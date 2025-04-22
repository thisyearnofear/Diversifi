-- Ensure the User table exists
CREATE TABLE IF NOT EXISTS "User" (
  "id" VARCHAR(42) PRIMARY KEY NOT NULL
);

-- Ensure the Action table exists with the correct schema
DO $$
BEGIN
  -- Check if the Action table exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Action') THEN
    -- Create the chain enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'chain_enum') THEN
      CREATE TYPE "chain_enum" AS ENUM ('BASE', 'CELO', 'ETHEREUM', 'OPTIMISM', 'POLYGON');
    END IF;

    -- Create the category enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'category_enum') THEN
      CREATE TYPE "category_enum" AS ENUM ('SOCIAL', 'DEFI', 'NFT', 'STABLECOIN', 'TRADING');
    END IF;

    -- Create the difficulty enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'difficulty_enum') THEN
      CREATE TYPE "difficulty_enum" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
    END IF;

    -- Create the Action table
    CREATE TABLE "Action" (
      "id" UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
      "title" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "category" "category_enum" NOT NULL,
      "chain" "chain_enum" NOT NULL,
      "difficulty" "difficulty_enum" NOT NULL,
      "prerequisites" JSONB[],
      "steps" JSONB[],
      "rewards" JSONB[],
      "createdAt" TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP NOT NULL
    );
  ELSE
    -- If the table exists, ensure the chain enum includes OPTIMISM
    -- First, check if the chain column is using an enum type
    IF EXISTS (
      SELECT 1 
      FROM pg_catalog.pg_attribute a
      JOIN pg_catalog.pg_class c ON a.attrelid = c.oid
      JOIN pg_catalog.pg_namespace n ON c.relnamespace = n.oid
      JOIN pg_catalog.pg_type t ON a.atttypid = t.oid
      WHERE c.relname = 'Action'
      AND n.nspname = 'public'
      AND a.attname = 'chain'
      AND t.typtype = 'e'
    ) THEN
      -- Check if OPTIMISM is already in the enum
      IF NOT EXISTS (
        SELECT 1
        FROM pg_enum
        WHERE enumtypid = (
          SELECT t.oid
          FROM pg_catalog.pg_attribute a
          JOIN pg_catalog.pg_class c ON a.attrelid = c.oid
          JOIN pg_catalog.pg_namespace n ON c.relnamespace = n.oid
          JOIN pg_catalog.pg_type t ON a.atttypid = t.oid
          WHERE c.relname = 'Action'
          AND n.nspname = 'public'
          AND a.attname = 'chain'
        )
        AND enumlabel = 'OPTIMISM'
      ) THEN
        -- Add OPTIMISM to the enum
        ALTER TYPE "chain_enum" ADD VALUE 'OPTIMISM';
      END IF;
    END IF;
  END IF;
END
$$;

-- Ensure the UserAction table exists
CREATE TABLE IF NOT EXISTS "UserAction" (
  "id" UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "userId" VARCHAR(42) NOT NULL REFERENCES "User"("id"),
  "actionId" UUID NOT NULL REFERENCES "Action"("id"),
  "status" VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED',
  "startedAt" TIMESTAMP,
  "completedAt" TIMESTAMP,
  "proof" JSONB,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL
);

-- Ensure the status column in UserAction has the correct enum values
DO $$
BEGIN
  -- Check if the status column exists
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'UserAction'
    AND column_name = 'status'
  ) THEN
    -- Update the status column to use the correct enum values
    ALTER TABLE "UserAction"
    ALTER COLUMN "status" TYPE VARCHAR(20),
    ALTER COLUMN "status" SET DEFAULT 'NOT_STARTED';
    
    -- Ensure the status column has a check constraint for the allowed values
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'UserAction_status_check'
    ) THEN
      ALTER TABLE "UserAction"
      ADD CONSTRAINT "UserAction_status_check"
      CHECK ("status" IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED'));
    END IF;
  END IF;
END
$$;
