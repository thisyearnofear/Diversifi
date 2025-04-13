import { NextResponse } from "next/server";
import { auth } from "@/app/auth";

// Brian API key from environment variables
const BRIAN_API_KEY = process.env.BRIAN_API_KEY || process.env.PRIVATE_KEY;

if (!BRIAN_API_KEY) {
  console.error("BRIAN_API_KEY environment variable is not set");
}

// Import the Brian SDK - in a real implementation, you would install the package
// For this example, we'll use the fetch API directly
// import { BrianSDK } from "@brian-ai/sdk";

export async function POST(request: Request) {
  try {
    // Get the user session
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get the amount and address from the request
    const { amount, address } = await request.json();

    if (!amount || !address) {
      return NextResponse.json(
        { error: "Amount and address are required" },
        { status: 400 }
      );
    }

    if (!BRIAN_API_KEY) {
      return NextResponse.json(
        { error: "BRIAN_API_KEY environment variable is not configured" },
        { status: 500 }
      );
    }

    // In a real implementation, you would use the Brian SDK like this:
    // const brian = new BrianSDK({ apiKey: BRIAN_API_KEY });
    // const data = await brian.transact({
    //   prompt: `I want to swap ${amount} MATIC to DAI on Polygon`,
    //   address: address
    // });

    // For this example, we'll use the fetch API directly
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Brian-Api-Key': BRIAN_API_KEY
      },
      body: JSON.stringify({
        prompt: `I want to swap ${amount} MATIC to DAI on Polygon`,
        address: address
      })
    };

    const response = await fetch("https://api.brianknows.org/api/v0/agent/transaction", options);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to prepare transaction with Brian API");
    }

    const data = await response.json();
    console.log("Brian API response:", data);

    // Calculate estimated DAI amount (this would be more accurate with actual price data)
    // For now, we'll use a simple estimation
    const maticPrice = 0.5; // Example price in USD
    const daiPrice = 1.0; // DAI is a stablecoin pegged to USD
    const estimatedDai = (parseFloat(amount) * maticPrice / daiPrice).toFixed(6);

    // Return the transaction data along with the estimated DAI amount
    return NextResponse.json({
      ...data,
      estimatedDai
    });
  } catch (error) {
    console.error("Error preparing swap transaction:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to prepare swap transaction";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
