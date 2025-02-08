import { z } from "zod";

/**
 * Input schema for mint_1155 action.
 */
export const mint1155Schema = z
  .object({
    tokenContract: z
      .string()
      .describe("The ERC-1155 contract address"),
    tokenId: z
      .string()
      .describe("The ERC-1155 token id to mint"),
    quantityToMint: z
      .number()
      .describe("Quantity of tokens to mint"),
    mintComment: z
      .string()
      .optional()
      .describe("Optional comment to include with the mint"),
    mintReferral: z
      .string()
      .optional()
      .describe("Optional address that will receive a mint referral reward"),
  }) 