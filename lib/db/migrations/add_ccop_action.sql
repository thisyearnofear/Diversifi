-- Add cCOP action to the database
INSERT INTO actions (id, title, description, category, chain, reward, steps, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Get cCOP Stablecoins',
  'Get Colombian Peso stablecoins (cCOP) on the Celo blockchain',
  'stablecoins',
  'CELO',
  'Earn 5 points and get cCOP stablecoins',
  ARRAY['Connect your wallet', 'Switch to Celo network', 'Swap cUSD for cCOP']::jsonb[],
  NOW(),
  NOW()
)
ON CONFLICT (title) DO NOTHING;
