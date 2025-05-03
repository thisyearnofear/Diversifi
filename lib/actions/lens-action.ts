import { z } from 'zod';

// Define the schema for the Lens action
export const lensActionSchema = z.object({
  title: z.string().default('Set up a Lens account'),
  description: z
    .string()
    .default('Create a Lens account and join the decentralized social network'),
  chain: z.string().default('LENS'),
  difficulty: z.string().default('beginner'),
  steps: z
    .array(z.string())
    .default([
      'Go to https://onboarding.lens.xyz and sign up',
      'Connect your wallet',
      'Create your profile',
      'Copy your profile URL (e.g. https://hey.xyz/u/username)',
    ]),
  reward: z.string().default('Access to the Lens ecosystem'),
  actionUrl: z.string().default('https://onboarding.lens.xyz'),
  proofFieldLabel: z.string().default('Your Lens Profile URL'),
  proofFieldPlaceholder: z.string().default('https://hey.xyz/u/yourusername'),
});

// Define the type for the Lens action
export type LensAction = z.infer<typeof lensActionSchema>;

// Validate a Lens URL
export const validateLensUrl = (url: string): boolean => {
  // Basic validation for Lens URLs
  const lensRegex = /^https:\/\/hey\.xyz\/u\/[^\/]+\/?$/i;
  return lensRegex.test(url);
};

// Create a default Lens action
export const createLensAction = (
  overrides: Partial<LensAction> = {},
): LensAction => {
  return lensActionSchema.parse({
    ...overrides,
  });
};
