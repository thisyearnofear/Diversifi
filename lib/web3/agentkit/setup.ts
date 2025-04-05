import {
  AgentKit,
  pythActionProvider,
  walletActionProvider,
} from "@coinbase/agentkit";
import { mockWalletProvider } from "./wallet-providers/mockWalletProvider";
import { CdpWalletProvider } from "./wallet-providers/cdpWalletProvider";
import { erc20ActionProvider } from "./action-providers/erc20";
import { safeActionProvider } from "./action-providers/safe";
import { alchemyActionProvider } from "./action-providers/alchemy";
import { zoraActionProvider } from "./action-providers/zora";
import { basenameActionProvider } from "./action-providers/basename";

export const setupAgentKit = async () => {
  const activeChain =
    process.env.NEXT_PUBLIC_ACTIVE_CHAIN === "base"
      ? "base-mainnet"
      : "base-sepolia";

  let walletProvider;

  try {
    // Try to use CDP wallet provider if credentials are available
    if (process.env.COINBASE_CDP_API_KEY && process.env.COINBASE_CDP_API_SECRET) {
      walletProvider = await CdpWalletProvider.configureWithWallet({
        apiKeyName: process.env.COINBASE_CDP_API_KEY,
        apiKeyPrivateKey: process.env.COINBASE_CDP_API_SECRET,
        networkId: activeChain,
      });
      console.log("Using CDP wallet provider");
    } else {
      // Fall back to mock wallet provider
      walletProvider = mockWalletProvider();
      console.log("Using mock wallet provider");
    }
  } catch (error) {
    console.error("Failed to initialize wallet provider:", error);
    // Fall back to mock wallet provider
    walletProvider = mockWalletProvider();
    console.log("Falling back to mock wallet provider");
  }

  // Create AgentKit instance
  return AgentKit.from({
    walletProvider,
    actionProviders: [
      pythActionProvider(),
      walletActionProvider(),
      erc20ActionProvider(),
      safeActionProvider(),
      basenameActionProvider(),
      // Only include Alchemy if API key is available
      ...(process.env.ALCHEMY_API_KEY ? [alchemyActionProvider(process.env.ALCHEMY_API_KEY)] : []),
      zoraActionProvider(),
    ],
  });
};
