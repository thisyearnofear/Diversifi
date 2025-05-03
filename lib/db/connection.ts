import 'server-only';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

// Create a singleton database connection
let client: postgres.Sql | null = null;
let db: ReturnType<typeof drizzle> | null = null;

// Create a function to get the database connection
export const getDbClient = () => {
  if (client) return client;

  try {
    const connectionString =
      process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

    if (!connectionString) {
      console.warn(
        '⚠️ No database connection string found. Some features may not work.',
      );
      return null;
    }

    client = postgres(connectionString, {
      port: 5432,
      ssl: { rejectUnauthorized: false },
      max: 1,
    });

    return client;
  } catch (error) {
    console.error('Failed to create database client:', error);
    return null;
  }
};

// Get the database instance
export const getDb = () => {
  if (db) return db;

  const client = getDbClient();
  if (!client) return null;

  db = drizzle(client, { schema });
  return db;
};

// Export a function to check if the database is available
export const isDatabaseAvailable = async () => {
  try {
    const db = getDb();
    if (!db) return false;

    // Try a simple query to check if the database is available
    await db.execute('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database availability check failed:', error);
    return false;
  }
};

// Note: We don't need to export sql tag as we're using drizzle's API
