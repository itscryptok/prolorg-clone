import { useState, useEffect, useMemo, useRef } from "react";
import { useListPrologues, useSavePrologue, useUnsavePrologue, useCheckSave, getCheckSaveQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, useSearch } from "wouter";
import { Home, Search as SearchIcon, Filter, User as UserIcon, UserCircle, Check, Volume2, VolumeX, Clock, X, Menu, Video, ShieldCheck, Users, Rocket, Zap, ChevronLeft, ChevronRight, AlertTriangle, LogOut } from "lucide-react";
import { profilePath } from "@/lib/slug";
import { useQueryClient } from "@tanstack/react-query";
import LoginModal from "@/components/LoginModal";

export default function Feed() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const searchString = useSearch();
  const queryClient = useQueryClient();

  // Parse URL filter params set by Search page or inline search
  const urlParams = useMemo(() => {
    const p = new URLSearchParams(searchString);
    return {
      search: p.get("search") || undefined,
      city: p.get("city") || undefined,
      country: p.get("country") || undefined,
      keyword: p.get("keyword") || undefined,
      availability: p.get("availability") || undefined,
    };
  }, [searchString]);

  const hasUrlFilter = Object.values(urlParams).some(Boolean);
  const filterLabel =
    urlParams.search || urlParams.keyword || urlParams.city ||
    urlParams.country || urlParams.availability || "";

  // Inline search UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [muted, setMuted] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Debounced value for live dropdown query
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 280);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Live dropdown suggestions
  const { data: dropdownData } = useListPrologues(
    { search: debouncedQuery },
    { query: { enabled: isSearching && debouncedQuery.length >= 2 } as any }
  );

  // Filtered prologues (from URL params)
  const { data: filteredData, isLoading: isFilteredLoading } = useListPrologues(urlParams, {
    query: { enabled: hasUrlFilter } as any,
  });

  // Full unfiltered feed — always loaded as fallback
  const { data: allData, isLoading } = useListPrologues({});

  // Stable shuffle seed so random tail doesn't reshuffle on re-renders
  const [shuffleSeed] = useState(() => Math.random());

  // Playlist: filtered matches first, then shuffled remainder from all
  const playlist = useMemo(() => {
    const all = allData?.prologues ?? [];
    if (!hasUrlFilter) return all;
    const filtered = filteredData?.prologues ?? [];
    const filteredIds = new Set(filtered.map((p) => p.id));
    const rest = all
      .filter((p) => !filteredIds.has(p.id))
      .sort(() => shuffleSeed - 0.5);
    return [...filtered, ...rest];
  }, [filteredData, allData, hasUrlFilter, shuffleSeed]);

  const filteredCount = hasUrlFilter ? (filteredData?.prologues?.length ?? 0) : playlist.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const pendingIndexRef = useRef<number | null>(null);

  // Reset index whenever the filter changes; honour any pending random index
  useEffect(() => {
    if (pendingIndexRef.current !== null) {
      setCurrentIndex(pendingIndexRef.current);
      pendingIndexRef.current = null;
    } else {
      setCurrentIndex(0);
    }
  }, [searchString]);

  const handleViewAllFeed = () => {
    const all = allData?.prologues ?? [];
    if (all.length > 0) {
      pendingIndexRef.current = Math.floor(Math.random() * all.length);
    }
    clearFilter();
  };

  const handleNext = () => {
    if (currentIndex < playlist.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else if (!user) {
      setShowLoginModal(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const currentPrologue = playlist[currentIndex];
  const isFilteredMatch = currentIndex < filteredCount;

  const { data: saveStatus } = useCheckSave(currentPrologue?.id || 0, {
    query: { enabled: !!user && !!currentPrologue?.id } as any,
  });
  const isSaved = saveStatus?.saved || false;

  const saveMutation = useSavePrologue({
    mutation: {
      onMutate: async ({ prologueId }) => {
        await queryClient.cancelQueries({ queryKey: getCheckSaveQueryKey(prologueId) });
        const prev = queryClient.getQueryData(getCheckSaveQueryKey(prologueId));
        queryClient.setQueryData(getCheckSaveQueryKey(prologueId), { saved: true });
        return { prev };
      },
      onError: (_err, { prologueId }, context: any) => {
        queryClient.setQueryData(getCheckSaveQueryKey(prologueId), context?.prev);
      },
      onSettled: (_data, _err, { prologueId }) => {
        queryClient.invalidateQueries({ queryKey: getCheckSaveQueryKey(prologueId) });
      },
    },
  });
  const unsaveMutation = useUnsavePrologue({
    mutation: {
      onMutate: async ({ prologueId }) => {
        await queryClient.cancelQueries({ queryKey: getCheckSaveQueryKey(prologueId) });
        const prev = queryClient.getQueryData(getCheckSaveQueryKey(prologueId));
        queryClient.setQueryData(getCheckSaveQueryKey(prologueId), { saved: false });
        return { prev };
      },
      onError: (_err, { prologueId }, context: any) => {
        queryClient.setQueryData(getCheckSaveQueryKey(prologueId), context?.prev);
      },
      onSettled: (_data, _err, { prologueId }) => {
        queryClient.invalidateQueries({ queryKey: getCheckSaveQueryKey(prologueId) });
      },
    },
  });

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { setShowLoginModal(true); return; }
    if (!currentPrologue) return;
    if (isSaved) unsaveMutation.mutate({ prologueId: currentPrologue.id });
    else saveMutation.mutate({ prologueId: currentPrologue.id });
  };

  const applyInlineSearch = (term: string) => {
    setIsSearching(false);
    setSearchQuery("");
    setDebouncedQuery("");
    setLocation(`/?search=${encodeURIComponent(term)}`);
  };

  const clearFilter = () => setLocation("/");

  if (isLoading && !allData) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading stage...</div>;
  }

  const dropdownSuggestions = dropdownData?.prologues?.slice(0, 8) ?? [];

  return (
    <div className="h-screen bg-black flex justify-center overflow-hidden">
    <div className="relative w-full md:w-4/5 lg:w-[60%] h-[100dvh] bg-black text-white overflow-hidden font-sans">

      {/* TOP NAV */}
      <div className="absolute top-0 left-0 w-full p-4 flex items-center gap-3 z-30 bg-gradient-to-b from-black/80 to-transparent">
        {isSearching ? (
          <div className="relative flex-1">
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                placeholder="Search roles, cities, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) applyInlineSearch(searchQuery.trim());
                  if (e.key === "Escape") { setIsSearching(false); setSearchQuery(""); }
                }}
                onBlur={() => setTimeout(() => { setIsSearching(false); setSearchQuery(""); }, 150)}
                className="flex-1 bg-white/20 border-none rounded-full px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { setIsSearching(false); setSearchQuery(""); }}
                className="p-2 shrink-0"
              >
                <X size={22} />
              </button>
            </div>

            {dropdownSuggestions.length > 0 && (
              <div className="absolute top-full mt-2 left-0 right-8 bg-zinc-900/98 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                {dropdownSuggestions.map((p) => (
                  <button
                    key={p.id}
                    onMouseDown={(e) => { e.preventDefault(); applyInlineSearch(p.stageName ?? ""); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left border-b border-white/5 last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <UserIcon size={14} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{p.stageName}</div>
                      <div className="text-xs text-white/50 truncate">
                        {[p.city, p.country].filter(Boolean).join(", ")}
                        {p.keywords ? ` · ${p.keywords.split(",").slice(0, 2).join(", ")}` : ""}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <button onClick={() => setLocation("/home")} className="p-2 drop-shadow-md shrink-0">
              <Home size={28} />
            </button>
            <div className="flex-1" />
            {hasUrlFilter && (
              <button
                onClick={clearFilter}
                className="flex items-center gap-1 bg-primary/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full max-w-[160px]"
              >
                <span className="truncate">{filterLabel}</span>
                <X size={12} className="shrink-0" />
              </button>
            )}
            <button onClick={() => setIsSearching(true)} className="p-2 drop-shadow-md">
              <SearchIcon size={28} />
            </button>
            <button onClick={() => setLocation("/search")} className="p-2 drop-shadow-md">
              <Filter size={28} />
            </button>
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => user ? setUserMenuOpen(v => !v) : setShowLoginModal(true)}
                className="p-2 drop-shadow-md"
                aria-label="User menu"
              >
                <UserCircle size={28} />
              </button>
              {userMenuOpen && user && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-xs text-white/50 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => { setUserMenuOpen(false); setLocation(profilePath(user.stageName, user.id)); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/10 transition-colors text-left"
                  >
                    <UserCircle size={16} className="text-primary shrink-0" />
                    My Profile
                  </button>
                  <div className="border-t border-white/10" />
                  <button
                    onClick={() => { setUserMenuOpen(false); logout(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/10 transition-colors text-left text-red-400"
                  >
                    <LogOut size={16} className="shrink-0" />
                    Logout
                  </button>
                </div>
              )}
            </div>
            <button onClick={() => setMenuOpen(true)} className="p-2 drop-shadow-md">
              <Menu size={28} />
            </button>
          </>
        )}
      </div>

      {/* No-matches banner — shown below nav when filter is active but returns nothing */}
      {hasUrlFilter && !isFilteredLoading && filteredCount === 0 && (
        <div className="absolute top-16 left-0 right-0 z-30 flex items-center justify-center gap-3 px-4 py-2">
          <span className="text-white/80 text-sm font-medium drop-shadow">No matches</span>
          <button
            onClick={handleViewAllFeed}
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
          >
            View all feed
          </button>
        </div>
      )}

      {/* Tap zones — gradient shadow + chevron hint */}
      <div
        className="absolute left-0 top-0 w-[20%] h-full z-10 cursor-pointer flex items-center justify-start"
        style={{ background: "linear-gradient(to right, rgba(0,0,0,0.25) 0%, transparent 100%)" }}
        onClick={handlePrev}
        data-testid="feed-prev-zone"
      >
        <ChevronLeft size={32} className="ml-2 text-white/50 drop-shadow" />
      </div>
      <div
        className="absolute right-0 top-0 w-[20%] h-full z-40 cursor-pointer flex items-center justify-end"
        style={{ background: "linear-gradient(to left, rgba(0,0,0,0.25) 0%, transparent 100%)" }}
        onClick={handleNext}
        data-testid="feed-next-zone"
      >
        <ChevronRight size={32} className="mr-2 text-white/50 drop-shadow" />
      </div>

      {/* VIDEO */}
      {currentPrologue ? (
        <div className="w-full h-full relative">
          {currentPrologue.isAd && (
            <div className="absolute top-20 left-4 z-20 bg-primary px-2 py-1 text-xs font-bold rounded uppercase">Sponsored</div>
          )}
          {hasUrlFilter && (
            <div className={`absolute top-20 right-4 z-20 px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${isFilteredMatch ? "bg-primary/80" : "bg-white/20"}`}>
              {isFilteredMatch ? `${currentIndex + 1} of ${filteredCount} matches` : "Browsing all"}
            </div>
          )}

          <video
            key={currentPrologue.id}
            src={currentPrologue.videoUrl ?? undefined}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted={muted}
            playsInline
            onError={(e) => { (e.currentTarget as HTMLVideoElement).style.display = "none"; }}
          />

          <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 pointer-events-none" />

          <div className="absolute bottom-24 left-4 z-20 w-[70%] pointer-events-none" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.9)" }}>
            <h2 className="text-3xl font-bold mb-1 text-white">{currentPrologue.stageName}</h2>
            <p className="text-sm font-semibold mb-2 text-white/90">
              {[currentPrologue.city, currentPrologue.country].filter(Boolean).join(", ")}
            </p>
            {currentPrologue.keywords && (
              <div className="flex flex-wrap gap-2">
                {currentPrologue.keywords.split(",").map((k) => (
                  <span key={k} className="bg-black/60 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">{k.trim()}</span>
                ))}
              </div>
            )}
          </div>

          <div className="absolute bottom-24 right-4 z-50 flex flex-col items-center gap-6">
            <button onClick={() => setMuted((m) => !m)} className="transition-transform hover:scale-110" aria-label={muted ? "Unmute" : "Mute"}>
              <div className="w-12 h-12 rounded-full bg-primary/25 backdrop-blur-sm flex items-center justify-center text-white">
                {muted ? <VolumeX size={22} /> : <Volume2 size={22} />}
              </div>
            </button>
            <button onClick={handleSaveToggle} className="transition-transform hover:scale-110">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSaved ? "bg-primary border-2 border-white text-primary-foreground" : "bg-primary/25 backdrop-blur-sm text-white"}`}>
                <Check size={22} />
              </div>
            </button>
            <button onClick={() => setLocation(profilePath(currentPrologue.stageName, currentPrologue.userId))} className="flex flex-col items-center transition-transform hover:scale-110">
              <div className="w-12 h-12 rounded-full bg-primary/25 backdrop-blur-sm flex items-center justify-center text-white">
                <UserIcon size={22} />
              </div>
              <span className="text-xs font-bold mt-1 drop-shadow-md text-white">Stage</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center z-20 relative bg-zinc-900">
          {hasUrlFilter ? (
            <>
              <h2 className="text-3xl font-bold mb-4">No matches for "{filterLabel}"</h2>
              <p className="text-muted-foreground mb-6 text-sm">Try a different term or browse everyone.</p>
              <button onClick={clearFilter} className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-bold transition-all">
                Browse All
              </button>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold mb-6 max-w-md leading-tight">Be one of the first to record your Prologue</h2>
              <button onClick={() => setLocation("/sign-up")} className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest transition-all hover:scale-105" data-testid="feed-signup-btn">
                Take the Stage
              </button>
            </>
          )}
        </div>
      )}

      {/* Menu overlay */}
      {menuOpen && (
        <div className="absolute inset-0 bg-black/60 z-40" onClick={() => setMenuOpen(false)} />
      )}

      {/* Menu slide-in panel */}
      <div className={`absolute top-0 right-0 h-full w-full max-w-sm bg-zinc-950 border-l border-white/10 z-50 flex flex-col overflow-y-auto transition-transform duration-300 ${menuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-2"><img src="/logo.png" alt="" className="h-8 w-auto" /><span className="text-lg font-bold">Prolorg</span></div>
          <button onClick={() => setMenuOpen(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 pt-4">
          <button
            onClick={() => { setMenuOpen(false); setLocation("/report-issue"); }}
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <AlertTriangle size={14} className="text-yellow-400/80" />
            Report an issue
          </button>
        </div>

        <div className="p-6 space-y-10">
          <section>
            <h2 className="text-xl font-bold mb-4">About</h2>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              Prolorg is a talent showcase platform built by <a href="https://cryptok.online" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">Cryp Tok Solutions</a> for the era of authentic connection. We believe the best way to evaluate a person isn't a static résumé — it's watching them speak.
            </p>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Professionals record a 60-second video prologue: who they are, what they've built, and where they want to go next. Companies, investors, and co-founders swipe through them TikTok-style — discovering people they'd never find on a job board.
            </p>
            <div className="space-y-3">
              {[
                { icon: <Video size={14} className="text-primary" />, title: "60-second prologues", sub: "Not a pitch deck. Not a bullet list. You, talking." },
                { icon: <ShieldCheck size={14} className="text-primary" />, title: "No AI filters", sub: "Every profile is a real human — verified, unpolished, genuine." },
                { icon: <Users size={14} className="text-primary" />, title: "Built for two sides", sub: "Talents get seen. Companies, investors, and co-founders do the discovering." },
              ].map(({ icon, title, sub }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-md bg-primary/10 shrink-0">{icon}</div>
                  <div>
                    <div className="text-sm font-semibold">{title}</div>
                    <div className="text-xs text-white/50">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="border-t border-white/10" />

          <section>
            <h2 className="text-xl font-bold mb-4">How It Works</h2>
            <div className="mb-5">
              <div className="text-xs font-bold uppercase tracking-widest text-primary mb-3">For Talent</div>
              <ol className="space-y-4">
                {[
                  { n: "1", title: "Create your profile", sub: "Add your name, city, bio, keywords, and links." },
                  { n: "2", title: "Record your prologue", sub: "Hit record in the browser. 60 seconds. No editing, no filters." },
                  { n: "3", title: "Answer the Real Talk questions", sub: "Eight scenarios that reveal how you think, lead, and handle pressure." },
                  { n: "4", title: "Get discovered", sub: "Your prologue enters the live feed. Companies swipe and save candidates." },
                ].map(({ n, title, sub }) => (
                  <li key={n} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{n}</span>
                    <div>
                      <div className="text-sm font-semibold">{title}</div>
                      <div className="text-xs text-white/50">{sub}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="border-t border-white/10 pt-5">
              <div className="text-xs font-bold uppercase tracking-widest text-primary mb-3">For Companies &amp; Investors</div>
              <ol className="space-y-4">
                {[
                  { n: "1", title: "Swipe the feed", sub: "Browse 60-second prologues. Tap left or right to move through talent." },
                  { n: "2", title: "Search by what matters", sub: "Filter by keyword, city, country, or availability." },
                  { n: "3", title: "Save to your Timeline", sub: "Bookmark anyone worth a second look." },
                  { n: "4", title: "Reach out directly", sub: "Every profile surfaces LinkedIn, GitHub, X, and personal links." },
                ].map(({ n, title, sub }) => (
                  <li key={n} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-white/10 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{n}</span>
                    <div>
                      <div className="text-sm font-semibold">{title}</div>
                      <div className="text-xs text-white/50">{sub}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <div className="border-t border-white/10" />

          <div className="pb-4 flex flex-col gap-3">
            <button
              onClick={() => { setMenuOpen(false); setLocation("/sign-up"); }}
              className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-full font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Rocket size={16} /> Record Your Prologue
            </button>
            <button
              onClick={() => setMenuOpen(false)}
              className="w-full border border-white/20 hover:bg-white/10 py-3 rounded-full font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Zap size={16} /> Back to Feed
            </button>
          </div>
        </div>
      </div>

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}

      {/* BOTTOM NAV */}
      <div className="absolute bottom-0 left-0 w-full p-6 flex justify-around z-30 bg-gradient-to-t from-black via-black/80 to-transparent">
        <button
          onClick={() => user ? setLocation("/profile/me") : setShowLoginModal(true)}
          className="flex flex-col items-center gap-1.5 transition-transform hover:scale-105"
        >
          <div className="w-11 h-11 rounded-full bg-primary/25 backdrop-blur-sm flex items-center justify-center text-white">
            <UserIcon size={20} />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-white drop-shadow-md">My Profile</span>
        </button>
        <button
          onClick={() => user ? setLocation("/activity") : setShowLoginModal(true)}
          className="flex flex-col items-center gap-1.5 transition-transform hover:scale-105"
        >
          <div className="w-11 h-11 rounded-full bg-primary/25 backdrop-blur-sm flex items-center justify-center text-white">
            <Clock size={20} />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-white drop-shadow-md">My Timeline</span>
        </button>
      </div>
    </div>
    </div>
  );
}
