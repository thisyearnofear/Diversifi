import { config } from 'dotenv';
import { getDb } from '../lib/db/connection';
import { action } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

// Load environment variables from .env file
config();

const addPusoAction = async () => {
  try {
    console.log('⏳ Getting database connection...');
    const db = getDb();

    if (!db) {
      console.error('❌ Database connection not available');
      process.exit(1);
    }

    console.log('⏳ Adding PUSO action...');

    // Check if the action already exists
    const existingAction = await db
      .select()
      .from(action)
      .where(eq(action.title, 'Get PUSO Stablecoins'))
      .limit(1);

    if (existingAction.length > 0) {
      console.log('✅ PUSO action already exists:', existingAction[0]);
      process.exit(0);
    }

    // Add the PUSO action
    await db.insert(action).values({
      id: '6a586388-9248-4f1f-9c71-0c2a7db70b36',
      title: 'Get PUSO Stablecoins',
      description: 'Get Philippine Peso stablecoins on Celo',
      category: 'STABLECOIN',
      chain: 'CELO',
      difficulty: 'BEGINNER',
      prerequisites: [],
      steps: [
        {
          title: 'Connect your wallet',
          description: 'Connect your wallet to continue',
        },
        {
          title: 'Switch to Celo network',
          description: 'Switch to the Celo network',
        },
        { title: 'Swap cUSD for PUSO', description: 'Swap your cUSD for PUSO' },
      ],
      rewards: [
        {
          type: 'POINTS',
          description: 'Earn 5 points and get PUSO stablecoins',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✅ PUSO action added successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to add PUSO action:', error);
    process.exit(1);
  }
};

// Run the function
addPusoAction();
