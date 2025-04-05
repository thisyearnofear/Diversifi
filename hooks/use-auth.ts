"use client";

import { useSimpleAuth } from "@/app/providers/auth-provider";

export function useAuth() {
  const auth = useSimpleAuth();

  return {
    ...auth,
    // For compatibility with existing code
    privyReady: true,
    privyAuthenticated: false,
    privyUser: null,
    privyLogin: () => console.log("Privy login not available"),
    privySignOut: () => console.log("Privy logout not available"),
    isPrivyUser: false,
  };
}
