import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/store";

/**
 * Custom hook to sync Clerk authentication state with the app's auth store
 * This ensures backward compatibility with existing code that uses useAuthStore
 */
export function useClerkSync() {
  const { user, isSignedIn } = useUser();
  const { setUser, setAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isSignedIn && user) {
      // Sync Clerk user to auth store
      const role = user.publicMetadata?.role;
      setUser({
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        name: user.fullName || user.firstName || "User",
        role: (role === "admin" || role === "customer") ? role : "customer",
      });
      setAuthenticated(true);
    } else {
      // Clear auth store when signed out
      setUser(null);
      setAuthenticated(false);
    }
  }, [isSignedIn, user, setUser, setAuthenticated]);

  return { user, isSignedIn };
}
