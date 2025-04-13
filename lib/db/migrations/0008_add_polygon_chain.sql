-- This migration adds "POLYGON" as a valid value for the chain enum in the Action table

-- First, drop the existing constraint
ALTER TABLE "Action" DROP CONSTRAINT IF EXISTS "Action_chain_check";

-- Alter the chain column to accept "POLYGON" as a valid value
ALTER TABLE "Action" 
ALTER COLUMN "chain" 
TYPE VARCHAR(255) 
USING "chain"::text;

-- Add the new constraint with POLYGON included
ALTER TABLE "Action" 
ADD CONSTRAINT "Action_chain_check" 
CHECK ("chain" IN ('BASE', 'CELO', 'ETHEREUM', 'OPTIMISM', 'POLYGON'));
