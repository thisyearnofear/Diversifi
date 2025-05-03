import { z } from 'zod';

// Define the schema for the Farcaster action
export const farcasterActionSchema = z.object({
  title: z.string().default('Set up a Farcaster account'),
  description: z
    .string()
    .default(
      'Create a Farcaster account and join the decentralized social network',
    ),
  chain: z.string().default('FARCASTER'),
  difficulty: z.string().default('beginner'),
  steps: z
    .array(z.string())
    .default([
      'Go to https://www.farcaster.xyz on mobile and sign up',
      'Use an invite code e.g. EC235BN6F, MFRACUEJK, T3QOBXWTC',
      'Say hi to @papa as your first cast',
      'Copy your profile URL (e.g. https://warpcast.com/papa)',
    ]),
  reward: z.string().default('Starter packs from the community'),
  actionUrl: z.string().default('https://www.farcaster.xyz'),
  proofFieldLabel: z.string().default('Your Warpcast Profile URL'),
  proofFieldPlaceholder: z
    .string()
    .default('https://warpcast.com/yourusername'),
});

// Define the type for the Farcaster action
export type FarcasterAction = z.infer<typeof farcasterActionSchema>;

// Validate a Warpcast URL
export const validateWarpcastUrl = (url: string): boolean => {
  // Basic validation for Warpcast URLs
  const warpcastRegex = /^https:\/\/warpcast\.com\/[^\/]+\/?$/i;
  return warpcastRegex.test(url);
};

// Create a default Farcaster action
export const createFarcasterAction = (
  overrides: Partial<FarcasterAction> = {},
): FarcasterAction => {
  return farcasterActionSchema.parse({
    ...overrides,
  });
};
