import { NextResponse } from "next/server";

/**
 * GET handler for Celo actions
 * @returns JSON response with Celo actions
 */
export async function GET() {
  try {
    // Return the Celo action data
    return NextResponse.json({
      actions: [
        {
          title: "Register on Celo",
          description: "Enable portfolio tracking on Celo",
          chain: "CELO",
          difficulty: "beginner",
          steps: [
            "Connect your wallet to continue",
            "Click 'Register' to enable portfolio tracking",
            "Confirm the transaction in your wallet",
            "Click 'Complete Registration' to finish"
          ],
          reward: "Access portfolio tracking and future rebalancing features",
          actionUrl: "",
          proofFieldLabel: "Transaction Hash",
          proofFieldPlaceholder: "0x..."
        },
        {
          title: "Get cUSD Stablecoins",
          description: "Secure USD-backed tokens on Celo",
          chain: "CELO",
          difficulty: "beginner",
          steps: [
            "Choose CELO as your source token",
            "Enter the amount you want to swap",
            "Review and confirm the swap",
            "Wait for the transaction to complete"
          ],
          reward: "Access to USD-backed stablecoins on Celo",
          actionUrl: "https://app.uniswap.org/#/swap?inputCurrency=0x471ece3750da237f93b8e339c536989b8978a438&outputCurrency=0x765DE816845861e75A25fCA122bb6898B8B1282a&chain=celo",
          proofFieldLabel: "Transaction Hash",
          proofFieldPlaceholder: "0x..."
        }
      ]
    });
  } catch (error) {
    console.error("Error fetching Celo actions:", error);
    return NextResponse.json(
      { error: "Failed to fetch Celo actions" },
      { status: 500 }
    );
  }
}
