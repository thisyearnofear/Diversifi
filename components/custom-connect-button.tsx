"use client";

import { ConnectKitButton } from "connectkit";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function CustomConnectButton() {
  const [isConnecting, setIsConnecting] = useState(false);

  // Custom render function to fix the empty href issue
  const customButtonRender = useCallback(
    ({ show, isConnected, address, ensName }: any) => {
      const handleConnect = async () => {
        if (isConnecting) return;

        setIsConnecting(true);
        try {
          // Add a small delay to ensure the browser recognizes this as a user action
          await new Promise((resolve) => setTimeout(resolve, 50));
          await show();
        } catch (error) {
          console.error("Connection error:", error);
          toast.error(
            "Failed to open wallet connection. Please check if pop-ups are blocked."
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
    [isConnecting]
  );

  return (
    <ConnectKitButton.Custom>{customButtonRender}</ConnectKitButton.Custom>
  );
}
