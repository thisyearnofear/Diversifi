import { db } from './queries';
import { action } from './schema';
import { eq } from 'drizzle-orm';
import type { InferInsertModel } from 'drizzle-orm';
import { seedLensAction } from './seeds/lens-action';
import { seedBaseAction } from './seeds/base-action';
import { seedOptimismActions } from './seeds/optimism-action';
import { seedCeloActions } from './seeds/celo-action';
import { seedStableStationActions } from './seeds/stable-station-action';
// Temporarily comment out the Polygon actions import to fix build
// import { seedPolygonActions } from "./seeds/polygon-action";

type ActionInsert = InferInsertModel<typeof action>;

const actions: Omit<ActionInsert, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Social Actions
  {
    title: 'Set up Farcaster Account',
    description:
      'Create a Farcaster account and join the decentralized social network',
    category: 'SOCIAL',
    chain: 'BASE',
    difficulty: 'BEGINNER',
    prerequisites: ['Wallet with BASE'],
    steps: [
      'Go to https://www.farcaster.xyz on mobile and sign up',
      'Use an invite code e.g. EC235BN6F, MFRACUEJK, T3QOBXWTC',
      'Say hi to @papa as your first cast',
      'Copy your profile URL (e.g. https://warpcast.com/papa)',
    ],
    rewards: [
      {
        type: 'SOCIAL',
        description: 'Starter packs from the community',
      },
    ],
  },
  {
    title: 'Set up Lens Account',
    description:
      'Create a Lens account and join the decentralized social network',
    category: 'SOCIAL',
    chain: 'BASE',
    difficulty: 'BEGINNER',
    prerequisites: ['Wallet with ETH'],
    steps: [
      'Go to https://onboarding.lens.xyz and sign up',
      'Connect your wallet',
      'Create your profile',
      'Copy your profile URL (e.g. https://hey.xyz/u/username)',
    ],
    rewards: [
      {
        type: 'SOCIAL',
        description: 'Access to the Lens ecosystem',
      },
    ],
  },

  // Note: Celo stablecoin actions are now defined in lib/db/seeds/celo-action.ts

  // Note: We're focusing on stablecoin actions now
];

export async function seedActions() {
  console.log('Seeding actions...');
  console.log('Database URL:', process.env.POSTGRES_URL);

  if (!db) {
    console.warn('⚠️ Database not available. Cannot seed actions.');
    return;
  }

  for (const actionData of actions) {
    const existingAction = await db
      .select()
      .from(action)
      .where(eq(action.title, actionData.title))
      .limit(1);

    if (existingAction.length === 0) {
      await db.insert(action).values({
        ...actionData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`Seeded action: ${actionData.title}`);
    } else {
      console.log(`Action already exists: ${actionData.title}`);
    }
  }

  // Seed the Lens action
  await seedLensAction();

  // Seed the Base action
  await seedBaseAction();

  // Seed the Optimism actions
  await seedOptimismActions();

  // Seed the Celo actions
  await seedCeloActions();

  // Seed the Stable Station actions
  await seedStableStationActions();

  // Temporarily comment out the Polygon actions seeding to fix build
  // await seedPolygonActions();

  console.log('Seeding complete!');
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedActions()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error seeding database:', error);
      process.exit(1);
    });
}
