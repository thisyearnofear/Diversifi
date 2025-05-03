import { NextResponse } from 'next/server';
import { auth } from '@/app/auth';

/**
 * GET handler for the Optimism actions API route.
 * Returns the Optimism actions data.
 */
export async function GET() {
  try {
    // Get the current session
    const session = await auth();

    // Return the Optimism action data
    return NextResponse.json({
      actions: [
        {
          title: 'Register on Optimism',
          description: 'Enable portfolio tracking on Optimism',
          chain: 'OPTIMISM',
          difficulty: 'beginner',
          steps: [
            'Connect your wallet to continue',
            "Click 'Register' to enable portfolio tracking",
            'Confirm the transaction in your wallet',
            "Click 'Complete Registration' to finish",
          ],
          reward: 'Access portfolio tracking and future rebalancing features',
          actionUrl: '',
          proofFieldLabel: 'Transaction Hash',
          proofFieldPlaceholder: '0x...',
        },
        {
          title: 'Swap to EURA on Velodrome',
          description: 'Get Euro-backed stablecoins on Optimism',
          chain: 'OPTIMISM',
          difficulty: 'beginner',
          steps: [
            'Choose your source token (ETH or USDC)',
            'Enter the amount you want to swap',
            'Review and confirm the swap',
            'Wait for the transaction to complete',
          ],
          reward: 'Access to Euro-backed stablecoins on Optimism',
          actionUrl:
            'https://app.velodrome.finance/swap?inputCurrency=ETH&outputCurrency=0x9485aca5bbBE1667AD97c7fE7C4531a624C8b1ED',
          proofFieldLabel: 'Transaction Hash',
          proofFieldPlaceholder: '0x...',
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching Optimism actions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Optimism actions' },
      { status: 500 },
    );
  }
}
