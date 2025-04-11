import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { db } from "@/lib/db/queries";
import { action } from "@/lib/db/schema";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Return the Base action data
    return NextResponse.json({
      actions: [
        {
          title: "Set up Base Account",
          description: "Enable portfolio tracking on Base",
          chain: "BASE",
          difficulty: "beginner",
          steps: [
            "Connect your wallet to continue",
            "Click 'Set Up Account' to enable portfolio tracking",
            "Confirm the transaction in your wallet",
            "Click 'Complete Setup' to finish"
          ],
          reward: "Access portfolio tracking and future rebalancing features",
          actionUrl: "",
          proofFieldLabel: "Transaction Hash",
          proofFieldPlaceholder: "0x..."
        },
        {
          title: "Get USDbC Stablecoins",
          description: "Secure USD-backed tokens on Base",
          chain: "BASE",
          difficulty: "beginner",
          steps: [
            "Click 'Get USDbC' to go to the swap interface",
            "Connect your wallet to Aerodrome",
            "Swap ETH for USDbC (already pre-selected)",
            "Confirm the transaction",
            "Copy the transaction hash",
            "Paste it below and click 'Complete Action'"
          ],
          reward: "",
          actionUrl: "https://aerodrome.finance/swap?inputCurrency=ETH&outputCurrency=0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
          proofFieldLabel: "Transaction Hash",
          proofFieldPlaceholder: "0x..."
        }
      ]
    });
  } catch (error) {
    console.error("Error fetching Base actions:", error);
    return NextResponse.json(
      { error: "Failed to fetch Base actions" },
      { status: 500 }
    );
  }
}
