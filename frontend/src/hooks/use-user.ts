"use client";

import { useSession } from "@/lib/auth-client";

export function useUser() {
  const { data: session, isPending } = useSession();

  return {
    user: session?.user || null,
    session: session || null,
    isLoading: isPending,
    isAuthenticated: !!session?.user,
  };
}