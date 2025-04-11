// This script inserts the Base actions directly into the database
// Run with: node scripts/insert-base-actions.js

const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

// Database connection
const client = new Client({
  connectionString: "postgres://postgres.aioxeyzbcwtpwpmkixya:SDL0fAdUZuJkCvjC@aws-0-eu-west-1.pooler.supabase.com:5432/postgres",
  ssl: {
    rejectUnauthorized: false
  }
});

async function insertBaseActions() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected to database');

    // Insert Divvi registration action
    const divviActionId = uuidv4();
    console.log('Inserting Divvi registration action with ID:', divviActionId);
    
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
        divviActionId,
        'Set up Base Account',
        'Enable portfolio tracking on Base',
        'STABLECOIN',
        'BASE',
        'BEGINNER',
        '[]', // Empty array for prerequisites
        JSON.stringify([
          {
            title: 'Connect wallet',
            description: 'Connect your wallet to continue',
          },
          {
            title: 'Set up Base Account',
            description: "Click 'Set Up Account' to enable portfolio tracking",
          },
          {
            title: 'Confirm transaction',
            description: 'Confirm the transaction in your wallet',
          },
          {
            title: 'Complete setup',
            description: "Click 'Complete Setup' to finish",
          },
        ]),
        JSON.stringify([
          {
            type: 'FEATURE',
            description: 'Access portfolio tracking and future rebalancing features',
          },
        ]),
        new Date(),
        new Date()
      ]
    };

    await client.query(divviActionQuery);
    console.log('Divvi registration action inserted successfully');

    // Insert Aerodrome swap action
    const aerodromeActionId = uuidv4();
    console.log('Inserting Aerodrome swap action with ID:', aerodromeActionId);
    
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
        aerodromeActionId,
        'Get USDbC Stablecoins',
        'Secure USD-backed tokens on Base',
        'STABLECOIN',
        'BASE',
        'BEGINNER',
        '[]', // Empty array for prerequisites
        JSON.stringify([
          {
            title: 'Get USDbC',
            description: "Click 'Get USDbC' to go to the swap interface",
          },
          {
            title: 'Connect wallet',
            description: 'Connect your wallet to Aerodrome',
          },
          {
            title: 'Swap ETH for USDbC',
            description: 'Swap ETH for USDbC (already pre-selected)',
          },
          {
            title: 'Confirm transaction',
            description: 'Confirm the transaction in your wallet',
          },
          {
            title: 'Copy transaction hash',
            description: 'Copy the transaction hash from your wallet or explorer',
          },
          {
            title: 'Complete action',
            description: "Paste the transaction hash and click 'Complete Action'",
          },
        ]),
        '[]', // Empty array for rewards
        new Date(),
        new Date()
      ]
    };

    await client.query(aerodromeActionQuery);
    console.log('Aerodrome swap action inserted successfully');

    console.log('Base actions inserted successfully');
  } catch (error) {
    console.error('Error inserting Base actions:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

insertBaseActions();
