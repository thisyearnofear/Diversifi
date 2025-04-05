"use client";

import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";

export function WalletConnect() {
  const { address, isConnected } = useAccount();

  return (
    <div className="flex items-center gap-4">
      <ConnectKitButton />
      {isConnected && (
        <div className="text-sm text-gray-500">
          Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
        </div>
      )}
    </div>
  );
}
