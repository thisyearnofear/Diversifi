"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  CheckCircle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { useCkesSwap } from "@/hooks/use-celo-ckes";
import { useTokenPrice } from "@/hooks/use-token-price";

interface CeloCkesConfirmCardCompactProps {
  amount: number | null;
  onComplete?: () => void;
}

export function CeloCkesConfirmCardCompact({
  amount,
  onComplete,
  onEditAmount,
}: CeloCkesConfirmCardCompactProps & { onEditAmount?: () => void }) {
  const { address } = useAccount();
  const [isExpanded, setIsExpanded] = useState(false);
  // Use the hook with the onComplete callback
  const {
    status,
    error,
    txHash,
    isCompleted,
    isApproved,
    swap,
    isCorrectNetwork,
    isSwitchingChain,
    switchToCelo,
    exchangeRate,
  } = useCkesSwap({ onComplete });

  // We'll calculate the output using either the hook's exchange rate or a backup

  // Get backup exchange rate from token prices
  const { prices } = useTokenPrice(["cUSD", "cKES"]);
  let backupRate = 1.0; // fallback rate for cUSD to cKES (approximately 1:1)
  if (prices?.cUSD?.usd && prices?.cKES?.usd) {
    backupRate = prices.cKES.usd / prices.cUSD.usd;
  }

  // Use the hook's exchange rate if it's valid, otherwise use the backup rate
  const finalRate = exchangeRate > 0 ? exchangeRate : backupRate;
  const finalOutput = (amount || 0) * finalRate || 0;

  console.log(
    "Confirm Card - isApproved:",
    isApproved,
    "status:",
    status,
    "amount:",
    amount
  );

  const isLoading =
    [
      "swapping",
      "transaction-pending",
      "transaction-submitted",
      "transaction-confirming",
      "completing",
    ].includes(status || "") || isSwitchingChain;

  // Handle the swap confirmation
  const handleConfirmSwap = async () => {
    try {
      if (!address) {
        toast.error("Please connect your wallet first");
        return;
      }

      if (!amount || amount <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      if (!isApproved) {
        toast.error("Please approve cUSD tokens in the previous step");
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

      // Call the swap function from the hook
      swap({ amount });
    } catch (error) {
      console.error("Error confirming swap:", error);
      toast.error("Failed to confirm swap");
    }
  };

  // If no amount, show message
  if (!amount && !isCompleted) {
    return (
      <Card className="w-full overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex flex-col">
                <span className="text-sm font-medium">Confirm &amp; Swap</span>
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Please enter and approve an amount in the previous step.
          </div>
        </div>
      </Card>
    );
  }

  if (isCompleted) {
    return (
      <Card className="p-4 border-green-200 bg-green-50 dark:bg-green-900/20">
        <div className="flex items-center gap-3">
          <CheckCircle className="size-5 text-green-600" />
          <div>
            <h3 className="font-medium">cKES Acquired</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You now have Kenyan Shilling stablecoins on Celo!
            </p>
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
                <span className="text-sm font-medium">
                  Confirm Swap to cKES
                </span>
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

          {!isExpanded && (
            <div className="text-sm text-gray-500">
              Swap {amount} cUSD for ~{finalOutput.toFixed(2)} cKES
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium">Swap Details</h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Amount:</span>
                  <span className="text-sm font-medium">{amount} cUSD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    Estimated output:
                  </span>
                  <span className="text-sm font-medium">
                    {finalOutput.toFixed(2)} cKES
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Exchange rate:</span>
                  <span className="text-sm font-medium">
                    1 cUSD ≈ {finalRate.toFixed(4)} cKES
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Fee:</span>
                  <span className="text-sm font-medium">0.25%</span>
                </div>
              </div>
            </div>

            {!isCorrectNetwork ? (
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md">
                <div className="flex items-center text-amber-600 dark:text-amber-400 text-sm">
                  <Info className="size-4 mr-2 flex-shrink-0" />
                  <span>
                    You need to switch to the Celo network to proceed.
                  </span>
                </div>
                <Button
                  size="sm"
                  className="mt-2 w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                  onClick={switchToCelo}
                  disabled={isSwitchingChain}
                >
                  {isSwitchingChain ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Switching to Celo...
                    </>
                  ) : (
                    "Switch to Celo Network"
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex justify-between space-x-2">
                {onEditAmount && (
                  <Button
                    variant="outline"
                    onClick={onEditAmount}
                    disabled={isLoading}
                  >
                    Edit Amount
                  </Button>
                )}
                <Button
                  onClick={handleConfirmSwap}
                  disabled={!isApproved || isLoading}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      {isSwitchingChain
                        ? "Switching Network..."
                        : status === "completing"
                        ? "Completing..."
                        : status === "transaction-confirming"
                        ? "Confirming Transaction..."
                        : status === "transaction-submitted"
                        ? "Transaction Submitted..."
                        : status === "transaction-pending"
                        ? "Transaction Pending..."
                        : "Swapping..."}
                    </>
                  ) : (
                    "Confirm Swap"
                  )}
                </Button>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="size-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Error
                    </h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
