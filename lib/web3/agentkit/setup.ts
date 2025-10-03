import {
  AgentKit,
  pythActionProvider,
  walletActionProvider,
  type WalletProvider,
} from '@coinbase/agentkit';
import { ConnectKitWalletProvider } from './wallet-providers/connectKitWalletProvider';
import { erc20ActionProvider } from './action-providers/erc20';
import { safeActionProvider } from './action-providers/safe';
import { alchemyActionProvider } from './action-providers/alchemy';
import { zoraActionProvider } from './action-providers/zora';
import { basenameActionProvider } from './action-providers/basename';
import { lensActionProvider } from './action-providers/lens';
import { baseActionProvider } from './action-providers/base';
import { optimismActionProvider } from './action-providers/optimism';
import { celoActionProvider } from './action-providers/celo';
// Import the polygon action provider
import { polygonActionProvider } from './action-providers/polygon';

export const setupAgentKit = async () => {
  let activeChain = 'celo-mainnet';

  // Determine the active chain based on environment variable
  if (process.env.NEXT_PUBLIC_ACTIVE_CHAIN === 'base') {
    activeChain = 'base-mainnet';
  } else if (process.env.NEXT_PUBLIC_ACTIVE_CHAIN === 'base-sepolia') {
    activeChain = 'base-sepolia';
  } else if (process.env.NEXT_PUBLIC_ACTIVE_CHAIN === 'celo') {
    activeChain = 'celo-mainnet';
  }

  let walletProvider: WalletProvider;

  // Configure ConnectKit wallet provider
  walletProvider = (await ConnectKitWalletProvider.configureWithWallet(
    activeChain,
  )) as unknown as WalletProvider;
  console.log('Using ConnectKit wallet provider');

  // Create AgentKit instance
  return AgentKit.from({
    walletProvider,
    actionProviders: [
      pythActionProvider(),
      walletActionProvider(),
      erc20ActionProvider(),
      safeActionProvider(),
      basenameActionProvider(),
      lensActionProvider(),
      baseActionProvider(),
      optimismActionProvider(),
      celoActionProvider(),
      polygonActionProvider(),
      // Only include Alchemy if API key is available
      ...(process.env.ALCHEMY_API_KEY
        ? [alchemyActionProvider(process.env.ALCHEMY_API_KEY)]
        : []),
      zoraActionProvider(),
    ],
  });
};
