import { useState, useEffect } from 'react';
import type { Region } from './use-user-region';

interface CurrencyPerformance {
  symbol: string;
  name: string;
  region: Region;
  values: number[];
  percentChange: number;
}

interface PerformanceData {
  dates: string[];
  currencies: CurrencyPerformance[];
  baseCurrency: string;
  source: 'api' | 'cache' | 'fallback';
}

// Currency metadata
const CURRENCY_METADATA: Record<string, { name: string; region: Region }> = {
  'USD': { name: 'US Dollar', region: 'USA' },
  'EUR': { name: 'Euro', region: 'Europe' },
  'KES': { name: 'Kenyan Shilling', region: 'Africa' },
  'COP': { name: 'Colombian Peso', region: 'LatAm' },
  'PHP': { name: 'Philippine Peso', region: 'Asia' },
  'GHS': { name: 'Ghanaian Cedi', region: 'Africa' },
  'BRL': { name: 'Brazilian Real', region: 'LatAm' }
};

// Currencies to track (in addition to base currency)
const TRACKED_CURRENCIES = ['EUR', 'KES', 'COP', 'PHP', 'BRL'];

export function useCurrencyPerformance(baseCurrency = 'USD') {
  const [data, setData] = useState<PerformanceData>({
    dates: [],
    currencies: [],
    baseCurrency,
    source: 'fallback'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrencyPerformance = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Prepare currencies to fetch (base currency + tracked currencies)
        const currenciesToFetch = [baseCurrency, ...TRACKED_CURRENCIES.filter(c => c !== baseCurrency)];

        // Prepare data structure for currencies
        const currencyData: CurrencyPerformance[] = currenciesToFetch.map(symbol => ({
          symbol,
          name: CURRENCY_METADATA[symbol]?.name || symbol,
          region: CURRENCY_METADATA[symbol]?.region || 'USA',
          values: [],
          percentChange: 0
        }));

        // In the main app, we'll just use fallback data
        const fallbackData = generateFallbackData(baseCurrency, currencyData);
        setData(fallbackData);
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error fetching currency performance:', err);
        setError(err.message || 'Failed to fetch currency performance data');

        // Use fallback data
        const fallbackData = generateFallbackData(baseCurrency,
          TRACKED_CURRENCIES.map(symbol => ({
            symbol,
            name: CURRENCY_METADATA[symbol]?.name || symbol,
            region: CURRENCY_METADATA[symbol]?.region || 'USA',
            values: [],
            percentChange: 0
          }))
        );
        setData(fallbackData);
        setIsLoading(false);
      }
    };

    fetchCurrencyPerformance();
  }, [baseCurrency]);

  // Generate fallback data when API fails
  const generateFallbackData = (
    baseCurrency: string,
    currencyData: CurrencyPerformance[]
  ): PerformanceData => {
    // Generate dates for the last 30 days
    const today = new Date();
    const dates: string[] = [];

    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    // Base values (approximately realistic as of 2023)
    const baseValues: Record<string, number> = {
      'USD': 1,
      'EUR': 0.92,
      'KES': 130,
      'COP': 4000,
      'PHP': 56,
      'GHS': 12.5,
      'BRL': 5.2
    };

    // Annual trends (% change, positive means currency is weakening against USD)
    const trends: Record<string, number> = {
      'USD': 0,
      'EUR': -2,
      'KES': 5,
      'COP': 3,
      'PHP': 2,
      'GHS': 8,
      'BRL': 4
    };

    // Volatility (daily % standard deviation)
    const volatility: Record<string, number> = {
      'USD': 0,
      'EUR': 0.3,
      'KES': 0.5,
      'COP': 0.6,
      'PHP': 0.4,
      'GHS': 0.7,
      'BRL': 0.6
    };

    // Generate values for each currency
    currencyData.forEach(currency => {
      const values: number[] = [];

      // Base currency is always 1.0
      if (currency.symbol === baseCurrency) {
        values.push(...dates.map(() => 1));
        currency.values = values;
        currency.percentChange = 0;
        return;
      }

      // For other currencies, generate realistic values
      const baseValue = baseValues[currency.symbol] || 1;
      const annualTrend = trends[currency.symbol] || 0;
      const dailyVolatility = volatility[currency.symbol] || 0.3;

      // Calculate daily trend factor (compounded)
      const dailyTrendFactor = Math.pow(1 + annualTrend / 100, 1/365);

      for (let i = 0; i < dates.length; i++) {
        // Apply trend and random volatility
        const daysFactor = Math.pow(dailyTrendFactor, i);
        const randomFactor = 1 + (Math.random() * 2 - 1) * dailyVolatility / 100;

        // Calculate exchange rate
        const exchangeRate = baseValue * daysFactor * randomFactor;

        // Convert to "value of 1 base currency worth of this currency over time"
        values.push(1 / exchangeRate);
      }

      // Calculate percent change (last 30 days)
      const percentChange = ((values[values.length - 1] - values[0]) / values[0]) * 100;

      currency.values = values;
      currency.percentChange = percentChange;
    });

    return {
      dates,
      currencies: currencyData,
      baseCurrency,
      source: 'fallback'
    };
  };

  // Calculate the value of $1 invested in each currency over time
  const calculateDollarPerformance = () => {
    if (!data.currencies.length) return [];

    return data.currencies.map(currency => {
      // Start with $1 worth of each currency
      const initialValue = 1;

      // Calculate the current value based on exchange rate changes
      const currentValue = initialValue * (1 + currency.percentChange / 100);

      return {
        symbol: currency.symbol,
        name: currency.name,
        region: currency.region,
        initialValue,
        currentValue,
        percentChange: currency.percentChange,
        source: data.source
      };
    });
  };

  return {
    data,
    isLoading,
    error,
    calculateDollarPerformance
  };
}
