"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { base, mainnet, celo, optimism, polygon } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { WalletSessionManager } from "@/components/wallet/wallet-session-manager";

if (!process.env.NEXT_PUBLIC_BASE_RPC)
  throw new Error("NEXT_PUBLIC_BASE_RPC is required");
if (!process.env.NEXT_PUBLIC_ETHEREUM_RPC)
  throw new Error("NEXT_PUBLIC_ETHEREUM_RPC is required");
if (!process.env.NEXT_PUBLIC_CELO_RPC)
  throw new Error("NEXT_PUBLIC_CELO_RPC is required");
if (!process.env.NEXT_PUBLIC_OPTIMISM_RPC)
  throw new Error("NEXT_PUBLIC_OPTIMISM_RPC is required");
if (!process.env.NEXT_PUBLIC_POLYGON_RPC)
  throw new Error("NEXT_PUBLIC_POLYGON_RPC is required");

// Optional API keys
if (!process.env.NEXT_PUBLIC_MORALIS_API_KEY) {
  console.warn(
    "NEXT_PUBLIC_MORALIS_API_KEY is not set. Moralis price fallback will not work."
  );
}
if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID)
  throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is required");

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [base, mainnet, celo, optimism, polygon],
    transports: {
      // RPC URL for each chain
      [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC),
      [mainnet.id]: http(process.env.NEXT_PUBLIC_ETHEREUM_RPC),
      [celo.id]: http(process.env.NEXT_PUBLIC_CELO_RPC),
      [optimism.id]: http(process.env.NEXT_PUBLIC_OPTIMISM_RPC),
      [polygon.id]: http(process.env.NEXT_PUBLIC_POLYGON_RPC),
    },

    // Required API Keys
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,

    // Required App Info
    appName: "Stable Station",
    appDescription: "Hub for Stablecoins & Real World Assets",
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    appIcon: "/favicon.ico",
  })
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          // Custom ConnectKit options
          customTheme={{
            // Match your app's color scheme
            "--ck-connectbutton-color": "var(--foreground)",
            "--ck-connectbutton-background": "var(--background)",
            "--ck-connectbutton-hover-color": "var(--foreground)",
            "--ck-connectbutton-hover-background": "var(--muted)",
          }}
          options={{
            // Show wallet image in the modal
            walletConnectCTA: "both",
            // Hide the ConnectKit branding
            hideQuestionMarkCTA: true,
            // Customize the disclaimer
            disclaimer:
              "By connecting your wallet, you agree to the Terms of Service and Privacy Policy",
          }}
          mode="dark"
        >
          <WalletSessionManager />
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
