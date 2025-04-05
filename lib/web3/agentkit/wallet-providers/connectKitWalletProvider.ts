import { WalletProvider } from "@coinbase/agentkit";
import { createWalletClient, http } from "viem";
import { baseSepolia, base } from "viem/chains";
import { getAccount, signMessage, sendTransaction } from "wagmi/actions";
import { type Hash } from "viem";

/**
 * A wallet provider that uses ConnectKit/Wagmi.
 * This bridges the gap between our ConnectKit frontend and AgentKit.
 */
export class ConnectKitWalletProvider implements WalletProvider {
  private networkId: string;
  private address: `0x${string}` | undefined;

  private constructor(networkId: string) {
    this.networkId = networkId;

    // Get the connected account from Wagmi
    const account = getAccount();
    this.address = account.address;
  }

  public static async configureWithWallet(
    networkId: string = "base-sepolia"
  ): Promise<ConnectKitWalletProvider> {
    return new ConnectKitWalletProvider(networkId);
  }

  getNetwork() {
    return this.networkId;
  }

  async getWallet() {
    const chain = this.networkId === "base-mainnet" ? base : baseSepolia;
    const account = getAccount();

    // If no wallet is connected, use a placeholder address
    const address = account.address || "0x0000000000000000000000000000000000000000" as `0x${string}`;

    return {
      getDefaultAddress: async () => ({
        getId: () => address,
      }),
      getNetwork: async () => ({
        getId: () => this.networkId,
      }),
      signMessage: async (message: string) => {
        console.log("ConnectKit signing message:", message);
        try {
          if (!account.address) {
            throw new Error("No wallet connected");
          }

          const signature = await signMessage({
            message,
          });

          return signature as `0x${string}`;
        } catch (error) {
          console.error("Error signing message:", error);
          return "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`;
        }
      },
      signTransaction: async (transaction: any) => {
        console.log("ConnectKit signing transaction:", transaction);
        // Wagmi doesn't have a direct signTransaction method
        // We'll return a placeholder for now
        return "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`;
      },
      sendTransaction: async (transaction: any) => {
        console.log("ConnectKit sending transaction:", transaction);
        try {
          if (!account.address) {
            throw new Error("No wallet connected");
          }

          const hash = await sendTransaction({
            to: transaction.to,
            value: transaction.value,
            data: transaction.data,
          });

          return {
            hash,
            wait: async () => ({
              status: 1,
            }),
          };
        } catch (error) {
          console.error("Error sending transaction:", error);
          return {
            hash: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
            wait: async () => ({
              status: 0,
            }),
          };
        }
      },
    };
  }
}
