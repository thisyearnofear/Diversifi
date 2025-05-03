import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables from .env file
config();

const checkPusoAction = async () => {
  if (!process.env.POSTGRES_URL) {
    console.error('❌ POSTGRES_URL is not defined');
    process.exit(1);
  }

  try {
    console.log('⏳ Connecting to database...');
    const connection = postgres(process.env.POSTGRES_URL, { max: 1 });

    console.log('⏳ Checking for PUSO action...');
    const result = await connection.unsafe(`
      SELECT * FROM "Action" WHERE title = 'Get PUSO Stablecoins'
    `);

    if (result.length > 0) {
      console.log('✅ PUSO action found in database:', result[0]);
    } else {
      console.log('❌ PUSO action not found in database');
    }

    // Close the connection
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database check failed');
    console.error(error);
    process.exit(1);
  }
};

checkPusoAction();
