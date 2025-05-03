import { NextResponse } from 'next/server';
import { db } from '@/lib/db/queries';
import { action } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import type { ActionData } from '@/lib/utils/message-helpers';

// Default proof fields in case database values are missing
const defaultProofFields = {
  label: 'Proof',
  placeholder: 'Provide proof of completion',
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const title = url.searchParams.get('title');
    const limit = Number.parseInt(url.searchParams.get('limit') || '3');

    console.log('Chat actions request:', { category, title, limit });

    if (!db) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 },
      );
    }

    const conditions = [];

    if (category) {
      // Check if the category is a valid chain
      const validChains = ['BASE', 'CELO', 'ETHEREUM', 'OPTIMISM', 'POLYGON'];
      if (validChains.includes(category.toUpperCase())) {
        conditions.push(eq(action.chain, category.toUpperCase() as any));
      } else {
        // If not a chain, it might be a category
        const validCategories = [
          'SOCIAL',
          'DEFI',
          'NFT',
          'STABLECOIN',
          'TRADING',
          'REGISTRATION',
        ];
        if (validCategories.includes(category.toUpperCase())) {
          conditions.push(eq(action.category, category.toUpperCase() as any));
        }
      }
    }

    if (title) {
      conditions.push(eq(action.title, title));
    }

    const actions = await db
      .select()
      .from(action)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limit);

    console.log(
      `Found ${actions.length} actions for category: ${category || 'all'}`,
    );

    // If no actions found, return some default actions
    if (actions.length === 0) {
      console.log('No actions found, returning default actions');

      // Chain-specific fallbacks
      const chainFallbacks = {
        CELO: [
          {
            title: 'Get PUSO Stablecoins',
            description: 'Get Philippine Peso stablecoins on Celo',
            chain: 'CELO',
            difficulty: 'beginner',
            steps: [
              'Connect your wallet',
              'Switch to Celo network',
              'Swap cUSD for PUSO',
            ],
            reward: 'Earn 5 points and get PUSO stablecoins',
            actionUrl: '#',
            proofFieldLabel: 'Transaction Hash',
            proofFieldPlaceholder: '0x...',
          },
          {
            title: 'Get cCOP Stablecoins',
            description:
              'Get Colombian Peso stablecoins (cCOP) on the Celo blockchain',
            chain: 'CELO',
            difficulty: 'beginner',
            steps: [
              'Connect your wallet',
              'Switch to Celo network',
              'Swap cUSD for cCOP',
            ],
            reward: 'Earn 5 points and get cCOP stablecoins',
            actionUrl: '#',
            proofFieldLabel: 'Transaction Hash',
            proofFieldPlaceholder: '0x...',
          },
          {
            title: 'Get cKES Stablecoins',
            description:
              'Acquire Kenyan Shilling stablecoins (cKES) on the Celo network',
            chain: 'CELO',
            difficulty: 'beginner',
            steps: [
              'Connect your wallet',
              'Switch to Celo network',
              'Swap cUSD for cKES',
            ],
            reward: 'Earn 5 points and get cKES stablecoins',
            actionUrl: '#',
            proofFieldLabel: 'Transaction Hash',
            proofFieldPlaceholder: '0x...',
          },
        ],
        OPTIMISM: [
          {
            title: 'Register on Optimism',
            description: 'Register on Stable Station via the Optimism network',
            chain: 'OPTIMISM',
            difficulty: 'beginner',
            steps: [
              'Connect your wallet',
              'Switch to Optimism network',
              'Complete registration',
            ],
            reward: 'Earn 5 points and unlock Optimism stablecoins',
            actionUrl: '#',
            proofFieldLabel: 'Transaction Hash',
            proofFieldPlaceholder: '0x...',
          },
          {
            title: 'Get EURA Stablecoins',
            description:
              'Acquire Euro stablecoins (EURA) on the Optimism network',
            chain: 'OPTIMISM',
            difficulty: 'beginner',
            steps: [
              'Connect your wallet',
              'Switch to Optimism network',
              'Swap ETH for EURA',
            ],
            reward: 'Earn 5 points and get EURA stablecoins',
            actionUrl: '#',
            proofFieldLabel: 'Transaction Hash',
            proofFieldPlaceholder: '0x...',
          },
        ],
        BASE: [
          {
            title: 'Register on Base',
            description: 'Register on Stable Station via the Base network',
            chain: 'BASE',
            difficulty: 'beginner',
            steps: [
              'Connect your wallet',
              'Switch to Base network',
              'Complete registration',
            ],
            reward: 'Earn 5 points and unlock Base stablecoins',
            actionUrl: '#',
            proofFieldLabel: 'Transaction Hash',
            proofFieldPlaceholder: '0x...',
          },
          {
            title: 'Get USDbC Stablecoins',
            description: 'Acquire Bridged USD Coin (USDbC) on the Base network',
            chain: 'BASE',
            difficulty: 'beginner',
            steps: [
              'Connect your wallet',
              'Switch to Base network',
              'Swap ETH for USDbC',
            ],
            reward: 'Earn 5 points and get USDbC stablecoins',
            actionUrl: '#',
            proofFieldLabel: 'Transaction Hash',
            proofFieldPlaceholder: '0x...',
          },
        ],
        POLYGON: [
          {
            title: 'Register on Polygon',
            description: 'Register on Stable Station via the Polygon network',
            chain: 'POLYGON',
            difficulty: 'beginner',
            steps: [
              'Connect your wallet',
              'Switch to Polygon network',
              'Complete registration',
            ],
            reward: 'Earn 5 points and unlock Polygon stablecoins',
            actionUrl: '#',
            proofFieldLabel: 'Transaction Hash',
            proofFieldPlaceholder: '0x...',
          },
          {
            title: 'Get DAI Stablecoins',
            description: 'Acquire DAI stablecoins on the Polygon network',
            chain: 'POLYGON',
            difficulty: 'beginner',
            steps: [
              'Connect your wallet',
              'Switch to Polygon network',
              'Swap MATIC for DAI',
            ],
            reward: 'Earn 5 points and get DAI stablecoins',
            actionUrl: '#',
            proofFieldLabel: 'Transaction Hash',
            proofFieldPlaceholder: '0x...',
          },
        ],
      };

      // Category-specific fallbacks
      const categoryFallbacks = {
        SOCIAL: [
          {
            title: 'Set Up Lens Account',
            description:
              'Create a Lens account and join the decentralized social network',
            chain: 'POLYGON',
            difficulty: 'beginner',
            steps: [
              'Go to onboarding.lens.xyz',
              'Connect wallet',
              'Create profile',
            ],
            reward: 'Access to the Lens ecosystem',
            actionUrl: '#',
            proofFieldLabel: 'Lens Profile URL',
            proofFieldPlaceholder: 'https://hey.xyz/u/yourusername',
          },
          {
            title: 'Set Up Farcaster Account',
            description:
              'Create a Farcaster account and join the decentralized social network',
            chain: 'BASE',
            difficulty: 'beginner',
            steps: ['Go to Warpcast', 'Connect wallet', 'Create profile'],
            reward: 'Access to the Farcaster ecosystem',
            actionUrl: '#',
            proofFieldLabel: 'Farcaster Profile URL',
            proofFieldPlaceholder: 'https://warpcast.com/yourusername',
          },
        ],
        REGISTRATION: [
          {
            title: 'Register on Base',
            description: 'Register on Stable Station via the Base network',
            chain: 'BASE',
            difficulty: 'beginner',
            steps: [
              'Connect your wallet',
              'Switch to Base network',
              'Complete registration',
            ],
            reward: 'Earn 5 points and unlock Base stablecoins',
            actionUrl: '#',
            proofFieldLabel: 'Transaction Hash',
            proofFieldPlaceholder: '0x...',
          },
          {
            title: 'Register on Celo',
            description: 'Register on Stable Station via the Celo network',
            chain: 'CELO',
            difficulty: 'beginner',
            steps: [
              'Connect your wallet',
              'Switch to Celo network',
              'Complete registration',
            ],
            reward: 'Earn 5 points and unlock Celo stablecoins',
            actionUrl: '#',
            proofFieldLabel: 'Transaction Hash',
            proofFieldPlaceholder: '0x...',
          },
        ],
        STABLECOIN: [
          {
            title: 'Get USDbC Stablecoins',
            description: 'Acquire Bridged USD Coin (USDbC) on the Base network',
            chain: 'BASE',
            difficulty: 'beginner',
            steps: [
              'Connect your wallet',
              'Switch to Base network',
              'Swap ETH for USDbC',
            ],
            reward: 'Earn 5 points and get USDbC stablecoins',
            actionUrl: '#',
            proofFieldLabel: 'Transaction Hash',
            proofFieldPlaceholder: '0x...',
          },
          {
            title: 'Get EURA Stablecoins',
            description:
              'Acquire Euro stablecoins (EURA) on the Optimism network',
            chain: 'OPTIMISM',
            difficulty: 'beginner',
            steps: [
              'Connect your wallet',
              'Switch to Optimism network',
              'Swap ETH for EURA',
            ],
            reward: 'Earn 5 points and get EURA stablecoins',
            actionUrl: '#',
            proofFieldLabel: 'Transaction Hash',
            proofFieldPlaceholder: '0x...',
          },
        ],
      };

      // If category is a valid chain, return chain-specific fallbacks
      if (
        category &&
        chainFallbacks[category.toUpperCase() as keyof typeof chainFallbacks]
      ) {
        return NextResponse.json(
          chainFallbacks[category.toUpperCase() as keyof typeof chainFallbacks],
        );
      }

      // If category is a valid category, return category-specific fallbacks
      if (
        category &&
        categoryFallbacks[
          category.toUpperCase() as keyof typeof categoryFallbacks
        ]
      ) {
        return NextResponse.json(
          categoryFallbacks[
            category.toUpperCase() as keyof typeof categoryFallbacks
          ],
        );
      }

      // Default fallback for other cases
      return NextResponse.json([
        {
          title: 'Set Up Lens Account',
          description:
            'Create a Lens account and join the decentralized social network',
          chain: 'POLYGON',
          difficulty: 'beginner',
          steps: [
            'Go to onboarding.lens.xyz',
            'Connect wallet',
            'Create profile',
          ],
          reward: 'Access to the Lens ecosystem',
          actionUrl: '#',
          proofFieldLabel: 'Lens Profile URL',
          proofFieldPlaceholder: 'https://hey.xyz/u/yourusername',
        },
      ]);
    }

    // Convert to ActionData format
    const actionData: ActionData[] = actions.map((a) => {
      const steps =
        (a.steps as any[])?.map((step) =>
          typeof step === 'string'
            ? step
            : step.title || step.description || '',
        ) || [];

      const reward = (a.rewards as any[])?.[0]?.description || 'Rewards';

      return {
        title: a.title,
        description: a.description,
        chain: a.chain,
        difficulty: a.difficulty,
        steps,
        reward,
        actionUrl: '#', // All actions are handled in-app
        proofFieldLabel: a.proofFieldLabel || defaultProofFields.label,
        proofFieldPlaceholder:
          a.proofFieldPlaceholder || defaultProofFields.placeholder,
      };
    });

    return NextResponse.json(actionData);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to get chat actions';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
