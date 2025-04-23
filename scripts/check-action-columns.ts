import { config } from "dotenv";
import postgres from "postgres";

// Load environment variables from .env file
config();

const checkActionColumns = async () => {
  if (!process.env.POSTGRES_URL) {
    console.error("❌ POSTGRES_URL is not defined");
    process.exit(1);
  }

  try {
    console.log("⏳ Connecting to database...");
    const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
    
    console.log("⏳ Checking Action table columns...");
    const columns = await connection.unsafe(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Action'
      ORDER BY ordinal_position
    `);
    
    console.log("✅ Action table columns:");
    columns.forEach((col: any) => {
      console.log(`- ${col.column_name} (${col.data_type})`);
    });
    
    // Close the connection
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Database check failed");
    console.error(error);
    process.exit(1);
  }
};

checkActionColumns();
