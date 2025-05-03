// This script manually seeds the Base actions into the database
// Run with: node scripts/seed-base-actions-simple.js

const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

// Database connection
const client = new Client({
  connectionString: "postgres://postgres.aioxeyzbcwtpwpmkixya:SDL0fAdUZuJkCvjC@aws-0-eu-west-1.pooler.supabase.com:5432/postgres",
  ssl: {
    rejectUnauthorized: false
  }
});

async function seedBaseActions() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected to database');

    // Check if the actions already exist
    const checkDivviQuery = {
      text: 'SELECT * FROM "Action" WHERE title = $1',
      values: ['Set up Base Account']
    };

    const checkAerodromeQuery = {
      text: 'SELECT * FROM "Action" WHERE title = $1',
      values: ['Get USDbC Stablecoins']
    };

    const divviResult = await client.query(checkDivviQuery);
    const aerodromeResult = await client.query(checkAerodromeQuery);

    // Insert Divvi registration action if it doesn't exist
    if (divviResult.rows.length === 0) {
      console.log('Inserting Divvi registration action...');
      
      const divviActionQuery = {
        text: `
          INSERT INTO "Action" (
            id, title, description, category, chain, difficulty, 
            prerequisites, steps, rewards, "createdAt", "updatedAt"
          ) VALUES (
            $1, $2, $3, $4, $5, $6, 
            $7, $8, $9, $10, $11
          )
        `,
        values: [
          uuidv4(),
          'Set up Base Account',
          'Enable portfolio tracking on Base',
          'STABLECOIN',
          'BASE',
          'BEGINNER',
          '{}', // Empty array for prerequisites
          '[{"title":"Connect wallet","description":"Connect your wallet to continue"},{"title":"Set up Base Account","description":"Click \\'Set Up Account\\' to enable portfolio tracking"},{"title":"Confirm transaction","description":"Confirm the transaction in your wallet"},{"title":"Complete setup","description":"Click \\'Complete Setup\\' to finish"}]',
          '[{"type":"FEATURE","description":"Access portfolio tracking and future rebalancing features"}]',
          new Date(),
          new Date()
        ]
      };

      await client.query(divviActionQuery);
      console.log('Divvi registration action inserted successfully');
    } else {
      console.log('Divvi registration action already exists');
    }

    // Insert Aerodrome swap action if it doesn't exist
    if (aerodromeResult.rows.length === 0) {
      console.log('Inserting Aerodrome swap action...');
      
      const aerodromeActionQuery = {
        text: `
          INSERT INTO "Action" (
            id, title, description, category, chain, difficulty, 
            prerequisites, steps, rewards, "createdAt", "updatedAt"
          ) VALUES (
            $1, $2, $3, $4, $5, $6, 
            $7, $8, $9, $10, $11
          )
        `,
        values: [
          uuidv4(),
          'Get USDbC Stablecoins',
          'Secure USD-backed tokens on Base',
          'STABLECOIN',
          'BASE',
          'BEGINNER',
          '{}', // Empty array for prerequisites
          '[{"title":"Get USDbC","description":"Click \\'Get USDbC\\' to go to the swap interface"},{"title":"Connect wallet","description":"Connect your wallet to Aerodrome"},{"title":"Swap ETH for USDbC","description":"Swap ETH for USDbC (already pre-selected)"},{"title":"Confirm transaction","description":"Confirm the transaction in your wallet"},{"title":"Copy transaction hash","description":"Copy the transaction hash from your wallet or explorer"},{"title":"Complete action","description":"Paste the transaction hash and click \\'Complete Action\\'"}]',
          '[]', // Empty array for rewards
          new Date(),
          new Date()
        ]
      };

      await client.query(aerodromeActionQuery);
      console.log('Aerodrome swap action inserted successfully');
    } else {
      console.log('Aerodrome swap action already exists');
    }

    console.log('Base actions seeded successfully');
  } catch (error) {
    console.error('Error seeding Base actions:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

seedBaseActions();
