import { z } from "zod";
import { ActionProvider, CreateAction, WalletProvider } from "@coinbase/agentkit";
import { Network } from "./types";

/**
 * Action provider for Celo-related actions.
 */
export class CeloActionProvider extends ActionProvider<WalletProvider> {
  /**
   * Constructor for the CeloActionProvider.
   */
  constructor() {
    super("celo", []);
  }
  /**
   * Check if the provider supports the given network.
   * @param network - The network to check support for.
   * @returns True if the network is supported, false otherwise.
   */
  supportsNetwork(network: Network): boolean {
    // Check if the network is Celo (chainId 42220)
    return network.chainId === "42220" ||
           network.protocolFamily.toLowerCase() === "celo" ||
           network.networkId === "celo-mainnet";
  }

  /**
   * Get cUSD on Celo action.
   *
   * @param _walletProvider - The wallet provider (not used for this action).
   * @returns A JSON string with the Celo action data.
   */
  @CreateAction({
    name: "celo-action",
    description: "Get USD-backed stablecoins on Celo by setting up your account and swapping for cUSD",
    schema: z.object({}).describe("No parameters needed"),
  })
  async celoAction(_walletProvider: WalletProvider): Promise<string> {
    // Return a JSON string with both Celo actions
    return JSON.stringify([
      {
        title: "Register on Celo",
        description: "Enable portfolio tracking on Celo",
        chain: "CELO",
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
        title: "Get cUSD Stablecoins",
        description: "Secure USD-backed tokens on Celo",
        chain: "CELO",
        difficulty: "beginner",
        steps: [
          "Choose CELO as your source token",
          "Enter the amount you want to swap",
          "Review and confirm the swap",
          "Wait for the transaction to complete"
        ],
        reward: "Access to USD-backed stablecoins on Celo",
        actionUrl: "https://app.uniswap.org/#/swap?inputCurrency=0x471ece3750da237f93b8e339c536989b8978a438&outputCurrency=0x765DE816845861e75A25fCA122bb6898B8B1282a&chain=celo",
        proofFieldLabel: "Transaction Hash",
        proofFieldPlaceholder: "0x..."
      }
    ]);
  }
}

/**
 * Factory function to create a new CeloActionProvider.
 * @returns A new CeloActionProvider instance.
 */
export const celoActionProvider = () => new CeloActionProvider();
