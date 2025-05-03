import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables from .env file
config();

const updateChainConstraint = async () => {
  if (!process.env.POSTGRES_URL) {
    console.error('❌ POSTGRES_URL is not defined');
    process.exit(1);
  }

  try {
    console.log('⏳ Connecting to database...');
    const connection = postgres(process.env.POSTGRES_URL, { max: 1 });

    // First, check the current constraint
    console.log('⏳ Checking current chain constraint...');
    const currentConstraint = await connection.unsafe(`
      SELECT pg_get_constraintdef(oid) 
      FROM pg_constraint 
      WHERE conname = 'Action_chain_check'
    `);

    console.log(
      'Current constraint:',
      currentConstraint[0]?.pg_get_constraintdef,
    );

    // Get the column type
    console.log('⏳ Checking chain column type...');
    const columnType = await connection.unsafe(`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Action' 
      AND column_name = 'chain'
    `);

    console.log('Chain column type:', columnType[0]?.data_type);

    // Drop the existing constraint
    console.log('⏳ Dropping existing constraint...');
    await connection.unsafe(`
      ALTER TABLE "Action" DROP CONSTRAINT IF EXISTS "Action_chain_check"
    `);

    // Add the new constraint with POLYGON included
    console.log('⏳ Adding new constraint with POLYGON...');
    await connection.unsafe(`
      ALTER TABLE "Action" ADD CONSTRAINT "Action_chain_check" 
      CHECK (chain IN ('BASE', 'ETHEREUM', 'OPTIMISM', 'CELO', 'POLYGON'))
    `);

    // Verify the new constraint
    console.log('⏳ Verifying new constraint...');
    const newConstraint = await connection.unsafe(`
      SELECT pg_get_constraintdef(oid) 
      FROM pg_constraint 
      WHERE conname = 'Action_chain_check'
    `);

    console.log('✅ New constraint:', newConstraint[0]?.pg_get_constraintdef);

    // Close the connection
    await connection.end();
    console.log('✅ Chain constraint updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to update chain constraint');
    console.error(error);
    process.exit(1);
  }
};

updateChainConstraint();
