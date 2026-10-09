import { useCallback, useEffect, useRef, useState } from "react";
import { ClerkProvider, SignIn, SignUp, useClerk, useSignIn } from "@clerk/react";
import { X } from "lucide-react";
import { dark } from "@clerk/themes";
import { Switch, Route, Router as WouterRouter, useLocation, useSearch } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CLERK_ENABLED, clerkProxyUrl, clerkPubKey } from "@/lib/auth-config";
import NotFound from "@/pages/not-found";

import VideoFeed from "@/pages/Feed";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import EditProfile from "@/pages/EditProfile";
import Activity from "@/pages/Activity";
import Search from "@/pages/Search";
import Admin from "@/pages/Admin";
import ReportIssue from "@/pages/ReportIssue";
import HowItWorks from "@/pages/HowItWorks";
import Roadmap from "@/pages/Roadmap";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import SplashScreen from "@/components/SplashScreen";

export const queryClient = new QueryClient();

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

// Static-clone note: Clerk is optional here (see @/lib/auth-config). The
// original threw when no publishable key was configured; the clone renders
// signed-out instead so the portfolio entry works without auth wiring.

const clerkAppearance = {
  baseTheme: dark,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
    socialButtonsVariant: "blockButton" as const,
  },
  variables: {
    colorPrimary: "#F59E0B",
    colorForeground: "#f0ebe0",
    colorMutedForeground: "#9c8f6e",
    colorDanger: "#dc2626",
    colorBackground: "#0d0b08",
    colorInput: "#1f1a12",
    colorInputForeground: "#f0ebe0",
    colorNeutral: "#3d3020",
    fontFamily: "system-ui, sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#13100b] border border-[#3d3020] rounded-2xl w-[440px] max-w-full overflow-hidden shadow-2xl",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-[#f0ebe0] font-bold",
    headerSubtitle: "text-[#9c8f6e]",
    socialButtonsBlockButtonText: "text-[#f0ebe0]",
    socialButtonsBlockButton: "border-[#3d3020] hover:bg-[#1f1a12]",
    formFieldLabel: "text-[#f0ebe0]",
    formFieldInput: "bg-[#1f1a12] border-[#3d3020] text-[#f0ebe0]",
    footerActionLink: "text-[#F59E0B] hover:text-[#fbbf24]",
    footerActionText: "text-[#9c8f6e]",
    footerAction: "bg-transparent",
    dividerText: "text-[#9c8f6e]",
    dividerLine: "bg-[#3d3020]",
    identityPreviewEditButton: "text-[#F59E0B]",
    formFieldSuccessText: "text-green-400",
    alertText: "text-red-400",
    alert: "bg-red-950/60 border-red-800/50",
    logoBox: "flex justify-center",
    logoImage: "h-10",
    formButtonPrimary: "bg-[#F59E0B] text-[#1a0f00] hover:bg-[#fbbf24] font-bold",
    otpCodeFieldInput: "bg-[#1f1a12] border-[#3d3020] text-[#f0ebe0]",
    formFieldRow: "",
    main: "",
  },
};

function AuthPageWrapper({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-12 relative">
      <button
        onClick={() => window.history.length > 1 ? window.history.back() : setLocation("/")}
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
        aria-label="Close"
      >
        <X size={18} className="text-foreground" />
      </button>
      {children}
    </div>
  );
}

function SignInPage() {
  const signInState = useSignIn() as any;
  const isLoaded: boolean = signInState?.isLoaded ?? false;
  const signIn = signInState?.signIn;
  const [, setLocation] = useLocation();
  const [oauthNotFound, setOauthNotFound] = useState(false);
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !signIn) return;

    // Detect failed Google/OAuth attempt — account doesn't exist on Prolorg
    const fv = (signIn.firstFactorVerification ?? {}) as any;
    const isOauthFailed =
      fv?.status === "failed" &&
      (fv?.strategy?.startsWith("oauth_") ||
        fv?.error?.code === "external_account_not_found" ||
        fv?.error?.code === "user_not_found");

    if (isOauthFailed && !redirectedRef.current) {
      redirectedRef.current = true;
      setOauthNotFound(true);
      // Auto-navigate to sign-up after a short pause so user sees the message
      const t = setTimeout(() => setLocation("/sign-up?from=google"), 2800);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [isLoaded, signIn, setLocation]);

  return (
    <AuthPageWrapper>
      {oauthNotFound && (
        <div className="absolute top-16 left-4 right-4 z-50 bg-red-950/80 border border-red-700 rounded-xl px-4 py-3 text-sm text-red-300 flex flex-col gap-2 shadow-lg max-w-sm mx-auto">
          <p className="font-semibold">Google account not registered</p>
          <p className="text-red-400/80">That Google account hasn't signed up on Prolorg yet. Redirecting you to sign up…</p>
          <button
            onClick={() => setLocation("/sign-up?from=google")}
            className="self-start text-xs bg-red-700/60 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors font-semibold"
          >
            Go to Sign Up now
          </button>
        </div>
      )}
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        fallbackRedirectUrl={basePath || "/"}
        appearance={clerkAppearance}
      />
    </AuthPageWrapper>
  );
}

function SignUpPage() {
  const searchString = useSearch();
  const fromGoogle = new URLSearchParams(searchString).get("from") === "google";

  return (
    <AuthPageWrapper>
      {fromGoogle && (
        <div className="absolute top-16 left-4 right-4 z-50 bg-amber-950/80 border border-amber-700 rounded-xl px-4 py-3 text-sm text-amber-200 shadow-lg max-w-sm mx-auto">
          <p className="font-semibold mb-0.5">New to Prolorg?</p>
          <p className="text-amber-300/80">Complete the form below to create your account with Google.</p>
        </div>
      )}
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        fallbackRedirectUrl={basePath || "/"}
        appearance={clerkAppearance}
      />
    </AuthPageWrapper>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

const HIDE_BACK_PATHS = new Set(["/", "/home", "/sign-in", "/sign-up"]);

function FloatingBackButton() {
  const [location] = useLocation();
  if (HIDE_BACK_PATHS.has(location)) return null;
  return (
    <button
      onClick={() => window.history.back()}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-primary/20 backdrop-blur-sm hover:bg-primary/35 transition-colors shadow-lg"
    >
      ← Back
    </button>
  );
}

function StaticAuthNotice() {
  const [, setLocation] = useLocation();
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-8 text-center">
        <h2 className="font-bold text-xl mb-2">Static preview</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Sign-in is disabled in this static portfolio preview of Prolorg.
        </p>
        <button
          onClick={() => setLocation("/")}
          className="w-full bg-primary text-primary-foreground py-3 rounded-md font-bold hover:bg-primary/90 transition-colors"
        >
          Back to the stage
        </button>
      </div>
    </div>
  );
}

function Router() {
  const SignInRoute = CLERK_ENABLED ? SignInPage : StaticAuthNotice;
  const SignUpRoute = CLERK_ENABLED ? SignUpPage : StaticAuthNotice;
  return (
    <>
      {CLERK_ENABLED && <ClerkQueryClientCacheInvalidator />}
      <Switch>
        <Route path="/" component={VideoFeed} />
        <Route path="/home" component={Home} />
        <Route path="/sign-in/*?" component={SignInRoute} />
        <Route path="/sign-up/*?" component={SignUpRoute} />
        <Route path="/profile/me" component={EditProfile} />
        <Route path="/profile/:userId" component={Profile} />
        <Route path="/activity" component={Activity} />
        <Route path="/search" component={Search} />
        <Route path="/addy" component={Admin} />
        <Route path="/report-issue" component={ReportIssue} />
        <Route path="/how" component={HowItWorks} />
        <Route path="/roadmap" component={Roadmap} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route component={NotFound} />
      </Switch>
      <FloatingBackButton />
    </>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  const content = (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );

  // Static-clone note: without a Clerk key the app renders signed-out.
  if (!CLERK_ENABLED || !clerkPubKey) return content;

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      signInFallbackRedirectUrl={basePath || "/"}
      signUpFallbackRedirectUrl={basePath || "/"}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      {content}
    </ClerkProvider>
  );
}

function App() {
  const [splashDone, setSplashDone] = useState(false);
  const handleSplashDone = useCallback(() => setSplashDone(true), []);

  return (
    <>
      {!splashDone && <SplashScreen onDone={handleSplashDone} />}
      <WouterRouter base={basePath}>
        <ClerkProviderWithRoutes />
      </WouterRouter>
    </>
  );
}

export default App;
