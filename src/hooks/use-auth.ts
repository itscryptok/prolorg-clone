import { useUser, useClerk } from "@clerk/react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useGetMe } from "@workspace/api-client-react";
import { CLERK_ENABLED } from "@/lib/auth-config";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function useClerkAuth(
  setLocation: (to: string, opts?: { replace?: boolean }) => void,
  queryClient: ReturnType<typeof useQueryClient>,
) {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerk();

  // Local DB user (profile data — id, stageName, role, etc.)
  const { data: localUser, isLoading: isLoadingUser } = useGetMe({
    query: { enabled: isLoaded && !!clerkUser } as any,
  });

  const logout = async () => {
    await signOut({ redirectUrl: `${basePath}/` });
    queryClient.clear();
    localStorage.removeItem("prolorg_swipe_count");
  };

  return {
    // null = definitely logged out, undefined = still loading, object = logged in
    user: !isLoaded ? undefined : clerkUser ? (localUser ?? undefined) : null,
    isLoadingUser: !isLoaded || isLoadingUser,
    logout,
    isLoggingOut: false,
    // Legacy shims kept so existing call sites don't break during transition
    login: () => setLocation("/sign-in"),
    isLoggingIn: false,
    register: () => setLocation("/sign-up"),
    isRegistering: false,
  };
}

export function useAuth() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Static-clone note: without Clerk there is no signed-in user. useUser /
  // useClerk throw outside a ClerkProvider, so return the signed-out shape
  // directly instead of calling them.
  if (!CLERK_ENABLED) {
    return {
      user: null,
      isLoadingUser: false,
      logout: async () => {},
      isLoggingOut: false,
      login: () => setLocation("/sign-in"),
      isLoggingIn: false,
      register: () => setLocation("/sign-up"),
      isRegistering: false,
    };
  }

  return useClerkAuth(setLocation, queryClient);
}
