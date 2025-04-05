import { WalletProvider } from "@coinbase/agentkit";

// A simple mock wallet provider for development
export const mockWalletProvider = (): WalletProvider => {
  return {
    getWallet: async () => {
      return {
        getDefaultAddress: async () => ({
          getId: () => "0x0000000000000000000000000000000000000000",
        }),
        getNetwork: async () => ({
          getId: () => "base-sepolia",
        }),
        signMessage: async (message: string) => {
          console.log("Mock signing message:", message);
          return "0x0000000000000000000000000000000000000000000000000000000000000000";
        },
        signTransaction: async (transaction: any) => {
          console.log("Mock signing transaction:", transaction);
          return "0x0000000000000000000000000000000000000000000000000000000000000000";
        },
        sendTransaction: async (transaction: any) => {
          console.log("Mock sending transaction:", transaction);
          return {
            hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
            wait: async () => ({
              status: 1,
            }),
          };
        },
      };
    },
  };
};
