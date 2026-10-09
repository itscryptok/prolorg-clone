import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { profilePath } from "@/lib/slug";
import {
  useUpdateProfile, useGetProfile, getGetProfileQueryKey, getListProloguesQueryKey,
  useRequestUploadUrl, useSaveVideo,
} from "@workspace/api-client-react";
import type { PublicProfile } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Home, Play, Plus, Trash2, Video, Square, RotateCcw, CheckCircle, Loader2 } from "lucide-react";
import Footer from "@/components/Footer";
import LoginGate from "@/components/LoginGate";

interface ExtraLink { label: string; url: string; }

const PSYCH_QUESTIONS = [
  "Your team just broke prod at 5pm on a Friday. You...",
  "A client emails at 11pm with a 'quick question'. You...",
  "You disagree with your manager in a meeting. You...",
  "Your biggest strength that feels like a weakness is...",
  "If your work style was a music genre, it would be...",
  "The hill you will absolutely die on is...",
  "Your most controversial professional opinion is...",
  "When you hit a creative block, you usually...",
];

function parsePsychAnswers(raw: string | null | undefined): { answers: Record<string, string>; videoPath: string } {
  try {
    const pa = JSON.parse(raw || "{}");
    const { _videoPath, ...answers } = pa as Record<string, string>;
    return { answers: answers ?? {}, videoPath: _videoPath || "" };
  } catch {
    return { answers: {}, videoPath: "" };
  }
}

function parseExtraLinks(raw: string | null | undefined): ExtraLink[] {
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function EditProfile() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: profile } = useGetProfile(String(user?.id ?? ""), {
    query: { enabled: !!user?.id } as any,
  });

  if (user === null) return <LoginGate />;

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return <EditProfileForm profile={profile} userId={user?.id ?? 0} />;
}

type RecordState = "idle" | "recording" | "review" | "uploading" | "done";

function PrologueRecorder({ currentVideoUrl, onSaved }: { currentVideoUrl?: string | null; onSaved: (url: string) => void }) {
  const [state, setState] = useState<RecordState>("idle");
  const [countdown, setCountdown] = useState(60);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const liveRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const requestUploadUrlMutation = useRequestUploadUrl();
  const saveVideoMutation = useSaveVideo();

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
  }, []);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true });
      streamRef.current = stream;

      // liveRef is always mounted (hidden), so we can assign immediately
      if (liveRef.current) {
        liveRef.current.srcObject = stream;
        liveRef.current.play().catch(() => {});
      }

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "video/mp4";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        setRecordedUrl(URL.createObjectURL(blob));
        setState("review");
        stopStream();
      };

      recorder.start(1000);
      // Set state first so the video element renders, then assign srcObject in the effect
      setState("recording");
      setCountdown(60);

      let secs = 60;
      timerRef.current = setInterval(() => {
        secs -= 1;
        setCountdown(secs);
        if (secs <= 0) stopRecording();
      }, 1000);
    } catch {
      setError("Could not access camera or microphone. Please allow access and try again.");
    }
  };

  const handleUseThis = async () => {
    if (!recordedBlob) return;
    setState("uploading");
    setError(null);
    try {
      const { uploadURL, objectPath } = await requestUploadUrlMutation.mutateAsync({
        data: { name: `prologue-${Date.now()}.webm`, size: recordedBlob.size, contentType: recordedBlob.type },
      });

      const uploadRes = await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": recordedBlob.type },
        body: recordedBlob,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");

      const result = await saveVideoMutation.mutateAsync({ data: { objectPath } });
      setSavedUrl(result.videoUrl);
      onSaved(result.videoUrl);
      // Keep recordedUrl alive so "done" state can show the local blob immediately
      setState("done");
    } catch {
      setError("Upload failed. Please try again.");
      setState("review");
    }
  };

  const handleReRecord = () => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl(null);
    setRecordedBlob(null);
    setState("idle");
  };

  const displayUrl = savedUrl ?? currentVideoUrl;

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div>
        <h2 className="font-bold text-lg">Get discovered for big opps.</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Your 60-second video pitch shown on the feed.</p>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
      )}

      {/* IDLE — show current video + record button */}
      {state === "idle" && (
        <div className="space-y-3">
          {displayUrl ? (
            <div className="relative rounded-lg overflow-hidden bg-black aspect-video max-h-52">
              <video
                key={displayUrl}
                src={displayUrl}
                className="w-full h-full object-cover opacity-0 transition-opacity duration-300"
                preload="auto"
                muted
                autoPlay
                playsInline
                onLoadedData={(e) => {
                  const v = e.currentTarget;
                  v.pause();
                  v.style.opacity = "1";
                }}
                onError={(e) => { e.currentTarget.style.opacity = "1"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              <span className="absolute bottom-2 left-3 text-xs text-white/70 font-medium">Current prologue</span>
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 aspect-video max-h-52 flex items-center justify-center">
              <span className="text-muted-foreground text-sm">No prologue recorded yet</span>
            </div>
          )}
          <button
            type="button"
            onClick={startRecording}
            className="flex items-center gap-2 w-full justify-center bg-primary text-primary-foreground px-4 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            <Video size={18} />
            {displayUrl ? "Start Recording" : "Record Prologue"}
          </button>
        </div>
      )}

      {/* RECORDING — always-mounted live video (hidden when not recording) */}
      <div className={state === "recording" ? "space-y-3" : "hidden"}>
        <div className="relative rounded-lg overflow-hidden bg-black aspect-video max-h-52">
          <video ref={liveRef} className="w-full h-full object-cover scale-x-[-1]" muted playsInline />
          <div className="absolute top-2 right-3 bg-black/60 text-white text-sm font-bold px-2 py-1 rounded-full tabular-nums">
            {countdown}s
          </div>
          <div className="absolute top-2 left-3 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white text-xs font-semibold">REC</span>
          </div>
        </div>
        <button
          type="button"
          onClick={stopRecording}
          className="flex items-center gap-2 w-full justify-center bg-destructive text-destructive-foreground px-4 py-3 rounded-xl font-semibold hover:bg-destructive/90 transition-colors"
        >
          <Square size={16} fill="currentColor" />
          Stop Recording
        </button>
      </div>

      {/* REVIEW — play back before committing */}
      {state === "review" && recordedUrl && (
        <div className="space-y-3">
          <div className="rounded-lg overflow-hidden bg-black aspect-video max-h-52">
            <video src={recordedUrl} className="w-full h-full object-cover" controls playsInline />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleReRecord}
              className="flex-1 flex items-center gap-2 justify-center border border-border px-4 py-3 rounded-xl font-semibold hover:bg-secondary transition-colors"
            >
              <RotateCcw size={16} /> Re-record
            </button>
            <button
              type="button"
              onClick={handleUseThis}
              className="flex-1 flex items-center gap-2 justify-center bg-primary text-primary-foreground px-4 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              <CheckCircle size={16} /> Use This
            </button>
          </div>
        </div>
      )}

      {/* UPLOADING */}
      {state === "uploading" && (
        <div className="flex flex-col items-center gap-3 py-6">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Uploading your prologue…</p>
        </div>
      )}

      {/* DONE — show local blob so it's available instantly (no GCS round-trip) */}
      {state === "done" && recordedUrl && (
        <div className="space-y-3">
          <div className="rounded-lg overflow-hidden bg-black aspect-video max-h-52">
            <video
              src={recordedUrl}
              className="w-full h-full object-cover"
              muted
              playsInline
              controls
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-green-500 font-medium">
            <CheckCircle size={16} /> Prologue saved successfully!
          </div>
          <button
            type="button"
            onClick={handleReRecord}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw size={14} /> Record again
          </button>
        </div>
      )}
    </div>
  );
}

function EditProfileForm({ profile, userId }: { profile: PublicProfile; userId: number }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState(() => ({
    stageName: profile.stageName || "",
    city: profile.city || "",
    state: profile.state || "",
    country: profile.country || "",
    availability: profile.availability || "",
    bio: (profile as any).bio || "",
    keywords: profile.keywords || "",
    linkedinUrl: (profile as any).linkedinUrl || "",
    xUrl: (profile as any).xUrl || "",
    youtubeUrl: (profile as any).youtubeUrl || "",
    tiktokUrl: (profile as any).tiktokUrl || "",
    instagramUrl: (profile as any).instagramUrl || "",
    facebookUrl: (profile as any).facebookUrl || "",
    websiteUrl: (profile as any).websiteUrl || "",
  }));

  const [extraLinks, setExtraLinks] = useState<ExtraLink[]>(() =>
    parseExtraLinks((profile as any).extraLinks)
  );

  const [psychAnswers, setPsychAnswers] = useState<Record<string, string>>(() => {
    const { answers } = parsePsychAnswers(profile.psychAnswers);
    return answers;
  });
  const [videoPath] = useState<string>(() => {
    const { videoPath } = parsePsychAnswers(profile.psychAnswers);
    return videoPath;
  });
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(
    (profile as any).prologueVideoUrl ?? null
  );

  const updateMutation = useUpdateProfile({
    mutation: {
      onSuccess: (data) => {
        toast({ title: "Profile updated!" });
        queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey(String(userId)) });
        setLocation(profilePath(data?.stageName, userId));
      },
      onError: (err: unknown) => {
        const msg = (err as any)?.response?.data?.error ?? "";
        if (msg.includes("stage name")) {
          toast({ title: "Stage name taken", description: msg, variant: "destructive" });
        } else {
          toast({ title: "Failed to save", variant: "destructive" });
        }
      },
    },
  });

  const filledAnswers = Object.values(psychAnswers).filter(v => v.trim() !== "").length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanExtra = extraLinks.filter(l => l.url.trim() !== "");
    const allAnswers = { ...psychAnswers };
    // Never persist _videoPath back — save-video route handles the video link directly
    const finalPsych = JSON.stringify({ ...allAnswers });
    updateMutation.mutate({
      data: {
        ...formData,
        extraLinks: cleanExtra.length > 0 ? JSON.stringify(cleanExtra) : null,
        psychAnswers: finalPsych,
      },
    });
  };

  const field = (label: string, key: keyof typeof formData, placeholder = "") => (
    <div>
      <label className="block text-sm font-medium mb-1 text-muted-foreground">{label}</label>
      <input
        value={formData[key]}
        onChange={e => setFormData({ ...formData, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full bg-input border border-border rounded p-3 focus:outline-none focus:border-primary"
      />
    </div>
  );

  const addExtraLink = () => setExtraLinks(prev => [...prev, { label: "", url: "" }]);
  const removeExtraLink = (i: number) => setExtraLinks(prev => prev.filter((_, idx) => idx !== i));
  const updateExtraLink = (i: number, key: keyof ExtraLink, value: string) =>
    setExtraLinks(prev => prev.map((l, idx) => idx === i ? { ...l, [key]: value } : l));

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Nav bar ── */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-background/90 backdrop-blur border-b border-border">
        <button
          onClick={() => setLocation(`/profile/${userId}`)}
          className="p-2 rounded-full hover:bg-secondary transition-colors"
          aria-label="Back to profile"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">Edit Profile</h1>
        <div className="flex gap-2">
          <button onClick={() => setLocation("/")} className="p-2 rounded-full hover:bg-secondary transition-colors" aria-label="Swipe feed">
            <Play size={18} />
          </button>
          <button onClick={() => setLocation("/home")} className="p-2 rounded-full hover:bg-secondary transition-colors" aria-label="Home">
            <Home size={18} />
          </button>
        </div>
      </div>

      <div className="w-full md:w-4/5 lg:w-3/5 mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Prologue video ── */}
          <PrologueRecorder
            currentVideoUrl={currentVideoUrl}
            onSaved={(url) => {
              setCurrentVideoUrl(url);
              queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey(String(userId)) });
              queryClient.invalidateQueries({ queryKey: getListProloguesQueryKey() });
            }}
          />

          {/* ── Basic info ── */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-bold text-lg">Basic Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {field("Stage Name", "stageName", "Your public name")}
              {field("Availability", "availability", "e.g. Immediately, Open to offers")}
              {field("City", "city")}
              {field("State / Region", "state")}
              {field("Country", "country")}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Bio</label>
              <textarea
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell companies who you are in a few sentences"
                className="w-full bg-input border border-border rounded p-3 h-28 focus:outline-none focus:border-primary resize-none"
              />
            </div>
            {field("Keywords (comma separated)", "keywords", "e.g. React, UX Design, Leadership")}
          </div>

          {/* ── Links ── */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-bold text-lg">Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {field("LinkedIn", "linkedinUrl", "https://linkedin.com/in/...")}
              {field("X (Twitter)", "xUrl", "https://x.com/...")}
              {field("Website", "websiteUrl", "https://yoursite.com")}
              {field("YouTube", "youtubeUrl", "https://youtube.com/...")}
              {field("TikTok", "tiktokUrl", "https://tiktok.com/@...")}
              {field("Instagram", "instagramUrl", "https://instagram.com/...")}
              {field("Facebook", "facebookUrl", "https://facebook.com/...")}
            </div>

            {extraLinks.length > 0 && (
              <div className="space-y-3 pt-2">
                <p className="text-sm font-medium text-muted-foreground">Additional links</p>
                {extraLinks.map((link, i) => (
                  <div key={i} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-start">
                    <input
                      value={link.label}
                      onChange={e => updateExtraLink(i, "label", e.target.value)}
                      placeholder="Label (e.g. Portfolio)"
                      className="w-full sm:w-32 sm:shrink-0 bg-input border border-border rounded p-3 focus:outline-none focus:border-primary text-sm"
                    />
                    <input
                      value={link.url}
                      onChange={e => updateExtraLink(i, "url", e.target.value)}
                      placeholder="https://..."
                      className="w-full sm:flex-1 bg-input border border-border rounded p-3 focus:outline-none focus:border-primary text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeExtraLink(i)}
                      className="self-end sm:self-auto p-3 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Remove link"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={addExtraLink}
              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors mt-2"
            >
              <Plus size={16} />
              Add another link
            </button>
          </div>

          {/* ── Real Talk ── */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-5">
            <div>
              <h2 className="font-bold text-lg">Real Talk</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Your answers appear on your public profile. Be yourself.
                {filledAnswers > 0 && (
                  <span className="ml-2 text-primary font-medium">({filledAnswers}/8 answered)</span>
                )}
              </p>
            </div>
            {PSYCH_QUESTIONS.map((q, i) => (
              <div key={i}>
                <label className="block text-sm font-medium mb-2 text-foreground/80">
                  <span className="text-primary font-bold mr-1">{i + 1}.</span>{q}
                </label>
                <textarea
                  value={psychAnswers[q] ?? ""}
                  onChange={e => {
                    const val = e.target.value;
                    setPsychAnswers(prev => ({ ...prev, [q]: val }));
                  }}
                  placeholder="Type your answer..."
                  rows={2}
                  className="w-full bg-background text-foreground border-2 border-border focus:border-primary rounded-lg px-3 py-2 text-sm focus:outline-none resize-none placeholder:text-muted-foreground transition-colors"
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {updateMutation.isPending ? "Saving..." : `Save Profile`}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
