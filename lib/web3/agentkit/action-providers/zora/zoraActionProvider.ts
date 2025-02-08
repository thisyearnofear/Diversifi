import type { z } from "zod";
import {
  ActionProvider,
  CreateAction,
  type EvmWalletProvider,
} from "@coinbase/agentkit";
import type { Network } from "./types";
import { mint1155Schema } from "./schemas";
import { mint } from "@zoralabs/protocol-sdk";

/**
 * ZoraActionProvider provides actions for interacting with Zora Protocol.
 */
export class ZoraActionProvider extends ActionProvider {
  /**
   * Constructor for the ZoraActionProvider.
   */
  constructor() {
    super("zora", []);
  }

  /**
   * Mints tokens from a Zora 1155 contract.
   *
   * @param walletProvider - The wallet provider to mint from.
   * @param args - The mint parameters.
   * @returns The transaction hash of the mint.
   */
  @CreateAction({
    name: "mint_1155",
    description: `
    This tool will mint ERC-1155 tokens from a Zora contract.
    It takes the following inputs:
      - tokenContract: The ERC-1155 contract address
      - tokenId: The ERC-1155 token id to mint
      - quantityToMint: Quantity of tokens to mint
      - mintComment: (Optional) Comment to include with the mint
      - mintReferral: (Optional) Address that will receive a mint referral reward
    `,
    schema: mint1155Schema,
  })
  async mint1155(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof mint1155Schema>
  ): Promise<string> {
    try {
      // Create collector client
      // Prepare mint parameters
      const { parameters } = await mint({
        tokenContract: args.tokenContract as `0x${string}`,
        mintType: "1155",
        tokenId: BigInt(args.tokenId),
        quantityToMint: args.quantityToMint,
        mintComment: args.mintComment,
        mintReferral: args.mintReferral as `0x${string}` | undefined,
        minterAccount: walletProvider.getAddress(),
        publicClient: walletProvider
      });

      // Execute the mint transaction
      const hash = await walletProvider.sendTransaction(parameters);

      return `Successfully initiated mint transaction. Transaction hash: ${hash}`;
    } catch (error) {
      return `Error minting tokens: ${error}`;
    }
  }

  /**
   * Checks if the Zora action provider supports the given network.
   *
   * @param network - The network to check.
   * @returns True if the network is supported by Zora, false otherwise.
   */
  supportsNetwork = (network: Network) => {
    // Zora supports Base (8453) and Zora Network (7777777)
    const supportedChainIds = ["8453", "7777777"];
    return supportedChainIds.includes(String(network.chainId));
  };
}

export const zoraActionProvider = () => new ZoraActionProvider(); 