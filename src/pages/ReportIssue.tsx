import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

type FormState = "idle" | "submitting" | "success" | "error";

export default function ReportIssue() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/report-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, title, description }),
      });

      const data = await res.json() as { success: boolean; message?: string };
      if (data.success) {
        setFormState("success");
      } else {
        setErrorMsg(data.message ?? "Submission failed. Please try again.");
        setFormState("error");
      }
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setFormState("error");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button
          onClick={() => window.history.length > 1 ? window.history.back() : setLocation("/")}
          className="p-2 rounded-full hover:bg-secondary transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">Report an Issue</h1>
      </div>

      <div className="flex-1 flex items-start justify-center p-6">
        <div className="w-full max-w-lg">

          {formState === "success" ? (
            <div className="flex flex-col items-center text-center gap-4 py-16">
              <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center">
                <CheckCircle size={36} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-bold">Report sent!</h2>
              <p className="text-muted-foreground text-sm max-w-xs">
                Thanks for letting us know. We'll look into it and get back to you at <span className="font-semibold text-foreground">{email}</span>.
              </p>
              <button
                onClick={() => setLocation("/")}
                className="mt-4 bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-semibold hover:bg-primary/90 transition-colors"
              >
                Back to feed
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <p className="text-muted-foreground text-sm mb-6">
                  Found a bug or something not working right? Tell us and we'll get it sorted.
                </p>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold" htmlFor="email">
                  Your email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Issue title */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold" htmlFor="title">
                  Issue title
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Short summary of the problem"
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what happened, what you expected, and steps to reproduce if possible..."
                  rows={6}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Error */}
              {formState === "error" && (
                <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={formState === "submitting"}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {formState === "submitting" ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit report
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
