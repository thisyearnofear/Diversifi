"use client";

import { useState } from "react";
import { useAccount, useAccountEffect, useSignMessage } from "wagmi";
import {
  auth,
  generateSiweChallenge,
  verifySiwe,
  logout,
} from "@/app/auth-actions";
import useSWR from "swr";

export function useAuth() {
  const { address, status } = useAccount();
  const { signMessage } = useSignMessage();
  const [isLoading, setIsLoading] = useState(false);

  const { data: session, mutate } = useSWR(
    status === "connected" ? ["auth", address] : null,
    () => auth()
  );

  const isAuthenticated = !!(session?.user && session.user.id === address);

  useAccountEffect({
    onConnect(data) {
      console.log("Wallet connected!", data);
    },
    onDisconnect: async () => {
      console.log("Wallet disconnected!");
      await logout(); // Use server action to delete cookie
      mutate(); // Revalidate auth state
    },
  });

  async function login() {
    if (!address) return;

    try {
      setIsLoading(true);
      const message = await generateSiweChallenge(address);
      signMessage(
        { message },
        {
          onSuccess: async (signature) => {
            try {
              await verifySiwe(message, signature);
              mutate(); // Revalidate auth state
              setIsLoading(false);
            } catch (error) {
              console.error("Verification failed:", error);
              setIsLoading(false);
            }
          },
          onError: (error) => {
            console.error("Login failed:", error);
            setIsLoading(false);
          },
        }
      );
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
    }
  }

  return {
    isAuthenticated,
    isLoading,
    login,
    address,
    sessionAddress: session?.user?.id,
  };
}
