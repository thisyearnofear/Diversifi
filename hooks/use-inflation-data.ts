import { useState, useEffect } from 'react';

// Types
export interface InflationData {
  country: string;
  region: string;
  currency: string;
  rate: number;
  year: number;
  source: 'api' | 'cache' | 'fallback';
}

export interface RegionalInflationData {
  region: string;
  countries: InflationData[];
  avgRate: number;
  stablecoins: string[];
}

// Fallback inflation data (used when API fails or is unavailable)
const FALLBACK_INFLATION_DATA: Record<string, RegionalInflationData> = {
  Africa: {
    region: 'Africa',
    countries: [
      { country: 'Kenya', region: 'Africa', currency: 'KES', rate: 6.8, year: 2023, source: 'fallback' },
      { country: 'Ghana', region: 'Africa', currency: 'GHS', rate: 23.2, year: 2023, source: 'fallback' },
      { country: 'CFA Zone', region: 'Africa', currency: 'XOF', rate: 3.5, year: 2023, source: 'fallback' },
    ],
    avgRate: 11.2,
    stablecoins: ['cKES', 'cGHS', 'eXOF'],
  },
  LatAm: {
    region: 'LatAm',
    countries: [
      { country: 'Brazil', region: 'LatAm', currency: 'BRL', rate: 4.5, year: 2023, source: 'fallback' },
      { country: 'Colombia', region: 'LatAm', currency: 'COP', rate: 7.2, year: 2023, source: 'fallback' },
    ],
    avgRate: 5.9,
    stablecoins: ['cREAL', 'cCOP'],
  },
  Asia: {
    region: 'Asia',
    countries: [
      { country: 'Philippines', region: 'Asia', currency: 'PHP', rate: 3.9, year: 2023, source: 'fallback' },
    ],
    avgRate: 3.9,
    stablecoins: ['PUSO'],
  },
  Europe: {
    region: 'Europe',
    countries: [
      { country: 'Euro Zone', region: 'Europe', currency: 'EUR', rate: 2.4, year: 2023, source: 'fallback' },
    ],
    avgRate: 2.4,
    stablecoins: ['cEUR'],
  },
  USA: {
    region: 'USA',
    countries: [
      { country: 'United States', region: 'USA', currency: 'USD', rate: 3.1, year: 2023, source: 'fallback' },
    ],
    avgRate: 3.1,
    stablecoins: ['cUSD'],
  },
};

// Country to region mapping
const COUNTRY_TO_REGION: Record<string, string> = {
  // Africa
  'KEN': 'Africa', // Kenya
  'GHA': 'Africa', // Ghana
  'SEN': 'Africa', // Senegal (CFA)
  'CIV': 'Africa', // Ivory Coast (CFA)
  'NGA': 'Africa', // Nigeria
  'ZAF': 'Africa', // South Africa
  'TZA': 'Africa', // Tanzania
  'UGA': 'Africa', // Uganda
  'ETH': 'Africa', // Ethiopia
  'RWA': 'Africa', // Rwanda

  // Latin America
  'BRA': 'LatAm', // Brazil
  'COL': 'LatAm', // Colombia
  'MEX': 'LatAm', // Mexico
  'ARG': 'LatAm', // Argentina
  'CHL': 'LatAm', // Chile
  'PER': 'LatAm', // Peru
  'VEN': 'LatAm', // Venezuela
  'ECU': 'LatAm', // Ecuador
  'BOL': 'LatAm', // Bolivia
  'URY': 'LatAm', // Uruguay

  // Asia
  'PHL': 'Asia', // Philippines
  'IDN': 'Asia', // Indonesia
  'MYS': 'Asia', // Malaysia
  'THA': 'Asia', // Thailand
  'IND': 'Asia', // India
  'CHN': 'Asia', // China
  'JPN': 'Asia', // Japan
  'KOR': 'Asia', // South Korea
  'VNM': 'Asia', // Vietnam
  'SGP': 'Asia', // Singapore

  // Europe
  'DEU': 'Europe', // Germany (Euro)
  'FRA': 'Europe', // France (Euro)
  'ITA': 'Europe', // Italy (Euro)
  'ESP': 'Europe', // Spain (Euro)
  'GBR': 'Europe', // UK
  'NLD': 'Europe', // Netherlands
  'BEL': 'Europe', // Belgium
  'PRT': 'Europe', // Portugal
  'GRC': 'Europe', // Greece
  'CHE': 'Europe', // Switzerland

  // USA
  'USA': 'USA', // United States
  'CAN': 'USA', // Canada (grouped with USA for simplicity)
};

// Currency to country mapping
const CURRENCY_TO_COUNTRY: Record<string, string> = {
  'KES': 'KEN', // Kenyan Shilling
  'GHS': 'GHA', // Ghanaian Cedi
  'XOF': 'SEN', // CFA Franc
  'BRL': 'BRA', // Brazilian Real
  'COP': 'COL', // Colombian Peso
  'PHP': 'PHL', // Philippine Peso
  'EUR': 'DEU', // Euro (using Germany as representative)
  'USD': 'USA', // US Dollar
};

// Currency to stablecoin mapping
const CURRENCY_TO_STABLECOIN: Record<string, string> = {
  'KES': 'cKES',
  'GHS': 'cGHS',
  'XOF': 'eXOF',
  'BRL': 'cREAL',
  'COP': 'cCOP',
  'PHP': 'PUSO',
  'EUR': 'cEUR',
  'USD': 'cUSD',
};

export function useInflationData() {
  const [inflationData, setInflationData] = useState<Record<string, RegionalInflationData>>(FALLBACK_INFLATION_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'api' | 'cache' | 'fallback'>('fallback');

  useEffect(() => {
    // In the main app, we'll just use the fallback data
    setInflationData(FALLBACK_INFLATION_DATA);
    setDataSource('fallback');
    setIsLoading(false);
  }, []);

  // Get inflation rate for a specific currency
  const getInflationRateForCurrency = (currency: string): number => {
    const countryCode = CURRENCY_TO_COUNTRY[currency];
    if (!countryCode) return 0;

    const region = COUNTRY_TO_REGION[countryCode];
    if (!region || !inflationData[region]) return 0;

    const countryData = inflationData[region].countries.find(
      c => c.currency === currency
    );

    return countryData ? countryData.rate : inflationData[region].avgRate;
  };

  // Get inflation rate for a specific stablecoin
  const getInflationRateForStablecoin = (stablecoin: string): number => {
    // Find the currency that corresponds to this stablecoin
    const currency = Object.keys(CURRENCY_TO_STABLECOIN).find(
      key => CURRENCY_TO_STABLECOIN[key] === stablecoin
    );

    if (!currency) return 0;

    return getInflationRateForCurrency(currency);
  };

  // Get region for a specific stablecoin
  const getRegionForStablecoin = (stablecoin: string): string => {
    // Find the currency that corresponds to this stablecoin
    const currency = Object.keys(CURRENCY_TO_STABLECOIN).find(
      key => CURRENCY_TO_STABLECOIN[key] === stablecoin
    );

    if (!currency) return 'Unknown';

    const countryCode = CURRENCY_TO_COUNTRY[currency];
    if (!countryCode) return 'Unknown';

    return COUNTRY_TO_REGION[countryCode] || 'Unknown';
  };

  return {
    inflationData,
    isLoading,
    error,
    dataSource,
    getInflationRateForCurrency,
    getInflationRateForStablecoin,
    getRegionForStablecoin
  };
}
