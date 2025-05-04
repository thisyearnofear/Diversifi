import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  CELO_TOKENS,
  MENTO_BROKER_ADDRESS,
  MENTO_ABIS,
  handleMentoError,
} from "../utils/mento-utils";
import { useInflationData } from "../hooks/use-inflation-data";

interface Token {
  symbol: string;
  name: string;
  icon?: string;
  region: string;
}

interface SwapInterfaceProps {
  availableTokens: Token[];
  onSwap?: (
    fromToken: string,
    toToken: string,
    amount: string
  ) => Promise<void>;
  title?: string;
  address?: string | null;
}

export default function SwapInterface({
  availableTokens,
  onSwap,
  title = "Swap Stablecoins",
  address,
}: SwapInterfaceProps) {
  const [fromToken, setFromToken] = useState<string>(
    availableTokens[0]?.symbol || ""
  );
  const [toToken, setToToken] = useState<string>(
    availableTokens[1]?.symbol || ""
  );
  const [amount, setAmount] = useState<string>("10");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [status, setStatus] = useState<
    "idle" | "approving" | "swapping" | "completed" | "error"
  >("idle");

  // Get inflation data
  const {
    getInflationRateForStablecoin,
    getRegionForStablecoin,
    dataSource: inflationDataSource,
  } = useInflationData();
  const [expectedOutput, setExpectedOutput] = useState<string | null>(null);
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.5); // 0.5% default

  // Get expected output amount when inputs change
  useEffect(() => {
    const getExpectedOutput = async () => {
      if (
        !fromToken ||
        !toToken ||
        !amount ||
        Number.parseFloat(amount) <= 0 ||
        fromToken === toToken
      ) {
        setExpectedOutput(null);
        return;
      }

      try {
        const output = await getExpectedAmountOut(fromToken, toToken, amount);
        setExpectedOutput(output);
      } catch (err) {
        console.warn("Error getting expected output:", err);
        setExpectedOutput(null);
      }
    };

    getExpectedOutput();
  }, [fromToken, toToken, amount]);

  // Get expected amount out for a swap
  const getExpectedAmountOut = async (
    fromToken: string,
    toToken: string,
    amount: string
  ): Promise<string> => {
    try {
      // Get token addresses
      const fromTokenAddress =
        CELO_TOKENS[fromToken as keyof typeof CELO_TOKENS];
      const toTokenAddress = CELO_TOKENS[toToken as keyof typeof CELO_TOKENS];

      if (!fromTokenAddress || !toTokenAddress) {
        throw new Error("Invalid token selection");
      }

      // Create a read-only provider for Celo
      const provider = new ethers.providers.JsonRpcProvider(
        "https://forno.celo.org"
      );

      // Convert amount to wei
      const amountInWei = ethers.utils.parseUnits(amount, 18);

      // Find the exchange for the token pair
      const brokerContract = new ethers.Contract(
        MENTO_BROKER_ADDRESS,
        MENTO_ABIS.BROKER_PROVIDERS,
        provider
      );

      const exchangeProviders = await brokerContract.getExchangeProviders();

      // Find the exchange for the token pair
      let exchangeProvider = "";
      let exchangeId = "";

      // Loop through providers to find the right exchange
      for (const providerAddress of exchangeProviders) {
        const exchangeContract = new ethers.Contract(
          providerAddress,
          MENTO_ABIS.EXCHANGE,
          provider
        );

        const exchanges = await exchangeContract.getExchanges();

        // Check each exchange
        for (const exchange of exchanges) {
          const assets = exchange.assets.map((a: string) => a.toLowerCase());

          if (
            assets.includes(fromTokenAddress.toLowerCase()) &&
            assets.includes(toTokenAddress.toLowerCase())
          ) {
            exchangeProvider = providerAddress;
            exchangeId = exchange.exchangeId;
            break;
          }
        }

        if (exchangeProvider && exchangeId) break;
      }

      if (!exchangeProvider || !exchangeId) {
        throw new Error(`No exchange found for ${fromToken}/${toToken}`);
      }

      // Get the expected amount out
      const brokerRateContract = new ethers.Contract(
        MENTO_BROKER_ADDRESS,
        MENTO_ABIS.BROKER_RATE,
        provider
      );

      const expectedAmountOut = await brokerRateContract.getAmountOut(
        exchangeProvider,
        exchangeId,
        fromTokenAddress,
        toTokenAddress,
        amountInWei
      );

      // Format the amount
      return ethers.utils.formatUnits(expectedAmountOut, 18);
    } catch (err) {
      console.error("Error getting expected amount out:", err);
      return "0";
    }
  };

  const handleSwap = async () => {
    if (
      !fromToken ||
      !toToken ||
      !amount ||
      Number.parseFloat(amount) <= 0 ||
      fromToken === toToken
    ) {
      return;
    }

    if (!address) {
      setError("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTxHash(null);
    setIsCompleted(false);
    setStatus("approving");

    try {
      if (onSwap) {
        // Use the provided onSwap function if available
        await onSwap(fromToken, toToken, amount);
        setIsCompleted(true);
        setStatus("completed");
      } else {
        // Otherwise, perform the swap directly
        await performSwap(fromToken, toToken, amount);
      }
    } catch (error) {
      console.error("Swap error:", error);
      setError(handleMentoError(error, "swap tokens"));
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  const performSwap = async (
    fromToken: string,
    toToken: string,
    amount: string
  ) => {
    if (!window.ethereum) {
      throw new Error(
        "No wallet detected. Please install a wallet like MiniPay or MetaMask."
      );
    }

    // Request account access
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const userAddress = accounts[0];

    // Create a Web3Provider from the Ethereum provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Get token addresses
    const fromTokenAddress = CELO_TOKENS[fromToken as keyof typeof CELO_TOKENS];
    const toTokenAddress = CELO_TOKENS[toToken as keyof typeof CELO_TOKENS];

    if (!fromTokenAddress || !toTokenAddress) {
      throw new Error("Invalid token selection");
    }

    // Convert amount to wei
    const amountInWei = ethers.utils.parseUnits(amount, 18);

    // Step 1: Approve the broker to spend tokens
    const tokenContract = new ethers.Contract(
      fromTokenAddress,
      MENTO_ABIS.ERC20_APPROVE,
      signer
    );

    // Check if approval is needed
    const allowance = await tokenContract.allowance(
      userAddress,
      MENTO_BROKER_ADDRESS
    );
    if (allowance.lt(amountInWei)) {
      const approveTx = await tokenContract.approve(
        MENTO_BROKER_ADDRESS,
        amountInWei
      );
      await approveTx.wait();
    }

    setStatus("swapping");

    // Step 2: Find the exchange for the token pair
    const brokerContract = new ethers.Contract(
      MENTO_BROKER_ADDRESS,
      MENTO_ABIS.BROKER_PROVIDERS,
      provider
    );

    const exchangeProviders = await brokerContract.getExchangeProviders();

    // Find the exchange for the token pair
    let exchangeProvider = "";
    let exchangeId = "";

    // Loop through providers to find the right exchange
    for (const providerAddress of exchangeProviders) {
      const exchangeContract = new ethers.Contract(
        providerAddress,
        MENTO_ABIS.EXCHANGE,
        provider
      );

      const exchanges = await exchangeContract.getExchanges();

      // Check each exchange
      for (const exchange of exchanges) {
        const assets = exchange.assets.map((a: string) => a.toLowerCase());

        if (
          assets.includes(fromTokenAddress.toLowerCase()) &&
          assets.includes(toTokenAddress.toLowerCase())
        ) {
          exchangeProvider = providerAddress;
          exchangeId = exchange.exchangeId;
          break;
        }
      }

      if (exchangeProvider && exchangeId) break;
    }

    if (!exchangeProvider || !exchangeId) {
      throw new Error(`No exchange found for ${fromToken}/${toToken}`);
    }

    // Step 3: Get the expected amount out
    const brokerRateContract = new ethers.Contract(
      MENTO_BROKER_ADDRESS,
      MENTO_ABIS.BROKER_RATE,
      provider
    );

    const expectedAmountOut = await brokerRateContract.getAmountOut(
      exchangeProvider,
      exchangeId,
      fromTokenAddress,
      toTokenAddress,
      amountInWei
    );

    // Apply slippage tolerance
    const minAmountOut = expectedAmountOut
      .mul(ethers.BigNumber.from(Math.floor((100 - slippageTolerance) * 100)))
      .div(ethers.BigNumber.from(10000));

    // Step 4: Execute the swap
    const brokerSwapContract = new ethers.Contract(
      MENTO_BROKER_ADDRESS,
      MENTO_ABIS.BROKER_SWAP,
      signer
    );

    // Try with automatic gas estimation first
    try {
      const swapTx = await brokerSwapContract.swapIn(
        exchangeProvider,
        exchangeId,
        fromTokenAddress,
        toTokenAddress,
        amountInWei,
        minAmountOut
      );

      setTxHash(swapTx.hash);

      // Wait for the transaction to be confirmed
      const swapReceipt = await swapTx.wait();
      if (swapReceipt.status !== 1) {
        throw new Error("Swap transaction failed");
      }

      setIsCompleted(true);
      setStatus("completed");
    } catch (swapError) {
      console.error(
        "Error with automatic gas estimation, trying with manual gas limit:",
        swapError
      );

      // If automatic gas estimation fails, try with manual gas limit
      const options = {
        gasLimit: ethers.utils.hexlify(500000), // Manual gas limit of 500,000
      };

      const swapTx = await brokerSwapContract.swapIn(
        exchangeProvider,
        exchangeId,
        fromTokenAddress,
        toTokenAddress,
        amountInWei,
        minAmountOut,
        options
      );

      setTxHash(swapTx.hash);

      // Wait for the transaction to be confirmed
      const swapReceipt = await swapTx.wait();
      if (swapReceipt.status !== 1) {
        throw new Error("Swap transaction failed");
      }

      setIsCompleted(true);
      setStatus("completed");
    }
  };

  const handleSwitchTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  // Get inflation rates for the selected tokens
  const fromTokenInflationRate = fromToken
    ? getInflationRateForStablecoin(fromToken)
    : 0;
  const toTokenInflationRate = toToken
    ? getInflationRateForStablecoin(toToken)
    : 0;
  const fromTokenRegion = fromToken ? getRegionForStablecoin(fromToken) : "";
  const toTokenRegion = toToken ? getRegionForStablecoin(toToken) : "";

  // Calculate potential inflation savings
  const inflationDifference = fromTokenInflationRate - toTokenInflationRate;
  const hasInflationBenefit = inflationDifference > 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {inflationDataSource === "api" && (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
            Live Inflation Data
          </span>
        )}
        {inflationDataSource === "cache" && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            Cached Inflation Data
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            From
          </label>
          <div className="flex space-x-2">
            <select
              value={fromToken}
              onChange={(e) => setFromToken(e.target.value)}
              className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              disabled={isLoading}
            >
              {availableTokens.map((token) => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol} - {token.region}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="block w-2/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              placeholder="Amount"
              min="0"
              step="0.01"
              disabled={isLoading}
            />
          </div>
          {fromToken && (
            <div className="mt-1 text-xs text-gray-500 flex items-center">
              <span className="mr-1">Region: {fromTokenRegion}</span>
              <span className="ml-auto">
                Inflation:{" "}
                <span className="font-medium">
                  {fromTokenInflationRate.toFixed(1)}%
                </span>
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleSwitchTokens}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            disabled={isLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-5 text-gray-500 dark:text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16 10a1 1 0 01-1 1H5.414l2.293 2.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 111.414 1.414L5.414 9H15a1 1 0 011 1z"
                transform="rotate(90 10 10)"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            To
          </label>
          <div className="flex items-center space-x-2">
            <select
              value={toToken}
              onChange={(e) => setToToken(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              disabled={isLoading}
            >
              {availableTokens.map((token) => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol} - {token.region}
                </option>
              ))}
            </select>
          </div>

          {toToken && (
            <div className="mt-1 text-xs text-gray-500 flex items-center">
              <span className="mr-1">Region: {toTokenRegion}</span>
              <span className="ml-auto">
                Inflation:{" "}
                <span className="font-medium">
                  {toTokenInflationRate.toFixed(1)}%
                </span>
              </span>
            </div>
          )}

          {expectedOutput && Number.parseFloat(expectedOutput) > 0 && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Expected output:{" "}
              <span className="font-medium">
                {Number.parseFloat(expectedOutput).toFixed(6)} {toToken}
              </span>
            </div>
          )}
        </div>

        {/* Inflation benefit information */}
        {fromToken && toToken && hasInflationBenefit && (
          <div className="p-3 bg-green-50 rounded-md">
            <h3 className="text-sm font-medium text-green-800 mb-1">
              Inflation Protection Benefit
            </h3>
            <p className="text-xs text-green-700">
              By swapping from {fromToken} to {toToken}, you could save
              approximately{" "}
              <span className="font-bold">
                {inflationDifference.toFixed(1)}%
              </span>{" "}
              in purchasing power per year due to lower inflation in{" "}
              {toTokenRegion}.
            </p>
          </div>
        )}

        {/* Slippage Tolerance */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Slippage Tolerance
          </label>
          <div className="flex space-x-2">
            {[0.1, 0.5, 1.0, 2.0].map((tolerance) => (
              <button
                key={tolerance}
                onClick={() => setSlippageTolerance(tolerance)}
                className={`px-3 py-1 text-sm rounded-md ${
                  slippageTolerance === tolerance
                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                    : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                }`}
                disabled={isLoading}
              >
                {tolerance}%
              </button>
            ))}
          </div>
        </div>

        {/* Transaction Status */}
        {status !== "idle" && (
          <div
            className={`p-3 rounded-md ${
              status === "error"
                ? "bg-red-50 text-red-700 border border-red-100"
                : status === "completed"
                ? "bg-green-50 text-green-700 border border-green-100"
                : "bg-blue-50 text-blue-700 border border-blue-100"
            }`}
          >
            <div className="flex items-center">
              {status === "approving" && (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 size-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Approving token transfer...</span>
                </>
              )}

              {status === "swapping" && (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 size-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Executing swap transaction...</span>
                </>
              )}

              {status === "completed" && (
                <>
                  <svg
                    className="size-4 mr-2 text-green-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Swap completed successfully!</span>
                </>
              )}

              {status === "error" && (
                <>
                  <svg
                    className="size-4 mr-2 text-red-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{error || "An error occurred during the swap"}</span>
                </>
              )}
            </div>

            {txHash && (
              <div className="mt-2 text-xs">
                <a
                  href={`https://explorer.celo.org/mainnet/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View transaction on explorer
                </a>
              </div>
            )}
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={handleSwap}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              isLoading ||
              !fromToken ||
              !toToken ||
              !amount ||
              Number.parseFloat(amount) <= 0 ||
              fromToken === toToken
            }
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 size-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {status === "approving"
                  ? "Approving..."
                  : status === "swapping"
                  ? "Swapping..."
                  : "Processing..."}
              </span>
            ) : (
              "Swap"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
