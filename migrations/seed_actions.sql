-- Insert or update the cKES action
INSERT INTO "Action" (
  "id",
  "title",
  "description",
  "category",
  "chain",
  "difficulty",
  "prerequisites",
  "steps",
  "rewards",
  "createdAt",
  "updatedAt"
)
VALUES (
  '2f9e3a1c-5c0e-4b5a-9d8f-3a1c5c0e4b5a',
  'Get cKES Stablecoins',
  'Acquire Kenyan Shilling stablecoins (cKES) on the Celo network',
  'STABLECOIN',
  'CELO',
  'BEGINNER',
  ARRAY[jsonb_build_array('Connect your wallet', 'Switch to Celo network')]::json[],
  ARRAY[jsonb_build_array('Approve cUSD for swap', 'Swap cUSD for cKES')]::json[],
  ARRAY[jsonb_build_array('cKES tokens', 'Geographic diversification')]::json[],
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO UPDATE
SET
  "title" = EXCLUDED."title",
  "description" = EXCLUDED."description",
  "category" = EXCLUDED."category",
  "chain" = EXCLUDED."chain",
  "difficulty" = EXCLUDED."difficulty",
  "prerequisites" = EXCLUDED."prerequisites",
  "steps" = EXCLUDED."steps",
  "rewards" = EXCLUDED."rewards",
  "updatedAt" = NOW();

-- Insert or update the EURA action
INSERT INTO "Action" (
  "id",
  "title",
  "description",
  "category",
  "chain",
  "difficulty",
  "prerequisites",
  "steps",
  "rewards",
  "createdAt",
  "updatedAt"
)
VALUES (
  '3f9e3a1c-5c0e-4b5a-9d8f-3a1c5c0e4b5b',
  'Get EURA Stablecoins',
  'Acquire Euro stablecoins (EURA) on the Optimism network',
  'STABLECOIN',
  'OPTIMISM',
  'BEGINNER',
  ARRAY[jsonb_build_array('Connect your wallet', 'Switch to Optimism network')]::json[],
  ARRAY[jsonb_build_array('Approve ETH for swap', 'Swap ETH for EURA')]::json[],
  ARRAY[jsonb_build_array('EURA tokens', 'Geographic diversification')]::json[],
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO UPDATE
SET
  "title" = EXCLUDED."title",
  "description" = EXCLUDED."description",
  "category" = EXCLUDED."category",
  "chain" = EXCLUDED."chain",
  "difficulty" = EXCLUDED."difficulty",
  "prerequisites" = EXCLUDED."prerequisites",
  "steps" = EXCLUDED."steps",
  "rewards" = EXCLUDED."rewards",
  "updatedAt" = NOW();

-- Insert or update the Register on Optimism action
INSERT INTO "Action" (
  "id",
  "title",
  "description",
  "category",
  "chain",
  "difficulty",
  "prerequisites",
  "steps",
  "rewards",
  "createdAt",
  "updatedAt"
)
VALUES (
  '4f9e3a1c-5c0e-4b5a-9d8f-3a1c5c0e4b5c',
  'Register on Optimism',
  'Register for Divvi on the Optimism network',
  'STABLECOIN',
  'OPTIMISM',
  'BEGINNER',
  ARRAY[jsonb_build_array('Connect your wallet', 'Switch to Optimism network')]::json[],
  ARRAY[jsonb_build_array('Register with Divvi', 'Complete the registration')]::json[],
  ARRAY[jsonb_build_array('Optimism registration', 'Access to Optimism ecosystem')]::json[],
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO UPDATE
SET
  "title" = EXCLUDED."title",
  "description" = EXCLUDED."description",
  "category" = EXCLUDED."category",
  "chain" = EXCLUDED."chain",
  "difficulty" = EXCLUDED."difficulty",
  "prerequisites" = EXCLUDED."prerequisites",
  "steps" = EXCLUDED."steps",
  "rewards" = EXCLUDED."rewards",
  "updatedAt" = NOW();
