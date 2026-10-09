import { useEffect, useState } from "react";

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fade = setTimeout(() => setFading(true), 3400);
    const done = setTimeout(onDone, 4000);
    return () => { clearTimeout(fade); clearTimeout(done); };
  }, [onDone]);

  return (
    <>
      <style>{`
        @keyframes inkSpread {
          0%   { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        @keyframes inkGlow {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1; }
        }
        .ink-bar {
          transform-origin: left center;
          animation: inkSpread 3.4s cubic-bezier(0.05, 0.0, 0.2, 1) forwards;
        }
        .ink-tip {
          animation: inkGlow 1.2s ease-in-out infinite;
        }
      `}</style>
      <div
        className={`fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center gap-6 transition-opacity duration-500 ${fading ? "opacity-0" : "opacity-100"}`}
      >
        <img src="/logo.png" alt="Prolorg logo" className="h-20 w-auto" />
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary tracking-tight">Prolorg</h1>
          <p className="text-muted-foreground text-sm mt-1">Find co-founders. Find Talents.</p>
        </div>

        {/* Ink spread loader */}
        <div className="mt-2 relative w-28 h-[3px] bg-muted/30 rounded-full overflow-visible">
          <div className="ink-bar absolute inset-y-0 left-0 w-full rounded-full bg-primary" />
          <div className="ink-tip absolute inset-y-[-2px] right-0 w-[6px] rounded-full bg-primary blur-[2px]" />
        </div>
      </div>
    </>
  );
}
