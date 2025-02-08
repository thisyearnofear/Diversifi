import { z } from "zod";

/**
 * Input schema for getBaseTokens action.
 */
export const searchBaseTokensSchema = z
  .object({
    search: z
      .string()
      .describe("Search term for token (name, symbol, or address)"),
    limit: z
      .string()
      .optional()
      .describe("Maximum number of tokens to return"),
  })

/**
 * Input schema for getPortfolios action.
 */
export const getPortfoliosSchema = z
  .object({
    addresses: z
      .array(z.string())
      .describe("Array of wallet addresses to get portfolios for"),
  })