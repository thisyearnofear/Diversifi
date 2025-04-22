"use client";

import { useState, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import { celo } from "wagmi/chains";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Loader2,
  Info,
  Wallet,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useCkesSwap } from "@/hooks/use-celo-ckes";
import { useTokenPrice } from "@/hooks/use-token-price";
import { formatUnits } from "ethers/lib/utils";

// Card for entering cUSD amount and approving cUSD for swap to cKES.
interface CkesApproveCardCompactProps {
  onComplete?: (amount: number) => void;
}

export function CeloCkesApproveCardCompact({
  onComplete,
}: CkesApproveCardCompactProps) {
  const { address } = useAccount();
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    status,
    error,
    txHash,
    isApproved,
    swap,
    isCorrectNetwork,
    switchToCelo,
    isSwitchingChain,
    exchangeRate: hookExchangeRate,
  } = useCkesSwap();

  // Get cUSD balance
  const cUSDAddress = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
  const { data: cUSDBalance } = useBalance({
    address,
    token: cUSDAddress as `0x${string}`,
    chainId: celo.id,
  });

  const [amount, setAmount] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);

  // Backup with live prices
  const { prices } = useTokenPrice(["cUSD", "cKES"]);
  let calculatedRate = 40.06; // More accurate fallback rate for cUSD to cKES
  if (prices?.cUSD?.usd && prices?.cKES?.usd) {
    calculatedRate = prices.cKES.usd / prices.cUSD.usd;
  }

  // Use the hook's exchange rate if available, otherwise use the calculated rate
  const exchangeRate = hookExchangeRate > 0 ? hookExchangeRate : calculatedRate;
  const estimatedOutput = parseFloat(amount || "0") * exchangeRate;

  const isLoading =
    [
      "approving",
      "transaction-pending",
      "transaction-submitted",
      "transaction-confirming",
    ].includes(status) || isSwitchingChain;

  const isApprovalCompleted =
    isApproved || status === "approved" || status === "completed";

  // Check if user has enough cUSD
  const hasEnoughCUSD =
    cUSDBalance && amount
      ? parseFloat(formatUnits(cUSDBalance.value, cUSDBalance.decimals)) >=
        parseFloat(amount)
      : true;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) || value === "") {
      setAmount(value);
    }
  };

  // Set max amount from balance
  const handleSetMaxAmount = () => {
    if (cUSDBalance) {
      // Leave a small amount for gas
      const maxAmount = parseFloat(
        formatUnits(cUSDBalance.value, cUSDBalance.decimals)
      );
      const amountWithBuffer = Math.max(0, maxAmount - 0.01).toFixed(4);
      setAmount(amountWithBuffer);
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
      if (!isCorrectNetwork) {
        toast.info("Switching to Celo network...");
        await switchToCelo();
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (!isCorrectNetwork) {
          toast.error("Please switch to the Celo network to continue");
          return;
        }
      }
      if (!amount || parseFloat(amount) <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }
      // Approve cUSD for swapping to cKES
      swap({
        amount: parseFloat(amount),
      });
    } catch (error) {
      console.error("Error approving:", error);
      toast.error("Failed to approve CELO");
    }
  };

  // Call onComplete when approval is completed
  useEffect(() => {
    if (isApprovalCompleted && onComplete && amount) {
      console.log("Calling onComplete with amount:", parseFloat(amount));
      onComplete(parseFloat(amount));
    }
  }, [isApprovalCompleted, onComplete, amount]);

  return (
    <Card className="w-full overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex flex-col">
              {isApprovalCompleted && status !== "completed" ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="size-4 mr-1" />
                  <span className="text-sm font-medium">Approved</span>
                </div>
              ) : status === "completed" ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="size-4 mr-1" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
              ) : (
                <span className="text-sm font-medium">
                  Set Amount &amp; Approve <Badge color="blue">cUSD</Badge>
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="size-8 p-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </Button>
        </div>
        {status === "completed" && (
          <div className="mt-4 space-y-2">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="size-4" />
                <span className="text-sm">cKES acquired successfully!</span>
              </div>
              {txHash && (
                <a
                  href={`https://explorer.celo.org/mainnet/tx/${txHash}`}
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
        )}
        {(isExpanded || !isApprovalCompleted) && (
          <>
            <div className="space-y-4 mt-4">
              {!isApprovalCompleted && (
                <>
                  <div className="relative">
                    <Input
                      inputMode="decimal"
                      autoFocus
                      min={0}
                      placeholder="Amount in cUSD"
                      value={amount}
                      onChange={handleAmountChange}
                      disabled={isLoading || isReviewing}
                      className="pr-16"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute right-1 top-1 h-7 px-2 text-xs"
                      onClick={handleSetMaxAmount}
                      disabled={isLoading || isReviewing || !cUSDBalance}
                    >
                      Max
                    </Button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Estimated output:{" "}
                        <b>{estimatedOutput.toFixed(2)} cKES</b>
                      </span>
                      {cUSDBalance && (
                        <span className="text-xs flex items-center text-gray-500">
                          <Wallet className="size-3 mr-1" />
                          Balance:{" "}
                          {formatUnits(
                            cUSDBalance.value,
                            cUSDBalance.decimals
                          )}{" "}
                          cUSD
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      Exchange rate: 1 cUSD ≈ {exchangeRate.toFixed(4)} cKES
                    </span>
                    <span className="text-xs text-gray-400">
                      Network: Celo mainnet
                    </span>
                    {!hasEnoughCUSD && amount && (
                      <div className="bg-red-50 p-2 rounded-md text-xs text-red-700 flex items-start">
                        <Info className="size-3 mr-1 mt-0.5 flex-shrink-0" />
                        <span>
                          Insufficient cUSD balance. You need {amount} cUSD but
                          only have{" "}
                          {cUSDBalance
                            ? formatUnits(
                                cUSDBalance.value,
                                cUSDBalance.decimals
                              )
                            : "0"}{" "}
                          cUSD.
                        </span>
                      </div>
                    )}
                    <div className="bg-amber-50 p-2 rounded-md text-xs text-amber-700">
                      Note: You need cUSD tokens on Celo to perform this swap.
                      Make sure you have enough cUSD in your wallet.
                    </div>
                  </div>
                  {!isCorrectNetwork && (
                    <div className="bg-amber-50 p-2 rounded-md flex items-center text-amber-600 text-sm">
                      <Info className="size-4 mr-1" />
                      You need to switch to the Celo network.
                    </div>
                  )}
                  {error && (
                    <div className="bg-red-50 p-2 rounded-md">
                      <div className="text-red-600 text-sm">{error}</div>
                    </div>
                  )}
                  <Button
                    size="sm"
                    disabled={
                      !isCorrectNetwork ||
                      isLoading ||
                      !amount ||
                      parseFloat(amount) <= 0 ||
                      !hasEnoughCUSD
                    }
                    onClick={isReviewing ? handleBack : handleReview}
                  >
                    {isReviewing ? "Back" : "Review"}
                  </Button>
                  {isReviewing && (
                    <Button
                      size="sm"
                      variant="default"
                      disabled={isLoading}
                      onClick={handleApprove}
                      className="ml-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="size-4 mr-2 animate-spin" />
                          Approving...
                        </>
                      ) : (
                        "Approve cUSD"
                      )}
                    </Button>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
