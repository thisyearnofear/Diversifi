import { NextResponse } from "next/server";
import { auth } from "@/app/auth";

// Get the Brian API key from environment variables
const BRIAN_API_KEY = process.env.BRIAN_API_KEY || process.env.PRIVATE_KEY;

if (!BRIAN_API_KEY) {
  console.error("BRIAN_API_KEY environment variable is not set");
}

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

    // Get the transaction data and address from the request
    const { transactionData, address } = await request.json();

    if (!transactionData || !address) {
      return NextResponse.json(
        { error: "Transaction data and address are required" },
        { status: 400 }
      );
    }

    if (!BRIAN_API_KEY) {
      return NextResponse.json(
        { error: "BRIAN_API_KEY environment variable is not configured" },
        { status: 500 }
      );
    }

    // The Brian API doesn't directly execute transactions - it prepares them for execution by the frontend
    // We'll return the transaction data to the frontend for the user to execute with their wallet

    console.log("Transaction data for frontend execution:", transactionData);

    // Generate a unique identifier for this transaction request
    const requestId = `polygon-dai-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Format the transaction data for frontend execution
    // The Brian API response has a specific structure we need to handle
    console.log("Formatting transaction data for frontend execution");

    // Validate the transaction data structure
    if (!transactionData.result || !Array.isArray(transactionData.result) || transactionData.result.length === 0) {
      console.error("Invalid transaction data structure:", transactionData);
      return NextResponse.json(
        { error: "Invalid transaction data structure" },
        { status: 400 }
      );
    }

    // Extract the first transaction from the result array
    const transaction = transactionData.result[0];
    console.log("Transaction details:", JSON.stringify(transaction, null, 2));

    // Format the response for the frontend
    let formattedData = {
      success: true,
      requestId,
      message: "Transaction prepared for frontend execution",
      // Include the transaction details
      transaction: transaction,
      // Include the full response for debugging
      fullResponse: transactionData,
      // Include estimated DAI amount if available
      estimatedDai: transactionData.estimatedDai || null
    };

    // Return the formatted transaction data for frontend execution
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error executing swap transaction:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to execute swap transaction";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
