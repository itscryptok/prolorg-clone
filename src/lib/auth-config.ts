import { publishableKeyFromHost } from "@clerk/react/internal";

/**
 * Static-clone note: the original app requires a Clerk publishable key and
 * throws without one. This clone treats Clerk as optional so the portfolio
 * entry renders without backend/auth wiring. Clerk is enabled ONLY when
 * VITE_CLERK_PUBLISHABLE_KEY is set — note that publishableKeyFromHost()
 * derives a (non-functional) key from the hostname even without an env key,
 * so the env var itself is the switch. When disabled:
 * - ClerkProvider is skipped
 * - useAuth() returns a signed-out stub
 * - /sign-in and /sign-up render a static-preview notice
 */
const envKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

export const CLERK_ENABLED = !!envKey;

export const clerkPubKey = CLERK_ENABLED
  ? publishableKeyFromHost(window.location.hostname, envKey)
  : undefined;

export const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
