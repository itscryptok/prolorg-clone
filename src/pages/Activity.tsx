import { useState } from "react";
import { useListSaves, useUnsavePrologue } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { profilePath } from "@/lib/slug";
import { useEffect, useRef } from "react";
import { Clock, Bookmark, ArrowLeft, ChevronDown, ChevronRight, X, ExternalLink } from "lucide-react";
import Footer from "@/components/Footer";
import LoginGate from "@/components/LoginGate";
import { useQueryClient } from "@tanstack/react-query";

export default function Activity() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: saves, isLoading } = useListSaves({ query: { enabled: !!user } as any });

  const [savedOpen, setSavedOpen] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const unsaveMutation = useUnsavePrologue({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["listSaves"] });
        setExpandedId(null);
      },
    },
  });

  if (user === null) return <LoginGate />;

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Header ── */}
      <div className="sticky top-0 z-40 flex items-center gap-3 px-4 py-4 bg-background/95 backdrop-blur border-b border-border">
        <button
          onClick={() => setLocation("/")}
          className="p-2 rounded-full hover:bg-secondary transition-colors"
          aria-label="Back to feed"
        >
          <ArrowLeft size={20} />
        </button>
        <Clock size={24} className="text-primary" />
        <h1 className="text-xl font-bold">My Timeline</h1>
      </div>

      <div className="w-full md:w-4/5 lg:w-3/5 mx-auto px-4 py-6 space-y-3">

        {/* ── Saved section ── */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">

          {/* Section header */}
          <button
            onClick={() => setSavedOpen(o => !o)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Bookmark size={18} className="text-primary" />
              <span className="font-semibold">Saved Candidates</span>
              {saves && saves.length > 0 && (
                <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                  {saves.length}
                </span>
              )}
            </div>
            {savedOpen
              ? <ChevronDown size={18} className="text-muted-foreground" />
              : <ChevronRight size={18} className="text-muted-foreground" />
            }
          </button>

          {/* Section body */}
          {savedOpen && (
            <div className="border-t border-border divide-y divide-border">
              {isLoading && (
                <div className="px-5 py-8 text-center text-muted-foreground text-sm">Loading…</div>
              )}

              {!isLoading && (!saves || saves.length === 0) && (
                <div className="px-5 py-10 flex flex-col items-center gap-3 text-center">
                  <Bookmark size={32} className="text-muted-foreground" />
                  <p className="font-semibold">Nothing saved yet</p>
                  <p className="text-sm text-muted-foreground">Hit the checkmark on a prologue in the feed to save it here.</p>
                  <button
                    onClick={() => setLocation("/")}
                    className="mt-2 bg-primary text-primary-foreground text-sm font-bold px-5 py-2 rounded-full hover:bg-primary/90 transition-colors"
                  >
                    Go to Feed
                  </button>
                </div>
              )}

              {saves?.map((prologue: any) => (
                <SavedItem
                  key={prologue.id}
                  prologue={prologue}
                  expanded={expandedId === prologue.id}
                  onToggle={() => setExpandedId(prev => prev === prologue.id ? null : prologue.id)}
                  onUnsave={() => unsaveMutation.mutate({ prologueId: prologue.id })}
                  onProfile={() => setLocation(profilePath(prologue.stageName, prologue.userId))}
                  isSaving={unsaveMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Future timeline sections will go here ── */}

      </div>
      <Footer />
    </div>
  );
}

function SavedItem({
  prologue,
  expanded,
  onToggle,
  onUnsave,
  onProfile,
  isSaving,
}: {
  prologue: any;
  expanded: boolean;
  onToggle: () => void;
  onUnsave: () => void;
  onProfile: () => void;
  isSaving: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (expanded) {
      videoRef.current?.play().catch(() => {});
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [expanded]);

  return (
    <div>
      {/* Row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-3 hover:bg-secondary/30 transition-colors text-left"
      >
        {/* Thumbnail */}
        <div className="w-10 h-14 bg-black rounded overflow-hidden shrink-0">
          <video
            src={prologue.videoUrl}
            className="w-full h-full object-cover"
            muted
            playsInline
            preload="metadata"
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{prologue.stageName || "Unnamed"}</p>
          <p className="text-xs text-muted-foreground truncate">{[prologue.city, prologue.country].filter(Boolean).join(", ")}</p>
        </div>

        {expanded
          ? <ChevronDown size={16} className="text-muted-foreground shrink-0" />
          : <ChevronRight size={16} className="text-muted-foreground shrink-0" />
        }
      </button>

      {/* Expanded video panel */}
      {expanded && (
        <div className="px-5 pb-5">
          <div className="rounded-xl overflow-hidden bg-black relative aspect-[9/16] max-h-[60vh]">
            <video
              ref={videoRef}
              src={prologue.videoUrl}
              className="w-full h-full object-cover"
              controls
              playsInline
              loop
            />
          </div>

          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={onProfile}
              className="flex-1 flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-sm font-semibold py-2.5 rounded-lg transition-colors"
            >
              <ExternalLink size={15} />
              View Profile
            </button>
            <button
              onClick={onUnsave}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 bg-destructive/10 hover:bg-destructive/20 text-destructive text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              <X size={15} />
              Unsave
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
