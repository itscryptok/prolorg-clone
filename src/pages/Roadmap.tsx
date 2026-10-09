import { useLocation } from "wouter";
import { CheckCircle2, Circle, Clock, ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";

const PHASES = [
  {
    label: "Launched",
    status: "done" as const,
    items: [
      { title: "60-second in-browser video recording", desc: "Record directly from your browser — no app, no upload." },
      { title: "TikTok-style swipeable feed", desc: "Full-screen video feed with left/right navigation." },
      { title: "Talent profiles with stage name URLs", desc: "Shareable profile links like prolorg.app/profile/your-name." },
      { title: "Real Talk psychometric questions", desc: "Eight scenario questions that reveal how candidates think." },
      { title: "Advanced search & filters", desc: "Filter by keyword, city, country, and availability." },
      { title: "Save to Timeline (Activity)", desc: "Bookmark candidates for later review." },
      { title: "Admin console", desc: "Content moderation, video management, and platform controls." },
    ],
  },
  {
    label: "Coming Soon",
    status: "soon" as const,
    items: [
      { title: "Direct messaging", desc: "Contact talent directly inside the platform — no third-party links required." },
      { title: "Company profiles", desc: "Let companies create a presence on Prolorg so talent can find and follow them too." },
      { title: "Verified badges", desc: "Identity and credential verification for both talent and companies." },
      { title: "Mobile apps (iOS & Android)", desc: "Native apps for recording and swiping on the go." },
      { title: "Prologue analytics for talent", desc: "See how many views, saves, and profile visits your prologue receives." },
    ],
  },
  {
    label: "On the Horizon",
    status: "future" as const,
    items: [
      { title: "AI-powered matching", desc: "Smart recommendations that surface the right talent to the right companies — without replacing human judgment." },
      { title: "Availability calendar", desc: "Talent can flag when they're open to new opportunities; companies can filter in real time." },
      { title: "Team collections", desc: "Companies can share saved candidate lists across their hiring team." },
      { title: "Video reactions", desc: "Companies can leave a short video response on a prologue to kick off the conversation." },
      { title: "Prolorg for universities", desc: "Dedicated onboarding for graduating cohorts and campus career offices." },
    ],
  },
];

const statusIcon = {
  done: <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />,
  soon: <Clock size={16} className="text-amber-400 shrink-0 mt-0.5" />,
  future: <Circle size={16} className="text-muted-foreground shrink-0 mt-0.5" />,
};

const statusBadge = {
  done: "bg-primary/10 text-primary",
  soon: "bg-amber-400/10 text-amber-400",
  future: "bg-secondary text-muted-foreground",
};

export default function Roadmap() {
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
        <h1 className="text-4xl font-bold mb-3">Roadmap</h1>
        <p className="text-muted-foreground mb-12">
          What we've shipped, what's coming next, and where we're headed. We build in public and ship fast.
        </p>

        <div className="space-y-12">
          {PHASES.map((phase) => (
            <section key={phase.label}>
              <div className="flex items-center gap-3 mb-6">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${statusBadge[phase.status]}`}>
                  {phase.label}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <ul className="space-y-4">
                {phase.items.map((item) => (
                  <li key={item.title} className="flex gap-3">
                    {statusIcon[phase.status]}
                    <div>
                      <div className="text-sm font-semibold">{item.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-14 p-6 rounded-2xl border border-border bg-card text-center">
          <p className="text-sm font-semibold mb-1">Have a feature idea?</p>
          <p className="text-xs text-muted-foreground mb-4">We read every message. Tell us what would make Prolorg more useful for you.</p>
          <button
            onClick={() => setLocation("/report-issue")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-full font-bold text-sm transition-colors"
          >
            Send Feedback
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
