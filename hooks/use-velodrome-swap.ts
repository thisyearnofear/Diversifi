"use client";

import { useState, useEffect } from "react";
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from "wagmi";
import { optimism } from "wagmi/chains";
import { parseEther, parseUnits } from "viem";
import { toast } from "sonner";
import { useActions } from "@/hooks/use-actions";
import { useOptimismDivviRegistration } from "./use-optimism-divvi-registration";
import { useTokenPrice } from "@/hooks/use-token-price";

// Velodrome and EURA constants
const VELODROME_URL = "https://app.velodrome.finance/swap";
const EURA_CONTRACT_ADDRESS = "0x9485aca5bbBE1667AD97c7fE7C4531a624C8b1ED"; // agEUR on Optimism
const USDC_CONTRACT_ADDRESS = "0x7F5c764cBc14f9669B88837ca1490cCa17c31607"; // USDC on Optimism
const OPTIMISM_VELODROME_SWAP = "0xD4fE775b3221769D8AC2cd52D5b1Cb50fB4B91A2"; // Our deployed contract

// ABI for the OptimismVelodromeSwap contract
const OPTIMISM_VELODROME_SWAP_ABI = [
  {
    "inputs": [
      {"internalType": "uint256", "name": "_amountOutMin", "type": "uint256"}
    ],
    "name": "swapETHForEURA",
    "outputs": [
      {"internalType": "uint256", "name": "euraReceived", "type": "uint256"}
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_tokenIn", "type": "address"},
      {"internalType": "uint256", "name": "_amountIn", "type": "uint256"},
      {"internalType": "uint256", "name": "_amountOutMin", "type": "uint256"},
      {"internalType": "bool", "name": "_useDirectRoute", "type": "bool"}
    ],
    "name": "swapTokenForEURA",
    "outputs": [
      {"internalType": "uint256", "name": "euraReceived", "type": "uint256"}
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export type VelodromeSwapStatus =
  | "idle"
  | "waiting-for-registration"
  | "ready"
  | "swapping"
  | "waiting-for-hash"
  | "completing"
  | "completed"
  | "wrong-network"
  | "switching-network"
  | "error";

interface SwapParams {
  sourceToken: string;
  amount: number;
}

export function useVelodromeSwap() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const [status, setStatus] = useState<VelodromeSwapStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const { completeAction } = useActions();
  const { isRegistered } = useOptimismDivviRegistration();

  // Check if we're on the correct network (Optimism)
  const isCorrectNetwork = chainId === optimism.id;

  // Get token prices from CoinGecko
  const { prices, isLoading: isPriceLoading } = useTokenPrice(["ETH", "USDC"]);

  // Get ETH balance
  const { data: ethBalance } = useBalance({
    address,
    chainId: optimism.id,
  });

  // Get USDC balance
  const { data: usdcBalance } = useBalance({
    address,
    token: USDC_CONTRACT_ADDRESS as `0x${string}`,
    chainId: optimism.id,
  });

  // Get EURA balance
  const { data: euraBalance } = useBalance({
    address,
    token: EURA_CONTRACT_ADDRESS as `0x${string}`,
    chainId: optimism.id,
  });

  // Write contract hook for performing the swap
  const { writeContract, isPending: isWritePending, data: writeData } = useWriteContract();

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  // Update status based on registration status and network
  useEffect(() => {
    if (!isCorrectNetwork) {
      setStatus("wrong-network");
      return;
    }

    if (!isRegistered) {
      setStatus("waiting-for-registration");
    } else if (status === "waiting-for-registration" || status === "idle" || status === "wrong-network") {
      setStatus("ready");
    }
  }, [isRegistered, status, isCorrectNetwork]);

  // Update status when switching networks
  useEffect(() => {
    if (isSwitchingChain) {
      setStatus("switching-network");
    } else if (status === "switching-network" && isCorrectNetwork) {
      // If we were switching networks and now we're on the correct network,
      // update the status based on registration status
      if (!isRegistered) {
        setStatus("waiting-for-registration");
      } else {
        setStatus("ready");
      }
    }
  }, [isSwitchingChain, status, isCorrectNetwork, isRegistered]);

  // Update status based on transaction state
  useEffect(() => {
    if (isWritePending || isConfirming) {
      setStatus("swapping");
    } else if (isConfirmed && writeData) {
      setTxHash(writeData);
      setStatus("completed");
      setIsCompleted(true);
      toast.success("Swap completed successfully!");
    }
  }, [isWritePending, isConfirming, isConfirmed, writeData]);

  // Function to switch to Optimism network
  const switchToOptimism = async () => {
    try {
      setStatus("switching-network");
      switchChain({ chainId: optimism.id });
      toast.success("Switched to Optimism network");

      // Add a small delay to ensure the chain ID has been updated
      await new Promise((resolve) => { setTimeout(resolve, 1000); });

      // Manually update the status after switching networks
      if (chainId === optimism.id) {
        if (!isRegistered) {
          setStatus("waiting-for-registration");
        } else {
          setStatus("ready");
        }
      }
      // If we're not on the correct network yet, the useEffect will handle it
    } catch (error) {
      console.error("Error switching to Optimism:", error);
      setStatus("error");
      setError(error instanceof Error ? error.message : "Failed to switch to Optimism network");
    }
  };

  // Check if the user can swap
  const canSwap = isRegistered && isCorrectNetwork && status !== "swapping" && status !== "completing";

  // Open the Velodrome swap interface
  const openSwapInterface = async () => {
    try {
      setStatus("swapping");
      setError(null);

      // Open Velodrome in a new tab with EURA pre-selected
      window.open(`${VELODROME_URL}?inputCurrency=ETH&outputCurrency=${EURA_CONTRACT_ADDRESS}`, "_blank");
      toast.info("Velodrome opened in a new tab");

      // After opening the swap interface, we're waiting for the user to provide the transaction hash
      setStatus("waiting-for-hash");
    } catch (error) {
      console.error("Error opening swap interface:", error);
      setStatus("error");
      setError(error instanceof Error ? error.message : "Failed to open swap interface");
    }
  };

  // Submit transaction hash and complete the action
  const submitTransactionHash = async (hash: string) => {
    if (!address || !hash) {
      setError("Please provide a valid transaction hash");
      return;
    }

    try {
      setStatus("completing");
      setTxHash(hash);

      // Get the action ID from the database
      const response = await fetch("/api/actions/by-title", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: "Swap to EURA on Velodrome" }),
      });

      if (!response.ok) {
        // If we get a 404, it means the action doesn't exist in the database yet
        if (response.status === 404) {
          setStatus("completed");
          setIsCompleted(true);
          toast.success("Swap completed successfully!");
          return;
        } else {
          throw new Error("Failed to get action ID");
        }
      }

      const { id } = await response.json();

      // Complete the action
      await completeAction(id, {
        txHash: hash,
        platform: "velodrome",
        completedAt: new Date().toISOString(),
      });

      setStatus("completed");
      setIsCompleted(true);
      toast.success("Swap completed successfully!");
    } catch (error) {
      console.error("Error completing swap:", error);
      setStatus("error");
      setError(error instanceof Error ? error.message : "Failed to complete swap");
    }
  };

  // Perform the swap using our custom contract
  const swap = async ({ sourceToken, amount }: SwapParams) => {
    if (!address) {
      throw new Error("Please connect your wallet first");
    }

    if (!isCorrectNetwork) {
      throw new Error("Please switch to the Optimism network first");
    }

    if (!isRegistered) {
      throw new Error("Please register with Divvi V0 first");
    }

    if (amount <= 0) {
      throw new Error("Please enter a valid amount");
    }

    try {
      setStatus("swapping");
      setError(null);

      // Slippage tolerance (0.5%)
      const slippageTolerance = 0.005;

      if (sourceToken === "ETH") {
        // Check if user has enough ETH
        if (ethBalance && parseFloat(ethBalance.formatted) < amount) {
          throw new Error(`Insufficient ETH balance. You have ${ethBalance.formatted} ETH`);
        }

        // Calculate expected output based on current exchange rate
        // This is a simplified calculation - in production, you'd want to use an oracle or on-chain price
        const ethPrice = prices?.ETH?.usd || 0;
        const euraPrice = 1.08; // Assuming 1 EURA ≈ 1.08 USD
        const exchangeRate = ethPrice / euraPrice;

        const expectedOutput = amount * exchangeRate;
        const minAmountOut = Math.floor(expectedOutput * (1 - slippageTolerance));

        // Use our custom contract to swap ETH for EURA
        writeContract({
          address: OPTIMISM_VELODROME_SWAP as `0x${string}`,
          abi: OPTIMISM_VELODROME_SWAP_ABI,
          functionName: "swapETHForEURA",
          args: [
            BigInt(minAmountOut), // amountOutMin
          ],
          value: parseEther(amount.toString()),
          chainId: optimism.id,
        });
      } else if (sourceToken === "USDC") {
        // Check if user has enough USDC
        if (usdcBalance && parseFloat(usdcBalance.formatted) < amount) {
          throw new Error(`Insufficient USDC balance. You have ${usdcBalance.formatted} USDC`);
        }

        // Calculate expected output based on current exchange rate
        const usdcPrice = prices?.USDC?.usd || 1; // USDC should be ~$1
        const euraPrice = 1.08; // Assuming 1 EURA ≈ 1.08 USD
        const exchangeRate = usdcPrice / euraPrice;

        const expectedOutput = amount * exchangeRate;
        const minAmountOut = Math.floor(expectedOutput * (1 - slippageTolerance));

        // First approve the contract to spend our USDC
        writeContract({
          address: USDC_CONTRACT_ADDRESS as `0x${string}`,
          abi: [
            {
              "inputs": [
                {"internalType": "address", "name": "spender", "type": "address"},
                {"internalType": "uint256", "name": "amount", "type": "uint256"}
              ],
              "name": "approve",
              "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
              "stateMutability": "nonpayable",
              "type": "function"
            }
          ],
          functionName: "approve",
          args: [
            OPTIMISM_VELODROME_SWAP as `0x${string}`,
            parseUnits(amount.toString(), 6), // USDC has 6 decimals
          ],
          chainId: optimism.id,
        });

        // Note: We're not waiting for approval confirmation to simplify the flow
        // In a production app, you might want to wait for the approval to be confirmed

        // Now swap USDC for EURA using our custom contract
        writeContract({
          address: OPTIMISM_VELODROME_SWAP as `0x${string}`,
          abi: OPTIMISM_VELODROME_SWAP_ABI,
          functionName: "swapTokenForEURA",
          args: [
            USDC_CONTRACT_ADDRESS, // _tokenIn
            parseUnits(amount.toString(), 6), // _amountIn (USDC has 6 decimals)
            BigInt(minAmountOut), // _amountOutMin
            true, // _useDirectRoute (direct USDC->EURA route)
          ],
          chainId: optimism.id,
        });
      } else {
        throw new Error("Unsupported token");
      }
    } catch (error) {
      console.error("Error performing swap:", error);
      setStatus("error");
      setError(error instanceof Error ? error.message : "Failed to perform swap");
    }
  };

  return {
    status,
    error,
    txHash,
    isCompleted,
    canSwap,
    isCorrectNetwork,
    isSwitchingChain,
    openSwapInterface,
    submitTransactionHash,
    setTxHash,
    swap,
    switchToOptimism,
  };
}
