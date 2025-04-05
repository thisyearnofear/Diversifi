"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { useAccount } from "wagmi";

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
    setAuthState({
      isAuthenticated: Boolean(isConnected && web3Address),
      activeAddress: web3Address,
      isWeb3User: Boolean(web3Address),
    });
  }, [web3Address, isConnected]);

  return (
    <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
  );
}
