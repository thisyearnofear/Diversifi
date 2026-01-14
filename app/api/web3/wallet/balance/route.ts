import { NextResponse } from 'next/server';
import { getWalletBalance } from '@/lib/web3/wallet-service';
import { auth } from '@/app/auth';
import { db } from '@/lib/db/queries';
import { wallet } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    // Get the user session
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 },
      );
    }

    // Get the user's wallet
    const userWallets = await db
      .select()
      .from(wallet)
      .where(eq(wallet.userId, session.user.id));

    if (userWallets.length === 0) {
      return NextResponse.json(
        { error: 'User does not have a wallet' },
        { status: 404 },
      );
    }

    const userWallet = userWallets[0];

    // Get the wallet balance
    const balanceResult = await getWalletBalance(userWallet.walletId);

    return NextResponse.json(
      {
        address: userWallet.address,
        network: userWallet.network,
        balance: balanceResult.balance,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to get wallet balance';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
