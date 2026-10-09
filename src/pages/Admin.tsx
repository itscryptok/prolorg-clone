import { useState } from "react";
import { useAdminLogin, useAdminListUsers, useAdminUpdateUser, useAdminDeleteUser, useAdminMarkAd } from "@workspace/api-client-react";
import Footer from "@/components/Footer";
import { useQueryClient, useQuery } from "@tanstack/react-query";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const loginMutation = useAdminLogin({
    mutation: {
      onSuccess: () => setIsAuthenticated(true),
      onError: () => alert("Invalid admin password")
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ data: { password } });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <form onSubmit={handleLogin} className="bg-card p-8 rounded-xl border border-border w-full max-w-sm text-center shadow-2xl">
            <h1 className="text-2xl font-bold mb-6 text-primary uppercase tracking-widest">Backstage Access</h1>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-input border-border p-3 rounded mb-6 text-center font-mono tracking-widest"
              placeholder="ACCESS KEY"
            />
            <button type="submit" disabled={loginMutation.isPending} className="w-full bg-primary text-primary-foreground py-3 rounded font-bold">
              ENTER
            </button>
          </form>
        </div>
        <Footer />
      </div>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useAdminListUsers();
  
  const updateMutation = useAdminUpdateUser({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] }) }
  });
  const deleteMutation = useAdminDeleteUser({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] }) }
  });
  const markAdMutation = useAdminMarkAd({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] }) }
  });

  const [uploadingFor, setUploadingFor] = useState<number | null>(null);
  const [fixStatus, setFixStatus] = useState<string | null>(null);

  const handleFixProdVideos = async () => {
    setFixStatus("running…");
    try {
      const res = await fetch("/api/admin/fix-prod-videos", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setFixStatus(`✓ Done — prologue updated to ${(data.prologue?.videoUrl as string)?.split("/").pop()}`);
      } else {
        setFixStatus(`✗ Error: ${(data as { error?: string }).error ?? res.status}`);
      }
    } catch {
      setFixStatus("✗ Request failed");
    }
  };

  const handleFileUpload = async (userId: number, file: File) => {
    setUploadingFor(userId);
    try {
      const res = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
      });
      if (!res.ok) throw new Error("Failed to request upload URL");
      const { uploadURL, objectPath } = await res.json();
      
      const putRes = await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file
      });
      if (!putRes.ok) throw new Error("Upload failed");
      
      // Admin update profile logic goes here. Since we don't have an admin profile update hook, 
      // we might just alert success, or use a workaround if supported. 
      // The API spec doesn't explicitly list admin setting video URL, but the user is an admin.
      alert(`Video uploaded to ${objectPath}. (Backend sync required for admin video overwrite)`);
    } catch (err) {
      alert("Error uploading file");
    } finally {
      setUploadingFor(null);
    }
  };

  const { data: reports } = useQuery<{ id: number; email: string; title: string; description: string; createdAt: string }[]>({
    queryKey: ["/api/admin/reports"],
    queryFn: async () => {
      const res = await fetch("/api/admin/reports");
      if (!res.ok) throw new Error("Failed to load reports");
      return res.json();
    },
  });

  if (isLoading) return <div className="p-8">Loading users...</div>;

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Console</h1>

      {/* One-time production video fix */}
      <div className="bg-amber-950/40 border border-amber-700 rounded-xl p-4 mb-8 flex items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-amber-300 text-sm">Fix Production Videos</p>
          <p className="text-xs text-amber-200/70 mt-0.5">Links Captain Tok's Clerk account and updates their prologue to the recorded video.</p>
          {fixStatus && <p className="text-xs mt-1 font-mono text-amber-100">{fixStatus}</p>}
        </div>
        <button
          onClick={handleFixProdVideos}
          className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold px-4 py-2 rounded shrink-0"
        >
          Run Fix
        </button>
      </div>

      {/* Issue Reports */}
      <h2 className="text-xl font-bold mb-4 text-primary">Issue Reports</h2>
      {!reports || reports.length === 0 ? (
        <p className="text-muted-foreground text-sm mb-8">No reports yet.</p>
      ) : (
        <div className="space-y-3 mb-10">
          {reports.map(r => (
            <div key={r.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-4 mb-1">
                <span className="font-semibold text-sm">{r.title}</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(r.createdAt).toLocaleString()}</span>
              </div>
              <div className="text-xs text-muted-foreground mb-2">{r.email}</div>
              <p className="text-sm whitespace-pre-wrap">{r.description}</p>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-xl font-bold mb-4 text-primary">Users</h2>
      <div className="overflow-x-auto bg-card rounded-xl border border-border">
        <table className="w-full text-left">
          <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-4">ID / Email</th>
              <th className="p-4">Role / Stage Name</th>
              <th className="p-4">Location</th>
              <th className="p-4">Video</th>
              <th className="p-4">Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users?.map(u => (
              <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                <td className="p-4">
                  <div className="font-mono text-xs text-muted-foreground mb-1">#{u.id}</div>
                  <div className="font-bold">{u.email}</div>
                </td>
                <td className="p-4">
                  <div className="capitalize font-bold text-primary text-xs mb-1">{u.role}</div>
                  <div>{u.stageName || "-"}</div>
                </td>
                <td className="p-4 text-sm">
                  {u.city ? `${u.city}, ${u.country}` : "-"}
                </td>
                <td className="p-4">
                  {u.prologueVideoUrl ? (
                    <a href={`/api/storage${u.prologueVideoUrl}`} target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm font-bold">View Video</a>
                  ) : (
                    <div className="text-sm text-muted-foreground mb-2">No Video</div>
                  )}
                  <div className="mt-2 relative">
                    <input 
                      type="file" 
                      accept="video/*" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={e => e.target.files?.[0] && handleFileUpload(u.id, e.target.files[0])}
                    />
                    <button className="bg-secondary text-xs px-3 py-1 rounded">
                      {uploadingFor === u.id ? "Uploading..." : "Upload File"}
                    </button>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-2 items-start">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={u.isAd || false}
                        onChange={e => markAdMutation.mutate({ prologueId: u.prologueId || 0, data: { isAd: e.target.checked } })}
                        disabled={!u.prologueId}
                        className="accent-primary"
                      />
                      Mark as Ad
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={u.isBanned || false}
                        onChange={e => updateMutation.mutate({ userId: u.id, data: { isBanned: e.target.checked } })}
                        className="accent-destructive"
                      />
                      Ban User
                    </label>
                    <button 
                      onClick={() => { if(confirm("Delete user?")) deleteMutation.mutate({ userId: u.id }) }}
                      className="text-destructive text-xs hover:underline mt-1"
                    >
                      Delete Account
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Footer />
    </div>
  );
}
