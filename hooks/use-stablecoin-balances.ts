import { useState, useEffect } from 'react';

interface StablecoinBalance {
  symbol: string;
  name: string;
  balance: string;
  formattedBalance: string;
  value: number;
  region: string;
}

// Token metadata
const TOKEN_METADATA: Record<string, { name: string; region: string }> = {
  'CUSD': { name: 'Celo Dollar', region: 'USA' },
  'CEUR': { name: 'Celo Euro', region: 'Europe' },
  'CREAL': { name: 'Celo Real', region: 'LatAm' },
  'CKES': { name: 'Celo Kenyan Shilling', region: 'Africa' },
  'CCOP': { name: 'Celo Colombian Peso', region: 'LatAm' },
  'PUSO': { name: 'Philippine Peso', region: 'Asia' },
  'CGHS': { name: 'Celo Ghana Cedi', region: 'Africa' },
  'EXOF': { name: 'CFA Franc', region: 'Africa' },
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

        // In the main app, we'll just use mock data
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
        
        // Cache the results
        setCachedBalances(address, mockBalances);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching balances:', err);
        setError('Failed to fetch balances');
        setIsLoading(false);
      }
    };

    fetchBalances();
  }, [address]);

  // Calculate region totals and total value
  const calculateTotals = (balances: Record<string, StablecoinBalance>) => {
    const regions: Record<string, number> = {};
    let total = 0;

    Object.values(balances).forEach((balance) => {
      const { region, value } = balance;
      regions[region] = (regions[region] || 0) + value;
      total += value;
    });

    setRegionTotals(regions);
    setTotalValue(total);
  };

  // Cache helpers
  const getCachedBalances = (address: string): Record<string, StablecoinBalance> | null => {
    try {
      const cached = localStorage.getItem(`stablecoin-balances-${address}`);
      if (!cached) return null;

      const { balances, timestamp } = JSON.parse(cached);
      // Cache valid for 5 minutes
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return balances;
      }
      return null;
    } catch (err) {
      console.warn('Error reading from cache:', err);
      return null;
    }
  };

  const setCachedBalances = (address: string, balances: Record<string, StablecoinBalance>) => {
    try {
      localStorage.setItem(
        `stablecoin-balances-${address}`,
        JSON.stringify({
          balances,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      console.warn('Error writing to cache:', err);
    }
  };

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
