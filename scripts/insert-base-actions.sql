-- This SQL script inserts the Base actions directly into the database
-- Run in Supabase SQL Editor

-- Insert Divvi registration action
INSERT INTO "Action" (
  id, title, description, category, chain, difficulty,
  prerequisites, steps, rewards, "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'Register on Stable Station',
  'Activate your account on the Base ecosystem for enhanced features',
  'STABLECOIN',
  'BASE',
  'BEGINNER',
  '[]'::jsonb, -- Empty array for prerequisites
  '[
    {
      "title": "Connect wallet",
      "description": "Connect your wallet to continue"
    },
    {
      "title": "Register on Stable Station",
      "description": "Click ''Register'' to activate your account on Base"
    },
    {
      "title": "Confirm transaction",
      "description": "Confirm the transaction in your wallet"
    },
    {
      "title": "Complete registration",
      "description": "Click ''Complete Registration'' to finish"
    }
  ]'::jsonb,
  '[
    {
      "type": "FEATURE",
      "description": "Enhanced access to stablecoin tools, portfolio management, and insights"
    }
  ]'::jsonb,
  NOW(),
  NOW()
);

-- Insert Aerodrome swap action
INSERT INTO "Action" (
  id, title, description, category, chain, difficulty,
  prerequisites, steps, rewards, "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'Get USDbC Stablecoins',
  'Secure USD-backed tokens on Base',
  'STABLECOIN',
  'BASE',
  'BEGINNER',
  '[]'::jsonb, -- Empty array for prerequisites
  '[
    {
      "title": "Get USDbC",
      "description": "Click ''Get USDbC'' to go to the swap interface"
    },
    {
      "title": "Connect wallet",
      "description": "Connect your wallet to Aerodrome"
    },
    {
      "title": "Swap ETH for USDbC",
      "description": "Swap ETH for USDbC (already pre-selected)"
    },
    {
      "title": "Confirm transaction",
      "description": "Confirm the transaction in your wallet"
    },
    {
      "title": "Copy transaction hash",
      "description": "Copy the transaction hash from your wallet or explorer"
    },
    {
      "title": "Complete action",
      "description": "Paste the transaction hash and click ''Complete Action''"
    }
  ]'::jsonb,
  '[]'::jsonb, -- Empty array for rewards
  NOW(),
  NOW()
);
