"use client";

import { useAuth } from "@/hooks/use-auth";
import { ConnectWallet } from "@coinbase/onchainkit/wallet";
import { Button } from "@/components/ui/button";
export function ConnectButton() {
  const { isAuthenticated, isLoading, login, address, sessionAddress } =
    useAuth();

  console.log("isAuthenticated", isAuthenticated);
  console.log("isLoading", isLoading);
  console.log("address", address);
  console.log("sessionAddress", sessionAddress);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!address) {
    return <ConnectWallet onConnect={login} />;
  }

  if (!isAuthenticated || address !== sessionAddress) {
    return <Button onClick={login}>Sign In</Button>;
  }

  return <ConnectWallet />;
}
