import { ActionProvider, CreateAction, WalletProvider } from "@coinbase/agentkit";
import { z } from "zod";
import { Network } from "./types";

/**
 * PolygonActionProvider provides actions for getting DAI on Polygon.
 */
export class PolygonActionProvider extends ActionProvider<WalletProvider> {
  /**
   * Constructor for the PolygonActionProvider.
   */
  constructor() {
    super("polygon", []);
  }

  /**
   * Get DAI on Polygon action.
   *
   * @param _walletProvider - The wallet provider (not used for this action).
   * @returns A JSON string with the Polygon action data.
   */
  @CreateAction({
    name: "polygon-action",
    description: "Get DAI stablecoins on Polygon by setting up your account and swapping for DAI",
    schema: z.object({}).describe("No parameters needed"),
  })
  async polygonAction(_walletProvider: WalletProvider): Promise<string> {
    // Return a JSON string with both Polygon actions
    return JSON.stringify([
      {
        title: "Register on Polygon",
        description: "Enable portfolio tracking on Polygon",
        chain: "POLYGON",
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
        title: "Get DAI Stablecoins",
        description: "Secure USD-backed tokens on Polygon",
        chain: "POLYGON",
        difficulty: "beginner",
        steps: [
          "Click 'Get DAI' to prepare the transaction",
          "Review the transaction details",
          "Confirm the transaction in your wallet",
          "Wait for the transaction to complete"
        ],
        reward: "Access to DAI stablecoins on Polygon",
        actionUrl: "",
        proofFieldLabel: "Transaction Hash",
        proofFieldPlaceholder: "0x..."
      }
    ]);
  }

  /**
   * Checks if the Polygon action provider supports the given network.
   *
   * @param network - The network to check.
   * @returns True if the network is supported by Polygon, false otherwise.
   */
  supportsNetwork = (network: Network) => {
    return network.networkId === "polygon" || network.networkId === "polygon-mumbai";
  };
}

/**
 * Factory function to create a new PolygonActionProvider.
 * @returns A new PolygonActionProvider instance.
 */
export const polygonActionProvider = () => new PolygonActionProvider();
