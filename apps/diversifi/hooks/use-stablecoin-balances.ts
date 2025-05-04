import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CELO_TOKENS, MENTO_ABIS } from '../utils/mento-utils';

interface StablecoinBalance {
  symbol: string;
  name: string;
  balance: string;
  formattedBalance: string;
  value: number;
  region: string;
}

// Token metadata mapping
const TOKEN_METADATA: Record<string, { name: string; region: string }> = {
  // Standard format
  CUSD: { name: 'Celo Dollar', region: 'USA' },
  CEUR: { name: 'Celo Euro', region: 'Europe' },
  CREAL: { name: 'Celo Brazilian Real', region: 'LatAm' },
  CKES: { name: 'Celo Kenyan Shilling', region: 'Africa' },
  CCOP: { name: 'Celo Colombian Peso', region: 'LatAm' },
  PUSO: { name: 'Philippine Peso', region: 'Asia' },
  CGHS: { name: 'Celo Ghana Cedi', region: 'Africa' },
  EXOF: { name: 'CFA Franc', region: 'Africa' },

  // Add lowercase versions to handle case sensitivity issues
  cusd: { name: 'Celo Dollar', region: 'USA' },
  ceur: { name: 'Celo Euro', region: 'Europe' },
  creal: { name: 'Celo Brazilian Real', region: 'LatAm' },
  ckes: { name: 'Celo Kenyan Shilling', region: 'Africa' },
  ccop: { name: 'Celo Colombian Peso', region: 'LatAm' },
  puso: { name: 'Philippine Peso', region: 'Asia' },
  cghs: { name: 'Celo Ghana Cedi', region: 'Africa' },
  exof: { name: 'CFA Franc', region: 'Africa' },
};

// Exchange rates to USD (simplified for demo)
const EXCHANGE_RATES: Record<string, number> = {
  // Standard format
  CUSD: 1,
  CEUR: 1.08,
  CREAL: 0.2,
  CKES: 0.0078,
  CCOP: 0.00025,
  PUSO: 0.0179,
  CGHS: 0.069,
  EXOF: 0.0016,

  // Lowercase versions
  cusd: 1,
  ceur: 1.08,
  creal: 0.2,
  ckes: 0.0078,
  ccop: 0.00025,
  puso: 0.0179,
  cghs: 0.069,
  exof: 0.0016,
};

function getCachedBalances(address: string): Record<string, StablecoinBalance> | null {
  try {
    const cacheKey = `stablecoin-balances-${address}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      // Check if cache is still valid (5 minutes)
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return data;
      }
    }

    return null;
  } catch (e) {
    console.warn('Error reading from cache:', e);
    return null;
  }
}

function setCachedBalances(address: string, balances: Record<string, StablecoinBalance>) {
  try {
    const cacheKey = `stablecoin-balances-${address}`;
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        data: balances,
        timestamp: Date.now(),
      })
    );
  } catch (e) {
    console.warn('Error writing to cache:', e);
  }
}

export function useStablecoinBalances(address: string | undefined | null) {
  const [balances, setBalances] = useState<Record<string, StablecoinBalance>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regionTotals, setRegionTotals] = useState<Record<string, number>>({});
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    if (!address) {
      setIsLoading(false);
      return;
    }

    const fetchBalances = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check cache first
        const cachedBalances = getCachedBalances(address);
        if (cachedBalances) {
          setBalances(cachedBalances);
          calculateTotals(cachedBalances);
          setIsLoading(false);
          return;
        }

        // For demo/testing purposes, use mock data if we're not on Celo network
        // This prevents unnecessary API calls that might fail
        if (typeof window !== 'undefined' && window.ethereum) {
          try {
            const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
            const chainId = Number.parseInt(chainIdHex as string, 16);

            // If not on Celo (42220) or Alfajores (44787), use mock data
            if (chainId !== 42220 && chainId !== 44787) {
              console.log('Not on Celo network, using mock data');

              // Create mock balances
              const mockBalances: Record<string, StablecoinBalance> = {
                CUSD: {
                  symbol: 'CUSD',
                  name: 'Celo Dollar',
                  balance: '100000000000000000000',
                  formattedBalance: '100',
                  value: 100,
                  region: 'USA'
                },
                CEUR: {
                  symbol: 'CEUR',
                  name: 'Celo Euro',
                  balance: '80000000000000000000',
                  formattedBalance: '80',
                  value: 86.4,
                  region: 'Europe'
                },
                CKES: {
                  symbol: 'CKES',
                  name: 'Celo Kenyan Shilling',
                  balance: '5000000000000000000000',
                  formattedBalance: '5000',
                  value: 39,
                  region: 'Africa'
                }
              };

              setBalances(mockBalances);
              calculateTotals(mockBalances);
              setIsLoading(false);
              return;
            }
          } catch (err) {
            console.warn('Error checking chain ID, proceeding with API calls:', err);
          }
        }

        // Create provider for Celo
        const provider = new ethers.providers.JsonRpcProvider(
          'https://forno.celo.org'
        );

        // Only fetch balances for tokens we care about (limit API calls)
        const tokensToFetch = ['CUSD', 'CEUR', 'CKES', 'CCOP', 'PUSO'];

        // Fetch balances for each token
        const tokenPromises = tokensToFetch.map(
          async (symbol) => {
            try {
              // Use type assertion to handle the index signature
              const tokenAddress = CELO_TOKENS[symbol as keyof typeof CELO_TOKENS] ||
                                  CELO_TOKENS[symbol.toUpperCase() as keyof typeof CELO_TOKENS];
              if (!tokenAddress) {
                console.warn(`Token address not found for ${symbol}`);
                return null;
              }

              const contract = new ethers.Contract(
                tokenAddress,
                MENTO_ABIS.ERC20_BALANCE,
                provider
              );

              const balance = await contract.balanceOf(address);
              const formattedBalance = ethers.utils.formatUnits(balance, 18);

              // Calculate USD value
              const exchangeRate = EXCHANGE_RATES[symbol] ||
                                  EXCHANGE_RATES[symbol.toUpperCase()] ||
                                  EXCHANGE_RATES[symbol.toLowerCase()] || 1;
              const value = Number.parseFloat(formattedBalance) * exchangeRate;

              // Get token metadata - try both original case and uppercase
              const metadata = TOKEN_METADATA[symbol] ||
                               TOKEN_METADATA[symbol.toUpperCase()] ||
                               TOKEN_METADATA[symbol.toLowerCase()] ||
                               { name: symbol, region: 'USA' }; // Default to USA instead of Unknown

              return {
                symbol,
                name: metadata.name,
                balance: balance.toString(),
                formattedBalance,
                value,
                region: metadata.region,
              };
            } catch (err) {
              console.warn(`Error fetching balance for ${symbol}:`, err);
              return null;
            }
          }
        );

        const results = await Promise.all(tokenPromises);
        const validResults = results.filter(Boolean) as StablecoinBalance[];

        // Convert to record
        const balanceMap: Record<string, StablecoinBalance> = {};
        for (const balance of validResults) {
          balanceMap[balance.symbol] = balance;
        }

        setBalances(balanceMap);
        calculateTotals(balanceMap);

        // Cache the results
        setCachedBalances(address, balanceMap);

        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching balances:', err);
        setError('Failed to fetch balances');
        setIsLoading(false);
      }
    };

    const calculateTotals = (balanceMap: Record<string, StablecoinBalance>) => {
      // Calculate region totals
      const regions: Record<string, number> = {};
      let total = 0;

      for (const balance of Object.values(balanceMap)) {
        const { region, value } = balance;
        regions[region] = (regions[region] || 0) + value;
        total += value;
      }

      // Convert to percentages
      const percentages: Record<string, number> = {};
      for (const [region, value] of Object.entries(regions)) {
        percentages[region] = total > 0 ? value / total : 0;
      }

      setRegionTotals(percentages);
      setTotalValue(total);
    };

    fetchBalances();
  }, [address]);

  const refreshBalances = () => {
    if (address) {
      // Clear cache for this address
      localStorage.removeItem(`stablecoin-balances-${address}`);
      // Refetch
      setIsLoading(true);
      setError(null);
    }
  };

  return {
    balances,
    isLoading,
    error,
    regionTotals,
    totalValue,
    refreshBalances
  };
}
