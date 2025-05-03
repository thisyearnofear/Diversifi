import { db } from '../queries';
import { action } from '../schema';
import { eq } from 'drizzle-orm';
import type { InferInsertModel } from 'drizzle-orm';

type ActionInsert = InferInsertModel<typeof action>;

const polygonActions: Omit<ActionInsert, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Get DAI Stablecoins',
    description: 'Secure USD-backed tokens on Polygon',
    category: 'STABLECOIN',
    chain: 'POLYGON',
    difficulty: 'BEGINNER',
    prerequisites: ['Wallet with MATIC'],
    steps: [
      'Register on Polygon to unlock features',
      'Switch to the Polygon network',
      'Set the amount of MATIC to swap',
      'Execute the swap transaction',
      'Wait for the transaction to complete',
    ],
    rewards: [
      {
        type: 'TOKEN',
        description: 'Access to DAI stablecoins on Polygon',
      },
    ],
  },
];

export async function seedPolygonActions() {
  console.log('Seeding Polygon actions...');

  if (!db) {
    console.warn('⚠️ Database not available. Cannot seed Polygon actions.');
    return;
  }

  for (const actionData of polygonActions) {
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
      console.log(`Seeded Polygon action: ${actionData.title}`);
    } else {
      console.log(`Polygon action already exists: ${actionData.title}`);
    }
  }

  console.log('Polygon action seeding complete!');
}
