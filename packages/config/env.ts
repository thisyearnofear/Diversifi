/**
 * Environment variable validation and type safety
 * 
 * Usage:
 *   import { env } from '@diversifi/config'
 *   const apiKey = env.OPENAI_API_KEY
 */

const requiredEnvVars = {
  // AI
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,

  // Database
  POSTGRES_URL: process.env.POSTGRES_URL,
  POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,

  // Auth
  AUTH_SECRET: process.env.AUTH_SECRET,
  SESSION_SECRET: process.env.SESSION_SECRET,

  // Web3
  NEXT_PUBLIC_ACTIVE_CHAIN: process.env.NEXT_PUBLIC_ACTIVE_CHAIN,
  ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
} as const;

const optionalEnvVars = {
  // Storage
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,

  // OnchainKit
  NEXT_PUBLIC_ONCHAINKIT_API_KEY: process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY,
  NEXT_PUBLIC_CDP_PROJECT_ID: process.env.NEXT_PUBLIC_CDP_PROJECT_ID,

  // Coinbase Commerce
  NEXT_PUBLIC_COINBASE_COMMERCE_PRODUCT_STARTER_KIT:
    process.env.NEXT_PUBLIC_COINBASE_COMMERCE_PRODUCT_STARTER_KIT,
  NEXT_PUBLIC_COINBASE_COMMERCE_PRODUCT_STARTER_KIT_GIFT:
    process.env.NEXT_PUBLIC_COINBASE_COMMERCE_PRODUCT_STARTER_KIT_GIFT,
  COINBASE_COMMERCE_API_KEY: process.env.COINBASE_COMMERCE_API_KEY,

  // APIs
  PINATA_JWT: process.env.PINATA_JWT,
  NEXT_PUBLIC_COINGECKO_API_KEY: process.env.NEXT_PUBLIC_COINGECKO_API_KEY,
  NEXT_PUBLIC_MORALIS_API_KEY: process.env.NEXT_PUBLIC_MORALIS_API_KEY,

  // Feature flags
  NEXT_PUBLIC_DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
  NEXT_PUBLIC_MAINTENANCE_MODE: process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true',
} as const;

// Validate required vars at runtime
function validateEnv() {
  const missing: string[] = [];

  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Only validate in server context
if (typeof window === 'undefined') {
  validateEnv();
}

export const env = {
  ...requiredEnvVars,
  ...optionalEnvVars,
} as const;

export type Env = typeof env;
