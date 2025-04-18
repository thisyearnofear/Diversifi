"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  CheckCircle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { useCeloSwap } from "@/hooks/use-celo-swap";
import { useTokenPrice } from "@/hooks/use-token-price";

interface CeloApproveCardCompactProps {
  onComplete?: (amount: number) => void;
}

export function CeloApproveCardCompact({
  onComplete,
}: CeloApproveCardCompactProps) {
  const { address } = useAccount();
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    status,
    error,
    txHash,
    isApproved,
    approvalAmount,
    swap,
    isCorrectNetwork,
    switchToCelo,
    isSwitchingChain,
  } = useCeloSwap();

  // State for the swap form
  const [amount, setAmount] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);

  // Get real-time exchange rates from CoinGecko
  const { prices } = useTokenPrice(["CELO", "USDC"]);

  // Calculate exchange rate based on CoinGecko prices
  // Fallback rate: 1 CELO = $0.29
  let exchangeRate = 0.29;

  if (prices && prices.CELO && prices.USDC) {
    // 1 CELO = x cUSD (where cUSD is pegged to USD)
    exchangeRate = prices.CELO.usd / prices.USDC.usd;
  }

  const estimatedOutput = parseFloat(amount || "0") * exchangeRate;

  // Determine if we're in a loading state
  const isLoading =
    [
      "approving",
      "transaction-pending",
      "transaction-submitted",
      "transaction-confirming",
    ].includes(status) || isSwitchingChain;

  // Determine if the approval is completed
  const isApprovalCompleted =
    isApproved || status === "approved" || status === "completed";

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) || value === "") {
      setAmount(value);
    }
  };

  const handleReview = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setIsReviewing(true);
  };

  const handleBack = () => {
    setIsReviewing(false);
  };

  const handleApprove = async () => {
    try {
      if (!address) {
        toast.error("Please connect your wallet first");
        return;
      }

      // Double-check network before proceeding
      if (!isCorrectNetwork) {
        toast.info("Switching to Celo network...");
        await switchToCelo();

        // Add a small delay to ensure the chain ID has been updated
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Verify the switch was successful
        if (!isCorrectNetwork) {
          toast.error("Please switch to the Celo network to continue");
          return;
        }
      }

      if (!amount || parseFloat(amount) <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      // Call the swap function from the hook
      // This will trigger the approval flow since we're not approved yet
      swap({
        amount: parseFloat(amount),
      });
    } catch (error) {
      console.error("Error approving:", error);
      toast.error("Failed to approve CELO tokens");
    }
  };

  // When approval is completed, call onComplete with the amount
  if (isApprovalCompleted && onComplete && amount) {
    onComplete(parseFloat(amount));
  }

  return (
    <Card className="w-full overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex flex-col">
              {isApprovalCompleted ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Approved</span>
                </div>
              ) : (
                <span className="text-sm font-medium">
                  Set Amount & Approve CELO
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {(isExpanded || !isApprovalCompleted) && (
          <div className="mt-4">
            {!isApprovalCompleted ? (
              <>
                {!isReviewing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="amount"
                        className="block text-sm font-medium"
                      >
                        Amount of CELO to swap
                      </label>
                      <Input
                        id="amount"
                        placeholder="0.0"
                        value={amount}
                        onChange={handleAmountChange}
                        disabled={isLoading}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          Estimated output: {estimatedOutput.toFixed(2)} cUSD
                        </span>
                        <span className="text-sm">
                          1 CELO ≈ {exchangeRate.toFixed(2)} cUSD
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <span>
                          Rate: 1 CELO ≈ ${exchangeRate.toFixed(2)} ($
                          {(exchangeRate * 100).toFixed(0)}¢)
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Info className="h-3 w-3 mr-1" />
                        <span>
                          A small 0.25% fee is applied to support development
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-amber-600 mt-1">
                        <Info className="h-3 w-3 mr-1" />
                        <span>
                          This requires two transactions: first approve, then
                          swap
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsExpanded(false)}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleReview}
                        disabled={!amount || isLoading}
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium">Review Approval</h3>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Amount:</span>
                          <span className="text-sm font-medium">
                            {amount} CELO
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            Estimated output:
                          </span>
                          <span className="text-sm font-medium">
                            {estimatedOutput.toFixed(2)} cUSD
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            Exchange rate:
                          </span>
                          <span className="text-sm font-medium">
                            1 CELO ≈ {exchangeRate.toFixed(2)} cUSD
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Fee:</span>
                          <span className="text-sm font-medium">0.25%</span>
                        </div>
                      </div>
                    </div>

                    {!isCorrectNetwork && (
                      <div className="bg-amber-50 p-2 rounded-md">
                        <div className="flex items-center text-amber-600 text-sm">
                          <Info className="h-4 w-4 mr-1" />
                          <span>
                            You need to switch to the Celo network to proceed.
                          </span>
                        </div>
                        <Button
                          size="sm"
                          className="mt-2 w-full"
                          onClick={switchToCelo}
                          disabled={isSwitchingChain}
                        >
                          {isSwitchingChain ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Switching...
                            </>
                          ) : (
                            "Switch to Celo"
                          )}
                        </Button>
                      </div>
                    )}

                    {error && (
                      <div className="bg-red-50 p-2 rounded-md">
                        <div className="text-red-600 text-sm">{error}</div>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBack}
                        disabled={isLoading}
                      >
                        Back
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleApprove}
                        disabled={!isCorrectNetwork || isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Approving...
                          </>
                        ) : (
                          "Approve"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">
                    Approved {amount} CELO for swapping
                  </span>
                </div>
                {txHash && (
                  <div className="flex items-center text-xs text-gray-500">
                    <a
                      href={`https://celoscan.io/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center hover:underline"
                    >
                      View transaction
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                )}
                <div className="text-sm text-gray-500">
                  Proceed to the next step to complete the swap.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
