"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { useAuth } from "./use-auth";
import { useActions } from "./use-actions";
import { toast } from "sonner";
import { useNetworkState } from "./use-network-state";
import { ADDRESSES, ABIS, SwapParams, UseCkesSwapOptions, CkesSwapStatus } from "../constants/celo-tokens";
import { handleSwapError } from "../utils/celo-utils";
import {
  CELO_TOKENS,
  getMentoExchangeRate,
  getCachedData,
  setCachedData,
  CACHE_KEYS,
  CACHE_DURATIONS,
  handleMentoError,
  DEFAULT_EXCHANGE_RATES
} from "../utils/mento-utils";

export function useCkesSwap(options?: UseCkesSwapOptions) {
  const { address } = useAccount();
  const { isAuthenticated } = useAuth();
  const { completeAction } = useActions();

  // Core state
  const [status, setStatus] = useState<CkesSwapStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [approvalAmount, setApprovalAmount] = useState<string | null>(null);
  // Balance is static for simplicity
  const balance = "0";
  // Get exchange rate from Mento SDK or cache
  const [exchangeRate, setExchangeRate] = useState<number>(DEFAULT_EXCHANGE_RATES.CKES);

  // Fetch exchange rate from Mento or cache
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        // Check cache first
        const cachedRate = getCachedData(CACHE_KEYS.EXCHANGE_RATE_CKES);
        if (cachedRate !== null) {
          setExchangeRate(cachedRate);
          return;
        }

        // Fetch from Mento SDK
        const rate = await getMentoExchangeRate('CKES');
        setExchangeRate(rate);

        // Cache the result
        setCachedData(CACHE_KEYS.EXCHANGE_RATE_CKES, rate);
      } catch (error) {
        console.warn("Error fetching CKES exchange rate:", error);
        // Keep default rate
      }
    };

    fetchExchangeRate();
  }, []);

  // Network state
  const { isCorrectNetwork, isSwitchingChain, switchToCelo } = useNetworkState();

  // Handle completion callback
  useEffect(() => {
    if (status === "completed" && options?.onComplete) {
      options.onComplete();
    }
  }, [status, options]);

  // Check approval and completion status on mount
  useEffect(() => {
    // Flag to track if the component is mounted
    let isMounted = true;

    const checkStatus = async () => {
      if (!address || !isAuthenticated) {
        return;
      }

      try {
        setStatus("checking");

        // Try to get the action ID from the database
        let isActionCompleted = false;
        try {
          try {
            const actionResponse = await fetch("/api/actions/by-title", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ title: "Get cKES Stablecoins" }),
            });

            // Check if the action is completed
            if (actionResponse.ok && isMounted) {
              const { id } = await actionResponse.json();
              const response = await fetch(`/api/actions/${id}/completed`);
              if (response.ok) {
                const data = await response.json();
                if (data.completed) {
                  setIsCompleted(true);
                  setStatus("completed");
                  isActionCompleted = true;
                }
              }
            }
          } catch (apiError) {
            // If the API endpoint doesn't exist, check local storage instead
            console.warn("API endpoint not available, checking local storage:", apiError);

            try {
              const completedActions = localStorage.getItem('completed-actions');
              if (completedActions) {
                const actions = JSON.parse(completedActions);
                if (actions.includes('Get cKES Stablecoins')) {
                  setIsCompleted(true);
                  setStatus("completed");
                  isActionCompleted = true;
                }
              }
            } catch (storageError) {
              console.warn("Error checking local storage:", storageError);
            }
          }
        } catch (error) {
          console.warn("Error checking action completion status:", error);
        }

        if (!isActionCompleted && isMounted) {
          // Check if we have an approval already
          try {
            // Check allowance using direct ERC20 contract
            const allowance = await checkAllowance(address);

            if (allowance && allowance.gt(ethers.constants.Zero) && isMounted) {
              setIsApproved(true);
              setApprovalAmount(ethers.utils.formatEther(allowance));
              setStatus("approved");
            } else if (isMounted) {
              setStatus("idle");
            }
          } catch (error) {
            console.error("Error checking allowance:", error);
            if (isMounted) {
              setStatus("idle");
            }
          }
        }
      } catch (error) {
        console.error("Error checking status:", error);
        if (isMounted) {
          setStatus("idle");
        }
      }
    };

    checkStatus();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [address, isAuthenticated]);

  // Method to check allowance directly using ERC20 contract
  const checkAllowance = async (userAddress: string | undefined) => {
    if (!userAddress) {
      console.warn("Cannot check allowance: user address is undefined");
      return ethers.constants.Zero;
    }

    try {
      // Create a read-only provider for Celo mainnet
      const provider = new ethers.providers.JsonRpcProvider("https://forno.celo.org");

      // Get the broker address
      const brokerAddress = ADDRESSES.BROKER;

      // Create ERC20 contract instance
      const cusdToken = new ethers.Contract(ADDRESSES.CUSD, ABIS.ERC20_ALLOWANCE, provider);

      // Get the allowance
      const allowance = await cusdToken.allowance(userAddress, brokerAddress);
      console.log("cUSD allowance:", ethers.utils.formatUnits(allowance, 18));

      return allowance;
    } catch (error) {
      console.error("Error checking allowance:", error);
      return ethers.constants.Zero;
    }
  };

  // Function to complete the swap process
  const completeSwap = async (transactionHash: string) => {
    try {
      setStatus("completing");

      // Record the completion in the database
      try {
        await completeAction("Get cKES Stablecoins", {
          transactionHash,
          network: "celo",
          tokenSymbol: "cKES"
        });

        // Update state
        setIsCompleted(true);
        setStatus("completed");
        toast.success("Successfully acquired cKES stablecoins!");
      } catch (apiError) {
        console.error("Error recording completion:", apiError);

        // Fallback to localStorage if API fails
        try {
          const completedActions = localStorage.getItem('completed-actions') || '[]';
          const actions = JSON.parse(completedActions);
          if (!actions.includes('Get cKES Stablecoins')) {
            actions.push('Get cKES Stablecoins');
            localStorage.setItem('completed-actions', JSON.stringify(actions));
          }

          // Update state
          setIsCompleted(true);
          setStatus("completed");
          toast.success("Successfully acquired cKES stablecoins!");
        } catch (storageError) {
          console.error("Error updating localStorage:", storageError);
          setStatus("error");
          setError("Failed to record completion. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error completing swap:", error);
      setStatus("error");
      setError("Failed to complete swap. Please try again.");
    }
  };

  // Function to approve token spending
  const approveToken = async (amount: string) => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return false;
    }

    if (!isCorrectNetwork) {
      toast.info("Switching to Celo network...");
      const success = await switchToCelo();
      if (!success) return false;
    }

    // Check if window.ethereum is available
    if (typeof window === 'undefined' || !window.ethereum) {
      toast.error("Ethereum provider not available. Please use a Web3 browser.");
      return false;
    }

    // Initialize provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const signer = provider.getSigner();

    // Convert amount to Wei
    const amountInWei = ethers.utils.parseUnits(amount.toString(), 18);

    try {
      setStatus("approving");
      toast.info("Approving cUSD tokens...");

      // Define cUSD token address for approval
      const cUSDAddress = ADDRESSES.CUSD;

      // Get the broker address
      const brokerAddress = ADDRESSES.BROKER;

      // Create ERC20 contract instance
      const cusdToken = new ethers.Contract(cUSDAddress, ABIS.ERC20_APPROVE, signer);

      // Approve the broker to spend cUSD
      const approveTx = await cusdToken.approve(brokerAddress, amountInWei);
      setTxHash(approveTx.hash);

      // Wait for the transaction to be confirmed
      const allowanceReceipt = await approveTx.wait();
      if (allowanceReceipt.status !== 1) throw new Error("Approval transaction failed");

      // Update state
      setIsApproved(true);
      setApprovalAmount(amount.toString());
      setStatus("approved");
      toast.success("Approval confirmed! Now you can swap.");
      return true;
    } catch (error) {
      const errorMessage = handleMentoError(error, "approving tokens");
      setStatus("error");
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  };

  // Function to perform the swap
  const swap = async ({ amount }: SwapParams) => {
    console.log("Swap function called with amount:", amount, "and isApproved:", isApproved);

    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please sign in first");
      return;
    }

    if (!isCorrectNetwork) {
      const success = await switchToCelo();
      if (!success) return;
    }

    // Check if window.ethereum is available
    if (typeof window === 'undefined' || !window.ethereum) {
      toast.error("Ethereum provider not available. Please use a Web3 browser.");
      return;
    }

    // Initialize provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const signer = provider.getSigner();

    // Convert amount to Wei
    const amountInWei = ethers.utils.parseUnits(amount.toString(), 18);

    try {
      // Approval if needed
      if (!isApproved) {
        const approved = await approveToken(amount.toString());
        if (!approved) return;
      }

      // Perform the swap
      setStatus("swapping");
      toast.info("Performing swap...");

      try {
        // Get the cKES address
        const ckesAddr = ADDRESSES.CKES;
        const cUSDAddr = ADDRESSES.CUSD;
        const brokerAddress = ADDRESSES.BROKER;

        // Create a read-only provider for getting the quote
        const readProvider = new ethers.providers.JsonRpcProvider("https://forno.celo.org");

        // Get the list of exchange providers from the broker
        const brokerProvidersContract = new ethers.Contract(
          brokerAddress,
          ABIS.BROKER_PROVIDERS,
          readProvider
        );
        const exchangeProviders = await brokerProvidersContract.getExchangeProviders();

        // For each provider, get the exchanges and find the one for cUSD/cKES
        let exchangeProvider = "";
        let exchangeId = "";

        // Loop through each provider to find the cUSD/cKES exchange
        for (const providerAddress of exchangeProviders) {
          const exchangeContract = new ethers.Contract(
            providerAddress,
            ABIS.EXCHANGE,
            readProvider
          );
          const exchanges = await exchangeContract.getExchanges();

          // Check each exchange to see if it includes cUSD and cKES
          for (const exchange of exchanges) {
            const assets = exchange.assets.map((a: string) => a.toLowerCase());

            if (assets.includes(cUSDAddr.toLowerCase()) && assets.includes(ckesAddr.toLowerCase())) {
              exchangeProvider = providerAddress;
              exchangeId = exchange.exchangeId;
              break;
            }
          }

          if (exchangeProvider && exchangeId) break;
        }

        if (!exchangeProvider || !exchangeId) {
          throw new Error("Direct cUSD to cKES swaps are not currently available. Please try again later or contact support.");
        }

        // Create a contract instance for the Broker
        const brokerRateContract = new ethers.Contract(
          brokerAddress,
          ABIS.BROKER_RATE,
          readProvider
        );

        // Create a contract instance for the Broker with the signer
        const brokerSwapContract = new ethers.Contract(
          brokerAddress,
          ABIS.BROKER_SWAP,
          signer
        );

        // Get the quote
        const quoteAmountOut = await brokerRateContract.getAmountOut(
          exchangeProvider,
          exchangeId,
          cUSDAddr,
          ckesAddr,
          amountInWei.toString()
        );

        // Allow 1% slippage from quote
        const expectedAmountOut = ethers.BigNumber.from(quoteAmountOut).mul(99).div(100);

        try {
          // First try with automatic gas estimation
          const swapTx = await brokerSwapContract.swapIn(
            exchangeProvider,
            exchangeId,
            cUSDAddr,
            ckesAddr,
            amountInWei.toString(),
            expectedAmountOut.toString()
          );

          setTxHash(swapTx.hash);

          // Wait for the transaction to be confirmed
          const swapReceipt = await swapTx.wait();
          if (swapReceipt.status !== 1) throw new Error("Swap transaction failed");

          // Update state and complete the swap
          setStatus("transaction-success");
          completeSwap(swapTx.hash);
        } catch (swapError) {
          console.error("Error with automatic gas estimation, trying with manual gas limit:", swapError);

          // If automatic gas estimation fails, try with manual gas limit
          const options = {
            gasLimit: ethers.utils.hexlify(500000), // Manual gas limit of 500,000
          };

          // Try again with manual gas limit
          const swapTx = await brokerSwapContract.swapIn(
            exchangeProvider,
            exchangeId,
            cUSDAddr,
            ckesAddr,
            amountInWei.toString(),
            expectedAmountOut.toString(),
            options
          );

          setTxHash(swapTx.hash);

          // Wait for the transaction to be confirmed
          const swapReceipt = await swapTx.wait();
          if (swapReceipt.status !== 1) throw new Error("Swap transaction failed");

          // Update state and complete the swap
          setStatus("transaction-success");
          completeSwap(swapTx.hash);
        }
      } catch (error) {
        const errorMessage = handleMentoError(error, "performing swap");
        setStatus("error");
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage = handleMentoError(error, "swap process");
      setStatus("error");
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Return combined state and actions
  return {
    status,
    error,
    txHash,
    isCompleted,
    isApproved,
    approvalAmount,
    balance,
    isCorrectNetwork,
    isSwitchingChain,
    exchangeRate,
    swap,
    switchToCelo,
  };
}
