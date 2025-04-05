"use client";

import { ConnectKitButton } from "connectkit";
import { useCallback } from "react";

export function CustomConnectButton() {
  // Custom render function to fix the empty href issue
  const customButtonRender = useCallback(({ show, isConnected, address, ensName }: any) => {
    return (
      <button 
        onClick={show}
        className="flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
      >
        {isConnected ? (
          <div className="flex items-center gap-2">
            <span>
              {ensName || `${address?.slice(0, 6)}...${address?.slice(-4)}`}
            </span>
          </div>
        ) : (
          <span>Connect Wallet</span>
        )}
      </button>
    );
  }, []);

  return (
    <ConnectKitButton.Custom>
      {customButtonRender}
    </ConnectKitButton.Custom>
  );
}
