"use client";

import type { ReactNode } from "react";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { baseSepolia, base } from "wagmi/chains"; // add baseSepolia for testing
import { WagmiProvider, createConfig, http } from "wagmi";
import { coinbaseWallet, metaMask } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SWRConfig } from "swr";

const activeChain =
  process.env.NEXT_PUBLIC_ACTIVE_CHAIN === "base" ? base : baseSepolia;

const wagmiConfig = createConfig({
  chains: [activeChain],
  connectors: [
    coinbaseWallet({
      appName: "onchainkit",
    }),
    metaMask(),
  ],
  ssr: true,
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();

  return (
    <SWRConfig
      value={{
        provider: () => new Map(),
        revalidateOnFocus: false,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <OnchainKitProvider
            apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
            projectId={process.env.NEXT_PUBLIC_CDP_PROJECT_ID}
            chain={activeChain}
            config={{
              wallet: {
                display: "modal",
              },
            }}
          >
            {children}
          </OnchainKitProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </SWRConfig>
  );
}
