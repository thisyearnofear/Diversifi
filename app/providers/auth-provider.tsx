'use client';

import {
  type ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import { useAccount } from 'wagmi';
import { auth } from '@/app/auth';

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
        console.log('AuthProvider: Checking authentication status...');
        console.log('AuthProvider: Current web3Address:', web3Address);

        // Check if the user is authenticated with SIWE
        const session = await auth();
        console.log('AuthProvider: Session result:', {
          hasUser: Boolean(session?.user),
          userId: session?.user?.id,
          expires: session?.expires,
        });

        // Only consider the user authenticated if they have a valid session
        // We no longer try to match wallet address with session ID to avoid confusion
        const isAuthenticated = Boolean(session?.user?.id);

        // Check if the wallet address matches the session ID
        const addressMatchesSession =
          Boolean(web3Address) &&
          Boolean(session?.user?.id) &&
          typeof web3Address === 'string' &&
          typeof session?.user?.id === 'string' &&
          web3Address.toLowerCase() === session?.user?.id?.toLowerCase();

        // Log the authentication decision logic
        console.log('AuthProvider: Authentication decision:', {
          hasSessionUserId: Boolean(session?.user?.id),
          web3AddressMatchesSession: addressMatchesSession,
          finalDecision: isAuthenticated,
        });

        // If the wallet address doesn't match the session ID, we should log out
        // This prevents issues where a user connects a different wallet than the one they signed in with
        if (isAuthenticated && !addressMatchesSession) {
          console.log(
            "AuthProvider: Wallet address doesn't match session ID, logging out",
          );
          // We'll handle this by setting isAuthenticated to false
          // The user will need to sign in again with the new wallet
          setAuthState({
            isAuthenticated: false,
            activeAddress: web3Address ?? undefined,
            isWeb3User: Boolean(web3Address),
          });
          return;
        }

        setAuthState({
          isAuthenticated: isAuthenticated,
          activeAddress: web3Address ?? undefined,
          isWeb3User: Boolean(web3Address),
        });

        // For debugging
        console.log('AuthProvider: Auth state updated:', {
          isAuthenticated,
          activeAddress: web3Address,
          isWeb3User: Boolean(web3Address),
          sessionUserId: session?.user?.id,
        });
      } catch (error) {
        console.error('AuthProvider: Error checking authentication:', error);
        setAuthState({
          isAuthenticated: false,
          activeAddress: web3Address,
          isWeb3User: Boolean(web3Address),
        });
      }
    };

    console.log('AuthProvider: Connection state changed:', {
      isConnected,
      web3Address,
    });

    if (isConnected && web3Address) {
      console.log('AuthProvider: Wallet connected, checking auth...');
      checkAuth();
    } else {
      console.log(
        'AuthProvider: Wallet disconnected or no address, resetting auth state',
      );
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
