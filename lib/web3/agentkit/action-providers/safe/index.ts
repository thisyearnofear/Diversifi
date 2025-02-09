import { ActionProvider, CreateAction, EvmWalletProvider, Network } from '@coinbase/agentkit';
import Safe, {
    OnchainAnalyticsProps,
    PredictedSafeProps,
    SafeAccountConfig
} from '@safe-global/protocol-kit'
import { waitForTransactionReceipt } from 'viem/actions'
import { baseSepolia } from 'viem/chains'
import { CreateSafeSchema } from './schemas';
import { z } from 'zod';

const onchainAnalytics: OnchainAnalyticsProps = {
    project: 'HELLO_WORLD_COMPUTER', // Required. Always use the same value for your project.
    platform: 'WEB' // Optional
};

export class SafeActionProvider extends ActionProvider {

    constructor() {
        super("safe", []);
    }

    /**
     * Creates a safe on the network.
     *
     * @param walletProvider - The wallet provider to create the safe from.
     * @param args - The input arguments for the action.
     * @returns A message containing the safe address.
     */
    @CreateAction({
        name: "create_safe",
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
        args: z.infer<typeof CreateSafeSchema>
    ): Promise<CreateSafeReturnType> {
        try {
            const safeAccountConfig: SafeAccountConfig = {
                owners: args.owners,
                threshold: args.threshold
                // ...
            };

            const predictedSafe: PredictedSafeProps = {
                safeAccountConfig
                // ...
            };

            const protocolKit = await Safe.init({
                provider: baseSepolia.rpcUrls.default.http[0],
                signer: walletProvider.getAddress(),
                predictedSafe,
                onchainAnalytics // Optional
                // ...
            });

            const predictedSafeAddress = await protocolKit.getAddress();

            const deploymentTransaction =
                await protocolKit.createSafeDeploymentTransaction();


            const client =
                await protocolKit.getSafeProvider().getExternalSigner();

            const tx = await client!.prepareTransactionRequest({
                to: deploymentTransaction.to,
                value: BigInt(deploymentTransaction.value),
                data: deploymentTransaction.data as `0x${string}`,
                chain: baseSepolia
            });

            if (!tx) {
              throw new Error("Failed to prepare transaction request");
            }

            const transactionHash = await walletProvider.sendTransaction(tx);

            await waitForTransactionReceipt(
              // biome-ignore lint: client is not null
              client!,
              { hash: transactionHash }
            );

            const newProtocolKit = await protocolKit.connect({
                safeAddress: predictedSafeAddress
            });

            const deployedSafeAddress = await newProtocolKit.getAddress();

            return {
                safeAddress: deployedSafeAddress,
                transactionHash,
                threshold: args.threshold,
                owners: args.owners
                };
        } catch (error: any) {
            return { error };
        }
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