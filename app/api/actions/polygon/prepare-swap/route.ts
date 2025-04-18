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
    // Use a more natural language prompt
    const prompt = `I want to swap ${amount} MATIC for DAI on Polygon`;
    console.log(`Using prompt: "${prompt}" for Brian API request`);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Brian-Api-Key': BRIAN_API_KEY
      },
      body: JSON.stringify({
        prompt: prompt,
        address: address
      })
    };

    console.log(`Making request to Brian API with key: ${BRIAN_API_KEY ? BRIAN_API_KEY.substring(0, 5) + '...' : 'undefined'}`);

    // Add a timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let data;
    try {
      const response = await fetch("https://api.brianknows.org/api/v0/agent/transaction", {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId); // Clear the timeout if the request completes

      if (!response.ok) {
        // Read the response body as text first
        const apiErrorText = await response.text();
        let apiError;
        
        // Try to parse as JSON, fallback to text if parsing fails
        try {
          apiError = JSON.parse(apiErrorText);
        } catch {
          apiError = { details: apiErrorText };
        }

        const errorMessage = `Brian API error: ${response.status} ${response.statusText}${apiError && apiError.error ? ` - ${apiError.error}` : ""}`;
        console.error("Brian API error details:", apiError);

        // Provide more specific error messages based on status code
        if (response.status === 401 || response.status === 403) {
          throw new Error("API key is invalid or unauthorized. Please check your BRIAN_API_KEY environment variable.");
        } else if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        } else if (response.status >= 500) {
          throw new Error("Brian API server error. The service might be experiencing issues. Please try again later.");
        } else {
          throw new Error(errorMessage);
        }
      }

      data = await response.json();
      console.log("Brian API response:", JSON.stringify(data, null, 2));
    } catch (fetchError: unknown) {
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error("Request to Brian API timed out. Please try again later.");
      }
      throw fetchError;
    }

    // Validate the response structure (object with result array)
    if (!data || !Array.isArray(data.result)) {
      console.error("Unexpected response format: result array not found", data);
      throw new Error("Unexpected response format from Brian API: result array not found");
    }

    // Extract estimated DAI amount if available
    let estimatedDai = "0";
    if (
      data.result.length > 0 &&
      data.result[0].data &&
      data.result[0].data.toAmount
    ) {
      estimatedDai = data.result[0].data.toAmount.toString();
      console.log(`Extracted estimated DAI amount: ${estimatedDai}`);
    } else {
      // Calculate a fallback estimate
      const maticPrice = 0.5; // Example price in USD
      const daiPrice = 1.0; // DAI is a stablecoin pegged to USD
      estimatedDai = (parseFloat(amount) * maticPrice / daiPrice).toFixed(6);
      console.log(`Calculated fallback estimated DAI amount: ${estimatedDai}`);
    }

    // Format the response to match what the frontend expects
    const formattedResponse = {
      success: true,
      result: data.result, // The result array from the API response
      estimatedDai
    };

    console.log("Formatted response:", JSON.stringify(formattedResponse, null, 2));

    // Return the transaction data along with the estimated DAI amount
    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error("Error preparing swap transaction:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to prepare swap transaction";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
