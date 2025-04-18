"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from "wagmi";
import { optimism } from "wagmi/chains";
import { stringToHex } from "viem";
import { toast } from "sonner";
import { useActions } from "@/hooks/use-actions";
import { parseContractError } from "@/lib/utils/error-helpers";

// Divvi V0 Registry Contract on Optimism
const REGISTRY_CONTRACT_ADDRESS = "0xBa9655677f4E42DD289F5b7888170bC0c7dA8Cdc";
const REFERRER_ID = "papa";

// Registry Contract ABI
const registryContractAbi = [
  {
    "inputs": [
      {"internalType": "address", "name": "userAddress", "type": "address"},
      {"internalType": "bytes32[]", "name": "protocolIds", "type": "bytes32[]"}
    ],
    "name": "isUserRegistered",
    "outputs": [{"internalType": "bool[]", "name": "", "type": "bool[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "bytes32", "name": "referrerId", "type": "bytes32"},
      {"internalType": "bytes32[]", "name": "protocolIds", "type": "bytes32[]"}
    ],
    "name": "registerReferrals",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Status type for the registration process
export type DivviRegistrationStatus =
  | "idle"
  | "checking"
  | "not-registered"
  | "registering"
  | "transaction-pending"
  | "transaction-confirming"
  | "transaction-success"
  | "transaction-failed"
  | "already-registered"
  | "completing"
  | "completed"
  | "wrong-network"
  | "switching-network"
  | "error";

export function useOptimismDivviRegistration() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const [status, setStatus] = useState<DivviRegistrationStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const { completeAction } = useActions();

  // Check if we're on the correct network (Optimism)
  const isCorrectNetwork = chainId === optimism.id;

  // Check if user is registered with Velodrome protocol
  const { data: registrationStatus, refetch: refetchRegistrationStatus, isLoading: isCheckingRegistration } = useReadContract({
    address: REGISTRY_CONTRACT_ADDRESS,
    abi: registryContractAbi,
    functionName: "isUserRegistered",
    args: address ? [address, [stringToHex("velodrome", { size: 32 })]] : undefined,
    chainId: optimism.id,
  });

  // Register user with Divvi Protocol
  const { writeContract, data: writeData, isPending: isWritePending, isError: isWriteError, error: writeError } = useWriteContract();

  // Track transaction status
  const { isLoading: isConfirming, isSuccess: isConfirmed, isError: isConfirmError } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  // Update local state when registration status changes or network changes
  useEffect(() => {
    if (!isCorrectNetwork) {
      setStatus("wrong-network");
      return;
    }

    if (isCheckingRegistration) {
      setStatus("checking");
    } else if (registrationStatus && (registrationStatus as unknown as boolean[])?.[0]) {
      setIsRegistered(true);
      setStatus("already-registered");
    } else if (status === "idle" || status === "checking" || status === "wrong-network") {
      setStatus("not-registered");
    }
  }, [registrationStatus, isCheckingRegistration, status, isCorrectNetwork]);

  // Update status when switching networks
  useEffect(() => {
    if (isSwitchingChain) {
      setStatus("switching-network");
    } else if (status === "switching-network" && isCorrectNetwork) {
      // If we were switching networks and now we're on the correct network,
      // update the status to not-registered or already-registered
      if (registrationStatus && (registrationStatus as unknown as boolean[])?.[0]) {
        setIsRegistered(true);
        setStatus("already-registered");
      } else {
        setStatus("not-registered");
      }
    }
  }, [isSwitchingChain, status, isCorrectNetwork, registrationStatus]);

  // Update status based on transaction state
  useEffect(() => {
    if (isWritePending) {
      setStatus("transaction-pending");
    } else if (isConfirming) {
      setStatus("transaction-confirming");
    } else if (isConfirmed && writeData) {
      setTxHash(writeData);
      setStatus("transaction-success");
      // Refetch registration status after transaction is confirmed
      refetchRegistrationStatus();
    } else if ((isWriteError || isConfirmError) && writeError) {
      setStatus("transaction-failed");
      setError(parseContractError(writeError));
    }
  }, [isWritePending, isConfirming, isConfirmed, isWriteError, isConfirmError, writeData, writeError, refetchRegistrationStatus]);

  // Handle completion when user is already registered
  const [hasAttemptedCompletion, setHasAttemptedCompletion] = useState(false);

  useEffect(() => {
    // Only run this effect when the user is already registered and we haven't attempted completion yet
    if (status === "already-registered" && !hasAttemptedCompletion && !txHash) {
      // Mark that we've attempted completion to prevent infinite loops
      setHasAttemptedCompletion(true);
      // Use setTimeout to avoid calling during render
      setTimeout(() => {
        completeRegistration();
      }, 0);
    }
  }, [status, hasAttemptedCompletion, txHash]);

  // Function to switch to Optimism network
  const switchToOptimism = async () => {
    try {
      setStatus("switching-network");
      switchChain({ chainId: optimism.id });
      toast.success("Switched to Optimism network");

      // Add a small delay to ensure the chain ID has been updated
      await new Promise((resolve) => { setTimeout(resolve, 1000); });

      // Force a refetch of the registration status after switching networks
      if (chainId === optimism.id) {
        await refetchRegistrationStatus();

        // Update the status based on the registration status
        if (registrationStatus && (registrationStatus as unknown as boolean[])?.[0]) {
          setIsRegistered(true);
          setStatus("already-registered");
        } else {
          setStatus("not-registered");
        }
      }
      // If we're not on the correct network yet, the useEffect will handle it
    } catch (error) {
      console.error("Error switching to Optimism:", error);
      setStatus("error");
      setError(parseContractError(error));
    }
  };

  // Register with Divvi V0
  const register = async () => {
    if (!address) {
      setError("Please connect your wallet first");
      return;
    }

    if (!isCorrectNetwork) {
      setError("Please switch to the Optimism network first");
      return;
    }

    try {
      setStatus("registering");
      setError(null);

      console.log("Checking if user is already registered...");
      // First check if the user is already registered
      const isRegisteredResult = await refetchRegistrationStatus();

      console.log("Registration check result:", isRegisteredResult.data);

      // If already registered, update status and return early
      if (isRegisteredResult.data && (isRegisteredResult.data as unknown as boolean[])?.[0]) {
        console.log("User is already registered with Velodrome");
        setStatus("already-registered");
        return;
      }

      console.log("User is not registered, proceeding with registration");
      console.log("Using referrer ID:", REFERRER_ID);

      // Format the arguments correctly
      const referrerIdHex = stringToHex(REFERRER_ID, { size: 32 });
      const protocolsToRegister = [stringToHex("velodrome", { size: 32 })];

      console.log("Referrer ID hex:", referrerIdHex);
      console.log("Protocols to register:", protocolsToRegister);

      // If not registered, proceed with registration
      writeContract({
        address: REGISTRY_CONTRACT_ADDRESS,
        abi: registryContractAbi,
        functionName: "registerReferrals",
        args: [
          referrerIdHex,
          protocolsToRegister,
        ],
        chainId: optimism.id,
      });

      console.log("Registration transaction submitted");
    } catch (error) {
      console.error("Error registering with Divvi V0:", error);
      setStatus("error");
      setError(parseContractError(error));
    }
  };

  // Complete the registration action in the database
  const completeRegistration = async () => {
    if (!address) return;

    try {
      setStatus("completing");

      try {
        // Get the action ID from the database
        const response = await fetch("/api/actions/by-title", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: "Register on Optimism" }),
        });

        if (!response.ok) {
          // If we get a 404, it means the action doesn't exist in the database yet
          // We'll handle this gracefully by marking the action as completed anyway
          if (response.status === 404) {
            // Log a more informative message at debug level
            console.debug("Action 'Register on Optimism' not found in database, marking as completed anyway");
            setStatus("completed");
            toast.success("Registration on Optimism completed!");
            return;
          } else {
            // Only log as error for non-404 responses
            console.error("Failed to get action ID:", await response.text());
            throw new Error("Failed to get action ID");
          }
        }

        const { id } = await response.json();

        // Complete the action
        await completeAction(id, {
          txHash: txHash || "already-registered",
          platform: "divvi-optimism",
          completedAt: new Date().toISOString(),
        });
      } catch (error) {
        // Log at debug level instead of error since we're handling it gracefully
        console.debug("Non-critical error completing registration:", error);
        // Even if there's an error with the database, we'll still mark it as completed
        // This ensures the user can proceed to the next step
        setStatus("completed");
        toast.success("Registration on Optimism completed!");
        return;
      }

      setStatus("completed");
      toast.success("Registration on Optimism completed!");
    } catch (error) {
      console.error("Error completing registration:", error);
      setStatus("error");
      setError(parseContractError(error));
    }
  };

  return {
    status,
    error,
    txHash,
    isRegistered,
    isCorrectNetwork,
    isSwitchingChain,
    register,
    completeRegistration,
    switchToOptimism,
  };
}
