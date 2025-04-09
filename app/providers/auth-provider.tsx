"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { useAccount } from "wagmi";
import { auth } from "@/app/auth";

// Create a simple auth context
interface AuthContextType {
  isAuthenticated: boolean;
  activeAddress: string | undefined;
  isWeb3User: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  activeAddress: undefined,
  isWeb3User: false,
});

export const useSimpleAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { address: web3Address, isConnected } = useAccount();
  const [authState, setAuthState] = useState<AuthContextType>({
    isAuthenticated: false,
    activeAddress: undefined,
    isWeb3User: false,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if the user is authenticated with SIWE
        const session = await auth();

        // If the wallet address matches the session user ID, consider them authenticated
        // This handles the case where the user has connected their wallet but not signed in with SIWE
        const isAuthenticated =
          Boolean(session?.user?.id) ||
          (Boolean(web3Address) &&
            Boolean(session?.user?.id) &&
            typeof web3Address === "string" &&
            typeof session?.user?.id === "string" &&
            web3Address.toLowerCase() === session?.user?.id?.toLowerCase());

        setAuthState({
          isAuthenticated: isAuthenticated,
          activeAddress: web3Address ?? undefined,
          isWeb3User: Boolean(web3Address),
        });

        // For debugging
        console.log("Auth state updated:", {
          isAuthenticated,
          activeAddress: web3Address,
          isWeb3User: Boolean(web3Address),
          sessionUserId: session?.user?.id,
        });
      } catch (error) {
        console.error("Error checking authentication:", error);
        setAuthState({
          isAuthenticated: false,
          activeAddress: web3Address,
          isWeb3User: Boolean(web3Address),
        });
      }
    };

    if (isConnected && web3Address) {
      checkAuth();
    } else {
      setAuthState({
        isAuthenticated: false,
        activeAddress: undefined,
        isWeb3User: false,
      });
    }
  }, [web3Address, isConnected]);

  return (
    <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
  );
}
