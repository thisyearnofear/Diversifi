import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables from .env file
config();

const listTables = async () => {
  if (!process.env.POSTGRES_URL) {
    console.error('❌ POSTGRES_URL is not defined');
    process.exit(1);
  }

  try {
    console.log('⏳ Connecting to database...');
    const connection = postgres(process.env.POSTGRES_URL, { max: 1 });

    console.log('⏳ Listing tables...');
    const result = await connection.unsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    console.log('✅ Tables in database:');
    result.forEach((row: any) => {
      console.log(`- ${row.table_name}`);
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

listTables();
