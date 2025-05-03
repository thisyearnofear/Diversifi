// Script to add the Register on Optimism action to the database
require('dotenv').config();
const { Pool } = require('pg');

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function addOptimismAction() {
  try {
    // Connect to the database
    const client = await pool.connect();
    console.log('Connected to the database');

    try {
      // Add the Register on Optimism action
      const result = await client.query(`
        INSERT INTO "Action" (
          "id",
          "title",
          "description",
          "category",
          "chain",
          "difficulty",
          "prerequisites",
          "steps",
          "rewards",
          "createdAt",
          "updatedAt"
        )
        VALUES (
          '4f9e3a1c-5c0e-4b5a-9d8f-3a1c5c0e4b5c',
          'Register on Optimism',
          'Register for Divvi on the Optimism network',
          'STABLECOIN',
          'OPTIMISM',
          'BEGINNER',
          ARRAY[jsonb_build_array('Connect your wallet', 'Switch to Optimism network')]::json[],
          ARRAY[jsonb_build_array('Register with Divvi', 'Complete the registration')]::json[],
          ARRAY[jsonb_build_array('Optimism registration', 'Access to Optimism ecosystem')]::json[],
          NOW(),
          NOW()
        )
        ON CONFLICT ("id") DO UPDATE
        SET
          "title" = EXCLUDED."title",
          "description" = EXCLUDED."description",
          "category" = EXCLUDED."category",
          "chain" = EXCLUDED."chain",
          "difficulty" = EXCLUDED."difficulty",
          "prerequisites" = EXCLUDED."prerequisites",
          "steps" = EXCLUDED."steps",
          "rewards" = EXCLUDED."rewards",
          "updatedAt" = NOW();
      `);

      console.log('Action added successfully:', result);

      // Verify the action was added
      const verifyResult = await client.query(
        'SELECT * FROM "Action" WHERE title = $1;',
        ['Register on Optimism'],
      );
      console.log('\nRegister on Optimism action:');
      console.log(verifyResult.rows);
    } finally {
      // Release the client back to the pool
      client.release();
      console.log('Database connection released');
    }
  } catch (err) {
    console.error('Error connecting to the database:', err);
  } finally {
    // Close the pool
    await pool.end();
    console.log('Connection pool closed');
  }
}

// Run the function
addOptimismAction();
