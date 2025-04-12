import {
  AgentKit,
  pythActionProvider,
  walletActionProvider,
  WalletProvider,
} from "@coinbase/agentkit";
import { ConnectKitWalletProvider } from "./wallet-providers/connectKitWalletProvider";
import { erc20ActionProvider } from "./action-providers/erc20";
import { safeActionProvider } from "./action-providers/safe";
import { alchemyActionProvider } from "./action-providers/alchemy";
import { zoraActionProvider } from "./action-providers/zora";
import { basenameActionProvider } from "./action-providers/basename";
import { lensActionProvider } from "./action-providers/lens";
import { baseActionProvider } from "./action-providers/base";
import { optimismActionProvider } from "./action-providers/optimism";

export const setupAgentKit = async () => {
  const activeChain =
    process.env.NEXT_PUBLIC_ACTIVE_CHAIN === "base"
      ? "base-mainnet"
      : "base-sepolia";

  let walletProvider: WalletProvider;

  // Configure ConnectKit wallet provider
  walletProvider = (await ConnectKitWalletProvider.configureWithWallet(
    activeChain
  )) as unknown as WalletProvider;
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
      lensActionProvider(),
      baseActionProvider(),
      optimismActionProvider(),
      // Only include Alchemy if API key is available
      ...(process.env.ALCHEMY_API_KEY
        ? [alchemyActionProvider(process.env.ALCHEMY_API_KEY)]
        : []),
      zoraActionProvider(),
    ],
  });
};
