import { useLocation } from "wouter";
import { Lock } from "lucide-react";

export default function LoginGate() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mb-4">
            <Lock size={22} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-1">Sign in to continue</h2>
          <p className="text-muted-foreground text-sm">This page is for registered users.</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 shadow-2xl flex flex-col gap-4">
          <button
            onClick={() => setLocation("/sign-in")}
            className="w-full bg-primary text-primary-foreground py-3 rounded-md font-bold hover:bg-primary/90 transition-colors"
          >
            Sign In
          </button>
          <p className="text-center text-sm text-muted-foreground">
            New here?{" "}
            <button
              onClick={() => setLocation("/sign-up")}
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
