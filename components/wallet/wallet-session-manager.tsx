"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";

/**
 * WalletSessionManager component
 * 
 * This component handles WalletConnect session management to prevent errors
 * related to session requests without listeners.
 * 
 * It cleans up any orphaned WalletConnect sessions when the component unmounts
 * or when the wallet connection status changes.
 */
export function WalletSessionManager() {
  const { isConnected } = useAccount();

  useEffect(() => {
    // Function to clean up WalletConnect sessions
    const cleanupWalletConnectSessions = () => {
      try {
        // Clear any stored WalletConnect sessions from localStorage
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('wc@2:') || key.startsWith('wagmi.') || key.startsWith('walletconnect:')) {
            console.log(`Cleaning up WalletConnect session: ${key}`);
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.error("Error cleaning up WalletConnect sessions:", error);
      }
    };

    // Clean up sessions when wallet connection status changes
    if (!isConnected) {
      cleanupWalletConnectSessions();
    }

    // Clean up sessions when component unmounts
    return () => {
      if (!isConnected) {
        cleanupWalletConnectSessions();
      }
    };
  }, [isConnected]);

  // This component doesn't render anything
  return null;
}
