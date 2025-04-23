"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { useAuth } from "./use-auth";
import { useActions } from "./use-actions";
import { toast } from "sonner";
import { useNetworkState } from "./use-network-state";
import { useTokenPrice } from "./use-token-price";
import { ABIS } from "../constants/celo-tokens";
import { handleSwapError } from "../utils/celo-utils";
import {
  CELO_TOKENS,
  getMentoExchangeRate,
  getCachedData,
  setCachedData,
  CACHE_KEYS,
  CACHE_DURATIONS,
  handleMentoError,
  DEFAULT_EXCHANGE_RATES,
  MENTO_EXCHANGE_ADDRESS,
  MENTO_ABIS
} from "../utils/mento-utils";

// Token addresses from mento-utils
const CELO_TOKEN_ADDRESS = CELO_TOKENS.CELO;
const CUSD_TOKEN_ADDRESS = CELO_TOKENS.CUSD;
const PUSO_TOKEN_ADDRESS = CELO_TOKENS.PUSO;

// Mento contracts from mento-utils
const EXCHANGE_ADDRESS = MENTO_EXCHANGE_ADDRESS; // Use the exported address with correct checksum

// Types
export type PusoSwapStatus =
  | "idle"
  | "approving"
  | "swapping"
  | "checking"
  | "completed"
  | "error";

type SwapParams = {
  amount: string;
};

type UsePusoSwapOptions = {
  onComplete?: () => void;
};

export function usePusoSwap(options?: UsePusoSwapOptions) {
  // Core state
  const [status, setStatus] = useState<PusoSwapStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [balance, setBalance] = useState("0");

  // Network state
  const {
    isCorrectNetwork,
    isSwitchingChain,
    switchToCelo
  } = useNetworkState();

  // User state
  const { address } = useAccount();
  const { isAuthenticated } = useAuth();
  const { completeAction } = useActions();
  const { prices } = useTokenPrice(["CELO", "cKES"], "usd", "0x42"); // 0x42 is Celo's chain ID

  // Get exchange rate from Mento SDK or cache
  const [exchangeRate, setExchangeRate] = useState<number>(DEFAULT_EXCHANGE_RATES.PUSO);

  // Fetch exchange rate from Mento or cache
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        // Check cache first
        const cachedRate = getCachedData(CACHE_KEYS.EXCHANGE_RATE_PUSO);
        if (cachedRate !== null) {
          setExchangeRate(cachedRate);
          return;
        }

        // Fetch from Mento SDK
        const rate = await getMentoExchangeRate('PUSO');
        setExchangeRate(rate);

        // Cache the result
        setCachedData(CACHE_KEYS.EXCHANGE_RATE_PUSO, rate);
      } catch (error) {
        console.warn("Error fetching PUSO exchange rate:", error);
        // Keep default rate
      }
    };

    fetchExchangeRate();
  }, []);

  // Check if user has approved the token
  useEffect(() => {
    const checkApproval = async () => {
      if (!address || !isCorrectNetwork) return;

      try {
        setStatus("checking");

        // Get provider
        const provider = new ethers.providers.Web3Provider(window.ethereum as any);
        const signer = provider.getSigner();

        // Create contract instances
        const cusdContract = new ethers.Contract(
          CUSD_TOKEN_ADDRESS,
          ABIS.ERC20_ALLOWANCE,
          signer
        );

        // Check allowance
        const allowance = await cusdContract.allowance(address, EXCHANGE_ADDRESS);
        setIsApproved(allowance.gt(ethers.constants.Zero));

        // Check balance
        const pusoContract = new ethers.Contract(
          PUSO_TOKEN_ADDRESS,
          ABIS.ERC20_BALANCE,
          signer
        );

        const pusoBalance = await pusoContract.balanceOf(address);
        setBalance(ethers.utils.formatUnits(pusoBalance, 18));

        setStatus("idle");
      } catch (err) {
        console.error("Error checking approval:", err);
        setStatus("idle");
      }
    };

    if (address && isCorrectNetwork) {
      checkApproval();
    }
  }, [address, isCorrectNetwork, isCompleted]);

  // Function to approve the token
  const approve = async (): Promise<boolean> => {
    if (!address || !isCorrectNetwork) {
      toast.error("Please connect your wallet and switch to Celo network");
      return false;
    }

    try {
      setStatus("approving");
      setError(null);

      // Get provider
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const signer = provider.getSigner();

      // Create contract instance
      const cusdContract = new ethers.Contract(
        CUSD_TOKEN_ADDRESS,
        ABIS.ERC20_APPROVE,
        signer
      );

      // Approve the exchange to spend tokens
      const tx = await cusdContract.approve(
        EXCHANGE_ADDRESS,
        ethers.utils.parseUnits("1000", 18) // Approve a large amount
      );

      // Wait for transaction to be mined
      await tx.wait();

      setIsApproved(true);
      setStatus("idle");
      toast.success("Approval successful");
      return true;
    } catch (err) {
      console.error("Error approving token:", err);
      setError(handleMentoError(err, "approving token"));
      setStatus("error");
      toast.error("Failed to approve token");
      return false;
    }
  };

  // Function to perform the swap
  const swap = async ({ amount }: SwapParams) => {
    if (!address || !isCorrectNetwork) {
      toast.error("Please connect your wallet and switch to Celo network");
      return;
    }

    // If not approved, do the approval first
    if (!isApproved) {
      const approved = await approve();
      if (!approved) return;
    }

    try {
      setStatus("swapping");
      setError(null);

      // Get provider
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const signer = provider.getSigner();

      // Create contract instance for the exchange
      // Use the Mento exchange ABI from mento-utils
      const exchangeContract = new ethers.Contract(
        EXCHANGE_ADDRESS,
        MENTO_ABIS.MENTO_EXCHANGE,
        signer
      );

      // Calculate minimum amount out with 2% slippage
      const amountIn = ethers.utils.parseUnits(amount, 18);
      const expectedOut = amountIn.mul(ethers.BigNumber.from(Math.floor(exchangeRate * 100))).div(100);
      const minAmountOut = expectedOut.mul(98).div(100); // 2% slippage

      // Execute the swap
      const tx = await exchangeContract.swap(
        CUSD_TOKEN_ADDRESS,
        PUSO_TOKEN_ADDRESS,
        amountIn,
        minAmountOut
      );

      // Wait for transaction to be mined
      await tx.wait();

      setTxHash(tx.hash);
      setStatus("completed");
      setIsCompleted(true);

      // Record completion in the database
      if (isAuthenticated) {
        await completeAction("Get PUSO Stablecoins", tx.hash);
      }

      // Call onComplete callback if provided
      if (options?.onComplete) {
        options.onComplete();
      }

      toast.success("Swap completed successfully");
    } catch (err) {
      console.error("Error swapping tokens:", err);
      setError(handleMentoError(err, "swapping tokens"));
      setStatus("error");
      toast.error("Failed to swap tokens");
    }
  };

  // No need to define switchToCelo here as it's already provided by useNetworkState

  // Return combined state and actions
  return {
    status,
    error,
    txHash,
    isCompleted,
    isApproved,
    balance,
    exchangeRate,
    isCorrectNetwork,
    isSwitchingChain,
    approve,
    swap,
    switchToCelo,
  };
}
