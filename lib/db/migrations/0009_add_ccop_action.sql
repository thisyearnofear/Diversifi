-- Add cCOP action to the database
DO $$
BEGIN
  -- Check if the action already exists
  IF NOT EXISTS (SELECT 1 FROM "Action" WHERE title = 'Get cCOP Stablecoins') THEN
    -- Insert the action if it doesn't exist
    INSERT INTO "Action" (id, title, description, category, chain, difficulty, steps, rewards, "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(),
      'Get cCOP Stablecoins',
      'Get Colombian Peso stablecoins (cCOP) on the Celo blockchain',
      'stablecoins',
      'CELO',
      'BEGINNER',
      ARRAY[
        jsonb_build_object('description', 'Connect your wallet'),
        jsonb_build_object('description', 'Switch to Celo network'),
        jsonb_build_object('description', 'Swap cUSD for cCOP')
      ]::jsonb[],
      ARRAY[
        jsonb_build_object('description', 'Earn 5 points and get cCOP stablecoins')
      ]::jsonb[],
      NOW(),
      NOW()
    );
  END IF;
END
$$;
