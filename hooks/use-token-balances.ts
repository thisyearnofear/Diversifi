'use client';

import { useTokenBalancesQuery } from './api/use-token-balances-query';

// Re-export constants for backward compatibility
export {
  TOKEN_REGIONS,
  TOKEN_USD_CONVERSION_RATES,
  TOKEN_ADDRESSES,
} from './api/use-token-balances-query';

export function useTokenBalances(selectedRegion?: string) {
  // Use the React Query hook with proper caching
  const {
    balances: formattedBalances,
    totalValue,
    isLoading,
    refreshBalances,
  } = useTokenBalancesQuery(selectedRegion);

  return {
    balances: formattedBalances,
    totalValue,
    isLoading,
    refreshBalances,
  };
}
