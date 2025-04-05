"use client";

import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { toast } from "sonner";

export function useTransaction() {
  const { data: hash, sendTransaction, isPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const send = async (to: string, value: string) => {
    try {
      await sendTransaction({
        to,
        value: parseEther(value),
      });
      toast.success("Transaction sent!");
    } catch (error) {
      console.error("Transaction failed:", error);
      toast.error("Transaction failed");
    }
  };

  return {
    send,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    // Helper function to get transaction status
    getStatus: () => {
      if (!hash) return "idle";
      if (isPending) return "pending";
      if (isConfirming) return "confirming";
      if (isSuccess) return "success";
      return "error";
    },
  };
}
