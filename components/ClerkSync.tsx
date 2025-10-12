"use client";

import { useClerkSync } from "@/lib/hooks/useClerkSync";

/**
 * Component that syncs Clerk authentication state with the app's store
 * Place this in the root layout to ensure sync happens on every page
 */
export default function ClerkSync() {
  useClerkSync();
  return null;
}
