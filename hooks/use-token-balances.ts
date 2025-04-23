"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { CELO_TOKENS } from "@/utils/mento-utils";

// Define token groups by region
export const TOKEN_REGIONS = {
  Africa: ["cKES"],
  Europe: ["EURA"],
  USA: ["USDbC", "USDC", "DAI"],
  LatAm: ["cCOP", "BRZ"],
  Asia: ["PUSO"],
  RWA: []
};

// Define conversion rates to USD for non-USD stablecoins
export const TOKEN_USD_CONVERSION_RATES = {
  cKES: 0.0078,   // 1 KES ≈ 0.0078 USD
  EURA: 1.08,     // 1 EUR ≈ 1.08 USD
  cCOP: 0.00025,  // 1 COP ≈ 0.00025 USD
  BRZ: 0.20,      // 1 BRZ ≈ 0.20 USD
  PUSO: 0.0179    // 1 PHP ≈ 0.0179 USD
  // Other tokens (USDbC, USDC, DAI) are already in USD
};

// Define token addresses by chain
export const TOKEN_ADDRESSES = {
  // Celo tokens
  cKES: { address: CELO_TOKENS.CKES, chain: "celo", decimals: 18 },
  cCOP: { address: CELO_TOKENS.CCOP, chain: "celo", decimals: 18 },
  PUSO: { address: CELO_TOKENS.PUSO, chain: "celo", decimals: 18 },

  // Base tokens
  USDbC: { address: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA", chain: "base", decimals: 18 }, // Verify this is correct

  // Optimism tokens
  EURA: { address: "0x9485aca5bbBE1667AD97c7fE7C4531a624C8b1ED", chain: "optimism", decimals: 18 },

  // Polygon tokens
  DAI: { address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", chain: "polygon", decimals: 18 },

  // Other tokens
  USDC: { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", chain: "base", decimals: 6 },
  BRZ: { address: "0x491a4eb4f1fc3bff8e1d2fc856a6a46663ad556f", chain: "polygon", decimals: 18 }
};

// RPC URLs for different chains
const RPC_URLS = {
  celo: "https://forno.celo.org",
  base: "https://mainnet.base.org",
  optimism: "https://mainnet.optimism.io",
  polygon: "https://polygon-rpc.com"
};

// ERC20 ABI for balance checking
const ERC20_BALANCE_ABI = [
  "function balanceOf(address owner) view returns (uint256)"
];

// Token balance cache with expiration
interface CachedBalance {
  balance: string;
  timestamp: number;
  loading: boolean;
  error: string | null;
}

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export function useTokenBalances(selectedRegion?: string) {
  const { address } = useAccount();
  const [balances, setBalances] = useState<Record<string, CachedBalance>>({});
  const [totalValue, setTotalValue] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Get tokens for the selected region or all tokens if no region is selected
  const getTokensForRegion = useCallback(() => {
    if (!selectedRegion || selectedRegion === "All") {
      // Return all tokens if no region is selected or "All" is selected
      return Object.keys(TOKEN_ADDRESSES);
    }

    return TOKEN_REGIONS[selectedRegion as keyof typeof TOKEN_REGIONS] || [];
  }, [selectedRegion]);

  // Calculate total value of all tokens in USD
  const calculateTotalValue = useCallback(() => {
    let total = 0;

    Object.entries(balances).forEach(([token, data]) => {
      if (data.balance && !data.loading && !data.error) {
        // Get token info
        const tokenInfo = TOKEN_ADDRESSES[token as keyof typeof TOKEN_ADDRESSES];
        if (!tokenInfo) return;

        // Convert balance to number
        const balance = parseFloat(ethers.utils.formatUnits(data.balance, tokenInfo.decimals));

        // Apply conversion rates for non-USD stablecoins
        let value = balance;
        // Use centralized conversion rates
        const conversionRate = TOKEN_USD_CONVERSION_RATES[token as keyof typeof TOKEN_USD_CONVERSION_RATES];
        if (conversionRate) {
          value = balance * conversionRate;
        }
        // Other tokens (USDbC, USDC, DAI) are already in USD

        total += value;
      }
    });

    setTotalValue(total);
  }, [balances]);

  // Fetch balance for a specific token
  const fetchBalance = useCallback(async (token: string) => {
    console.log(`Fetching balance for ${token}...`);

    if (!address) {
      console.log(`No wallet address, skipping ${token} balance fetch`);
      return;
    }

    // Get token info
    const tokenInfo = TOKEN_ADDRESSES[token as keyof typeof TOKEN_ADDRESSES];
    if (!tokenInfo) {
      console.log(`No token info found for ${token}, skipping`);
      return;
    }

    try {
      // Update loading state
      setBalances(prev => ({
        ...prev,
        [token]: {
          ...prev[token],
          loading: true,
          error: null
        }
      }));

      // Create provider for the token's chain
      console.log(`Creating provider for ${token} on ${tokenInfo.chain} chain`);
      const provider = new ethers.providers.JsonRpcProvider(RPC_URLS[tokenInfo.chain as keyof typeof RPC_URLS]);

      // Create contract instance
      console.log(`Creating contract for ${token} at address ${tokenInfo.address}`);

      // Ensure the address is in lowercase to avoid checksum issues
      const tokenAddress = tokenInfo.address.toLowerCase();
      console.log(`Using normalized address: ${tokenAddress}`);

      const contract = new ethers.Contract(tokenAddress, ERC20_BALANCE_ABI, provider);

      // Get balance
      console.log(`Calling balanceOf for ${token} with address ${address}`);
      const balance = await contract.balanceOf(address);
      console.log(`Balance for ${token}: ${balance.toString()}`);


      // Update balance
      setBalances(prev => ({
        ...prev,
        [token]: {
          balance: balance.toString(),
          timestamp: Date.now(),
          loading: false,
          error: null
        }
      }));
    } catch (error) {
      console.error(`Error fetching balance for ${token}:`, error);

      // Log more detailed error information
      if (error instanceof Error) {
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack: ${error.stack}`);
      }

      // Update error state
      setBalances(prev => ({
        ...prev,
        [token]: {
          ...prev[token],
          loading: false,
          error: "Failed to fetch balance"
        }
      }));
    }
  }, [address]);

  // Helper function to fetch a list of tokens with timeout
  const fetchTokens = useCallback(async (tokensToFetch: string[]) => {
    if (tokensToFetch.length === 0) {
      calculateTotalValue();
      setIsLoading(false);
      return;
    }

    // Fetch balances for tokens that need to be fetched with timeout
    const fetchPromises = tokensToFetch.map(token => {
      // Create a promise that rejects after 10 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Timeout fetching balance for ${token}`)), 10000);
      });

      // Race the fetch against the timeout
      return Promise.race([
        fetchBalance(token),
        timeoutPromise
      ]).catch(error => {
        console.warn(`Error or timeout fetching ${token}:`, error.message);
        // Return a resolved promise to continue with other tokens
        return Promise.resolve();
      });
    });

    // Wait for all fetches to complete
    await Promise.allSettled(fetchPromises);
    console.log("All balance fetches completed or timed out");

    // Calculate total value
    calculateTotalValue();

    // Update loading state
    setIsLoading(false);
  }, [calculateTotalValue, fetchBalance]);

  // Fetch balances for all tokens in the selected region
  const fetchBalances = useCallback(async () => {
    console.log("fetchBalances called, address:", address ? "connected" : "not connected");
    console.log("Current selected region:", selectedRegion);

    if (!address) {
      console.log("No wallet address, skipping balance fetch");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Get tokens for the selected region
    const tokens = getTokensForRegion();
    console.log("Tokens for region:", tokens);

    // If no tokens were returned, use all tokens as a fallback
    if (tokens.length === 0) {
      console.log("No tokens found for region, using all tokens as fallback");
      const allTokens = Object.keys(TOKEN_ADDRESSES);
      console.log("All available tokens:", allTokens);

      // Continue with all tokens
      const tokensToFetch = allTokens.filter(token => {
        const cachedData = balances[token];
        return !cachedData ||
               cachedData.loading ||
               (Date.now() - cachedData.timestamp > CACHE_DURATION);
      });

      console.log("Fallback tokens to fetch:", tokensToFetch);

      // Process these tokens
      await fetchTokens(tokensToFetch);
      return;
    }

    // Check which tokens need to be fetched (not in cache or cache expired)
    const tokensToFetch = tokens.filter(token => {
      const cachedData = balances[token];
      return !cachedData ||
             cachedData.loading ||
             (Date.now() - cachedData.timestamp > CACHE_DURATION);
    });

    console.log("Tokens to fetch:", tokensToFetch);

    // Process the tokens
    await fetchTokens(tokensToFetch);
  }, [address, balances, calculateTotalValue, fetchBalance, fetchTokens, getTokensForRegion, selectedRegion]);

  // No automatic fetching on mount - user must click refresh
  useEffect(() => {
    if (!address) {
      // Reset loading state if no wallet is connected
      setIsLoading(false);
    }

    // No automatic refresh interval - user must click refresh
  }, [address]);

  // Return formatted balances for the selected region
  const getFormattedBalances = useCallback(() => {
    const tokens = getTokensForRegion();
    const result: Record<string, { amount: string, value: number, loading: boolean, error: string | null }> = {};

    // If no tokens were found, include all tokens as a fallback
    if (tokens.length === 0) {
      const allTokens = Object.keys(TOKEN_ADDRESSES);
      allTokens.forEach(token => {
        const cachedData = balances[token] || { balance: "0", timestamp: 0, loading: false, error: null };
        const tokenInfo = TOKEN_ADDRESSES[token as keyof typeof TOKEN_ADDRESSES];

        if (!tokenInfo) return;

        // Format balance
        let amount = "0.0";
        try {
          if (cachedData.balance) {
            amount = ethers.utils.formatUnits(cachedData.balance, tokenInfo.decimals);
          }
        } catch (error) {
          console.error(`Error formatting balance for ${token}:`, error);
        }

        // Calculate USD value based on token type
        let value = parseFloat(amount);

        // Apply conversion rates for non-USD stablecoins
        // Use centralized conversion rates
        const conversionRate = TOKEN_USD_CONVERSION_RATES[token as keyof typeof TOKEN_USD_CONVERSION_RATES];
        if (conversionRate) {
          value = value * conversionRate;
        }
        // Other tokens (USDbC, USDC, DAI) are already in USD

        result[token] = {
          amount,
          value,
          loading: cachedData.loading,
          error: cachedData.error
        };
      });

      return result;
    }

    tokens.forEach(token => {
      const cachedData = balances[token] || { balance: "0", timestamp: 0, loading: true, error: null };
      const tokenInfo = TOKEN_ADDRESSES[token as keyof typeof TOKEN_ADDRESSES];

      if (!tokenInfo) return;

      // Format balance
      let amount = "0.0";
      try {
        if (cachedData.balance) {
          amount = ethers.utils.formatUnits(cachedData.balance, tokenInfo.decimals);
        }
      } catch (error) {
        console.error(`Error formatting balance for ${token}:`, error);
      }

      // Calculate USD value based on token type
      let value = parseFloat(amount);

      // Apply conversion rates for non-USD stablecoins
      // Use centralized conversion rates
      const conversionRate = TOKEN_USD_CONVERSION_RATES[token as keyof typeof TOKEN_USD_CONVERSION_RATES];
      if (conversionRate) {
        value = value * conversionRate;
      }
      // Other tokens (USDbC, USDC, DAI) are already in USD

      result[token] = {
        amount,
        value,
        loading: cachedData.loading,
        error: cachedData.error
      };
    });

    return result;
  }, [balances, getTokensForRegion, selectedRegion]);

  // Memoize the formatted balances to prevent unnecessary recalculations
  const formattedBalances = useMemo(() => getFormattedBalances(), [getFormattedBalances]);

  return {
    balances: formattedBalances,
    totalValue,
    isLoading,
    refreshBalances: fetchBalances
  };
}
