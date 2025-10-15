import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { useExchangeToken, isAuthenticated } from "@/lib/api/auth";

/**
 * Custom hook to sync Clerk authentication state with the app's auth store
 * This ensures backward compatibility with existing code that uses useAuthStore
 * Also exchanges Clerk user ID for backend JWT token
 */
export function useClerkSync() {
  const { user, isSignedIn } = useUser();
  const { setUser, setAuthenticated } = useAuthStore();
  const exchangeToken = useExchangeToken();

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

      // Exchange Clerk user ID for backend JWT token if not already authenticated
      if (!isAuthenticated()) {
        exchangeToken.mutate(user.id, {
          onSuccess: (response) => {
            console.log('Backend token obtained for user:', response.data?.user.email);
            console.log('🍇🍎Token exchanged:', response.data?.token);
            console.log('User Role: ', role);
          },
          onError: (error) => {
            console.error('Failed to exchange token with backend:', error);
          }
        });
      }
    } else {
      // Clear auth store when signed out
      setUser(null);
      setAuthenticated(false);
    }
  }, [isSignedIn, user, setUser, setAuthenticated]);

  return { user, isSignedIn };
}
