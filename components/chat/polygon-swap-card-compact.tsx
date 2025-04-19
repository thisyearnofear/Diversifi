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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePolygonDaiSwap } from "@/hooks/use-polygon-dai-swap";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface PolygonSwapCardCompactProps {
  onComplete?: () => void;
}

export function PolygonSwapCardCompact({
  onComplete,
}: PolygonSwapCardCompactProps) {
  const { address } = useAccount();
  const [isExpanded, setIsExpanded] = useState(true);
  const [amount, setAmount] = useState("0.1");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const {
    status,
    error,
    txHash,
    isCompleted,
    isCorrectNetwork,
    isSwitchingChain,
    prepareSwap,
    executeSwap,
    completeSwap,
    switchToPolygon,
    estimatedDai,
    transactionDetails,
    setStatus,
  } = usePolygonDaiSwap();

  // Determine if we're in a loading state
  const isLoading = [
    "checking",
    "preparing",
    "executing",
    "transaction-pending",
    "transaction-confirming",
    "transaction-submitted",
    "completing",
  ].includes(status);

  // Handle swap preparation
  const handlePrepare = async () => {
    if (!address) return;

    try {
      // First check if we're on the correct network
      if (!isCorrectNetwork) {
        toast.info("Switching to Polygon network...");
        await switchToPolygon();

        // Verify the switch was successful
        if (!isCorrectNetwork) {
          toast.error("Please switch to the Polygon network to continue");
          return;
        }
      }

      await prepareSwap(amount);

      // Show confirmation after preparation
      setShowConfirmation(true);
    } catch (error) {
      console.error("Error preparing swap:", error);
      toast.error("Failed to prepare swap. Please try again.");
    }
  };

  // Determine if we're using 0xProtocol API (one-stage swap) or Brian API (two-stage swap)
  const [isUsingZeroX, setIsUsingZeroX] = useState(false);

  // Handle swap execution
  const handleExecute = async () => {
    if (!address) return;
    try {
      // First check if we're on the correct network
      if (!isCorrectNetwork) {
        toast.info("Switching to Polygon network...");
        await switchToPolygon();

        // Verify the switch was successful
        if (!isCorrectNetwork) {
          toast.error("Please switch to the Polygon network to continue");
          return;
        }
      }

      // Hide confirmation before executing
      setShowConfirmation(false);

      // Execute the swap using the user's wallet
      await executeSwap();

      // Check if we're using 0xProtocol API (transaction-success status and txHash present)
      if (status === "transaction-success" && txHash) {
        console.log("Using 0xProtocol API, completing swap immediately");
        setIsUsingZeroX(true);
        // Auto-complete the swap for 0xProtocol API
        await completeSwap(txHash);
      }
    } catch (error) {
      console.error("Error executing swap:", error);
      toast.error("Failed to execute swap. Please try again.");
    }
  };

  // Handle cancellation
  const handleCancel = () => {
    setShowConfirmation(false);
    setStatus("idle");
  };

  // Handle completion
  const handleComplete = async () => {
    if (!address || !txHash) return;
    await completeSwap(txHash);

    if (onComplete) {
      onComplete();
    }
  };

  // Call onComplete when status changes to completed
  const [hasCalledOnComplete, setHasCalledOnComplete] = useState(false);

  useEffect(() => {
    if (status === "completed" && onComplete && !hasCalledOnComplete) {
      console.log("Swap completed, calling onComplete");
      setHasCalledOnComplete(true);
      onComplete();
    }
  }, [status, onComplete, hasCalledOnComplete]);

  // Auto-complete for 0xProtocol API when transaction is successful
  useEffect(() => {
    const autoCompleteZeroXSwap = async () => {
      if (status === "transaction-success" && txHash && isUsingZeroX) {
        console.log("Auto-completing 0xProtocol swap");
        // Add a small delay to allow the UI to update
        setTimeout(async () => {
          await completeSwap(txHash);
        }, 1500);
      }
    };

    autoCompleteZeroXSwap();
  }, [status, txHash, isUsingZeroX, completeSwap]);

  if (isCompleted) {
    return (
      <Card className="p-4 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">DAI Acquired ✓</h3>
              <Badge
                variant="outline"
                className="text-xs bg-blue-100 dark:bg-blue-900 border-blue-200"
              >
                Step 2 of 2 Complete
              </Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You now have USD-backed stablecoins on Polygon!
            </p>
            {txHash && (
              <a
                href={`https://polygonscan.com/tx/${txHash}`}
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
    <Card className="overflow-hidden border-blue-200">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">Get DAI on Polygon</h3>
                  <Badge
                    variant="outline"
                    className="text-xs bg-blue-100 dark:bg-blue-900 border-blue-200"
                  >
                    Step 2 of 2
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Swap MATIC for DAI stablecoins
                </p>
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

          {/* Show status messages */}
          {error && <p className="text-xs text-red-600">{error}</p>}
          {status === "wrong-network" && (
            <p className="text-xs text-amber-600">
              You need to switch to the Polygon network to continue
            </p>
          )}
          {status === "transaction-pending" && (
            <p className="text-xs text-amber-600">Transaction pending...</p>
          )}
          {status === "transaction-confirming" && (
            <p className="text-xs text-amber-600">Transaction confirming...</p>
          )}
          {status === "transaction-success" && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-xs text-green-600">
                  Transaction successful!
                </p>
              </div>
              {txHash && (
                <div className="flex items-center text-xs">
                  <a
                    href={`https://polygonscan.com/tx/${txHash}`}
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

        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Swap Details:</h4>
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-600">
                    Amount (MATIC)
                  </label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={status !== "idle" && status !== "error"}
                    className="h-8 text-sm"
                    placeholder="0.1"
                  />
                </div>
                {estimatedDai && (
                  <p className="text-xs text-gray-600">
                    Estimated DAI: ~{estimatedDai}
                  </p>
                )}

                {/* Transaction Confirmation Display */}
                {showConfirmation && status === "prepared" && (
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                    <h4 className="text-xs font-medium mb-1">
                      Confirm Transaction
                    </h4>
                    <Separator className="my-1" />
                    <div className="text-xs space-y-1">
                      <p>
                        <span className="font-medium">Network:</span> Polygon
                      </p>
                      <p>
                        <span className="font-medium">Action:</span>{" "}
                        {transactionDetails?.description ||
                          `Swap ${amount} MATIC for DAI`}
                      </p>
                      {transactionDetails?.fromToken && (
                        <p>
                          <span className="font-medium">From:</span>{" "}
                          {transactionDetails.fromAmount}{" "}
                          {transactionDetails.fromToken.symbol}
                        </p>
                      )}
                      {transactionDetails?.toToken && (
                        <p>
                          <span className="font-medium">To:</span> ~{" "}
                          {transactionDetails.toAmount}{" "}
                          {transactionDetails.toToken.symbol}
                        </p>
                      )}
                      {!transactionDetails && (
                        <p>
                          <span className="font-medium">Estimated DAI:</span> ~
                          {estimatedDai}
                        </p>
                      )}
                      {transactionDetails?.data?.protocol && (
                        <p>
                          <span className="font-medium">Protocol:</span>{" "}
                          {transactionDetails.data.protocol.name ||
                            transactionDetails.data.protocol.key ||
                            "Unknown"}
                        </p>
                      )}
                      {transactionDetails?.solver && (
                        <p>
                          <span className="font-medium">Solver:</span>{" "}
                          {transactionDetails.solver}
                        </p>
                      )}
                      <p className="text-amber-600 text-[10px] mt-1">
                        Please review and confirm this transaction in your
                        wallet after clicking Confirm
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center text-xs text-blue-600 mt-2">
                <a
                  href="https://polygon.technology"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:underline"
                >
                  Learn about Polygon
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="pt-3 border-t border-blue-100 dark:border-blue-800">
              <div className="flex gap-2">
                {!isCorrectNetwork ? (
                  <Button
                    onClick={switchToPolygon}
                    disabled={isLoading || !address || isSwitchingChain}
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isSwitchingChain ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Switching Network...
                      </>
                    ) : (
                      "Switch to Polygon Network"
                    )}
                  </Button>
                ) : status === "idle" || status === "error" ? (
                  <Button
                    onClick={handlePrepare}
                    disabled={isLoading || !address || parseFloat(amount) <= 0}
                    size="sm"
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Preparing...
                      </>
                    ) : (
                      "Prepare Swap"
                    )}
                  </Button>
                ) : status === "prepared" ? (
                  showConfirmation ? (
                    <div className="flex gap-2 w-full">
                      <Button
                        onClick={handleCancel}
                        disabled={isLoading}
                        size="sm"
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleExecute}
                        disabled={isLoading}
                        size="sm"
                        className="flex-1"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            Confirming...
                          </>
                        ) : (
                          "Confirm Swap"
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={handleExecute}
                      disabled={isLoading}
                      size="sm"
                      className="flex-1"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Executing...
                        </>
                      ) : (
                        "Execute Swap"
                      )}
                    </Button>
                  )
                ) : status === "transaction-success" ? (
                  <Button
                    onClick={handleComplete}
                    disabled={isLoading || isUsingZeroX}
                    size="sm"
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Processing...
                      </>
                    ) : isUsingZeroX ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Completing...
                      </>
                    ) : (
                      "Complete Swap"
                    )}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
