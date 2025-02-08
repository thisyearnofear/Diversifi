import type { z } from "zod";
import {
  ActionProvider,
  CreateAction,
  type EvmWalletProvider,
} from "@coinbase/agentkit";
import { getTokenBalancesSchema, type TokenBalanceWithMetadata, getNFTsForOwnerSchema, type NFTWithMetadata } from "./schemas";
import { Network } from "../types";

/**
 * AlchemyActionProvider provides actions for interacting with Alchemy APIs.
 */
export class AlchemyActionProvider extends ActionProvider {
  private apiKey: string;

  /**
   * Constructor for the AlchemyActionProvider.
   * @param apiKey - The Alchemy API key
   */
  constructor(apiKey: string) {
    super("alchemy", []);
    this.apiKey = apiKey;
  }

  /**
   * Gets the appropriate Alchemy base URL for the given chain ID.
   * @param chainId - The chain ID
   * @returns The Alchemy base URL for the chain
   */
  private getBaseUrl(chainId: string): string {
    const urls: Record<string, string> = {
      "1": "eth-mainnet.g.alchemy.com",
      "8453": "base-mainnet.g.alchemy.com",
      "84532": "base-sepolia.g.alchemy.com",
    };

    const domain = urls[chainId];
    if (!domain) {
      throw new Error(`Chain ID ${chainId} not supported by Alchemy`);
    }

    return `https://${domain}/v2/${this.apiKey}`;
  }

  /**
   * Gets token balances for a wallet address.
   *
   * @param walletProvider - The wallet provider to get balances from.
   * @param args - The query parameters.
   * @returns Array of token balances with metadata.
   */
  @CreateAction({
    name: "get_token_balances",
    description: `
    This tool will get all ERC-20 token balances for a wallet address.
    It takes the following inputs:
      - address: The wallet address to get token balances for
      - includeZeroBalances: (Optional) Whether to include tokens with zero balance
    Returns an array of token balances with metadata including name, symbol, and balance.
    `,
    schema: getTokenBalancesSchema,
  })
  async getTokenBalances(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof getTokenBalancesSchema>
  ): Promise<TokenBalanceWithMetadata[]> {
    try {
      const chainId = String(walletProvider.getNetwork().chainId);
      const baseURL = this.getBaseUrl(chainId);

      // Get token balances
      const balancesResponse = await fetch(baseURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "alchemy_getTokenBalances",
          params: [args.address],
          id: 42,
        }),
      });

      const balancesData = await balancesResponse.json();
      const balances = balancesData.result.tokenBalances;

      // Filter out zero balances if requested
      const filteredBalances = args.includeZeroBalances 
        ? balances 
        : balances.filter((token: any) => token.tokenBalance !== "0");

      // Get metadata for each token
      const tokenBalancesWithMetadata: TokenBalanceWithMetadata[] = await Promise.all(
        filteredBalances.map(async (token: any) => {
          const metadataResponse = await fetch(baseURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0", 
              method: "alchemy_getTokenMetadata",
              params: [token.contractAddress],
              id: 42,
            }),
          });

          const metadataData = await metadataResponse.json();
          const metadata = metadataData.result;

          // Convert balance to human readable format
          const balance = (
            parseInt(token.tokenBalance) / Math.pow(10, metadata.decimals)
          ).toFixed(2);

          return {
            name: metadata.name,
            symbol: metadata.symbol,
            balance,
            decimals: metadata.decimals,
            contractAddress: token.contractAddress,
          };
        })
      );

      return tokenBalancesWithMetadata;
    } catch (error) {
      throw new Error(`Error getting token balances: ${error}`);
    }
  }

  /**
   * Gets NFTs owned by a wallet address.
   *
   * @param walletProvider - The wallet provider to get NFTs from.
   * @param args - The query parameters.
   * @returns Array of NFTs with metadata.
   */
  @CreateAction({
    name: "get_nfts_for_owner",
    description: `
    This tool will get all NFTs owned by a specified wallet address.
    It takes the following inputs:
      - owner: The wallet address to get NFTs for
      - withMetadata: (Optional) Whether to include NFT metadata (default: true)
      - pageSize: (Optional) Number of NFTs to return per page (default: 100)
    Returns an array of NFTs with metadata including contract info, token IDs, and media.
    `,
    schema: getNFTsForOwnerSchema,
  })
  async getNFTsForOwner(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof getNFTsForOwnerSchema>
  ): Promise<NFTWithMetadata[]> {
    try {
      const chainId = String(walletProvider.getNetwork().chainId);
      const baseURL = this.getBaseUrl(chainId);
      const nftBaseUrl = baseURL.replace("/v2/", "/nft/v3/");

      const queryParams = new URLSearchParams({
        owner: args.owner,
        withMetadata: String(args.withMetadata),
        pageSize: String(args.pageSize),
      });

      const response = await fetch(
        `${nftBaseUrl}/getNFTsForOwner?${queryParams}`,
        {
          method: "GET",
          headers: { accept: "application/json" },
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || "Failed to fetch NFTs");
      }

      return data.ownedNfts;
    } catch (error) {
      throw new Error(`Error getting NFTs: ${error}`);
    }
  }

  /**
   * Checks if the network is supported by Alchemy.
   * @param network - The network to check.
   * @returns True if the network is supported.
   */
  supportsNetwork = (network: Network) => {
    // Supported networks: Ethereum mainnet, Base mainnet, Base Sepolia
    const supportedChainIds = ["1", "8453", "84532"];
    return supportedChainIds.includes(String(network.chainId));
  };
}

export const alchemyActionProvider = (apiKey: string) => new AlchemyActionProvider(apiKey); 