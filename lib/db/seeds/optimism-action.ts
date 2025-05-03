import { db } from '@/lib/db/queries';
import { action } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Seeds the database with Optimism actions.
 */
export async function seedOptimismActions() {
  console.log('Seeding Optimism actions...');

  if (!db) {
    console.warn('⚠️ Database not available. Cannot seed Optimism actions.');
    return;
  }

  // Check if the Divvi registration action already exists
  const existingDivviAction = await db
    .select()
    .from(action)
    .where(eq(action.title, 'Register on Optimism'))
    .limit(1);

  if (existingDivviAction.length === 0) {
    // Create the Divvi registration action
    await db.insert(action).values({
      title: 'Register on Optimism',
      description: 'Enable portfolio tracking on Optimism',
      category: 'STABLECOIN',
      chain: 'OPTIMISM',
      difficulty: 'BEGINNER',
      prerequisites: [],
      steps: [
        {
          title: 'Connect wallet',
          description: 'Connect your wallet to continue',
        },
        {
          title: 'Register on Optimism',
          description: "Click 'Register' to enable portfolio tracking",
        },
        {
          title: 'Confirm transaction',
          description: 'Confirm the transaction in your wallet',
        },
        {
          title: 'Complete registration',
          description: "Click 'Complete Registration' to finish",
        },
      ],
      rewards: [
        {
          type: 'FEATURE',
          description:
            'Access portfolio tracking and future rebalancing features',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('Created Optimism Divvi registration action');
  } else {
    console.log('Optimism Divvi registration action already exists');
  }

  // Check if the Velodrome swap action already exists
  const existingVelodromeAction = await db
    .select()
    .from(action)
    .where(eq(action.title, 'Swap to EURA on Velodrome'))
    .limit(1);

  if (existingVelodromeAction.length === 0) {
    // Create the Velodrome swap action
    await db.insert(action).values({
      title: 'Swap to EURA on Velodrome',
      description: 'Get Euro-backed stablecoins on Optimism',
      category: 'STABLECOIN',
      chain: 'OPTIMISM',
      difficulty: 'BEGINNER',
      prerequisites: [],
      steps: [
        {
          title: 'Choose token',
          description: 'Choose your source token (ETH or USDC)',
        },
        {
          title: 'Enter amount',
          description: 'Enter the amount you want to swap',
        },
        {
          title: 'Review and confirm',
          description: 'Review and confirm the swap',
        },
        {
          title: 'Wait for completion',
          description: 'Wait for the transaction to complete',
        },
      ],
      rewards: [
        {
          type: 'TOKEN',
          description: 'Access to Euro-backed stablecoins on Optimism',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('Created Velodrome swap action');
  } else {
    console.log('Velodrome swap action already exists');
  }
}
