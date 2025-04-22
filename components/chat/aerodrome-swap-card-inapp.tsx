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
import { useAerodromeSwap } from "@/hooks/use-aerodrome-swap-inapp";
import { useDivviRegistration } from "@/hooks/use-divvi-registration";
import { useTokenPrice } from "@/hooks/use-token-price";
import { toast } from "sonner";

interface AerodromeSwapCardInappProps {
  onComplete?: () => void;
}

export function AerodromeSwapCardInapp({
  onComplete,
}: AerodromeSwapCardInappProps) {
  const { address } = useAccount();
  // Set expanded state based on registration status - only expand if registered
  const [isExpanded, setIsExpanded] = useState(false);
  const { isRegistered } = useDivviRegistration();
  const {
    status,
    error,
    txHash,
    isCompleted,
    canSwap,
    isCorrectNetwork,
    isSwitchingChain,
    swap,
    switchToBase,
  } = useAerodromeSwap();

  // State for the swap form
  const [sourceToken, setSourceToken] = useState("ETH");
  const [amount, setAmount] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);

  // Get real-time exchange rates from CoinGecko
  const {
    prices,
    isLoading: isPriceLoading,
    error: priceError,
  } = useTokenPrice(["ETH", "USDC"]);

  // Calculate exchange rate based on CoinGecko prices
  let exchangeRate = sourceToken === "ETH" ? 2000 : 1; // Fallback rates

  if (prices && prices.ETH && prices.USDC) {
    if (sourceToken === "ETH") {
      // 1 ETH = x USDbC (where USDbC is pegged to USD)
      exchangeRate = prices.ETH.usd / prices.USDC.usd;
    }
    // For USDC to USDbC, keep the 1:1 rate since both are stablecoins
  }

  // Update expanded state when registration status changes
  useEffect(() => {
    if (isRegistered) {
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
    }
  }, [isRegistered]);

  const estimatedOutput = parseFloat(amount || "0") * exchangeRate;

  // Determine if we're in a loading state
  const isLoading = [
    "swapping",
    "transaction-pending",
    "transaction-submitted",
    "transaction-confirming",
    "completing",
  ].includes(status);

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

  const handleSwap = async () => {
    try {
      if (!address) {
        toast.error("Please connect your wallet first");
        return;
      }

      // Double-check network before proceeding
      if (!isCorrectNetwork) {
        toast.info("Switching to Base network...");
        await switchToBase();

        // Verify the switch was successful
        if (!isCorrectNetwork) {
          toast.error("Please switch to the Base network to continue");
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

  if (isCompleted) {
    return (
      <Card className="p-4 border-green-200 bg-green-50 dark:bg-green-900/20">
        <div className="flex items-center gap-3">
          <CheckCircle className="size-5 text-green-600" />
          <div>
            <h3 className="font-medium">USDbC Acquired ✓</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You now have USD-backed stablecoins on Base!
            </p>
            {txHash && (
              <a
                href={`https://basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 flex items-center mt-1 hover:underline"
              >
                View transaction
                <ExternalLink className="size-3 ml-1" />
              </a>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-blue-200">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {/* Status indicator icon */}
              {isRegistered ? (
                status === "transaction-pending" ||
                status === "transaction-submitted" ||
                status === "transaction-confirming" ? (
                  <Loader2 className="size-5 text-blue-500 animate-spin" />
                ) : (
                  <div className="size-5 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    2
                  </div>
                )
              ) : (
                <div className="size-5 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
                  2
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Get Stablecoins</h3>
                <Badge
                  variant="outline"
                  className="text-xs bg-blue-100 dark:bg-blue-900 border-blue-200"
                >
                  Step 2 of 2
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Swap ETH for USDbC
              </p>
              {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
              {!isRegistered && (
                <p className="text-xs text-amber-600 mt-1">
                  Complete registration in Step 1 to unlock this step
                </p>
              )}
              {isRegistered && status === "wrong-network" && (
                <p className="text-xs text-amber-600 mt-1">
                  You need to switch to the Base network to continue
                </p>
              )}
              {status === "switching-network" && (
                <p className="text-xs text-amber-600 mt-1">
                  Switching to Base network...
                </p>
              )}
              {status === "transaction-pending" && (
                <p className="text-xs text-amber-600 mt-1">
                  Transaction pending...
                </p>
              )}
              {status === "transaction-submitted" && (
                <p className="text-xs text-amber-600 mt-1">
                  Transaction submitted, waiting for confirmation...
                </p>
              )}
              {status === "transaction-confirming" && (
                <p className="text-xs text-amber-600 mt-1">
                  Transaction confirming on the blockchain...
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
              <ChevronUp className="size-3" />
            ) : (
              <ChevronDown className="size-3" />
            )}
          </Button>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">
                Why get USDbC stablecoins:
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                USDbC is a USD-backed stablecoin on Base that provides stability
                and can be used across various DeFi applications. It's perfect
                for trading, saving, and participating in the Base ecosystem.
              </p>
              <div className="flex items-center text-xs text-blue-600">
                <a
                  href="https://docs.base.org/tokens/usdbc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:underline"
                >
                  Learn more about USDbC
                  <ExternalLink className="ml-1 size-3" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {status === "wrong-network" ? (
          <div className="space-y-3">
            <Button
              onClick={switchToBase}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Switching Network...
                </>
              ) : (
                "Switch to Base Network"
              )}
            </Button>
          </div>
        ) : !isReviewing ? (
          <>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Select token to swap
                </label>
                <Select
                  value={sourceToken}
                  onValueChange={setSourceToken}
                  disabled={isLoading || !isRegistered || !isCorrectNetwork}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Amount to swap
                </label>
                <Input
                  type="text"
                  placeholder={`Enter ${sourceToken} amount`}
                  value={amount}
                  onChange={handleAmountChange}
                  disabled={isLoading || !isRegistered}
                />
                {amount && !isNaN(parseFloat(amount)) && (
                  <p className="text-xs text-gray-500 mt-1">
                    ≈ {estimatedOutput.toFixed(2)} USDbC
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleReview}
                disabled={
                  !amount ||
                  parseFloat(amount) <= 0 ||
                  isLoading ||
                  !isRegistered
                }
              >
                Review Swap
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-3">
              <h4 className="font-medium">Review Swap Details</h4>

              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    You pay:
                  </span>
                  <span className="text-sm font-medium">
                    {amount} {sourceToken}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    You receive:
                  </span>
                  <span className="text-sm font-medium">
                    ≈ {estimatedOutput.toFixed(2)} USDbC
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Exchange rate:
                  </span>
                  <span className="text-sm">
                    1 {sourceToken} ={" "}
                    {sourceToken === "ETH"
                      ? exchangeRate.toFixed(2)
                      : exchangeRate}{" "}
                    USDbC
                  </span>
                </div>
                {sourceToken === "ETH" && (
                  <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                    <span>
                      {prices?.ETH
                        ? "Price data by CoinGecko"
                        : "Using estimated price"}
                    </span>
                    {prices?.ETH && (
                      <a
                        href="https://www.coingecko.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center hover:underline"
                      >
                        <Info className="size-3 mr-1" />
                        CoinGecko
                      </a>
                    )}
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Network:
                  </span>
                  <span className="text-sm">Base</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Platform fee:
                  </span>
                  <span className="text-sm">0.25%</span>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Note: Actual amounts may vary slightly due to price
                fluctuations, gas fees, and the 0.25% platform fee.
              </p>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                onClick={handleSwap}
                disabled={isLoading || !isRegistered}
              >
                {status === "transaction-pending" && (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Preparing Transaction...
                  </>
                )}
                {status === "transaction-submitted" && (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Waiting for Confirmation...
                  </>
                )}
                {status === "transaction-confirming" && (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Confirming Transaction...
                  </>
                )}
                {status === "swapping" && (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Processing Swap...
                  </>
                )}
                {status === "completing" && (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Completing Swap...
                  </>
                )}
                {!isLoading && "Confirm Swap"}
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
