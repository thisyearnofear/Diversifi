import { NextResponse } from "next/server";
import { fundWalletFromFaucet } from "@/lib/web3/wallet-service";
import { auth } from "@/app/auth";
import { db } from "@/lib/db/queries";
import { wallet } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    // Get the user session
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 500 }
      );
    }

    // Get the user's wallet
    const userWallets = await db
      .select()
      .from(wallet)
      .where(eq(wallet.userId, session.user.id));

    if (userWallets.length === 0) {
      return NextResponse.json(
        { error: "User does not have a wallet" },
        { status: 404 }
      );
    }

    const userWallet = userWallets[0];

    // Fund the wallet
    const fundingResult = await fundWalletFromFaucet(userWallet.walletId);

    // Update the wallet in the database
    await db
      .update(wallet)
      .set({
        lastFundedAt: new Date(),
      })
      .where(eq(wallet.id, userWallet.id));

    return NextResponse.json(
      {
        message: "Wallet funded successfully",
        transaction: fundingResult,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error funding wallet:", error);
    return NextResponse.json(
      { error: "Failed to fund wallet" },
      { status: 500 }
    );
  }
}
