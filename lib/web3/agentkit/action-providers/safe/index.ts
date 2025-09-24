import {
  ActionProvider,
  CreateAction,
  type EvmWalletProvider,
  type Network,
} from '@coinbase/agentkit';
// Temporarily disabled - @safe-global/protocol-kit removed during build optimization
// import Safe, {
//   type OnchainAnalyticsProps,
//   type PredictedSafeProps,
//   type SafeAccountConfig,
// } from '@safe-global/protocol-kit';
import { waitForTransactionReceipt } from 'viem/actions';
import { baseSepolia } from 'viem/chains';
import { CreateSafeSchema } from './schemas';
import type { z } from 'zod';

// Temporary types while @safe-global/protocol-kit is disabled
type OnchainAnalyticsProps = {
  project: string;
  platform: string;
};

type SafeAccountConfig = {
  owners: string[];
  threshold: number;
};

type PredictedSafeProps = {
  safeAccountConfig: SafeAccountConfig;
};

type Safe = any; // Placeholder type

type CreateSafeReturnType = {
  safeAddress?: string;
  transactionHash?: string;
  threshold?: number;
  owners?: string[];
  error?: any;
};

const onchainAnalytics: OnchainAnalyticsProps = {
  project: 'HELLO_WORLD_COMPUTER', // Required. Always use the same value for your project.
  platform: 'WEB', // Optional
};

export class SafeActionProvider extends ActionProvider {
  constructor() {
    super('safe', []);
  }

  /**
   * Creates a safe on the network.
   *
   * @param walletProvider - The wallet provider to create the safe from.
   * @param args - The input arguments for the action.
   * @returns A message containing the safe address.
   */
  @CreateAction({
    name: 'create_safe',
    description: `
      This tool will create a multisig safe wallet on the network. 
      It takes the following inputs, both are addresses:
        - owners: The addresses of the owners of the safe
        - threshold: The number of owners required to sign a transaction
      `,
    schema: CreateSafeSchema,
  })
  async createSafe(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof CreateSafeSchema>,
  ): Promise<CreateSafeReturnType> {
    // Safe functionality is temporarily disabled during build optimization
    return {
      error: 'Safe creation is currently not available. The @safe-global/protocol-kit has been temporarily disabled for build optimization.',
    };
  }

  /**
   * Checks if the Safe action provider supports the given network.
   *
   * @param _ - The network to check.
   * @returns True if the Safe action provider supports the network, false otherwise.
   */
  supportsNetwork = (_: Network) => true;
}

export const safeActionProvider = () => new SafeActionProvider();
