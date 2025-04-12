import { z } from "zod";
import { ActionProvider, CreateAction, WalletProvider } from "@coinbase/agentkit";
import { Network } from "./types";

/**
 * Action provider for Optimism-related actions.
 */
export class OptimismActionProvider extends ActionProvider<WalletProvider> {
  /**
   * Constructor for the OptimismActionProvider.
   */
  constructor() {
    super("optimism", []);
  }
  /**
   * Check if the provider supports the given network.
   * @param network - The network to check support for.
   * @returns True if the network is supported, false otherwise.
   */
  supportsNetwork(network: Network): boolean {
    // Check if the network is Optimism (chainId 10)
    return network.chainId === "10" ||
           network.protocolFamily.toLowerCase() === "optimism" ||
           network.networkId === "optimism-mainnet";
  }

  /**
   * Get EURA on Optimism action.
   *
   * @param _walletProvider - The wallet provider (not used for this action).
   * @returns A JSON string with the Optimism action data.
   */
  @CreateAction({
    name: "optimism-action",
    description: "Get Euro-backed stablecoins on Optimism by setting up your account and swapping for EURA",
    schema: z.object({}).describe("No parameters needed"),
  })
  async optimismAction(_walletProvider: WalletProvider): Promise<string> {
    // Return a JSON string with both Optimism actions
    return JSON.stringify([
      {
        title: "Register on Optimism",
        description: "Enable portfolio tracking on Optimism",
        chain: "OPTIMISM",
        difficulty: "beginner",
        steps: [
          "Connect your wallet to continue",
          "Click 'Register' to enable portfolio tracking",
          "Confirm the transaction in your wallet",
          "Click 'Complete Registration' to finish"
        ],
        reward: "Access portfolio tracking and future rebalancing features",
        actionUrl: "",
        proofFieldLabel: "Transaction Hash",
        proofFieldPlaceholder: "0x..."
      },
      {
        title: "Swap to EURA on Velodrome",
        description: "Get Euro-backed stablecoins on Optimism",
        chain: "OPTIMISM",
        difficulty: "beginner",
        steps: [
          "Choose your source token (ETH or USDC)",
          "Enter the amount you want to swap",
          "Review and confirm the swap",
          "Wait for the transaction to complete"
        ],
        reward: "Access to Euro-backed stablecoins on Optimism",
        actionUrl: "https://app.velodrome.finance/swap?inputCurrency=ETH&outputCurrency=0x9485aca5bbBE1667AD97c7fE7C4531a624C8b1ED",
        proofFieldLabel: "Transaction Hash",
        proofFieldPlaceholder: "0x..."
      }
    ]);
  }
}

/**
 * Factory function to create a new OptimismActionProvider.
 * @returns A new OptimismActionProvider instance.
 */
export const optimismActionProvider = () => new OptimismActionProvider();
