import { getDb } from './connection';

// Export the database instance
export const db = getDb();

// Re-export everything from connection
export * from './connection';
