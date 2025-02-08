import type { z } from "zod";
import {
  ActionProvider,
  CreateAction,
} from "@coinbase/agentkit";
import type { Network } from "./types";
import { searchBaseTokensSchema, getPortfoliosSchema } from "./schemas";
import { getTokens, getPortfolios, GetTokensResponse, GetPortfoliosResponse, APIError } from "@coinbase/onchainkit/api";
import { setOnchainKitConfig } from '@coinbase/onchainkit';

/**
 * OnchainKitActionProvider provides actions for interacting with Base tokens.
 */
export class OnchainKitActionProvider extends ActionProvider {
  /**
   * Constructor for the OnchainKitActionProvider.
   * @param apiKey - The API key for OnchainKit
   */
  constructor(apiKey: string) {
    super("onchainkit", []);
    setOnchainKitConfig({ apiKey });
  }

  /**
   * Gets tokens on Base by searching for name, symbol, or address.
   *
   * @param args - The search parameters.
   * @returns A message containing the found tokens.
   */
  @CreateAction({
    name: "search_base_tokens",
    description: `
    This tool will search for tokens on Base by name, symbol, or address.
    It takes the following inputs:
      - search: Search term for token (name, symbol, or address)
      - limit: (Optional) Maximum number of tokens to return
    `,
    schema: searchBaseTokensSchema,
  })
  async searchBaseTokens(
    args: z.infer<typeof searchBaseTokensSchema>
  ): Promise<GetTokensResponse> {
    try {
      const tokens = await getTokens({
        search: args.search,
        limit: args.limit || "5",
      });

      return tokens;
    } catch (error) {
      return {
        error: `Error searching for tokens: ${error}`,
        code: "error",
        message: `Error searching for tokens`,
      };
    }
  }

  /**
   * Gets portfolio information for specified wallet addresses.
   *
   * @param args - The addresses to get portfolios for.
   * @returns Portfolio information for the specified addresses.
   */
  @CreateAction({
    name: "get_portfolios",
    description: `
    This tool will get portfolio information for specified wallet addresses.
    It takes the following input:
      - addresses: Array of wallet addresses to get portfolios for
    
    Returns portfolio information including token holdings and fiat values.
    `,
    schema: getPortfoliosSchema,
  })
  async getPortfolios(
    args: z.infer<typeof getPortfoliosSchema>
  ): Promise<GetPortfoliosResponse | APIError> {
    try {
        console.log("getting portfolios",args.addresses)
        const portfolios = await getPortfolios({
            addresses: args.addresses.map((address) => address as `0x${string}`),
        });

      return portfolios;
    } catch (error) {
      return {
        error: `Error getting portfolios: ${error}`,
        code: "error",
        message: `Error getting portfolios`,
      };
    }
  }

  /**
   * Checks if the OnchainKit action provider supports the given network.
   *
   * @param network - The network to check.
   * @returns True if the network is Base, false otherwise.
   */
  supportsNetwork = (network: Network) => {
    // Base mainnet chainId is 8453
    console.log("checking",network.chainId)
    return String(network.chainId) === "8453";
  };
}

/**
 * Creates a new OnchainKitActionProvider instance.
 * @param apiKey - The API key for OnchainKit
 */
export const onchainKitActionProvider = (apiKey: string) => new OnchainKitActionProvider(apiKey); 