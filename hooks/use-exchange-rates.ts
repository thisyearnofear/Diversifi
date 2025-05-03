import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useTokenPrice } from './use-token-price';
import { useForexRate } from './use-forex-rate';
import { ADDRESSES, ABIS, CACHE_KEYS } from '../constants/celo-tokens';
import { useCache } from '../utils/celo-utils';

export function useExchangeRates() {
  const [exchangeRate, setExchangeRate] = useState<number>(40.06); // Default exchange rate

  // Get token prices from CoinGecko
  const { prices } = useTokenPrice(['CELO', 'cKES', 'cUSD']);

  // Get forex rates
  const { rates } = useForexRate('USD', ['KES']);

  // Cache for exchange rate
  const { getItem: getCachedRate, setItem: setCachedRate } = useCache(
    CACHE_KEYS.EXCHANGE_RATE,
    60 * 60 * 1000, // 1 hour
  );

  // Calculate the exchange rate using API data
  const calculateExchangeRate = () => {
    // Method 1: Direct cUSD/cKES rate if available from CoinGecko
    if (prices?.cUSD?.usd && prices?.cKES?.usd) {
      const directRate = prices.cKES.usd / prices.cUSD.usd;
      console.log(
        'Calculated exchange rate from direct token prices:',
        directRate,
      );
      return directRate;
    }

    // Method 2: Calculate using USD/KES forex rate
    if (prices?.cUSD?.usd && rates && rates['USD/KES']) {
      const usdKesRate = rates['USD/KES'];
      const calculatedRate = usdKesRate; // 1 cUSD ≈ 1 USD
      console.log(
        'Calculated exchange rate from cUSD/USD and USD/KES:',
        calculatedRate,
      );
      return calculatedRate;
    }

    // Fallback to default rate
    return 40.06;
  };

  // Fetch exchange rate from Mento SDK
  const fetchExchangeRate = async () => {
    try {
      // First check if we have a cached rate
      const cachedRate = getCachedRate();
      if (cachedRate !== null) {
        setExchangeRate(cachedRate);
        return cachedRate;
      }

      // Create a read-only provider for Celo mainnet
      const provider = new ethers.providers.JsonRpcProvider(
        'https://forno.celo.org',
      );

      // Get the broker address
      const brokerAddress = ADDRESSES.BROKER;

      // Get the cKES and cUSD addresses
      const ckesAddr = ADDRESSES.CKES;
      const cUSDAddr = ADDRESSES.CUSD;

      // Get the list of exchange providers from the broker
      const brokerProvidersContract = new ethers.Contract(
        brokerAddress,
        ABIS.BROKER_PROVIDERS,
        provider,
      );
      const exchangeProviders =
        await brokerProvidersContract.getExchangeProviders();

      // For each provider, get the exchanges and find the one for cUSD/cKES
      let exchangeProvider = '';
      let exchangeId = '';

      // Loop through each provider to find the cUSD/cKES exchange
      for (const providerAddress of exchangeProviders) {
        const exchangeContract = new ethers.Contract(
          providerAddress,
          ABIS.EXCHANGE,
          provider,
        );
        const exchanges = await exchangeContract.getExchanges();

        // Check each exchange to see if it includes cUSD and cKES
        for (const exchange of exchanges) {
          const assets = exchange.assets.map((a: string) => a.toLowerCase());

          if (
            assets.includes(cUSDAddr.toLowerCase()) &&
            assets.includes(ckesAddr.toLowerCase())
          ) {
            exchangeProvider = providerAddress;
            exchangeId = exchange.exchangeId;
            break;
          }
        }

        if (exchangeProvider && exchangeId) break;
      }

      if (!exchangeProvider || !exchangeId) {
        throw new Error('Could not find exchange provider or ID for cUSD/cKES');
      }

      // Create a contract instance for the Broker
      const brokerContract = new ethers.Contract(
        brokerAddress,
        ABIS.BROKER_RATE,
        provider,
      );

      // Get the quote for 1 cUSD to cKES
      const oneEther = ethers.utils.parseUnits('1.0', 18);
      const quoteAmountOut = await brokerContract.getAmountOut(
        exchangeProvider,
        exchangeId,
        cUSDAddr,
        ckesAddr,
        oneEther.toString(),
      );

      // Convert the quote to a human-readable number
      const rate = Number.parseFloat(ethers.utils.formatUnits(quoteAmountOut, 18));
      console.log('Fetched exchange rate from Mento SDK:', rate);

      // Update the exchange rate state and cache it
      setExchangeRate(rate);
      setCachedRate(rate);
      return rate;
    } catch (sdkError) {
      console.warn(
        'Error fetching rate from Mento SDK, falling back to API data:',
        sdkError,
      );

      // If Mento SDK call fails, try to calculate the rate from API data
      const calculatedRate = calculateExchangeRate();
      if (calculatedRate !== 40.06) {
        setExchangeRate(calculatedRate);
        setCachedRate(calculatedRate);
        return calculatedRate;
      }

      // If all else fails, return the current exchange rate
      return exchangeRate;
    }
  };

  // Update exchange rate when prices or rates change
  useEffect(() => {
    // First try to get from cache
    const cachedRate = getCachedRate();
    if (cachedRate !== null) {
      setExchangeRate(cachedRate);
      return;
    }

    // If not in cache, calculate it
    const newRate = calculateExchangeRate();
    if (newRate !== exchangeRate) {
      setExchangeRate(newRate);
      // Cache the new rate
      setCachedRate(newRate);
    }
  }, [prices, rates]);

  return {
    exchangeRate,
    fetchExchangeRate,
  };
}
