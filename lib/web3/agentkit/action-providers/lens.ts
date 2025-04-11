import { ActionProvider, CreateAction, WalletProvider } from "@coinbase/agentkit";
import { z } from "zod";
import { Network } from "./types";

/**
 * LensActionProvider provides actions for setting up a Lens account.
 */
export class LensActionProvider extends ActionProvider<WalletProvider> {
  /**
   * Constructor for the LensActionProvider.
   */
  constructor() {
    super("lens", []);
  }

  /**
   * Set up a Lens account action.
   *
   * @param _walletProvider - The wallet provider (not used for this action).
   * @returns A JSON string with the Lens action data.
   */
  @CreateAction({
    name: "lens-action",
    description: "Set up a Lens account and join the decentralized social network",
    schema: z.object({}).describe("No parameters needed"),
  })
  async setupLensAccount(_walletProvider: WalletProvider): Promise<string> {
    // Return a JSON string with the Lens action data
    return JSON.stringify({
      title: "Set up Lens Account",
      description: "Create a Lens account and join the decentralized social network",
      chain: "LENS",
      difficulty: "beginner",
      steps: [
        "Go to https://onboarding.lens.xyz and sign up",
        "Connect your wallet",
        "Create your profile",
        "Copy your profile URL (e.g. https://hey.xyz/u/username)",
      ],
      reward: "Access to the Lens ecosystem",
      actionUrl: "https://onboarding.lens.xyz",
      proofFieldLabel: "Your Lens Profile URL",
      proofFieldPlaceholder: "https://hey.xyz/u/yourusername",
    });
  }

  /**
   * Checks if the Lens action provider supports the given network.
   * Lens actions are supported on all networks.
   *
   * @param network - The network to check.
   * @returns True, as Lens actions are supported on all networks.
   */
  supportsNetwork = (_network: Network) => true;
}

/**
 * Factory function to create a new LensActionProvider.
 * @returns A new LensActionProvider instance.
 */
export const lensActionProvider = () => new LensActionProvider();
