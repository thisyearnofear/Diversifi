import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import path from 'node:path';

// Load environment variables from .env file
config();

export const runMigrations = async (migrationsPath?: string) => {
  if (!process.env.POSTGRES_URL) {
    console.warn('⚠️ POSTGRES_URL is not defined, skipping migrations');
    return;
  }

  try {
    console.log('⏳ Connecting to database...');
    const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
    const db = drizzle(connection);

    const migrationsFolder = migrationsPath || path.resolve('./lib/db/migrations');
    console.log(`⏳ Running migrations from ${migrationsFolder}...`);

    const start = Date.now();
    await migrate(db, { migrationsFolder });
    const end = Date.now();

    console.log('✅ Migrations completed in', end - start, 'ms');
    await connection.end();
  } catch (error) {
    console.error('❌ Migration failed');
    console.error(error);
    throw error;
  }
};

if (require.main === module) {
  runMigrations().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
