import { ActionProvider } from "@coinbase/agentkit";
import { z } from "zod";

export const lensActionProvider = (): ActionProvider => {
  return {
    name: "lens",
    getActions: () => [
      {
        name: "lens-action",
        description: "Set up a Lens account and join the decentralized social network",
        schema: z.object({}).describe("No parameters needed"),
        invoke: async () => {
          return {
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
          };
        },
      },
    ],
  };
};
