import { config } from 'dotenv';
import postgres from 'postgres';
import fs from 'node:fs';

// Load environment variables from .env file
config();

const runSQL = async () => {
  if (!process.env.POSTGRES_URL) {
    console.error('❌ POSTGRES_URL is not defined');
    process.exit(1);
  }

  try {
    console.log('⏳ Connecting to database...');
    const connection = postgres(process.env.POSTGRES_URL, { max: 1 });

    // Read the SQL file
    const sqlContent = fs.readFileSync('./add-puso-action.sql', 'utf8');

    console.log('⏳ Running SQL...');
    const start = Date.now();

    // Execute the SQL
    await connection.unsafe(sqlContent);

    const end = Date.now();
    console.log('✅ SQL executed successfully in', end - start, 'ms');

    // Close the connection
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ SQL execution failed');
    console.error(error);
    process.exit(1);
  }
};

runSQL();
