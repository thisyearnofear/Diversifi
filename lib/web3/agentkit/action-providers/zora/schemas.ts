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
    mintRecipient: z
      .string()
      .optional()
      .describe("Optional recipient address to mint to"),
  }) 
  .strip()
  .describe("Mint parameters for ERC-1155 tokens");

/**
 * Response type for mint_1155 action
 */
export type Mint1155Response = {
  success: boolean;
  message: string;
  data?: {
    tokenContract: string;
    tokenId: string;
    quantity: number;
    recipient: string;
    transactionHash: string;
    blockNumber: string;
    value?: string;
  };
  error?: string;
};

export const create1155Schema = z.object({
  contractAddress: z.string(),
  name: z.string(),
  description: z.string(),
  imageFile: z.instanceof(File),
  // Optional fields
  attributes: z
    .array(
      z.object({
        trait_type: z.string(),
        value: z.string(),
      })
    )
    .optional(),
});

export type Create1155Response = {
  success: boolean;
  message: string;
  data?: {
    contractAddress: string;
    tokenId: string;
    tokenUri: string;
    transactionHash: string;
    blockNumber: string;
  };
  error?: string;
};