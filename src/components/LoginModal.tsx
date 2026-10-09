import { useLocation } from "wouter";
import { X, Lock } from "lucide-react";

interface LoginModalProps {
  onClose: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
  const [, setLocation] = useLocation();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Lock size={18} className="text-primary" />
            <h2 className="font-bold text-lg">Sign in to continue</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-secondary transition-colors text-muted-foreground"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <button
            onClick={() => { onClose(); setLocation("/sign-in"); }}
            className="w-full bg-primary text-primary-foreground py-3 rounded-md font-bold hover:bg-primary/90 transition-colors"
          >
            Sign In
          </button>

          <p className="text-center text-sm text-muted-foreground">
            New here?{" "}
            <button
              onClick={() => { onClose(); setLocation("/sign-up"); }}
              className="text-primary hover:underline font-medium"
            >
              Create a free account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
