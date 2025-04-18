"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

interface CeloConfirmCardCompactProps {
  amount: number | null;
  onComplete?: () => void;
}

export function CeloConfirmCardCompact({
  amount,
  onComplete,
}: CeloConfirmCardCompactProps) {
  const { address } = useAccount();
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    status,
    error,
    txHash,
    isCompleted,
    isApproved,
    swap,
    isCorrectNetwork,
    switchToCelo,
    isSwitchingChain,
  } = useCeloSwap();

  // Get real-time exchange rates from CoinGecko
  const { prices } = useTokenPrice(["CELO", "USDC"]);

  // Calculate exchange rate based on CoinGecko prices
  // Fallback rate: 1 CELO = $0.29
  let exchangeRate = 0.29;

  if (prices && prices.CELO && prices.USDC) {
    // 1 CELO = x cUSD (where cUSD is pegged to USD)
    exchangeRate = prices.CELO.usd / prices.USDC.usd;
  }

  const estimatedOutput = (amount || 0) * exchangeRate;

  // Determine if we're in a loading state
  const isLoading =
    [
      "swapping",
      "transaction-pending",
      "transaction-submitted",
      "transaction-confirming",
    ].includes(status) || isSwitchingChain;

  // Call onComplete when the swap is completed
  useEffect(() => {
    if (isCompleted && onComplete) {
      onComplete();
    }
  }, [isCompleted, onComplete]);

  const handleConfirmSwap = async () => {
    try {
      if (!address) {
        toast.error("Please connect your wallet first");
        return;
      }

      if (!amount || amount <= 0) {
        toast.error("Please set an amount in the previous step");
        return;
      }

      if (!isApproved) {
        toast.error("Please approve CELO tokens in the previous step");
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

      // Call the swap function from the hook
      // This will trigger the swap since we're already approved
      swap({
        amount: amount,
      });
    } catch (error) {
      console.error("Error confirming swap:", error);
      toast.error("Failed to confirm swap");
    }
  };

  // If no amount is set, show a message
  if (!amount && !isCompleted) {
    return (
      <Card className="w-full overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex flex-col">
                <span className="text-sm font-medium">Confirm & Swap</span>
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Please complete the previous step to set the amount first.
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden">
      <div className="p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex flex-col">
                {isCompleted ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Swap Completed</span>
                  </div>
                ) : (
                  <span className="text-sm font-medium">Confirm & Swap</span>
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

          {/* Show success details even when collapsed */}
          {isCompleted && (
            <div className="flex flex-col gap-1">
              <div className="text-sm text-gray-600">
                Successfully swapped {amount} CELO for approximately{" "}
                {estimatedOutput.toFixed(2)} cUSD
              </div>
              {txHash && (
                <div className="flex items-center text-xs">
                  <a
                    href={`https://celoscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:underline text-blue-600"
                  >
                    View transaction
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {(isExpanded || !isCompleted) && (
          <div className="mt-4">
            {!isCompleted ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Confirm Swap</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Amount:</span>
                      <span className="text-sm font-medium">{amount} CELO</span>
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

                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleConfirmSwap}
                    disabled={!isCorrectNetwork || isLoading || !isApproved}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Swapping...
                      </>
                    ) : (
                      "Confirm Swap"
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  Additional details about your swap are shown above.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
