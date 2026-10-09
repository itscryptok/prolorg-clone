import { useRoute, useLocation } from "wouter";
import { useGetProfile } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { ExternalLink, MapPin, ArrowLeft, Home, Play, Pencil, Video } from "lucide-react";
import Footer from "@/components/Footer";

export default function Profile() {
  const [, params] = useRoute("/profile/:userId");
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const slug = params?.userId ?? "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile, isLoading } = useGetProfile(slug, {
    query: { enabled: !!slug } as any
  });

  const resolvedIsOwnProfile = !!user && !!profile && user.id === profile.id;

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-xl">Loading...</div>;
  if (!profile) return <div className="min-h-screen bg-background flex items-center justify-center text-xl">Profile not found.</div>;

  let psychAnswers: Record<string, string> = {};
  // The video URL is stored as a full path like /api/storage/objects/uploads/uuid
  // Use it directly — don't add another /api/storage prefix
  const videoUrl = profile.prologueVideoUrl || null;

  if (profile.psychAnswers) {
    try {
      const parsed = JSON.parse(profile.psychAnswers);
      // _videoPath may have been stored during old signup flow; ignore it
      const { _videoPath: _ignored, ...rest } = parsed;
      // Only keep answers that actually have content
      psychAnswers = Object.fromEntries(
        Object.entries(rest).filter(([, v]) => typeof v === "string" && (v as string).trim() !== "")
      ) as Record<string, string>;
    } catch(e) { /* ignore bad JSON */ }
  }

  let extraLinks: { label: string; url: string }[] = [];
  if ((profile as any).extraLinks) {
    try { extraLinks = JSON.parse((profile as any).extraLinks); } catch { /* ignore */ }
  }

  const socialLinks = [
    { name: "LinkedIn",   url: profile.linkedinUrl },
    { name: "X (Twitter)", url: (profile as any).xUrl },
    { name: "Website",    url: profile.websiteUrl },
    { name: "YouTube",    url: profile.youtubeUrl },
    { name: "TikTok",     url: profile.tiktokUrl },
    { name: "Instagram",  url: profile.instagramUrl },
    { name: "Facebook",   url: profile.facebookUrl },
    ...extraLinks.filter(l => l.url).map(l => ({ name: l.label || "Link", url: l.url })),
  ].filter(link => link.url);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">

      {/* ── Nav bar ── */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/70 to-transparent">
        <button
          onClick={() => window.history.length > 1 ? window.history.back() : setLocation("/")}
          className="p-2 rounded-full bg-black/40 backdrop-blur hover:bg-black/60 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => setLocation("/")}
            className="p-2 rounded-full bg-black/40 backdrop-blur hover:bg-black/60 transition-colors"
            aria-label="Swipe feed"
          >
            <Play size={20} className="text-white" />
          </button>
          <button
            onClick={() => setLocation("/home")}
            className="p-2 rounded-full bg-black/40 backdrop-blur hover:bg-black/60 transition-colors"
            aria-label="Home"
          >
            <Home size={20} className="text-white" />
          </button>
          {resolvedIsOwnProfile && (
            <button
              onClick={() => setLocation("/profile/me")}
              className="p-2 rounded-full bg-primary/80 backdrop-blur hover:bg-primary transition-colors"
              aria-label="Edit profile"
            >
              <Pencil size={20} className="text-white" />
            </button>
          )}
        </div>
      </div>

      {/* ── Hero thumbnail (frozen frame from video) ── */}
      {videoUrl ? (
        <div className="w-full h-[50vh] md:h-[60vh] bg-black relative">
          <video
            src={videoUrl}
            className="w-full h-full object-cover opacity-0 transition-opacity duration-300"
            preload="auto"
            playsInline
            muted
            autoPlay
            onLoadedData={(e) => {
              const v = e.currentTarget;
              v.pause();
              v.style.opacity = "1";
            }}
            onError={(e) => { e.currentTarget.style.opacity = "1"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          {resolvedIsOwnProfile && (
            <button
              onClick={() => setLocation("/profile/me")}
              className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 hover:bg-black/80 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors"
            >
              <Video size={15} /> Start Recording
            </button>
          )}
        </div>
      ) : (
        <div className="w-full h-[30vh] bg-card border-b border-border flex items-center justify-center pt-16">
          {resolvedIsOwnProfile ? (
            <button
              onClick={() => setLocation("/profile/me")}
              className="flex items-center gap-2 text-primary hover:underline font-semibold"
            >
              <Video size={16} /> Record your first Prologue
            </button>
          ) : (
            <span className="text-muted-foreground">No prologue video yet</span>
          )}
        </div>
      )}

      <div className="w-full md:w-4/5 lg:w-3/5 mx-auto px-6 -mt-20 relative z-10">

        {/* ── Name + edit button ── */}
        <div className="flex items-end justify-between mb-4">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight break-words overflow-hidden">
            {profile.stageName || "Unknown Talent"}
          </h1>
          {resolvedIsOwnProfile && (
            <button
              onClick={() => setLocation("/profile/me")}
              className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary px-4 py-2 rounded-full font-semibold text-sm transition-colors mb-1"
            >
              <Pencil size={14} /> Edit
            </button>
          )}
        </div>

        {/* ── Location + availability chips ── */}
        <div className="flex flex-wrap gap-4 mb-8 text-muted-foreground font-medium">
          {profile.city && (
            <div className="flex items-center gap-1 bg-secondary/50 px-3 py-1 rounded-full text-sm">
              <MapPin size={16} /> {profile.city}{profile.country ? `, ${profile.country}` : ""}
            </div>
          )}
          {profile.availability && (
            <div className="flex items-center gap-1 bg-secondary/50 px-3 py-1 rounded-full text-sm">
              Availability - {profile.availability}
            </div>
          )}
        </div>

        {/* ── Bio ── */}
        {profile.bio && (
          <div className="text-xl leading-relaxed mb-12 max-w-2xl">{profile.bio}</div>
        )}

        {/* ── Keywords ── */}
        {profile.keywords && (
          <div className="mb-12">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Skills & Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {profile.keywords.split(",").map(k => (
                <span key={k} className="bg-card border border-border px-4 py-2 rounded-full font-medium">
                  {k.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Links ── always rendered; shows empty state on own profile ── */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">My Links</h3>
            {resolvedIsOwnProfile && (
              <button
                onClick={() => setLocation("/profile/me")}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Pencil size={12} /> {socialLinks.length === 0 ? "Add links" : "Edit"}
              </button>
            )}
          </div>

          {socialLinks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {socialLinks.map(link => (
                <a
                  key={link.name}
                  href={link.url!.startsWith("http") ? link.url! : `https://${link.url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between bg-card hover:bg-secondary border border-border p-4 rounded-lg transition-colors group"
                >
                  <span className="font-bold">{link.name}</span>
                  <ExternalLink size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              ))}
            </div>
          ) : resolvedIsOwnProfile ? (
            <button
              onClick={() => setLocation("/profile/me")}
              className="w-full border border-dashed border-border rounded-lg p-6 text-muted-foreground hover:border-primary hover:text-primary transition-colors text-sm"
            >
              + Add your LinkedIn, website, and social links
            </button>
          ) : (
            <p className="text-muted-foreground text-sm">No links added yet.</p>
          )}
        </div>

        {/* ── The Real Talk (psych answers) ── */}
        {Object.keys(psychAnswers).length > 0 && (
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">The Real Talk</h3>
            <div className="space-y-6">
              {Object.entries(psychAnswers).map(([q, a], i) => (
                <div key={i} className="bg-card border border-border p-6 rounded-xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform" />
                  <div className="text-sm text-muted-foreground font-medium mb-2">{q}</div>
                  <div className="text-xl font-bold">{a}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
