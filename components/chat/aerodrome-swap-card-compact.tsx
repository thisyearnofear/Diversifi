"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Loader2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAerodromeSwap } from "@/hooks/use-aerodrome-swap";
import { useDivviRegistration } from "@/hooks/use-divvi-registration";

interface AerodromeSwapCardCompactProps {
  onComplete?: () => void;
}

export function AerodromeSwapCardCompact({
  onComplete,
}: AerodromeSwapCardCompactProps) {
  const { address } = useAccount();
  const [isExpanded, setIsExpanded] = useState(false);
  const { isRegistered } = useDivviRegistration();
  const {
    status,
    error,
    txHash,
    isCompleted,
    canSwap,
    openSwapInterface,
    submitTransactionHash,
    setTxHash,
  } = useAerodromeSwap();

  // Determine if we're in a loading state
  const isLoading = ["swapping", "completing"].includes(status);

  // Handle opening the swap interface
  const handleStart = () => {
    if (!address) return;
    openSwapInterface();
  };

  // Handle completion
  const handleComplete = async () => {
    if (!address || !txHash) return;
    await submitTransactionHash(txHash);

    if (onComplete) {
      onComplete();
    }
  };

  if (isCompleted) {
    return (
      <Card className="p-4 border-green-200 bg-green-50 dark:bg-green-900/20">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <h3 className="font-medium">USDbC Acquired</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You now have USD-backed stablecoins on Base!
            </p>
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
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Get USDbC Stablecoins</h3>
                <Badge
                  variant="outline"
                  className="text-xs bg-blue-100 dark:bg-blue-900 border-blue-200"
                >
                  Step 2
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Secure USD-backed tokens on Base
              </p>
              {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
              {!isRegistered && (
                <p className="text-xs text-amber-600 mt-1">
                  Please complete Step 1 first
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full"
            onClick={() => setIsExpanded(!isExpanded)}
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
              <h4 className="text-sm font-medium mb-2">Steps:</h4>
              <ol className="list-decimal pl-5 space-y-1 text-sm">
                <li>Click "Get USDbC" to open the swap interface</li>
                <li>Connect your wallet to Aerodrome</li>
                <li>Swap ETH for USDbC (already pre-selected)</li>
                <li>Confirm the transaction</li>
                <li>Copy the transaction hash</li>
                <li>Paste it below and click "Complete Action"</li>
              </ol>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">About USDbC:</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                USDbC is a Coinbase-backed stablecoin on Base. It maintains a
                stable 1:1 value with USD, making it ideal for transactions and
                savings.
              </p>
              <div className="flex items-center text-xs text-blue-600">
                <a
                  href="https://docs.base.org/tokens/usdbc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:underline"
                >
                  Learn more about USDbC
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="pt-3 border-t border-blue-100 dark:border-blue-800">
              <div className="mb-3">
                <label
                  htmlFor="txHash"
                  className="block text-xs font-medium mb-1"
                >
                  Transaction Hash
                </label>
                <Input
                  id="txHash"
                  value={txHash || ""}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="0x..."
                  className="w-full h-8 text-sm"
                />
              </div>

              <div className="flex gap-2">
                {canSwap && (
                  <Button
                    onClick={handleStart}
                    disabled={isLoading || !isRegistered}
                    size="sm"
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Get USDbC"
                    )}
                  </Button>
                )}

                {status === "waiting-for-hash" && (
                  <Button
                    onClick={handleComplete}
                    disabled={isLoading || !txHash}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Complete Action"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
