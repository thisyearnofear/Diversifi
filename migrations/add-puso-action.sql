-- Add PUSO action to the database
INSERT INTO "Action" ("id", "title", "description", "category", "chain", "difficulty", "prerequisites", "steps", "rewards", "createdAt", "updatedAt")
VALUES
  ('6a586388-9248-4f1f-9c71-0c2a7db70b36', 'Get PUSO Stablecoins', 'Get Philippine Peso stablecoins on Celo', 'STABLECOIN', 'CELO', 'BEGINNER',
   ARRAY[]::jsonb[],
   ARRAY[jsonb_build_object('title', 'Connect your wallet'), jsonb_build_object('title', 'Switch to Celo network'), jsonb_build_object('title', 'Swap cUSD for PUSO')]::jsonb[],
   ARRAY[jsonb_build_object('type', 'POINTS', 'description', 'Earn 5 points and get PUSO stablecoins')]::jsonb[],
   NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Check if action_region table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'action_region') THEN
        -- Add PUSO action to the Asia region
        INSERT INTO "action_region" ("actionId", "region")
        VALUES
          ('6a586388-9248-4f1f-9c71-0c2a7db70b36', 'Asia')
        ON CONFLICT ("actionId", "region") DO NOTHING;
    END IF;
END
$$;
