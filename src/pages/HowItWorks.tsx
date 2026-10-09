import { useLocation } from "wouter";
import { Video, Search, Bookmark, ExternalLink, UserPlus, Mic, Brain, Zap, ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";

export default function HowItWorks() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-6 border-b border-border flex items-center gap-4">
        <button
          onClick={() => window.history.length > 1 ? window.history.back() : setLocation("/home")}
          className="p-2 rounded-full hover:bg-secondary transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="" className="h-7 w-auto" />
            <span className="text-lg font-bold text-primary">Prolorg</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-none mt-0.5">The Talent stage app</p>
        </div>
      </header>

      <main className="flex-1 w-full md:w-4/5 lg:w-3/5 mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-3">How It Works</h1>
        <p className="text-muted-foreground mb-12">
          Prolorg connects talent with opportunity through authentic 60-second video prologues. Here's how each side of the platform works.
        </p>

        {/* Talent Stage */}
        <section className="mb-14">
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6">
            Talent Stage
          </div>
          <h2 className="text-2xl font-bold mb-2">Your stage. Your voice. Your shot.</h2>
          <p className="text-muted-foreground text-sm mb-8">
            The Talent Stage is where professionals record and publish their prologue — a 60-second unfiltered video that replaces the traditional résumé.
          </p>

          <ol className="space-y-6">
            <li className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shrink-0">1</span>
                <div className="w-px flex-1 bg-border mt-2" />
              </div>
              <div className="pb-6">
                <div className="flex items-center gap-2 mb-1">
                  <UserPlus size={15} className="text-primary" />
                  <span className="font-semibold">Create your profile</span>
                </div>
                <p className="text-sm text-muted-foreground">Sign up and fill in your stage name, city, bio, keywords, and links — everything that frames who you are before the camera starts.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shrink-0">2</span>
                <div className="w-px flex-1 bg-border mt-2" />
              </div>
              <div className="pb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Mic size={15} className="text-primary" />
                  <span className="font-semibold">Record your prologue</span>
                </div>
                <p className="text-sm text-muted-foreground">Hit record directly in the browser. 60 seconds. No editing, no filters. Introduce yourself, name what you've built, and say where you want to go next.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shrink-0">3</span>
                <div className="w-px flex-1 bg-border mt-2" />
              </div>
              <div className="pb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Brain size={15} className="text-primary" />
                  <span className="font-semibold">Answer the Real Talk questions</span>
                </div>
                <p className="text-sm text-muted-foreground">Eight scenario questions that reveal how you think, lead, and handle pressure. Companies read these before reaching out — they matter.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shrink-0">4</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={15} className="text-primary" />
                  <span className="font-semibold">Get discovered</span>
                </div>
                <p className="text-sm text-muted-foreground">Your prologue enters the live feed. Startups, established companies, and investors swipe through it and save profiles they want to follow up on — no applications, no waiting.</p>
              </div>
            </li>
          </ol>
        </section>

        <div className="border-t border-border mb-14" />

        {/* Talent Finder */}
        <section className="mb-14">
          <div className="inline-block px-3 py-1 rounded-full bg-secondary text-foreground text-xs font-bold uppercase tracking-widest mb-6">
            Talent Finder
          </div>
          <h2 className="text-2xl font-bold mb-2">Find the right people, fast.</h2>
          <p className="text-muted-foreground text-sm mb-8">
            The Talent Finder is built for companies, startups hunting for co-founders, and investors looking for their next great hire — without résumé stacks or agency fees.
          </p>

          <ol className="space-y-6">
            <li className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="w-8 h-8 rounded-full bg-secondary text-foreground text-sm font-bold flex items-center justify-center shrink-0">1</span>
                <div className="w-px flex-1 bg-border mt-2" />
              </div>
              <div className="pb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Video size={15} className="text-primary" />
                  <span className="font-semibold">Swipe the feed</span>
                </div>
                <p className="text-sm text-muted-foreground">Browse a live stream of 60-second prologues. Tap left or right to move through talent instantly — no résumés, no cover letters, just people talking.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="w-8 h-8 rounded-full bg-secondary text-foreground text-sm font-bold flex items-center justify-center shrink-0">2</span>
                <div className="w-px flex-1 bg-border mt-2" />
              </div>
              <div className="pb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Search size={15} className="text-primary" />
                  <span className="font-semibold">Search by what matters</span>
                </div>
                <p className="text-sm text-muted-foreground">Filter by keyword, city, country, or availability. Find a React engineer in Austin or a CFO open to fractional work in seconds.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="w-8 h-8 rounded-full bg-secondary text-foreground text-sm font-bold flex items-center justify-center shrink-0">3</span>
                <div className="w-px flex-1 bg-border mt-2" />
              </div>
              <div className="pb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Bookmark size={15} className="text-primary" />
                  <span className="font-semibold">Save candidates to your Timeline</span>
                </div>
                <p className="text-sm text-muted-foreground">Bookmark anyone worth a second look. Your Timeline keeps all saved candidates in one place so nothing falls through the cracks.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="w-8 h-8 rounded-full bg-secondary text-foreground text-sm font-bold flex items-center justify-center shrink-0">4</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ExternalLink size={15} className="text-primary" />
                  <span className="font-semibold">Reach out directly</span>
                </div>
                <p className="text-sm text-muted-foreground">Every profile surfaces LinkedIn, GitHub, X, and personal links. No middleman, no recruiter fee — just a direct connection.</p>
              </div>
            </li>
          </ol>
        </section>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setLocation("/sign-up")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-full font-bold text-sm transition-colors"
          >
            Record Your Prologue
          </button>
          <button
            onClick={() => setLocation("/")}
            className="border border-border hover:bg-secondary px-6 py-3 rounded-full font-medium text-sm transition-colors"
          >
            Browse the Feed
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
