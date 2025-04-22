-- First, create a new type with the updated values
CREATE TYPE "chain_enum_new" AS ENUM ('BASE', 'CELO', 'ETHEREUM', 'OPTIMISM', 'POLYGON');

-- Then, update the column to use the new type
ALTER TABLE "Action" 
  ALTER COLUMN "chain" TYPE "chain_enum_new" 
  USING "chain"::text::"chain_enum_new";

-- Finally, drop the old type
DROP TYPE IF EXISTS "chain_enum";

-- Rename the new type to the original name
ALTER TYPE "chain_enum_new" RENAME TO "chain_enum";
