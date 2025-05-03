'use client';

import { ConnectKitButton } from 'connectkit';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export function CustomConnectButton() {
  const [isConnecting, setIsConnecting] = useState(false);

  // Function to clean up WalletConnect sessions
  const cleanupWalletConnectSessions = useCallback(() => {
    try {
      // Clear any stored WalletConnect sessions from localStorage
      Object.keys(localStorage).forEach((key) => {
        if (
          key.startsWith('wc@2:') ||
          key.startsWith('wagmi.') ||
          key.startsWith('walletconnect:')
        ) {
          console.log(`Cleaning up WalletConnect session: ${key}`);
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error cleaning up WalletConnect sessions:', error);
    }
  }, []);

  // Custom render function to fix the empty href issue
  const customButtonRender = useCallback(
    ({ show, isConnected, address, ensName }: any) => {
      const handleConnect = async () => {
        if (isConnecting) return;

        setIsConnecting(true);
        try {
          // Clean up any existing WalletConnect sessions before connecting
          cleanupWalletConnectSessions();

          // Add a small delay to ensure the browser recognizes this as a user action
          await new Promise((resolve) => setTimeout(resolve, 50));
          await show();
        } catch (error) {
          console.error('Connection error:', error);
          toast.error(
            'Failed to open wallet connection. Please check if pop-ups are blocked.',
          );
        } finally {
          setIsConnecting(false);
        }
      };

      return (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isConnected ? (
            <div className="flex items-center gap-2">
              <span>
                {ensName || `${address?.slice(0, 6)}...${address?.slice(-4)}`}
              </span>
            </div>
          ) : isConnecting ? (
            <span>Connecting...</span>
          ) : (
            <span>Connect Wallet</span>
          )}
        </button>
      );
    },
    [isConnecting, cleanupWalletConnectSessions],
  );

  return (
    <ConnectKitButton.Custom>{customButtonRender}</ConnectKitButton.Custom>
  );
}
