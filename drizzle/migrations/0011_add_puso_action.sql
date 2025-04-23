-- Add PUSO action to the database
INSERT INTO "action" ("id", "title", "description", "category", "chain", "difficulty", "prerequisites", "steps", "rewards", "createdAt", "updatedAt")
VALUES
  ('6a586388-9248-4f1f-9c71-0c2a7db70b36', 'Get PUSO Stablecoins', 'Get Philippine Peso stablecoins on Celo', 'stablecoins', 'CELO', 'BEGINNER', '[]', '[{"title": "Connect your wallet"}, {"title": "Switch to Celo network"}, {"title": "Swap cUSD for PUSO"}]', '[{"type": "POINTS", "description": "Earn 5 points and get PUSO stablecoins"}]', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Add PUSO action to the Asia region
INSERT INTO "action_region" ("actionId", "region")
VALUES
  ('6a586388-9248-4f1f-9c71-0c2a7db70b36', 'Asia')
ON CONFLICT ("actionId", "region") DO NOTHING;
