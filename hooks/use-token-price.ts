"use client";

import { useState, useEffect } from "react";

// Define the token IDs for CoinGecko API
const TOKEN_IDS = {
  ETH: "ethereum",
  USDC: "usd-coin",
  USDbC: "usd-coin", // Using USDC as a proxy for USDbC since they're pegged 1:1
};

// Define the supported currencies
export type SupportedCurrency = "usd";

// Define the token price data structure
export type TokenPriceData = {
  [tokenId: string]: {
    [currency: string]: number;
  };
};

/**
 * Custom hook to fetch token prices from CoinGecko API
 * @param tokens Array of token IDs to fetch prices for
 * @param currency Currency to fetch prices in (default: "usd")
 * @returns Object containing token prices, loading state, and error
 */
export function useTokenPrice(
  tokens: string[] = ["ETH", "USDC"],
  currency: SupportedCurrency = "usd"
) {
  const [prices, setPrices] = useState<TokenPriceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Set fallback prices immediately so we have something to work with
        const fallbackPrices: TokenPriceData = {
          ETH: { usd: 3500 },
          USDC: { usd: 1 },
        };
        setPrices(fallbackPrices);

        // Map tokens to CoinGecko IDs
        const tokenIds = tokens
          .map((token) => TOKEN_IDS[token as keyof typeof TOKEN_IDS])
          .filter(Boolean)
          .join(",");

        if (!tokenIds) {
          throw new Error("No valid token IDs provided");
        }

        // Try to fetch prices from CoinGecko API, but don't block on it
        try {
          const apiKey = process.env.NEXT_PUBLIC_COINGECKO_API_KEY || process.env.COINGECKO_API_KEY;
          const url = `https://api.coingecko.com/api/v3/simple/price?ids=${tokenIds}&vs_currencies=${currency}${apiKey ? `&x_cg_api_key=${apiKey}` : ''}`;

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

          const response = await fetch(url, {
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            console.warn(`CoinGecko API returned ${response.status}: ${response.statusText}`);
            return; // Just use fallback prices
          }

          const data = await response.json();

          // Transform the data to our format
          const formattedPrices: TokenPriceData = {};

          // Map CoinGecko IDs back to our token symbols
          Object.entries(TOKEN_IDS).forEach(([symbol, id]) => {
            if (data[id]) {
              formattedPrices[symbol] = {
                [currency]: data[id][currency],
              };
            }
          });

          // Only update if we got valid data
          if (Object.keys(formattedPrices).length > 0) {
            setPrices(formattedPrices);
          }
        } catch (apiError) {
          console.warn("Failed to fetch from CoinGecko API, using fallback prices", apiError);
          // We already set fallback prices, so just continue
        }
      } catch (err) {
        console.error("Error in token price hook:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch token prices");
        // Fallback prices already set above
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrices();

    // Refresh prices every 60 seconds
    const intervalId = setInterval(fetchPrices, 60000);

    return () => clearInterval(intervalId);
  }, [tokens.join(","), currency]);

  return { prices, isLoading, error };
}
