import {
  AgentKit,
  pythActionProvider,
  walletActionProvider,
} from "@coinbase/agentkit";
import { ConnectKitWalletProvider } from "./wallet-providers/connectKitWalletProvider";
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

  // Configure ConnectKit wallet provider
  walletProvider = await ConnectKitWalletProvider.configureWithWallet(activeChain);
  console.log("Using ConnectKit wallet provider");

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
