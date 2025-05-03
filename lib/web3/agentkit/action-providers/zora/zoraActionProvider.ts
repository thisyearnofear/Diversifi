import type { z } from 'zod';
import {
  ActionProvider,
  CreateAction,
  type EvmWalletProvider,
  NETWORK_ID_TO_VIEM_CHAIN,
} from '@coinbase/agentkit';
import type { Network } from '../types';
import { mint1155Schema, type Mint1155Response } from './schemas';
import { mint } from '@zoralabs/protocol-sdk';
import { createPublicClient, http, encodeFunctionData, type Hex } from 'viem';

/**
 * ZoraActionProvider provides actions for interacting with Zora Protocol.
 */
export class ZoraActionProvider extends ActionProvider {
  /**
   * Constructor for the ZoraActionProvider.
   */
  constructor() {
    super('zora', []);
  }

  /**
   * Mints tokens from a Zora 1155 contract.
   *
   * @param walletProvider - The wallet provider to mint from.
   * @param args - The mint parameters.
   * @returns The transaction hash of the mint.
   */
  @CreateAction({
    name: 'mint_1155',
    description: `
    This tool will mint ERC-1155 tokens from a Zora contract.
    It takes the following inputs:
      - tokenContract: The ERC-1155 contract address
      - tokenId: The ERC-1155 token id to mint
      - quantityToMint: Quantity of tokens to mint
      - mintRecipient: The address to mint the tokens to (optional, defaults to the wallet provider's address)

    Important notes:
    - Ensure the token contract supports ERC-1155
    - Ensure sufficient balance for gas fees
    `,
    schema: mint1155Schema,
  })
  async mint1155(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof mint1155Schema>,
  ): Promise<Mint1155Response> {
    try {
      const network = walletProvider.getNetwork();
      const publicClient = createPublicClient({
        // biome-ignore lint: networkId is not null
        chain: NETWORK_ID_TO_VIEM_CHAIN[network.networkId!],
        transport: http(),
      });

      const recipient = args.mintRecipient || walletProvider.getAddress();

      // Prepare mint parameters
      const { parameters } = await mint({
        tokenContract: args.tokenContract as `0x${string}`,
        mintType: '1155',
        tokenId: BigInt(args.tokenId),
        quantityToMint: args.quantityToMint,
        minterAccount: recipient,
        publicClient,
      });

      // Execute the mint transaction
      const hash = await walletProvider.sendTransaction({
        to: parameters.address as Hex,
        data: encodeFunctionData({
          abi: parameters.abi,
          functionName: parameters.functionName,
          args: parameters.args,
        }),
        value: parameters.value,
      });

      // Wait for transaction confirmation
      const receipt = await walletProvider.waitForTransactionReceipt(hash);

      return {
        success: true,
        message: 'Successfully minted tokens',
        data: {
          tokenContract: args.tokenContract,
          tokenId: args.tokenId,
          quantity: args.quantityToMint,
          recipient,
          transactionHash: hash,
          blockNumber: String(receipt.blockNumber),
          value: parameters.value ? String(parameters.value) : undefined,
        },
      };
    } catch (error) {
      console.log('Error minting tokens', error);
      return {
        success: false,
        message: 'Failed to mint tokens',
        error: error instanceof Error ? error.message : String(error),
      };
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
    const supportedChainIds = ['8453', '7777777'];
    const chainId = String(network.chainId);
    return supportedChainIds.includes(chainId);
  };
}

export const zoraActionProvider = () => new ZoraActionProvider();
