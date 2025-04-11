import { ActionProvider, CreateAction, WalletProvider } from "@coinbase/agentkit";
import { z } from "zod";
import { Network } from "./types";

/**
 * BaseActionProvider provides actions for swapping to USDbC on Aerodrome.
 */
export class BaseActionProvider extends ActionProvider<WalletProvider> {
  /**
   * Constructor for the BaseActionProvider.
   */
  constructor() {
    super("base", []);
  }

  /**
   * Check if the provider supports the given network.
   * @param network - The network to check support for.
   * @returns True if the network is supported, false otherwise.
   */
  supportsNetwork(network: Network): boolean {
    // Check if the network is Base (chainId 8453)
    return network.chainId === "8453" ||
           network.protocolFamily.toLowerCase() === "base" ||
           network.networkId === "base";
  }

  /**
   * Get USDbC on Base action.
   *
   * @param _walletProvider - The wallet provider (not used for this action).
   * @returns A JSON string with the Base action data.
   */
  @CreateAction({
    name: "base-action",
    description: "Get USD-backed stablecoins on Base by setting up your account and swapping for USDbC",
    schema: z.object({}).describe("No parameters needed"),
  })
  async baseAction(_walletProvider: WalletProvider): Promise<string> {
    // Return a JSON string with both Base actions
    return JSON.stringify([
      {
        title: "Set up Base Account",
        description: "Enable portfolio tracking on Base",
        chain: "BASE",
        difficulty: "beginner",
        steps: [
          "Connect your wallet to continue",
          "Click 'Set Up Account' to enable portfolio tracking",
          "Confirm the transaction in your wallet",
          "Click 'Complete Setup' to finish"
        ],
        reward: "Access portfolio tracking and future rebalancing features",
        actionUrl: "",
        proofFieldLabel: "Transaction Hash",
        proofFieldPlaceholder: "0x..."
      },
      {
        title: "Get USDbC Stablecoins",
        description: "Secure USD-backed tokens on Base",
        chain: "BASE",
        difficulty: "beginner",
        steps: [
          "Click 'Get USDbC' to go to the swap interface",
          "Connect your wallet to Aerodrome",
          "Swap ETH for USDbC (already pre-selected)",
          "Confirm the transaction",
          "Copy the transaction hash",
          "Paste it below and click 'Complete Action'"
        ],
        reward: "",
        actionUrl: "https://aerodrome.finance/swap?inputCurrency=ETH&outputCurrency=0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
        proofFieldLabel: "Transaction Hash",
        proofFieldPlaceholder: "0x..."
      }
    ]);
  }
}

/**
 * Factory function to create a new BaseActionProvider.
 * @returns A new BaseActionProvider instance.
 */
export const baseActionProvider = () => new BaseActionProvider();