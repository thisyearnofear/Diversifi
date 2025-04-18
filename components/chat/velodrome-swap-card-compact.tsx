"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Loader2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle,
  Info,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVelodromeSwap } from "@/hooks/use-velodrome-swap";
import { useOptimismDivviRegistration } from "@/hooks/use-optimism-divvi-registration";
import { useTokenPrice } from "@/hooks/use-token-price";
import { toast } from "sonner";

interface VelodromeSwapCardCompactProps {
  onComplete?: () => void;
}

export function VelodromeSwapCardCompact({
  onComplete,
}: VelodromeSwapCardCompactProps) {
  const { address } = useAccount();
  const [isExpanded, setIsExpanded] = useState(false);
  const { isRegistered } = useOptimismDivviRegistration();
  const {
    status,
    error,
    txHash,
    isCompleted,
    canSwap,
    isCorrectNetwork,
    isSwitchingChain,
    swap,
    switchToOptimism,
  } = useVelodromeSwap();

  // State for the swap form
  const [sourceToken, setSourceToken] = useState("ETH");
  const [amount, setAmount] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);

  // Get real-time exchange rates from CoinGecko with Moralis fallback
  const {
    prices,
    isLoading: isPriceLoading,
    error: priceError,
    source: priceSource,
  } = useTokenPrice(["ETH", "USDC", "EURA"], "usd", "0xa"); // 0xa is Optimism

  // Update expanded state when registration status changes
  useEffect(() => {
    if (isRegistered) {
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
    }
  }, [isRegistered]);

  // Calculate estimated EURA output
  const calculateEstimatedOutput = () => {
    if (!amount || parseFloat(amount) <= 0) return "0";

    try {
      const inputAmount = parseFloat(amount);
      let estimatedOutput = 0;

      // Get the EURA price from the API or use fallback
      const euraPrice = prices?.EURA?.usd || 1.08; // Default to 1.08 USD if not available

      if (sourceToken === "ETH") {
        const ethPrice = prices?.ETH?.usd || 0;
        if (ethPrice === 0) return "Price unavailable";
        estimatedOutput = (inputAmount * ethPrice) / euraPrice;
      } else if (sourceToken === "USDC") {
        const usdcPrice = prices?.USDC?.usd || 1; // USDC should be ~$1
        estimatedOutput = (inputAmount * usdcPrice) / euraPrice;
      }

      // Apply 0.25% platform fee
      estimatedOutput = estimatedOutput * 0.9975;

      return estimatedOutput.toFixed(2);
    } catch (error) {
      console.error("Error calculating estimated output:", error);
      return "Error";
    }
  };

  // Determine if we're in a loading state
  const isLoading = ["swapping", "completing", "switching-network"].includes(
    status
  );

  // Handle the swap
  const handleSwap = async () => {
    try {
      if (!address) {
        toast.error("Please connect your wallet first");
        return;
      }

      // Double-check network before proceeding
      if (!isCorrectNetwork) {
        toast.info("Switching to Optimism network...");
        await switchToOptimism();

        // Verify the switch was successful
        if (!isCorrectNetwork) {
          toast.error("Please switch to the Optimism network to continue");
          return;
        }
      }

      if (!amount || parseFloat(amount) <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      // Call the swap function from the hook
      await swap({
        sourceToken,
        amount: parseFloat(amount),
      });

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Error performing swap:", error);
      toast.error("Failed to perform swap");
    }
  };

  // If the swap is completed, show a success message
  if (isCompleted) {
    return (
      <Card className="p-4 border-purple-200 bg-purple-50 dark:bg-purple-900/20">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-purple-600" />
          <div>
            <h3 className="font-medium">Swap Complete ✓</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You've successfully swapped for EURA on Optimism!
            </p>
            {txHash && (
              <a
                href={`https://optimistic.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 flex items-center mt-1 hover:underline"
              >
                View transaction
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-purple-200">
      <div className="p-4 bg-purple-50 dark:bg-purple-900/20">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {/* Status indicator icon */}
              {isRegistered ? (
                status === "swapping" ||
                status === "completing" ||
                status === "switching-network" ? (
                  <Loader2 className="h-5 w-5 text-purple-500 animate-spin" />
                ) : (
                  <div className="h-5 w-5 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                    2
                  </div>
                )
              ) : (
                <div className="h-5 w-5 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
                  2
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Swap to EURA</h3>
                <Badge
                  variant="outline"
                  className="text-xs bg-purple-100 dark:bg-purple-900 border-purple-200"
                >
                  Step 2 of 2
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Get Euro-backed stablecoins on Optimism
              </p>
              {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
              {!isRegistered && (
                <p className="text-xs text-amber-600 mt-1">
                  Complete registration in Step 1 to unlock this step
                </p>
              )}
              {isRegistered && status === "wrong-network" && (
                <p className="text-xs text-amber-600 mt-1">
                  You need to switch to the Optimism network to continue
                </p>
              )}
              {status === "switching-network" && (
                <p className="text-xs text-amber-600 mt-1">
                  Switching to Optimism network...
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full"
            onClick={() => setIsExpanded(!isExpanded)}
            disabled={!isRegistered}
          >
            {isExpanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">About EURA:</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                EURA is an all-weather, multi-audited stablecoin able to
                withstand adverse market conditions. It is backed by secured
                debt and Euro stable assets.
              </p>
              <div className="flex items-center text-xs text-blue-600">
                <a
                  href="https://www.angle.money/eura"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:underline"
                >
                  Learn about EURA
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </div>
            </div>

            {status === "wrong-network" ? (
              <div className="space-y-3">
                <Button
                  onClick={switchToOptimism}
                  disabled={isLoading}
                  size="sm"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Switching Network...
                    </>
                  ) : (
                    "Switch to Optimism Network"
                  )}
                </Button>
              </div>
            ) : !isReviewing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium">From</label>
                  <div className="flex gap-2 mt-1">
                    <Select value={sourceToken} onValueChange={setSourceToken}>
                      <SelectTrigger className="w-1/3 h-8 text-xs">
                        <SelectValue placeholder="Select token" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ETH">ETH</SelectItem>
                        <SelectItem value="USDC">USDC</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Amount"
                      className="flex-1 h-8 text-xs"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                </div>

                {/* Display price source */}
                <div className="mt-1">
                  <p className="text-xs text-gray-500">
                    Price source:{" "}
                    {priceSource === "coingecko"
                      ? "CoinGecko"
                      : priceSource === "moralis"
                      ? "Moralis"
                      : "Fallback"}
                    {isPriceLoading && (
                      <span className="ml-1">
                        <Loader2 className="inline h-3 w-3 animate-spin" />
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <div className="flex justify-between">
                    <label className="text-xs font-medium">
                      Estimated EURA
                    </label>
                    <span className="text-xs text-gray-500">
                      {isPriceLoading
                        ? "Loading..."
                        : calculateEstimatedOutput()}
                    </span>
                  </div>
                  <div className="flex items-center mt-1 text-xs text-amber-600">
                    <Info className="h-3 w-3 mr-1" />
                    <span>Includes 0.25% platform fee</span>
                  </div>
                </div>

                <Button
                  onClick={() => setIsReviewing(true)}
                  disabled={!amount || parseFloat(amount) <= 0 || !canSwap}
                  size="sm"
                  className="w-full"
                >
                  Review Swap
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-md">
                  <div className="flex justify-between text-xs">
                    <span>From:</span>
                    <span className="font-medium">
                      {amount} {sourceToken}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs mt-2">
                    <span>To (estimated):</span>
                    <span className="font-medium">
                      {calculateEstimatedOutput()} EURA
                    </span>
                  </div>
                  <div className="flex justify-between text-xs mt-2">
                    <span>Fee:</span>
                    <span>0.25%</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsReviewing(false)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSwap}
                    disabled={isLoading || !canSwap}
                    size="sm"
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Confirm Swap"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
