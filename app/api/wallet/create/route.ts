import { NextResponse } from 'next/server';
import { createWallet } from '@/lib/web3/wallet-service';
import { auth } from '@/app/auth';
import { db } from '@/lib/db/queries';
import { wallet } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST() {
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

    // Check if the user already has a wallet
    const existingWallets = await db
      .select()
      .from(wallet)
      .where(eq(wallet.userId, session.user.id));

    if (existingWallets.length > 0) {
      console.log('User already has a wallet:', existingWallets[0]);
      return NextResponse.json(
        {
          message: 'User already has a wallet',
          wallet: existingWallets[0],
        },
        { status: 200 },
      );
    }

    console.log('Creating new wallet for user:', session.user.id);

    // Create a new wallet
    const newWallet = await createWallet();
    console.log('Wallet created:', newWallet);

    // Save the wallet to the database
    const savedWallet = await db
      .insert(wallet)
      .values({
        userId: session.user.id,
        walletId: newWallet.walletId,
        address: newWallet.address,
        network: newWallet.networkId,
        createdAt: new Date(),
      })
      .returning();

    console.log('Wallet saved to database:', savedWallet[0]);

    return NextResponse.json(
      {
        message: 'Wallet created successfully',
        wallet: savedWallet[0],
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating wallet:', error);

    // Properly type check the error
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    };

    console.error('Error details:', errorDetails);

    return NextResponse.json({ error: errorDetails.message }, { status: 500 });
  }
}
