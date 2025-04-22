"use client";

import { useState, useEffect } from "react";

export type ForexRateData = {
  [currencyPair: string]: number;
};

/**
 * Custom hook to fetch forex exchange rates
 * @param baseCurrency Base currency (default: "USD")
 * @param targetCurrencies Array of target currencies to fetch rates for
 * @returns Object containing exchange rates, loading state, and error
 */
export function useForexRate(
  baseCurrency: string = "USD",
  targetCurrencies: string[] = ["KES"]
) {
  const [rates, setRates] = useState<ForexRateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Set fallback rates immediately so we have something to work with
        const fallbackRates: ForexRateData = {
          "USD/KES": 140, // Approximate USD to KES rate
        };
        setRates(fallbackRates);

        // Try to fetch rates from exchangerate.host API
        await fetchFromExchangeRateAPI();
      } catch (err) {
        console.error("Error in forex rate hook:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch forex rates");
        // Fallback rates already set above
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch from exchangerate.host API
    const fetchFromExchangeRateAPI = async (): Promise<boolean> => {
      try {
        const symbols = targetCurrencies.join(",");
        const url = `https://api.exchangerate.host/latest?base=${baseCurrency}&symbols=${symbols}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

        const response = await fetch(url, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          console.warn(`Exchange Rate API returned ${response.status}: ${response.statusText}`);
          return false;
        }

        const data = await response.json();

        if (data && data.rates) {
          // Transform the data to our format
          const formattedRates: ForexRateData = {};

          // Format the rates as currency pairs
          Object.entries(data.rates).forEach(([currency, rate]) => {
            formattedRates[`${baseCurrency}/${currency}`] = rate as number;
          });

          // Only update if we got valid data
          if (Object.keys(formattedRates).length > 0) {
            setRates(formattedRates);
            return true;
          }
        }

        return false;
      } catch (apiError) {
        console.warn("Failed to fetch from Exchange Rate API", apiError);
        return false;
      }
    };

    fetchRates();

    // Refresh rates every 60 minutes (forex rates don't change as frequently as crypto prices)
    const intervalId = setInterval(fetchRates, 60 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [baseCurrency, targetCurrencies.join(",")]);

  return { rates, isLoading, error };
}
