import { WalletProvider } from "@coinbase/agentkit";
import { createWalletClient, http } from "viem";
import { baseSepolia, base } from "viem/chains";
import { getAccount, getConfig, signMessage, sendTransaction } from "wagmi/actions";
import { type Hash } from "viem";
import { createConfig, http as wagmiHttp } from "wagmi";
import { mainnet } from "wagmi/chains";

/**
 * A wallet provider that uses ConnectKit/Wagmi.
 * This bridges the gap between our ConnectKit frontend and AgentKit.
 */
export class ConnectKitWalletProvider implements WalletProvider {
  private networkId: string;
  private address: `0x${string}` | undefined;

  private constructor(networkId: string) {
    this.networkId = networkId;

    try {
      // Try to get the connected account from Wagmi
      // This will fail on the server side
      const account = getAccount();
      this.address = account.address;
    } catch (error) {
      console.log("Unable to get account from Wagmi, likely running on server");
      this.address = undefined;
    }
  }

  public static async configureWithWallet(
    networkId: string = "base-sepolia"
  ): Promise<ConnectKitWalletProvider> {
    // Create a fallback config for server-side rendering
    if (typeof window === 'undefined') {
      console.log("Creating server-side ConnectKitWalletProvider");
      // This is a minimal config that will work on the server
      try {
        const config = createConfig({
          chains: [mainnet],
          transports: {
            [mainnet.id]: wagmiHttp(),
          },
        });
      } catch (error) {
        console.log("Error creating server-side config, but this is expected", error);
      }
    }

    return new ConnectKitWalletProvider(networkId);
  }

  getNetwork() {
    return this.networkId;
  }

  // This method is required by AgentKit
  supportsNetwork(networkId: string): boolean {
    return networkId === this.networkId;
  }

  async getWallet() {
    const chain = this.networkId === "base-mainnet" ? base : baseSepolia;
    let address: `0x${string}` = "0x0000000000000000000000000000000000000000";

    try {
      // Try to get the connected account from Wagmi
      // This will fail on the server side
      if (typeof window !== 'undefined') {
        const account = getAccount();
        if (account.address) {
          address = account.address;
        }
      }
    } catch (error) {
      console.log("Using placeholder address for server-side rendering");
    }

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
          // Check if we're on the server
          if (typeof window === 'undefined') {
            console.log("Server-side signing not supported");
            throw new Error("Server-side signing not supported");
          }

          const account = getAccount();
          if (!account.address) {
            throw new Error("No wallet connected");
          }

          const signature = await signMessage({
            message,
          });

          return signature as `0x${string}`;
        } catch (error) {
          console.error("Error signing message:", error);
          throw error;
        }
      },
      signTransaction: async (transaction: any) => {
        console.log("ConnectKit signing transaction:", transaction);
        try {
          // Check if we're on the server
          if (typeof window === 'undefined') {
            console.log("Server-side transaction signing not supported");
            throw new Error("Server-side transaction signing not supported");
          }

          // Wagmi doesn't have a direct signTransaction method
          // Instead, we'll use sendTransaction which internally signs the transaction
          // This is a workaround and not ideal for production
          throw new Error("Transaction signing not directly supported by ConnectKit. Use sendTransaction instead.");
        } catch (error) {
          console.error("Error signing transaction:", error);
          throw error;
        }
      },
      sendTransaction: async (transaction: any) => {
        console.log("ConnectKit sending transaction:", transaction);
        try {
          // Check if we're on the server
          if (typeof window === 'undefined') {
            console.log("Server-side transactions not supported");
            throw new Error("Server-side transactions not supported");
          }

          const account = getAccount();
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
          throw error;
        }
      },
    };
  }
}
