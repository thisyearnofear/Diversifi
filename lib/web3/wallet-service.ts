// Using dynamic import for server-side compatibility
let Coinbase: any;
let Wallet: any;

// Configuration for different environments
const API_KEY = process.env.COINBASE_CDP_API_KEY || "";
const API_SECRET = process.env.COINBASE_CDP_API_SECRET || "";

// Initialize the SDK
let isInitialized = false;

const initializeSdk = async () => {
  if (!isInitialized) {
    try {
      // Log environment variables (without revealing full secrets)
      console.log("API_KEY available:", !!API_KEY);
      console.log("API_SECRET available:", !!API_SECRET);

      if (!API_KEY || !API_SECRET) {
        console.error("Coinbase API keys not found in environment variables");
        throw new Error("Coinbase API keys not configured");
      }

      // Dynamically import the SDK to avoid issues with server-side rendering
      const sdk = await import("@coinbase/coinbase-sdk");
      Coinbase = sdk.Coinbase;
      Wallet = sdk.Wallet;

      // Configure the SDK with API keys
      Coinbase.configure(API_KEY, API_SECRET);
      isInitialized = true;
      console.log("Coinbase SDK initialized with API keys");
    } catch (error) {
      console.error("Error initializing Coinbase SDK:", error);
      throw error;
    }
  }
};

/**
 * Creates a new Coinbase-managed wallet
 * @returns The created wallet and its default address
 */
export const createWallet = async () => {
  try {
    await initializeSdk();

    console.log("Creating wallet with Coinbase SDK...");

    // For testing purposes, let's create a developer-managed wallet (1-of-1) instead
    // This is simpler and more likely to work without additional configuration
    const wallet = await Wallet.create({
      // Use Base Sepolia for testing
      networkId: Coinbase.networks.BaseSepolia,
      // Set to false for Developer-managed wallet (1-of-1)
      coinbaseManaged: false,
    });

    // Get the wallet ID for future reference
    const walletId = wallet.getId();

    // Get the default address
    const address = await wallet.getDefaultAddress();
    const addressString = address.toString();

    console.log(`Wallet created successfully: ${walletId}`);
    console.log(`Default address: ${addressString}`);

    return {
      walletId,
      address: addressString,
      networkId: "base-sepolia",
    };
  } catch (error: any) {
    console.error("Error creating wallet:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      httpCode: error.httpCode,
      apiCode: error.apiCode,
      apiMessage: error.apiMessage,
      correlationId: error.correlationId,
    });
    throw error;
  }
};

/**
 * Funds a wallet with testnet ETH using the faucet
 * @param walletId The wallet ID to fund
 * @returns The faucet transaction details
 */
export const fundWalletFromFaucet = async (walletId: string) => {
  try {
    await initializeSdk();

    // Retrieve the wallet
    const wallet = await Wallet.fetch(walletId);

    // Fund the wallet with testnet ETH
    const faucetTransaction = await wallet.faucet();

    // Wait for the transaction to complete
    await faucetTransaction.wait();

    const txId = faucetTransaction.getId();
    const status = faucetTransaction.getStatus();

    console.log(`Faucet transaction completed: ${txId} with status: ${status}`);

    return {
      transactionId: txId,
      status,
    };
  } catch (error) {
    console.error("Error funding wallet:", error);
    throw error;
  }
};

/**
 * Gets the balance of a wallet
 * @param walletId The wallet ID
 * @param assetId The asset to check (defaults to ETH)
 * @returns The wallet balance
 */
export const getWalletBalance = async (walletId: string) => {
  try {
    await initializeSdk();

    // Retrieve the wallet
    const wallet = await Wallet.fetch(walletId);

    // Get all balances
    const balances = await wallet.listBalances();

    // Get ETH balance specifically
    const ethBalance = balances.find((b: any) => b.symbol === "ETH");
    const balance = ethBalance ? ethBalance.amount : "0";

    return {
      walletId,
      address: await wallet.getDefaultAddress(),
      balance,
    };
  } catch (error) {
    console.error("Error getting wallet balance:", error);
    throw error;
  }
};

/**
 * Transfers funds between wallets
 * @param sourceWalletId The source wallet ID
 * @param destinationAddress The destination address
 * @param amount The amount to transfer
 * @returns The transfer transaction details
 */
export const transferFunds = async (
  sourceWalletId: string,
  destinationAddress: string,
  amount: number
) => {
  try {
    await initializeSdk();

    // Retrieve the source wallet
    const sourceWallet = await Wallet.fetch(sourceWalletId);

    // Create the transfer
    const transfer = await sourceWallet.createTransfer({
      amount,
      assetId: Coinbase.assets.Eth,
      destination: destinationAddress,
    });

    // Wait for the transfer to complete
    await transfer.wait();

    const txId = transfer.getId();
    const status = transfer.getStatus();

    console.log(`Transfer completed: ${txId} with status: ${status}`);

    return {
      transactionId: txId,
      status,
    };
  } catch (error) {
    console.error("Error transferring funds:", error);
    throw error;
  }
};
