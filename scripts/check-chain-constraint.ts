import { config } from "dotenv";
import postgres from "postgres";

// Load environment variables from .env file
config();

const checkChainConstraint = async () => {
  if (!process.env.POSTGRES_URL) {
    console.error("❌ POSTGRES_URL is not defined");
    process.exit(1);
  }

  try {
    console.log("⏳ Connecting to database...");
    const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
    
    console.log("⏳ Checking chain constraint...");
    const result = await connection.unsafe(`
      SELECT pg_get_constraintdef(oid) 
      FROM pg_constraint 
      WHERE conname = 'Action_chain_check'
    `);
    
    console.log("✅ Chain constraint:", result[0]?.pg_get_constraintdef);
    
    // Get unique chain values
    const chains = await connection.unsafe(`
      SELECT DISTINCT "chain" FROM "Action"
    `);
    
    console.log("✅ Existing chain values:", chains.map((c: any) => c.chain));
    
    // Close the connection
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Database check failed");
    console.error(error);
    process.exit(1);
  }
};

checkChainConstraint();
