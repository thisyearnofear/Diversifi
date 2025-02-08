import { z } from "zod";

/**
 * Input schema for getTokenBalances action.
 */
export const getTokenBalancesSchema = z.object({
  address: z
    .string()
    .describe("The wallet address to get token balances for"),
  includeZeroBalances: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to include tokens with zero balance"),
});

/**
 * Token balance with metadata response type
 */
export type TokenBalanceWithMetadata = {
  name: string;
  symbol: string;
  balance: string;
  decimals: number;
  contractAddress: string;
};

/**
 * Input schema for getNFTsForOwner action
 */
export const getNFTsForOwnerSchema = z.object({
  owner: z
    .string()
    .describe("The wallet address to get NFTs for"),
  withMetadata: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to include NFT metadata"),
  pageSize: z
    .number()
    .optional()
    .default(100)
    .describe("Number of NFTs to return per page"),
});

/**
 * NFT with metadata response type
 */
export type NFTWithMetadata = {
  contract: {
    address: string;
    name?: string;
    symbol?: string;
    tokenType: string;
  };
  tokenId: string;
  tokenType: string;
  title?: string;
  description?: string;
  image?: {
    originalUrl?: string;
    thumbnailUrl?: string;
  };
}; 