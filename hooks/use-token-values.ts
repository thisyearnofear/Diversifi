"use client";

import { useState, useEffect, useCallback } from "react";
import { useTokenBalances, TOKEN_REGIONS } from "./use-token-balances";
import { useTokenPrice } from "./use-token-price";

/**
 * Custom hook that combines token balances with price data to get accurate USD values
 * @param selectedRegion The selected region to filter tokens by
 * @returns Object containing token balances with accurate USD values
 */
export function useTokenValues(selectedRegion?: string) {
  // Get token balances - no automatic fetching
  const { balances, isLoading, refreshBalances } = useTokenBalances(selectedRegion);

  // Initialize state for region totals and total value
  const [regionTotals, setRegionTotals] = useState<Record<string, number>>({});
  const [totalValue, setTotalValue] = useState<number>(0);

  // Calculate region totals whenever balances change
  useEffect(() => {
    if (isLoading || Object.keys(balances).length === 0) return;

    // Initialize region totals with 0
    const totals: Record<string, number> = {};
    let total = 0;

    // Initialize all regions with 0
    Object.keys(TOKEN_REGIONS).forEach(region => {
      if (region !== "All") {
        totals[region] = 0;
      }
    });

    // Calculate totals for each region
    Object.entries(TOKEN_REGIONS).forEach(([region, tokens]) => {
      if (region !== "All") {
        tokens.forEach(token => {
          if (balances[token]) {
            totals[region] += balances[token].value;
            total += balances[token].value;
          }
        });
      }
    });

    // Update state
    setRegionTotals(totals);
    setTotalValue(total);

  }, [balances, isLoading]);

  return {
    balances,
    regionTotals,
    totalValue,
    isLoading,
    refreshBalances
  };
}
