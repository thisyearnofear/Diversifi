"use client";

import { useState, useEffect, useCallback } from "react";
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

// Define token addresses by chain
export const TOKEN_ADDRESSES = {
  // Celo tokens
  cKES: { address: CELO_TOKENS.CKES, chain: "celo", decimals: 18 },
  cCOP: { address: CELO_TOKENS.CCOP, chain: "celo", decimals: 18 },
  PUSO: { address: CELO_TOKENS.PUSO, chain: "celo", decimals: 18 },

  // Base tokens
  USDbC: { address: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA", chain: "base", decimals: 18 },

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
    if (!selectedRegion) {
      // Return all tokens if no region is selected
      return Object.keys(TOKEN_ADDRESSES);
    }

    return TOKEN_REGIONS[selectedRegion as keyof typeof TOKEN_REGIONS] || [];
  }, [selectedRegion]);

  // Calculate total value of all tokens
  const calculateTotalValue = useCallback(() => {
    let total = 0;

    Object.entries(balances).forEach(([token, data]) => {
      if (data.balance && !data.loading && !data.error) {
        // Get token info
        const tokenInfo = TOKEN_ADDRESSES[token as keyof typeof TOKEN_ADDRESSES];
        if (!tokenInfo) return;

        // Convert balance to number
        const balance = parseFloat(ethers.utils.formatUnits(data.balance, tokenInfo.decimals));

        // Use a simple 1:1 conversion for stablecoins for now
        // In a real app, you'd use actual prices from an oracle or API
        total += balance;
      }
    });

    setTotalValue(total);
  }, [balances]);

  // Fetch balance for a specific token
  const fetchBalance = useCallback(async (token: string) => {
    if (!address) return;

    // Get token info
    const tokenInfo = TOKEN_ADDRESSES[token as keyof typeof TOKEN_ADDRESSES];
    if (!tokenInfo) return;

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
      const provider = new ethers.providers.JsonRpcProvider(RPC_URLS[tokenInfo.chain as keyof typeof RPC_URLS]);

      // Create contract instance
      const contract = new ethers.Contract(tokenInfo.address, ERC20_BALANCE_ABI, provider);

      // Get balance
      const balance = await contract.balanceOf(address);

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
      console.warn(`Error fetching balance for ${token}:`, error);

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

  // Fetch balances for all tokens in the selected region
  const fetchBalances = useCallback(async () => {
    if (!address) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Get tokens for the selected region
    const tokens = getTokensForRegion();

    // Check which tokens need to be fetched (not in cache or cache expired)
    const tokensToFetch = tokens.filter(token => {
      const cachedData = balances[token];
      return !cachedData ||
             cachedData.loading ||
             (Date.now() - cachedData.timestamp > CACHE_DURATION);
    });

    // If no tokens need to be fetched, just calculate total value
    if (tokensToFetch.length === 0) {
      calculateTotalValue();
      setIsLoading(false);
      return;
    }

    // Fetch balances for tokens that need to be fetched
    const fetchPromises = tokensToFetch.map(token => fetchBalance(token));

    // Wait for all fetches to complete
    await Promise.allSettled(fetchPromises);

    // Calculate total value
    calculateTotalValue();

    // Update loading state
    setIsLoading(false);
  }, [address, balances, calculateTotalValue, fetchBalance, getTokensForRegion]);

  // Only fetch balances when address changes, not on region change
  useEffect(() => {
    if (address) {
      // Only fetch on initial load, not on region changes
      // This makes refreshing explicitly manual
    }

    // No automatic refresh interval - user must click refresh
  }, [address]);

  // Return formatted balances for the selected region
  const getFormattedBalances = useCallback(() => {
    const tokens = getTokensForRegion();
    const result: Record<string, { amount: string, value: number, loading: boolean, error: string | null }> = {};

    tokens.forEach(token => {
      const cachedData = balances[token] || { balance: "0", timestamp: 0, loading: true, error: null };
      const tokenInfo = TOKEN_ADDRESSES[token as keyof typeof TOKEN_ADDRESSES];

      if (!tokenInfo) return;

      // Format balance
      const amount = cachedData.balance
        ? ethers.utils.formatUnits(cachedData.balance, tokenInfo.decimals)
        : "0.0";

      // Calculate value (1:1 for stablecoins)
      const value = parseFloat(amount);

      result[token] = {
        amount,
        value,
        loading: cachedData.loading,
        error: cachedData.error
      };
    });

    return result;
  }, [balances, getTokensForRegion]);

  return {
    balances: getFormattedBalances(),
    totalValue,
    isLoading,
    refreshBalances: fetchBalances
  };
}
