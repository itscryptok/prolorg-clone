import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useGetFeedStats } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Play, Filter, Menu, X, Video, Zap, ShieldCheck, Users, Rocket, UserCircle, LogOut } from "lucide-react";
import { profilePath } from "@/lib/slug";
import Footer from "@/components/Footer";

export default function Home() {
  const { data: stats } = useGetFeedStats();
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-6 border-b border-border flex justify-between items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-primary"><img src="/logo.png" alt="" className="h-9 w-auto" />Prolorg</h1>
          <p className="text-[10px] text-muted-foreground leading-none mt-0.5 pl-11">The Talent stage app</p>
        </div>
        <nav className="flex items-center gap-2">
          <button onClick={() => setLocation("/")} aria-label="Swipe feed" className="p-2 rounded-full hover:bg-secondary transition-colors hover:text-primary">
            <Play size={20} />
          </button>
          <button onClick={() => setLocation("/search")} aria-label="Advanced Search" className="p-2 rounded-full hover:bg-secondary transition-colors hover:text-primary">
            <Filter size={20} />
          </button>
          {user ? (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setUserMenuOpen(v => !v)}
                className="p-2 rounded-full hover:bg-secondary transition-colors hover:text-primary"
                aria-label="User menu"
              >
                <UserCircle size={22} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
                  <button
                    onClick={() => { setUserMenuOpen(false); setLocation(profilePath(user.stageName, user.id)); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-secondary transition-colors text-left"
                  >
                    <UserCircle size={16} className="text-primary shrink-0" />
                    My Profile
                  </button>
                  <div className="border-t border-border" />
                  <button
                    onClick={() => { setUserMenuOpen(false); logout(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-secondary transition-colors text-left text-destructive"
                  >
                    <LogOut size={16} className="shrink-0" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => setLocation("/sign-in")} className="px-4 py-2 rounded-full hover:bg-secondary transition-colors hover:text-primary text-sm font-medium">Login</button>
          )}
          <button onClick={() => setMenuOpen(true)} aria-label="Menu" className="p-2 rounded-full hover:bg-secondary transition-colors hover:text-primary">
            <Menu size={22} />
          </button>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <h2 className="text-5xl md:text-7xl font-bold mb-6 max-w-4xl">
          You are the big deal, let them find you.
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
          New company startups looking for co-founders. Established companies looking for talents. Pitch yourself in 60s.
        </p>

        <button
          onClick={() => setLocation("/")}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-4 rounded-full text-lg font-bold transition-all hover:scale-105 mb-16"
        >
          Back to Feed
        </button>

        <div className="flex items-start justify-center gap-10 flex-nowrap">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{stats?.totalTalents ?? "---"}</div>
            <div className="text-xs text-muted-foreground mt-1 whitespace-nowrap">Total Talents</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{stats?.newThisWeek ?? "---"}</div>
            <div className="text-xs text-muted-foreground mt-1 whitespace-nowrap">New This Week</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{stats?.totalPrologues ?? "---"}</div>
            <div className="text-xs text-muted-foreground mt-1 whitespace-nowrap">Total Prologues</div>
          </div>
        </div>
      </main>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Slide-in panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-background border-l border-border z-50 flex flex-col overflow-y-auto transition-transform duration-300 ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2"><img src="/logo.png" alt="" className="h-8 w-auto" /><span className="text-lg font-bold">Prolorg</span></div>
          <button onClick={() => setMenuOpen(false)} className="p-2 rounded-full hover:bg-secondary transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-10">

          {/* About */}
          <section>
            <h2 className="text-xl font-bold mb-4">About</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Prolorg is a talent showcase platform built by <a href="https://cryptok.online" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">Cryp Tok Solutions</a> for the era of authentic connection. We believe the best way to evaluate a person isn't a static résumé — it's watching them speak.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Professionals record a 60-second video prologue: who they are, what they've built, and where they want to go next. Companies, investors, and co-founders swipe through them TikTok-style — discovering people they'd never find on a job board.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 rounded-md bg-primary/10">
                  <Video size={14} className="text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold">60-second prologues</div>
                  <div className="text-xs text-muted-foreground">Not a pitch deck. Not a bullet list. You, talking.</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 rounded-md bg-primary/10">
                  <ShieldCheck size={14} className="text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold">No AI filters</div>
                  <div className="text-xs text-muted-foreground">Every profile is a real human — verified, unpolished, genuine.</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 rounded-md bg-primary/10">
                  <Users size={14} className="text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Built for two sides</div>
                  <div className="text-xs text-muted-foreground">Talents get seen. Companies, investors, and co-founders do the discovering.</div>
                </div>
              </div>
            </div>
          </section>

          <div className="border-t border-border" />

          {/* How it works */}
          <section>
            <h2 className="text-xl font-bold mb-4">How It Works</h2>

            <div className="mb-5">
              <div className="text-xs font-bold uppercase tracking-widest text-primary mb-3">For Talent</div>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <div>
                    <div className="text-sm font-semibold">Create your profile</div>
                    <div className="text-xs text-muted-foreground">Add your name, city, bio, keywords, and links — everything that frames who you are.</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <div>
                    <div className="text-sm font-semibold">Record your prologue</div>
                    <div className="text-xs text-muted-foreground">Hit record directly in the browser. 60 seconds. No editing, no filters. Say what matters.</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <div>
                    <div className="text-sm font-semibold">Answer the Real Talk questions</div>
                    <div className="text-xs text-muted-foreground">Eight scenario questions that reveal how you think, lead, and handle pressure.</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
                  <div>
                    <div className="text-sm font-semibold">Get discovered</div>
                    <div className="text-xs text-muted-foreground">Your prologue enters the live feed. Companies swipe, search by skill or city, and save candidates they want to follow up with.</div>
                  </div>
                </li>
              </ol>
            </div>

            <div className="border-t border-border/50 pt-5">
              <div className="text-xs font-bold uppercase tracking-widest text-primary mb-3">For Companies & Investors</div>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-secondary text-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <div>
                    <div className="text-sm font-semibold">Swipe the feed</div>
                    <div className="text-xs text-muted-foreground">Browse a live stream of 60-second prologues. Tap left or right to move through talent instantly.</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-secondary text-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <div>
                    <div className="text-sm font-semibold">Search by what matters</div>
                    <div className="text-xs text-muted-foreground">Filter by keyword, city, country, or availability. Find a React engineer in Austin or a CFO open to fractional work.</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-secondary text-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <div>
                    <div className="text-sm font-semibold">Save candidates to your Timeline</div>
                    <div className="text-xs text-muted-foreground">Bookmark anyone worth a second look. Your Timeline keeps all saved candidates in one place.</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-secondary text-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
                  <div>
                    <div className="text-sm font-semibold">Reach out directly</div>
                    <div className="text-xs text-muted-foreground">Every profile surfaces LinkedIn, GitHub, X, and personal links. No middleman, no recruiter fee.</div>
                  </div>
                </li>
              </ol>
            </div>
          </section>

          <div className="border-t border-border" />

          {/* CTA */}
          <div className="pb-4 flex flex-col gap-3">
            <button
              onClick={() => { setMenuOpen(false); setLocation("/sign-up"); }}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-full font-bold text-sm transition-colors"
            >
              <span className="flex items-center justify-center gap-2"><Rocket size={16} /> Record Your Prologue</span>
            </button>
            <button
              onClick={() => { setMenuOpen(false); setLocation("/"); }}
              className="w-full border border-border hover:bg-secondary py-3 rounded-full font-medium text-sm transition-colors"
            >
              <span className="flex items-center justify-center gap-2"><Zap size={16} /> Browse the Feed</span>
            </button>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
