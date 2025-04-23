"use client";

import { useState, useEffect } from "react";
import Moralis from "moralis";

// Define the token IDs for CoinGecko API
const TOKEN_IDS = {
  ETH: "ethereum",
  USDC: "usd-coin",
  USDbC: "usd-coin", // Using USDC as a proxy for USDbC since they're pegged 1:1
  CELO: "celo",
  cKES: "celo-kenyan-shilling",
  cCOP: "celo-colombian-peso", // May not exist in CoinGecko, but we'll try
};

// Define the token addresses for Moralis API (Optimism)
const OPTIMISM_TOKEN_ADDRESSES = {
  ETH: "0x4200000000000000000000000000000000000006", // WETH on Optimism
  USDC: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", // USDC on Optimism
  EURA: "0x9485aca5bbBE1667AD97c7fE7C4531a624C8b1ED", // EURA on Optimism
};

// Define the token addresses for Moralis API (Base)
const BASE_TOKEN_ADDRESSES = {
  ETH: "0x4200000000000000000000000000000000000006", // WETH on Base
  USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
  USDbC: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA", // USDbC on Base
};

// Define the supported currencies
export type SupportedCurrency = "usd";

// Define the token price data structure
export type TokenPriceData = {
  [tokenId: string]: {
    [currency: string]: number;
  };
};

// Initialize Moralis once
let moralisInitialized = false;
const initMoralis = async () => {
  if (moralisInitialized) return;

  try {
    const apiKey = process.env.NEXT_PUBLIC_MORALIS_API_KEY || process.env.MORALIS_API_KEY;
    if (!apiKey) {
      console.warn("Moralis API key not found");
      return false;
    }

    await Moralis.start({
      apiKey,
    });

    moralisInitialized = true;
    return true;
  } catch (error) {
    console.error("Failed to initialize Moralis:", error);
    return false;
  }
};

/**
 * Custom hook to fetch token prices from CoinGecko API with Moralis fallback
 * @param tokens Array of token IDs to fetch prices for
 * @param currency Currency to fetch prices in (default: "usd")
 * @param chainId Chain ID to use for Moralis fallback (default: "0xa" for Optimism)
 * @returns Object containing token prices, loading state, and error
 */
export function useTokenPrice(
  tokens: string[] = ["ETH", "USDC"],
  currency: SupportedCurrency = "usd",
  chainId: string = "0xa" // Default to Optimism (0xa)
) {
  const [prices, setPrices] = useState<TokenPriceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"fallback" | "coingecko" | "moralis">("fallback");

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Set fallback prices immediately so we have something to work with
        const fallbackPrices: TokenPriceData = {
          ETH: { usd: 3500 },
          USDC: { usd: 1 },
          USDbC: { usd: 1 },
          EURA: { usd: 1.08 },
          CELO: { usd: 0.29 },
          cKES: { usd: 0.0072 }, // Approx. 1 KES = 0.0072 USD (1 USD ≈ 140 KES)
          cCOP: { usd: 0.00025 }, // Approx. 1 COP = 0.00025 USD (1 USD ≈ 4000 COP)
        };
        setPrices(fallbackPrices);
        setSource("fallback");

        // Try to fetch prices from CoinGecko API first
        let success = await fetchFromCoinGecko();

        // If CoinGecko fails, try Moralis as a fallback
        if (!success) {
          success = await fetchFromMoralis();
        }

        // If both fail, we'll use the fallback prices set above
        if (!success) {
          console.warn("Using fallback prices as both CoinGecko and Moralis failed");
        }
      } catch (err) {
        console.error("Error in token price hook:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch token prices");
        // Fallback prices already set above
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch from CoinGecko API
    const fetchFromCoinGecko = async (): Promise<boolean> => {
      try {
        // Map tokens to CoinGecko IDs
        const tokenIds = tokens
          .map((token) => TOKEN_IDS[token as keyof typeof TOKEN_IDS])
          .filter(Boolean)
          .join(",");

        if (!tokenIds) {
          console.warn("No valid token IDs provided for CoinGecko");
          return false;
        }

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
          return false;
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
          setSource("coingecko");
          return true;
        }

        return false;
      } catch (apiError) {
        console.warn("Failed to fetch from CoinGecko API", apiError);
        return false;
      }
    };

    // Fetch from Moralis API
    const fetchFromMoralis = async (): Promise<boolean> => {
      try {
        // Initialize Moralis if not already initialized
        const initialized = await initMoralis();
        if (!initialized) {
          console.warn("Moralis not initialized, skipping price fetch");
          return false;
        }

        // Get token addresses based on the chain ID
        const tokenAddresses = chainId === "0xa" ? OPTIMISM_TOKEN_ADDRESSES : BASE_TOKEN_ADDRESSES;

        // Create a new formatted prices object
        const formattedPrices: TokenPriceData = {};

        // Fetch prices for each token
        for (const token of tokens) {
          const tokenAddress = tokenAddresses[token as keyof typeof tokenAddresses];
          if (!tokenAddress) {
            console.warn(`No address found for ${token} on chain ${chainId}`);
            continue;
          }

          try {
            const response = await Moralis.EvmApi.token.getTokenPrice({
              chain: chainId,
              include: "percent_change",
              address: tokenAddress,
            });

            const data = response.raw;

            if (data && data.usdPrice) {
              formattedPrices[token] = {
                [currency]: data.usdPrice,
              };
            }
          } catch (tokenError) {
            console.warn(`Failed to fetch price for ${token} from Moralis:`, tokenError);
          }
        }

        // Only update if we got valid data
        if (Object.keys(formattedPrices).length > 0) {
          setPrices(formattedPrices);
          setSource("moralis");
          return true;
        }

        return false;
      } catch (apiError) {
        console.warn("Failed to fetch from Moralis API", apiError);
        return false;
      }
    };

    fetchPrices();

    // Refresh prices every 60 seconds
    const intervalId = setInterval(fetchPrices, 60000);

    return () => clearInterval(intervalId);
  }, [tokens.join(","), currency, chainId]);

  return { prices, isLoading, error, source };
}
