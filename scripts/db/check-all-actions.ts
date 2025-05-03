import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables from .env file
config();

const checkAllActions = async () => {
  if (!process.env.POSTGRES_URL) {
    console.error('❌ POSTGRES_URL is not defined');
    process.exit(1);
  }

  try {
    console.log('⏳ Connecting to database...');
    const connection = postgres(process.env.POSTGRES_URL, { max: 1 });

    console.log('⏳ Listing all actions...');
    const result = await connection.unsafe(`
      SELECT id, title, description, category, chain FROM "Action"
    `);

    console.log('✅ Actions in database:');
    result.forEach((row: any) => {
      console.log(`- ${row.title} (${row.chain}): ${row.description}`);
    });

    // Close the connection
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database check failed');
    console.error(error);
    process.exit(1);
  }
};

checkAllActions();
