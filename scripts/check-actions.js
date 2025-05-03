// This script checks if the Base actions exist in the database
// Run with: node scripts/check-actions.js

const { Client } = require('pg');

// Database connection
const client = new Client({
  connectionString:
    'postgres://postgres.aioxeyzbcwtpwpmkixya:SDL0fAdUZuJkCvjC@aws-0-eu-west-1.pooler.supabase.com:5432/postgres',
  ssl: {
    rejectUnauthorized: false,
  },
});

async function checkActions() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected to database');

    // Check if the actions exist
    const checkDivviQuery = {
      text: 'SELECT * FROM "Action" WHERE title = $1',
      values: ['Set up Base Account'],
    };

    const checkAerodromeQuery = {
      text: 'SELECT * FROM "Action" WHERE title = $1',
      values: ['Get USDbC Stablecoins'],
    };

    const divviResult = await client.query(checkDivviQuery);
    const aerodromeResult = await client.query(checkAerodromeQuery);

    console.log('Divvi action exists:', divviResult.rows.length > 0);
    if (divviResult.rows.length > 0) {
      console.log('Divvi action ID:', divviResult.rows[0].id);
    }

    console.log('Aerodrome action exists:', aerodromeResult.rows.length > 0);
    if (aerodromeResult.rows.length > 0) {
      console.log('Aerodrome action ID:', aerodromeResult.rows[0].id);
    }

    // List all actions in the database
    const allActionsQuery = {
      text: 'SELECT id, title FROM "Action"',
    };

    const allActionsResult = await client.query(allActionsQuery);
    console.log('All actions in the database:');
    allActionsResult.rows.forEach((action) => {
      console.log(`- ${action.title} (${action.id})`);
    });
  } catch (error) {
    console.error('Error checking actions:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

checkActions();
