"use client";

import { ConnectKitButton } from "connectkit";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export function LoginOptions() {
  const { isAuthenticated, isWeb3User } = useAuth();

  if (isAuthenticated) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          Connected with Web3 Wallet
        </h2>
        <p className="text-gray-600">
          You're ready to start completing actions and earning rewards!
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Connect Your Wallet</h2>

      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Connect with Web3 Wallet</h3>
          <ConnectKitButton />
        </div>

        <p className="mt-4 text-sm text-gray-500">
          Connect your wallet to start exploring actions and earning rewards.
        </p>
      </div>
    </Card>
  );
}
