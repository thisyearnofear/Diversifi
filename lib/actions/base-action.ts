import { z } from "zod";

// Define the schema for the Base account setup action
export const baseAccountSetupSchema = z.object({
  title: z.string().default("Set up Base Account"),
  description: z.string().default("Enable portfolio tracking on Base"),
  chain: z.string().default("BASE"),
  difficulty: z.string().default("beginner"),
  steps: z.array(z.string()).default([
    "Connect your wallet to continue",
    "Click 'Set Up Account' to enable portfolio tracking",
    "Confirm the transaction in your wallet",
    "Click 'Complete Setup' to finish"
  ]),
  reward: z.string().default("Access portfolio tracking and future rebalancing features"),
  actionUrl: z.string().default(""),
  proofFieldLabel: z.string().default("Transaction Hash"),
  proofFieldPlaceholder: z.string().default("0x...")
});

// Define the schema for the USDbC acquisition action
export const usdBcAcquisitionSchema = z.object({
  title: z.string().default("Get USDbC Stablecoins"),
  description: z.string().default("Secure USD-backed tokens on Base"),
  chain: z.string().default("BASE"),
  difficulty: z.string().default("beginner"),
  steps: z.array(z.string()).default([
    "Click 'Get USDbC' to go to the swap interface",
    "Connect your wallet to Aerodrome",
    "Swap ETH for USDbC (already pre-selected)",
    "Confirm the transaction",
    "Copy the transaction hash",
    "Paste it below and click 'Complete Action'"
  ]),
  reward: z.string().default(""),
  actionUrl: z.string().default("https://aerodrome.finance/swap?inputCurrency=ETH&outputCurrency=0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA"),
  proofFieldLabel: z.string().default("Transaction Hash"),
  proofFieldPlaceholder: z.string().default("0x...")
});

// Define the schema for the Base action (combines both actions)
export const baseActionSchema = z.union([baseAccountSetupSchema, usdBcAcquisitionSchema]);

// Define the types for the actions
export type BaseAccountSetupAction = z.infer<typeof baseAccountSetupSchema>;
export type UsdBcAcquisitionAction = z.infer<typeof usdBcAcquisitionSchema>;
export type BaseAction = z.infer<typeof baseActionSchema>;

// Validate a transaction hash
export const validateTransactionHash = (hash: string): boolean => {
  // Basic validation for transaction hashes
  const txHashRegex = /^0x([A-Fa-f0-9]{64})$/;
  return txHashRegex.test(hash);
};

// Create a default Base account setup action
export const createBaseAccountSetupAction = (
  overrides: Partial<BaseAccountSetupAction> = {}
): BaseAccountSetupAction => {
  return baseAccountSetupSchema.parse({
    ...overrides
  });
};

// Create a default USDbC acquisition action
export const createUsdBcAcquisitionAction = (
  overrides: Partial<UsdBcAcquisitionAction> = {}
): UsdBcAcquisitionAction => {
  return usdBcAcquisitionSchema.parse({
    ...overrides
  });
};

// Create a default Base action (defaults to Base account setup)
export const createBaseAction = (
  overrides: Partial<BaseAction> = {}
): BaseAction => {
  // Default to Base account setup if no title is provided
  if (!overrides.title || overrides.title === "Set up Base Account") {
    return createBaseAccountSetupAction(overrides as Partial<BaseAccountSetupAction>);
  } else if (overrides.title === "Get USDbC Stablecoins") {
    return createUsdBcAcquisitionAction(overrides as Partial<UsdBcAcquisitionAction>);
  } else {
    // Default to Base account setup
    return createBaseAccountSetupAction(overrides as Partial<BaseAccountSetupAction>);
  }
};
