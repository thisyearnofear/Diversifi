"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { base, mainnet, celo } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

if (!process.env.NEXT_PUBLIC_BASE_RPC)
  throw new Error("NEXT_PUBLIC_BASE_RPC is required");
if (!process.env.NEXT_PUBLIC_ETHEREUM_RPC)
  throw new Error("NEXT_PUBLIC_ETHEREUM_RPC is required");
if (!process.env.NEXT_PUBLIC_CELO_RPC)
  throw new Error("NEXT_PUBLIC_CELO_RPC is required");
if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID)
  throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is required");

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [base, mainnet, celo],
    transports: {
      // RPC URL for each chain
      [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC),
      [mainnet.id]: http(process.env.NEXT_PUBLIC_ETHEREUM_RPC),
      [celo.id]: http(process.env.NEXT_PUBLIC_CELO_RPC),
    },

    // Required API Keys
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,

    // Required App Info
    appName: "Hello World Computer",
    appDescription: "Learn about Ethereum and get started with Web3",
    appUrl: "http://localhost:3000",
    appIcon: "/favicon.ico",
  })
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
