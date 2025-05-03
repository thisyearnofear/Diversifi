// Script to check the Action table in the database
require('dotenv').config();
const { Pool } = require('pg');

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function checkActions() {
  try {
    // Connect to the database
    const client = await pool.connect();
    console.log('Connected to the database');

    try {
      // Check if the Action table exists
      const tableResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'Action'
        );
      `);

      const tableExists = tableResult.rows[0].exists;
      console.log(`Action table exists: ${tableExists}`);

      if (tableExists) {
        // Query the Action table
        const result = await client.query('SELECT * FROM "Action" LIMIT 10;');
        console.log('Actions in the database:');
        console.log(result.rows);

        // Check for specific actions
        const ckesResult = await client.query(
          'SELECT * FROM "Action" WHERE title = $1;',
          ['Get cKES Stablecoins'],
        );
        console.log('\nGet cKES Stablecoins action:');
        console.log(ckesResult.rows);

        const euraResult = await client.query(
          'SELECT * FROM "Action" WHERE title = $1;',
          ['Get EURA Stablecoins'],
        );
        console.log('\nGet EURA Stablecoins action:');
        console.log(euraResult.rows);

        const optimismResult = await client.query(
          'SELECT * FROM "Action" WHERE title = $1;',
          ['Register on Optimism'],
        );
        console.log('\nRegister on Optimism action:');
        console.log(optimismResult.rows);
      }
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
checkActions();
