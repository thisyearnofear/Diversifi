"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { Address, Avatar, Name, Identity } from "@coinbase/onchainkit/identity";
import { color } from "@coinbase/onchainkit/theme";

export function ConnectButton() {
  const { login, isAuthenticated, address, isLoading } = useAuth();

  return (
    <div className="flex items-center gap-2">
      {!isAuthenticated && address && (
        <Button type="button" onClick={login} disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      )}
      <Wallet>
        <ConnectWallet onConnect={login}>
          <Avatar className="size-6" />
          <Name />
        </ConnectWallet>
        <WalletDropdown>
          <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
            <Avatar />
            <Name />
            <Address className={color.foregroundMuted} />
          </Identity>
          <WalletDropdownDisconnect />
        </WalletDropdown>
      </Wallet>
    </div>
  );
}

