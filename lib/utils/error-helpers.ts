/**
 * Utility functions for handling and displaying errors in a user-friendly way
 */

/**
 * Parses a contract error message and returns a user-friendly version
 * @param error The error object or message string
 * @returns A user-friendly error message
 */
export function parseContractError(error: unknown): string {
  if (!error) return "An unknown error occurred";
  
  const errorMessage = error instanceof Error 
    ? error.message 
    : typeof error === "string" 
      ? error 
      : "An unknown error occurred";

  // Handle user rejection errors
  if (
    errorMessage.includes("User rejected") || 
    errorMessage.includes("user rejected") ||
    errorMessage.includes("User denied")
  ) {
    return "Transaction was declined. You can try again when ready.";
  }

  // Handle Divvi registration specific errors
  if (errorMessage.includes("registerReferrals") && errorMessage.includes("reverted")) {
    if (errorMessage.includes("Pop up window failed to open")) {
      return "Registration failed. Please ensure pop-ups are enabled in your browser and try again.";
    }
    
    // Already registered error
    if (errorMessage.includes("already registered")) {
      return "You're already registered! Please proceed to the next step.";
    }

    return "Registration failed. Please check your wallet connection and try again.";
  }

  // Handle network errors
  if (
    errorMessage.includes("network") || 
    errorMessage.includes("disconnected") ||
    errorMessage.includes("connection")
  ) {
    return "Network connection issue. Please check your internet connection and try again.";
  }

  // Handle gas errors
  if (
    errorMessage.includes("gas") || 
    errorMessage.includes("fee")
  ) {
    return "Transaction failed due to gas issues. Please try again with a higher gas limit or wait for network congestion to decrease.";
  }

  // Handle insufficient funds
  if (
    errorMessage.includes("insufficient funds") || 
    errorMessage.includes("Insufficient funds")
  ) {
    return "You don't have enough funds to complete this transaction. Please add more funds to your wallet.";
  }

  // Handle timeout errors
  if (errorMessage.includes("timeout")) {
    return "The transaction timed out. Please try again.";
  }

  // If we can't identify a specific error, return a generic message
  // but include a simplified version of the original error for context
  const simplifiedError = errorMessage
    .replace(/^.*error:/, "")
    .replace(/\\n.*$/g, "")
    .replace(/\(.*\)/, "")
    .replace(/\[.*\]/, "")
    .replace(/https?:\/\/[^\s]+/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (simplifiedError.length > 100) {
    return `Transaction failed. Please try again later.`;
  }

  return `Transaction failed: ${simplifiedError}`;
}
