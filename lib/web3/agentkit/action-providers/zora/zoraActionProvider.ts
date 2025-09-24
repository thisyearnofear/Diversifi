import type { z } from 'zod';
import {
  ActionProvider,
  CreateAction,
  type EvmWalletProvider,
  NETWORK_ID_TO_VIEM_CHAIN,
} from '@coinbase/agentkit';
import type { Network } from '../types';
import { mint1155Schema, type Mint1155Response } from './schemas';
// Temporarily disabled - @zoralabs/protocol-sdk removed during build optimization
// import { mint } from '@zoralabs/protocol-sdk';
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
    // Zora minting functionality is temporarily disabled during build optimization
    return {
      success: false,
      message: 'Zora minting is currently not available. The @zoralabs/protocol-sdk has been temporarily disabled for build optimization.',
      error: 'Zora minting functionality is temporarily disabled',
    };
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
