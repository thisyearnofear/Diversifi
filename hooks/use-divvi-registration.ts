"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from "wagmi";
import { base, celo } from "wagmi/chains";
import { stringToHex } from "viem";
import { toast } from "sonner";
import { useActions } from "@/hooks/use-actions";
import { parseContractError } from "@/lib/utils/error-helpers";

// Divvi V0 Registry Contract on Base
const REGISTRY_CONTRACT_ADDRESS = "0xBa9655677f4E42DD289F5b7888170bC0c7dA8Cdc";
const REFERRER_ID = "papa";

// Full Registry Contract ABI
const registryContractAbi = [{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint48","name":"transferDelay","type":"uint48"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"AccessControlBadConfirmation","type":"error"},{"inputs":[{"internalType":"uint48","name":"schedule","type":"uint48"}],"name":"AccessControlEnforcedDefaultAdminDelay","type":"error"},{"inputs":[],"name":"AccessControlEnforcedDefaultAdminRules","type":"error"},{"inputs":[{"internalType":"address","name":"defaultAdmin","type":"address"}],"name":"AccessControlInvalidDefaultAdmin","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"bytes32","name":"neededRole","type":"bytes32"}],"name":"AccessControlUnauthorizedAccount","type":"error"},{"inputs":[{"internalType":"bytes32","name":"protocolId","type":"bytes32"},{"internalType":"bytes32","name":"referrerId","type":"bytes32"}],"name":"ReferrerNotRegistered","type":"error"},{"inputs":[{"internalType":"uint8","name":"bits","type":"uint8"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"SafeCastOverflowedUintDowncast","type":"error"},{"inputs":[{"internalType":"bytes32","name":"protocolId","type":"bytes32"},{"internalType":"bytes32","name":"referrerId","type":"bytes32"},{"internalType":"address","name":"userAddress","type":"address"}],"name":"UserAlreadyRegistered","type":"error"},{"anonymous":false,"inputs":[],"name":"DefaultAdminDelayChangeCanceled","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint48","name":"newDelay","type":"uint48"},{"indexed":false,"internalType":"uint48","name":"effectSchedule","type":"uint48"}],"name":"DefaultAdminDelayChangeScheduled","type":"event"},{"anonymous":false,"inputs":[],"name":"DefaultAdminTransferCanceled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newAdmin","type":"address"},{"indexed":false,"internalType":"uint48","name":"acceptSchedule","type":"uint48"}],"name":"DefaultAdminTransferScheduled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"protocolId","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"referrerId","type":"bytes32"},{"indexed":true,"internalType":"address","name":"userAddress","type":"address"}],"name":"ReferralRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"referrerId","type":"bytes32"},{"indexed":false,"internalType":"bytes32[]","name":"protocolIds","type":"bytes32[]"},{"indexed":false,"internalType":"uint256[]","name":"rewardRates","type":"uint256[]"},{"indexed":false,"internalType":"address","name":"rewardAddress","type":"address"}],"name":"ReferrerRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"previousAdminRole","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"newAdminRole","type":"bytes32"}],"name":"RoleAdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleGranted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleRevoked","type":"event"},{"inputs":[],"name":"DEFAULT_ADMIN_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"acceptDefaultAdminTransfer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newAdmin","type":"address"}],"name":"beginDefaultAdminTransfer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"cancelDefaultAdminTransfer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint48","name":"newDelay","type":"uint48"}],"name":"changeDefaultAdminDelay","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"defaultAdmin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"defaultAdminDelay","outputs":[{"internalType":"uint48","name":"","type":"uint48"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"defaultAdminDelayIncreaseWait","outputs":[{"internalType":"uint48","name":"","type":"uint48"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"providerId","type":"bytes32"}],"name":"getProtocols","outputs":[{"internalType":"bytes32[]","name":"","type":"bytes32[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"protocolId","type":"bytes32"}],"name":"getReferrers","outputs":[{"internalType":"bytes32[]","name":"","type":"bytes32[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"referrerId","type":"bytes32"}],"name":"getRewardAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"protocolId","type":"bytes32"},{"internalType":"bytes32","name":"referrerId","type":"bytes32"}],"name":"getRewardRate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"}],"name":"getRoleAdmin","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"protocolId","type":"bytes32"},{"internalType":"bytes32","name":"referrerId","type":"bytes32"}],"name":"getUsers","outputs":[{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"grantRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"hasRole","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddress","type":"address"},{"internalType":"bytes32[]","name":"protocolIds","type":"bytes32[]"}],"name":"isUserRegistered","outputs":[{"internalType":"bool[]","name":"","type":"bool[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pendingDefaultAdmin","outputs":[{"internalType":"address","name":"newAdmin","type":"address"},{"internalType":"uint48","name":"schedule","type":"uint48"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pendingDefaultAdminDelay","outputs":[{"internalType":"uint48","name":"newDelay","type":"uint48"},{"internalType":"uint48","name":"schedule","type":"uint48"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"referrerId","type":"bytes32"},{"internalType":"bytes32[]","name":"protocolIds","type":"bytes32[]"}],"name":"registerReferrals","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"referrerId","type":"bytes32"},{"internalType":"bytes32[]","name":"protocolIds","type":"bytes32[]"},{"internalType":"uint256[]","name":"rewardRates","type":"uint256[]"},{"internalType":"address","name":"rewardAddress","type":"address"}],"name":"registerReferrer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"renounceRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"revokeRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"rollbackDefaultAdminDelay","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}] as const;

export type DivviRegistrationStatus =
  | "idle"
  | "checking"
  | "already-registered"
  | "not-registered"
  | "registering"
  | "transaction-pending"
  | "transaction-confirming"
  | "transaction-success"
  | "transaction-failed"
  | "completing"
  | "completed"
  | "error";

export function useDivviRegistration(chainName: string = "aerodrome") {
  // Determine which chain to use based on the chainName parameter
  const targetChain = chainName === "celo" ? celo : base;
  const targetChainId = targetChain.id;

  // Get current chain ID
  const currentChainId = useChainId();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  // Check if we're on the correct network
  const isCorrectNetwork = currentChainId === targetChainId;
  const { address } = useAccount();
  const [status, setStatus] = useState<DivviRegistrationStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  // We'll use hasAttemptedCompletion instead of isCompleted
  const { completeAction } = useActions();

  // Check if user is registered with the protocol
  const { data: registrationStatus, refetch: refetchRegistrationStatus, isLoading: isCheckingRegistration } = useReadContract({
    address: REGISTRY_CONTRACT_ADDRESS,
    abi: registryContractAbi,
    functionName: "isUserRegistered",
    args: address ? [address, [stringToHex(chainName, { size: 32 })]] : undefined,
    chainId: targetChainId,
  });

  // Function to switch to the correct network
  const switchToCorrectNetwork = async () => {
    if (!isCorrectNetwork && address) {
      try {
        setStatus("checking");
        setError(null);
        await switchChain({ chainId: targetChainId });
        return true;
      } catch (error) {
        console.error("Error switching network:", error);
        setError(parseContractError(error));
        setStatus("error");
        return false;
      }
    }
    return isCorrectNetwork; // Already on correct network
  };

  // Register user with Divvi Protocol
  const { writeContract, data: writeData, isPending: isWritePending, isError: isWriteError, error: writeError } = useWriteContract();

  // Track transaction status
  const { isLoading: isConfirming, isSuccess: isConfirmed, isError: isConfirmError } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  // Update status based on registration check
  useEffect(() => {
    if (isCheckingRegistration) {
      setStatus("checking");
      return;
    }

    if (registrationStatus?.[0]) {
      setStatus("already-registered");
      console.log("User is already registered with Divvi V0 for Aerodrome");
      // We'll handle completion in a separate effect
    } else if (registrationStatus !== undefined) {
      setStatus("not-registered");
      console.log("User is not registered with Divvi V0 for Aerodrome");
    }
  }, [registrationStatus, isCheckingRegistration]);

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

  // Update status based on transaction state
  useEffect(() => {
    if (isWritePending) {
      setStatus("transaction-pending");
    } else if (isConfirming && writeData) {
      setStatus("transaction-confirming");
      setTxHash(writeData);
    } else if (isConfirmed && writeData) {
      setStatus("transaction-success");
      setTxHash(writeData);
      // Refetch registration status after transaction is confirmed
      setTimeout(() => {
        refetchRegistrationStatus();
      }, 2000);
    } else if ((isWriteError || isConfirmError) && writeError) {
      setStatus("transaction-failed");

      // Use the error parser to get a user-friendly message
      setError(parseContractError(writeError));
    }
  }, [isWritePending, isConfirming, isConfirmed, isWriteError, isConfirmError, writeData, writeError]);

  // Register with Divvi V0
  const register = async () => {
    if (!address) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      setStatus("registering");
      setError(null);

      // First, check if we're on the correct network
      const networkSwitched = await switchToCorrectNetwork();
      if (!networkSwitched) {
        toast.error(`Please switch to the ${chainName === "celo" ? "Celo" : "Base"} network first`);
        return;
      }

      console.log("Checking if user is already registered...");
      // First check if the user is already registered
      const isRegisteredResult = await refetchRegistrationStatus();

      console.log("Registration check result:", isRegisteredResult.data);

      // If already registered, update status and return early
      if (isRegisteredResult.data?.[0]) {
        console.log("User is already registered with Aerodrome");
        setStatus("already-registered");
        return;
      }

      console.log("User is not registered, proceeding with registration");
      console.log("Using referrer ID:", REFERRER_ID);

      // Format the arguments correctly
      const referrerIdHex = stringToHex(REFERRER_ID, { size: 32 });
      const protocolsToRegister = [stringToHex(chainName, { size: 32 })];

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
        chainId: targetChainId,
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
        // Determine the action title based on the chain
        const actionTitle = chainName === "celo" ? "Register on Celo" : "Register on Stable Station";

        const response = await fetch("/api/actions/by-title", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: actionTitle }),
        });

        if (!response.ok) {
          console.error("Failed to get action ID:", await response.text());
          // If we get a 404, it means the action doesn't exist in the database yet
          // We'll handle this gracefully by marking the action as completed anyway
          if (response.status === 404) {
            setStatus("completed");
            const platform = chainName === "celo" ? "Celo" : "Stable Station";
            toast.success(`Registration on ${platform} completed!`);
            return;
          } else {
            throw new Error("Failed to get action ID");
          }
        }

        const { id } = await response.json();

        // Complete the action
        await completeAction(id, {
          txHash: txHash || "already-registered",
          platform: "divvi",
          completedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error completing registration:", error);
        // Even if there's an error with the database, we'll still mark it as completed
        // This ensures the user can proceed to the next step
        setStatus("completed");
        toast.success("Registration on Stable Station completed!");
        return;
      }

      setStatus("completed");
      const platform = chainName === "celo" ? "Celo" : "Stable Station";
      toast.success(`Registration on ${platform} completed!`);
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
    isRegistered: status === "already-registered" || status === "completed",
    isCorrectNetwork,
    isSwitchingChain,
    switchToCorrectNetwork,
    register,
    completeRegistration,
  };
}
