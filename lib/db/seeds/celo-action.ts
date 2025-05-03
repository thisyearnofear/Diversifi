import { db } from '@/lib/db/queries';
import { action } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Seeds the database with Celo actions.
 */
export async function seedCeloActions() {
  console.log('Seeding Celo actions...');

  if (!db) {
    console.warn('⚠️ Database not available. Cannot seed Celo actions.');
    return;
  }

  // Check if the Divvi registration action already exists
  const existingDivviAction = await db
    .select()
    .from(action)
    .where(eq(action.title, 'Register on Celo'))
    .limit(1);

  if (existingDivviAction.length === 0) {
    // Create the Divvi registration action
    await db.insert(action).values({
      title: 'Register on Celo',
      description: 'Enable portfolio tracking on Celo',
      category: 'STABLECOIN',
      chain: 'CELO',
      difficulty: 'BEGINNER',
      prerequisites: [],
      steps: [
        {
          title: 'Connect wallet',
          description: 'Connect your wallet to continue',
        },
        {
          title: 'Register on Celo',
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

    console.log('Created Celo Divvi registration action');
  } else {
    console.log('Celo Divvi registration action already exists');
  }

  // Check if the UniswapV3 swap action already exists
  const existingSwapAction = await db
    .select()
    .from(action)
    .where(eq(action.title, 'Get cUSD Stablecoins'))
    .limit(1);

  if (existingSwapAction.length === 0) {
    // Create the UniswapV3 swap action
    await db.insert(action).values({
      title: 'Get cUSD Stablecoins',
      description: 'Secure USD-backed tokens on Celo',
      category: 'STABLECOIN',
      chain: 'CELO',
      difficulty: 'BEGINNER',
      prerequisites: [],
      steps: [
        {
          title: 'Choose token',
          description: 'Choose CELO as your source token',
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
          description: 'Access to USD-backed stablecoins on Celo',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('Created cUSD swap action');
  } else {
    console.log('cUSD swap action already exists');
  }

  // Check if the cKES swap action already exists
  const existingCkesAction = await db
    .select()
    .from(action)
    .where(eq(action.title, 'Get cKES Stablecoins'))
    .limit(1);

  if (existingCkesAction.length === 0) {
    // Create the cKES swap action
    await db.insert(action).values({
      title: 'Get cKES Stablecoins',
      description: 'Secure Kenyan Shilling stablecoins on Celo',
      category: 'STABLECOIN',
      chain: 'CELO',
      difficulty: 'BEGINNER',
      prerequisites: [],
      steps: [
        {
          title: 'Choose token',
          description: 'Choose CELO as your source token',
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
          description: 'Access to Kenyan Shilling stablecoins on Celo',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('Created cKES swap action');
  } else {
    console.log('cKES swap action already exists');
  }

  // Check if the cCOP swap action already exists
  const existingCcopAction = await db
    .select()
    .from(action)
    .where(eq(action.title, 'Get cCOP Stablecoins'))
    .limit(1);

  if (existingCcopAction.length === 0) {
    // Create the cCOP swap action
    await db.insert(action).values({
      title: 'Get cCOP Stablecoins',
      description: 'Get Colombian Peso stablecoins on Celo',
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
        { title: 'Swap cUSD for cCOP', description: 'Swap your cUSD for cCOP' },
      ],
      rewards: [
        {
          type: 'POINTS',
          description: 'Earn 5 points and get cCOP stablecoins',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('Created cCOP swap action');
  } else {
    console.log('cCOP swap action already exists');
  }

  // Check if the PUSO swap action already exists
  const existingPusoAction = await db
    .select()
    .from(action)
    .where(eq(action.title, 'Get PUSO Stablecoins'))
    .limit(1);

  if (existingPusoAction.length === 0) {
    // Create the PUSO swap action
    await db.insert(action).values({
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

    console.log('Created PUSO swap action');
  } else {
    console.log('PUSO swap action already exists');
  }
}
