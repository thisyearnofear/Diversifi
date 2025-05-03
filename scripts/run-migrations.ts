import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

// Load environment variables from .env file
config();

const runMigrate = async () => {
  if (!process.env.POSTGRES_URL) {
    console.error('❌ POSTGRES_URL is not defined');
    process.exit(1);
  }

  try {
    console.log('⏳ Connecting to database...');
    const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
    const db = drizzle(connection);

    console.log('⏳ Running migrations...');
    const start = Date.now();
    await migrate(db, { migrationsFolder: './lib/db/migrations' });
    const end = Date.now();

    console.log('✅ Migrations completed in', end - start, 'ms');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed');
    console.error(error);
    process.exit(1);
  }
};

runMigrate();
