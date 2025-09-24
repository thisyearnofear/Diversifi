import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, mainnet, celo, optimism, polygon } from 'wagmi/chains';
import { http } from 'wagmi';

// Validate required environment variables
if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
  throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is required");
}

export const config = getDefaultConfig({
  appName: 'DiversiFi',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  chains: [base, mainnet, celo, optimism, polygon],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC),
    [mainnet.id]: http(process.env.NEXT_PUBLIC_ETHEREUM_RPC),
    [celo.id]: http(process.env.NEXT_PUBLIC_CELO_RPC),
    [optimism.id]: http(process.env.NEXT_PUBLIC_OPTIMISM_RPC),
    [polygon.id]: http(process.env.NEXT_PUBLIC_POLYGON_RPC),
  },
  ssr: true, // Enable SSR support
});