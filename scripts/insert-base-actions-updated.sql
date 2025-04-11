-- This SQL script inserts the Base actions directly into the database
-- Run in Supabase SQL Editor

-- Insert Divvi registration action
INSERT INTO "Action" (
  id, title, description, category, chain, difficulty, 
  prerequisites, steps, rewards, "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(), 
  'Register on Stable Station',
  'Activate on the Base ecosystem for enhanced features',
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

-- Insert Aerodrome swap action with in-app swap steps
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
      "description": "Click ''Get USDbC'' to start the swap process"
    },
    {
      "title": "Select token to swap",
      "description": "Choose ETH or USDC to swap for USDbC"
    },
    {
      "title": "Enter amount",
      "description": "Specify how much you want to swap"
    },
    {
      "title": "Review swap details",
      "description": "Check the exchange rate and transaction details"
    },
    {
      "title": "Confirm transaction",
      "description": "Approve the transaction in your wallet"
    },
    {
      "title": "Complete swap",
      "description": "Wait for the transaction to be confirmed"
    }
  ]'::jsonb,
  '[]'::jsonb, -- Empty array for rewards
  NOW(),
  NOW()
);
