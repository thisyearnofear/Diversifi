"use client";

import { useAccount, useBalance, useConnect, useChainId, useSwitchChain } from "wagmi";

export function useWallet() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors } = useConnect();
  const { switchChain } = useSwitchChain();
  const { data: balance } = useBalance({
    address,
  });

  return {
    address,
    isConnected,
    chainId,
    connect,
    connectors,
    switchChain,
    balance,
    // Helper functions
    formatAddress: (addr?: string) => {
      if (!addr) return "";
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    },
    formatBalance: (bal?: bigint) => {
      if (!bal) return "0";
      return (Number(bal) / 1e18).toFixed(4);
    },
  };
}
