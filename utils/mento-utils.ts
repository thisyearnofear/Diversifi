"use client";

import { ethers } from "ethers";

// Token addresses on Celo
export const CELO_TOKENS = {
  CELO: "0x471ece3750da237f93b8e339c536989b8978a438",
  CUSD: "0x765de816845861e75a25fca122bb6898b8b1282a",
  CEUR: "0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73",
  CKES: "0x456a3d042c0dbd3db53d5489e98dfb038553b0d0",
  CCOP: "0x8a567e2ae79ca692bd748ab832081c45de4041ea",
  PUSO: "0x105d4a9306d2e55a71d2eb95b81553ae1dc20d7b",
};

// Mento Broker address
export const MENTO_BROKER_ADDRESS = "0x777a8255ca72412f0d706dc03c9d1987306b4cad";

// ABIs
export const MENTO_ABIS = {
  ERC20_BALANCE: ["function balanceOf(address) view returns (uint256)"],
  ERC20_ALLOWANCE: ["function allowance(address owner, address spender) view returns (uint256)"],
  ERC20_APPROVE: ["function approve(address spender, uint256 amount) returns (bool)"],
  BROKER_PROVIDERS: ["function getExchangeProviders() view returns (address[])"],
  EXCHANGE: ["function getExchanges() view returns ((bytes32 exchangeId, address[] assets)[])"],
  BROKER_RATE: ["function getAmountOut(address exchangeProvider, bytes32 exchangeId, address assetIn, address assetOut, uint256 amountIn) view returns (uint256)"],
  BROKER_SWAP: ["function swapIn(address exchangeProvider, bytes32 exchangeId, address assetIn, address assetOut, uint256 amountIn, uint256 minAmountOut) returns (uint256)"]
};

// Default exchange rates (USD to local currency)
export const DEFAULT_EXCHANGE_RATES = {
  CKES: 140, // 1 USD ≈ 140 KES
  CCOP: 4000, // 1 USD ≈ 4000 COP
  PUSO: 56, // 1 USD ≈ 56 PHP
};

// Cache keys
export const CACHE_KEYS = {
  EXCHANGE_RATE_CKES: 'mento-ckes-exchange-rate-cache',
  EXCHANGE_RATE_CCOP: 'mento-ccop-exchange-rate-cache',
  EXCHANGE_RATE_PUSO: 'mento-puso-exchange-rate-cache',
};

// Cache durations
export const CACHE_DURATIONS = {
  EXCHANGE_RATE: 1000 * 60 * 60, // 1 hour
  BALANCE: 1000 * 60 * 5, // 5 minutes
};

/**
 * Get cached data or null if not found or expired
 * @param key Cache key
 * @param duration Cache duration in milliseconds
 * @returns Cached value or null
 */
export const getCachedData = (key: string, duration: number = CACHE_DURATIONS.EXCHANGE_RATE): any => {
  try {
    if (typeof window === 'undefined') return null;

    const cachedData = localStorage.getItem(key);
    if (!cachedData) return null;

    const { value, timestamp } = JSON.parse(cachedData);
    const now = Date.now();

    if (now - timestamp < duration) {
      return value;
    }

    return null;
  } catch (error) {
    console.warn(`Error reading from cache (${key}):`, error);
    return null;
  }
};

/**
 * Set data in cache
 * @param key Cache key
 * @param value Value to cache
 */
export const setCachedData = (key: string, value: any): void => {
  try {
    if (typeof window === 'undefined') return;

    const cacheData = {
      value,
      timestamp: Date.now()
    };

    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.warn(`Error writing to cache (${key}):`, error);
  }
};

/**
 * Get exchange rate for a Celo stablecoin using Mento Protocol
 * @param tokenSymbol Token symbol (CKES, CCOP, PUSO)
 * @returns Exchange rate (cUSD to token)
 */
export const getMentoExchangeRate = async (tokenSymbol: string): Promise<number> => {
  const cacheKey = CACHE_KEYS[`EXCHANGE_RATE_${tokenSymbol}` as keyof typeof CACHE_KEYS];

  // Check cache first
  if (cacheKey) {
    const cachedRate = getCachedData(cacheKey);
    if (cachedRate !== null) {
      return cachedRate;
    }
  }

  // Default fallback rates
  const defaultRate = DEFAULT_EXCHANGE_RATES[tokenSymbol as keyof typeof DEFAULT_EXCHANGE_RATES] || 1;

  try {
    // Get token addresses
    const tokenAddress = CELO_TOKENS[tokenSymbol as keyof typeof CELO_TOKENS];
    const cusdAddress = CELO_TOKENS.CUSD;

    if (!tokenAddress) {
      console.warn(`Token address not found for ${tokenSymbol}`);
      return defaultRate;
    }

    // Create a read-only provider for Celo mainnet
    const provider = new ethers.providers.JsonRpcProvider("https://forno.celo.org");

    // Create contract instances
    const brokerContract = new ethers.Contract(
      MENTO_BROKER_ADDRESS,
      MENTO_ABIS.BROKER_PROVIDERS,
      provider
    );

    // Get exchange providers
    const exchangeProviders = await brokerContract.getExchangeProviders();

    // Find the exchange for cUSD/token
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
          assets.includes(cusdAddress.toLowerCase()) &&
          assets.includes(tokenAddress.toLowerCase())
        ) {
          exchangeProvider = providerAddress;
          exchangeId = exchange.exchangeId;
          break;
        }
      }

      if (exchangeProvider && exchangeId) break;
    }

    if (!exchangeProvider || !exchangeId) {
      console.warn(`No exchange found for cUSD/${tokenSymbol}`);
      return defaultRate;
    }

    // Get the rate using the broker
    const brokerRateContract = new ethers.Contract(
      MENTO_BROKER_ADDRESS,
      MENTO_ABIS.BROKER_RATE,
      provider
    );

    // Get quote for 1 cUSD
    const oneUSD = ethers.utils.parseUnits("1", 18);
    const amountOut = await brokerRateContract.getAmountOut(
      exchangeProvider,
      exchangeId,
      cusdAddress,
      tokenAddress,
      oneUSD
    );

    // Convert to number
    const rate = parseFloat(ethers.utils.formatUnits(amountOut, 18));

    // Cache the result
    if (cacheKey) {
      setCachedData(cacheKey, rate);
    }

    return rate;
  } catch (error) {
    console.error(`Error getting Mento exchange rate for ${tokenSymbol}:`, error);
    return defaultRate;
  }
};

/**
 * Handle common swap errors
 * @param error Error object
 * @param context Context string for error message
 * @returns User-friendly error message
 */
export const handleMentoError = (error: unknown, context: string): string => {
  const errorMsg = error instanceof Error ? error.message : String(error);
  console.error(`Error in ${context}:`, error);

  if (errorMsg.includes("low-level call failed") || errorMsg.includes("UNPREDICTABLE_GAS_LIMIT")) {
    return "Insufficient token balance or approval. Please check your balance.";
  } else if (errorMsg.includes("user rejected") || errorMsg.includes("User denied")) {
    return "Transaction was rejected. Please try again when ready.";
  } else if (errorMsg.includes("insufficient funds")) {
    return "Insufficient funds for gas fees. Please add more CELO to your wallet.";
  } else if (errorMsg.includes("nonce") || errorMsg.includes("replacement transaction")) {
    return "Transaction error. Please wait for pending transactions to complete.";
  } else if (errorMsg.includes("execution reverted")) {
    return "Transaction failed. This may be due to price slippage or liquidity issues.";
  }

  return `Failed to ${context}. Please try again.`;
};
