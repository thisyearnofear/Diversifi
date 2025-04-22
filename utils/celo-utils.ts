import { ethers } from "ethers";
import { CACHE_DURATIONS } from "../constants/celo-tokens";

// Create an ERC20 contract instance
export const createERC20Contract = (address: string, abi: string[], providerOrSigner: any) => {
  return new ethers.Contract(address, abi, providerOrSigner);
};

// Cache utility functions
export const useCache = (key: string, duration: number = CACHE_DURATIONS.EXCHANGE_RATE) => {
  const getItem = () => {
    try {
      const cachedData = localStorage.getItem(key);
      if (cachedData) {
        const { value, timestamp } = JSON.parse(cachedData);
        const now = Date.now();
        if (now - timestamp < duration) {
          return value;
        }
      }
    } catch (error) {
      console.warn(`Error reading from cache (${key}):`, error);
    }
    return null;
  };

  const setItem = (value: any) => {
    try {
      const cacheData = {
        value,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.warn(`Error writing to cache (${key}):`, error);
    }
  };

  return { getItem, setItem };
};

// Error handling utility
export const handleSwapError = (error: unknown, context: string): string => {
  const errorMsg = error instanceof Error ? error.message : String(error);
  console.error(`Error in ${context}:`, error);
  
  if (errorMsg.includes("low-level call failed") || errorMsg.includes("UNPREDICTABLE_GAS_LIMIT")) {
    return "Insufficient token balance or approval. Please check your balance.";
  } else if (errorMsg.includes("user rejected") || errorMsg.includes("User denied")) {
    return "Transaction was rejected. Please try again when ready.";
  } else if (errorMsg.includes("insufficient funds")) {
    return "Insufficient funds for gas fees. Please add more CELO to your wallet.";
  } else if (errorMsg.includes("nonce") || errorMsg.includes("replacement transaction")) {
    return "Transaction error. Please wait for pending transactions to complete.";
  }
  
  return `Failed to ${context}. Please try again.`;
};
