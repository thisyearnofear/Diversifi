'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { CELO_TOKENS } from '@/utils/mento-utils';

// Define token groups by region
export const TOKEN_REGIONS = {
  Africa: ['cKES'],
  Europe: ['EURA'],
  USA: ['USDbC', 'USDC', 'DAI'],
  LatAm: ['cCOP', 'BRZ'],
  Asia: ['PUSO'],
  RWA: [],
};

// Define conversion rates to USD for non-USD stablecoins
export const TOKEN_USD_CONVERSION_RATES = {
  cKES: 0.0078, // 1 KES ≈ 0.0078 USD
  EURA: 1.08, // 1 EUR ≈ 1.08 USD
  cCOP: 0.00025, // 1 COP ≈ 0.00025 USD
  BRZ: 0.2, // 1 BRZ ≈ 0.20 USD
  PUSO: 0.0179, // 1 PHP ≈ 0.0179 USD
  // Other tokens (USDbC, USDC, DAI) are already in USD
};

// Define token addresses by chain
export const TOKEN_ADDRESSES = {
  // Celo tokens
  cKES: { address: CELO_TOKENS.CKES, chain: 'celo', decimals: 18 },
  cCOP: { address: CELO_TOKENS.CCOP, chain: 'celo', decimals: 18 },
  PUSO: { address: CELO_TOKENS.PUSO, chain: 'celo', decimals: 18 },

  // Base tokens
  USDbC: {
    address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
    chain: 'base',
    decimals: 18,
  },

  // Optimism tokens
  EURA: {
    address: '0x9485aca5bbBE1667AD97c7fE7C4531a624C8b1ED',
    chain: 'optimism',
    decimals: 18,
  },

  // Polygon tokens
  DAI: {
    address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    chain: 'polygon',
    decimals: 18,
  },

  // Other tokens
  USDC: {
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    chain: 'base',
    decimals: 6,
  },
  BRZ: {
    address: '0x491a4eb4f1fc3bff8e1d2fc856a6a46663ad556f',
    chain: 'polygon',
    decimals: 18,
  },
};

// RPC URLs for different chains
const RPC_URLS = {
  celo: 'https://forno.celo.org',
  base: 'https://mainnet.base.org',
  optimism: 'https://mainnet.optimism.io',
  polygon: 'https://polygon-rpc.com',
};

// ERC20 ABI for balance checking
const ERC20_BALANCE_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
];

// Token balance type
export interface TokenBalance {
  amount: string;
  value: number;
  loading: boolean;
  error: string | null;
}

// Fetch balance for a specific token
const fetchTokenBalance = async (
  token: string,
  address: string,
): Promise<string> => {
  if (!address) {
    throw new Error('No wallet address provided');
  }

  // Get token info
  const tokenInfo = TOKEN_ADDRESSES[token as keyof typeof TOKEN_ADDRESSES];
  if (!tokenInfo) {
    throw new Error(`No token info found for ${token}`);
  }

  // Create provider for the token's chain
  const provider = new ethers.providers.JsonRpcProvider(
    RPC_URLS[tokenInfo.chain as keyof typeof RPC_URLS],
  );

  // Create contract instance
  const tokenAddress = tokenInfo.address.toLowerCase();
  const contract = new ethers.Contract(
    tokenAddress,
    ERC20_BALANCE_ABI,
    provider,
  );

  // Get balance
  const balance = await contract.balanceOf(address);

  return balance.toString();
};

// Format token balance
const formatTokenBalance = (balance: string, token: string): TokenBalance => {
  const tokenInfo = TOKEN_ADDRESSES[token as keyof typeof TOKEN_ADDRESSES];

  if (!tokenInfo) {
    return {
      amount: '0.0',
      value: 0,
      loading: false,
      error: 'Token info not found',
    };
  }

  // Format balance
  let amount = '0.0';
  try {
    if (balance) {
      amount = ethers.utils.formatUnits(balance, tokenInfo.decimals);
    }
  } catch (error) {
    console.error(`Error formatting balance for ${token}:`, error);
  }

  // Calculate USD value based on token type
  let value = Number.parseFloat(amount);

  // Apply conversion rates for non-USD stablecoins
  const conversionRate =
    TOKEN_USD_CONVERSION_RATES[
      token as keyof typeof TOKEN_USD_CONVERSION_RATES
    ];
  if (conversionRate) {
    value = value * conversionRate;
  }

  return {
    amount,
    value,
    loading: false,
    error: null,
  };
};

// Get tokens for the selected region or all tokens if no region is selected
const getTokensForRegion = (selectedRegion?: string): string[] => {
  if (!selectedRegion || selectedRegion === 'All') {
    // Return all tokens if no region is selected or "All" is selected
    return Object.keys(TOKEN_ADDRESSES);
  }

  return TOKEN_REGIONS[selectedRegion as keyof typeof TOKEN_REGIONS] || [];
};

// Hook for fetching token balances with React Query
export function useTokenBalancesQuery(selectedRegion?: string) {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  // Get tokens for the selected region
  const tokens = getTokensForRegion(selectedRegion);

  // Query for fetching all token balances
  const query = useQuery({
    queryKey: ['tokenBalances', address, selectedRegion],
    queryFn: async () => {
      if (!address) return {};

      // Create a map to store formatted balances
      const formattedBalances: Record<string, TokenBalance> = {};

      // Fetch balances for all tokens in parallel with timeout
      const results = await Promise.allSettled(
        tokens.map(async (token) => {
          try {
            // Create a promise that rejects after 10 seconds
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(
                () =>
                  reject(new Error(`Timeout fetching balance for ${token}`)),
                10000,
              );
            });

            // Race the fetch against the timeout
            const balance = (await Promise.race([
              fetchTokenBalance(token, address),
              timeoutPromise,
            ])) as string;

            // Format the balance
            formattedBalances[token] = formatTokenBalance(balance, token);

            return { token, balance };
          } catch (error) {
            console.warn(`Error fetching balance for ${token}:`, error);

            formattedBalances[token] = {
              amount: '0.0',
              value: 0,
              loading: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to fetch balance',
            };

            return { token, error };
          }
        }),
      );

      return formattedBalances;
    },
    enabled: !!address && tokens.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Calculate total value
  const totalValue = Object.values(query.data || {}).reduce(
    (total, balance) => total + balance.value,
    0,
  );

  // Function to refresh balances
  const refreshBalances = () => {
    return queryClient.invalidateQueries({
      queryKey: ['tokenBalances', address, selectedRegion],
    });
  };

  return {
    balances: query.data || {},
    totalValue,
    isLoading: query.isLoading || query.isFetching,
    error: query.error,
    refreshBalances,
  };
}
