"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { auth, generateSiweChallenge, verifySiwe } from "@/app/auth-actions";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionAddress: string | undefined;
}

export function useAuth() {
  const { address } = useAccount();
  const { signMessage } = useSignMessage();
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    sessionAddress: undefined,
  });

  // Check session status
  const checkAuth = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    const session = await auth();
    console.log("session", session);

    setState({
      isAuthenticated: !!session.user,
      isLoading: false,
      sessionAddress: session.user?.id,
    });
  }, []);

  // Login with SIWE
  const login = useCallback(async () => {
    if (!address) return;

    try {
      const message = await generateSiweChallenge(address);
      signMessage(
        { message },
        {
          onSuccess: async (signature) => {
            console.log("signature", signature);
            const verification = await verifySiwe(message, signature);
            console.log("verification", verification);
            checkAuth();
          },
        }
      );
    } catch (error) {
      console.error("Login failed:", error);
    }
  }, [address, signMessage, checkAuth]);

  // Check auth on mount and when address changes
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Handle address changes
  useEffect(() => {
    if (state.sessionAddress && address !== state.sessionAddress) {
      checkAuth(); // This will effectively log out the user if session address doesn't match
    }
  }, [address, state.sessionAddress, checkAuth]);

  return {
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    login,
    address,
    sessionAddress: state.sessionAddress,
  };
}
