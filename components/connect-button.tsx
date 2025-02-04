"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { WalletDefault } from "@coinbase/onchainkit/wallet";
export function ConnectButton() {
  const { login, isAuthenticated, address, isLoading } = useAuth();

  if (!address) {
    return <WalletDefault />;
  }

  if (!isAuthenticated) {
    return (
      <Button type="button" onClick={login} disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
    );
  }

  return <WalletDefault />;
}
