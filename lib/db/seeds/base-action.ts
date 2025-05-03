import { db } from '@/lib/db/queries';
import { action } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function seedBaseAction() {
  console.log('Seeding Base actions...');

  if (!db) {
    console.warn('⚠️ Database not available. Cannot seed Base actions.');
    return;
  }

  // Check if the Divvi registration action already exists
  const existingDivviAction = await db
    .select()
    .from(action)
    .where(eq(action.title, 'Set up Base Account'));

  if (existingDivviAction.length === 0) {
    // Create the Divvi registration action
    await db.insert(action).values({
      title: 'Set up Base Account',
      description: 'Enable portfolio tracking on Base',
      category: 'STABLECOIN',
      chain: 'BASE',
      difficulty: 'BEGINNER',
      prerequisites: [],
      steps: [
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
    console.log('Divvi registration action seeded successfully');
  } else {
    console.log('Divvi registration action already exists, skipping seed');
  }

  // Check if the Aerodrome swap action already exists
  const existingAerodromeAction = await db
    .select()
    .from(action)
    .where(eq(action.title, 'Get USDbC Stablecoins'));

  if (existingAerodromeAction.length === 0) {
    // Create the Aerodrome swap action
    await db.insert(action).values({
      title: 'Get USDbC Stablecoins',
      description: 'Secure USD-backed tokens on Base',
      category: 'STABLECOIN',
      chain: 'BASE',
      difficulty: 'BEGINNER',
      prerequisites: [],
      steps: [
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
      ],
      rewards: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Aerodrome swap action seeded successfully');
  } else {
    console.log('Aerodrome swap action already exists, skipping seed');
  }

  console.log('Base actions seeding completed');
}
