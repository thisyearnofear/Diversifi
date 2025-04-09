import { WalletProvider } from "@coinbase/agentkit";
import { Network } from "@coinbase/agentkit";
import { createWalletClient, http } from "viem";
import { baseSepolia, base } from "viem/chains";
import {
  getAccount,
  signMessage,
  sendTransaction,
  getBalance,
} from "wagmi/actions";
import { type Hash } from "viem";
import { createConfig, http as wagmiHttp } from "wagmi";
import { mainnet } from "wagmi/chains";

/**
 * A wallet provider that uses ConnectKit/Wagmi.
 * This bridges the gap between our ConnectKit frontend and AgentKit.
 */
export class ConnectKitWalletProvider extends WalletProvider {
  private networkId: string;
  private address: `0x${string}` | undefined;
  private config: ReturnType<typeof createConfig>;

  private constructor(networkId: string) {
    super();
    this.networkId = networkId;

    // Initialize config with default values
    this.config = createConfig({
      chains: [mainnet],
      transports: {
        [mainnet.id]: wagmiHttp(),
      },
    });

    try {
      // Try to get the connected account from Wagmi
      // This will fail on the server side
      const account = getAccount(this.config);
      this.address = account.address as `0x${string}` | undefined;
    } catch (error) {
      console.log("Unable to get account from Wagmi, likely running on server");
      this.address = undefined;
    }
  }

  public static async configureWithWallet(
    networkId: string = "base-sepolia"
  ): Promise<ConnectKitWalletProvider> {
    // Create a fallback config for server-side rendering
    if (typeof window === "undefined") {
      console.log("Creating server-side ConnectKitWalletProvider");
    }

    return new ConnectKitWalletProvider(networkId);
  }

  getNetwork(): Network {
    // Return a Network object as required by the interface
    return {
      protocolFamily: "EVM",
      networkId: this.networkId,
      chainId: this.networkId === "base-mainnet" ? "8453" : "84532", // Base or Base Sepolia chain ID
    };
  }

  // This method is required by AgentKit
  supportsNetwork(networkId: string): boolean {
    return networkId === this.networkId;
  }

  // No need to redefine trackInitialization as it's inherited from WalletProvider

  getAddress(): string {
    if (typeof window === "undefined" || !this.address) {
      console.log("Server-side getAddress not fully supported");
      return "0x0000000000000000000000000000000000000000";
    }

    return this.address;
  }

  getName(): string {
    return "ConnectKit";
  }

  async getBalance(): Promise<bigint> {
    if (typeof window === "undefined" || !this.address) {
      console.log("Server-side getBalance not supported");
      return BigInt(0);
    }

    try {
      const balance = await getBalance(this.config, {
        address: this.address,
      });

      return balance.value;
    } catch (error) {
      console.error("Error getting balance:", error);
      return BigInt(0);
    }
  }

  async nativeTransfer(
    to: `0x${string}`,
    value: string
  ): Promise<`0x${string}`> {
    if (typeof window === "undefined" || !this.address) {
      console.log("Server-side nativeTransfer not supported");
      throw new Error("Server-side nativeTransfer not supported");
    }

    try {
      // Convert string value to BigInt
      const bigintValue = BigInt(value);

      const hash = await sendTransaction(this.config, {
        to: to,
        value: bigintValue,
      });

      return hash;
    } catch (error) {
      console.error("Error performing native transfer:", error);
      throw error;
    }
  }

  async getWallet() {
    const chain = this.networkId === "base-mainnet" ? base : baseSepolia;
    let address: `0x${string}` = "0x0000000000000000000000000000000000000000";

    try {
      // Try to get the connected account from Wagmi
      // This will fail on the server side
      if (typeof window !== "undefined") {
        const account = getAccount(this.config);
        if (account.address) {
          address = account.address as `0x${string}`;
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
          if (typeof window === "undefined") {
            console.log("Server-side signing not supported");
            throw new Error("Server-side signing not supported");
          }

          const account = getAccount(this.config);
          if (!account.address) {
            throw new Error("No wallet connected");
          }

          const signature = await signMessage(this.config, {
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
          if (typeof window === "undefined") {
            console.log("Server-side transaction signing not supported");
            throw new Error("Server-side transaction signing not supported");
          }

          // Wagmi doesn't have a direct signTransaction method
          // Instead, we'll use sendTransaction which internally signs the transaction
          // This is a workaround and not ideal for production
          throw new Error(
            "Transaction signing not directly supported by ConnectKit. Use sendTransaction instead."
          );
        } catch (error) {
          console.error("Error signing transaction:", error);
          throw error;
        }
      },
      sendTransaction: async (transaction: any) => {
        console.log("ConnectKit sending transaction:", transaction);
        try {
          // Check if we're on the server
          if (typeof window === "undefined") {
            console.log("Server-side transactions not supported");
            throw new Error("Server-side transactions not supported");
          }

          const account = getAccount(this.config);
          if (!account.address) {
            throw new Error("No wallet connected");
          }

          const hash = await sendTransaction(this.config, {
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
