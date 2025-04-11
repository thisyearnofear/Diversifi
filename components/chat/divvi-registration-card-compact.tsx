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
import { Badge } from "@/components/ui/badge";
import { useDivviRegistration } from "@/hooks/use-divvi-registration";

interface DivviRegistrationCardCompactProps {
  onComplete?: () => void;
}

export function DivviRegistrationCardCompact({
  onComplete,
}: DivviRegistrationCardCompactProps) {
  const { address } = useAccount();
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    status,
    error,
    txHash,
    isRegistered,
    register,
    completeRegistration,
  } = useDivviRegistration();

  // Determine if we're in a loading state
  const isLoading = [
    "checking",
    "registering",
    "transaction-pending",
    "transaction-confirming",
    "completing",
  ].includes(status);

  // Determine if the registration is completed
  const isCompleted = isRegistered || status === "completed";

  // Handle registration
  const handleRegister = async () => {
    if (!address) return;
    await register();
  };

  // Handle completion
  const handleComplete = async () => {
    if (!address || !txHash) return;
    await completeRegistration();

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
            <h3 className="font-medium">Registration Complete</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You're now registered with Stable Station on base!
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-green-200">
      <div className="p-4 bg-green-50 dark:bg-green-900/20">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Register</h3>
                <Badge
                  variant="outline"
                  className="text-xs bg-green-100 dark:bg-green-900 border-green-200"
                >
                  Step 1
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Activate your account on the Base ecosystem
              </p>
              {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
              {status === "transaction-pending" && (
                <p className="text-xs text-amber-600 mt-1">
                  Transaction pending...
                </p>
              )}
              {status === "transaction-confirming" && (
                <p className="text-xs text-amber-600 mt-1">
                  Transaction confirming...
                </p>
              )}
              {status === "transaction-success" && (
                <p className="text-xs text-green-600 mt-1">
                  Transaction successful! Click "Complete Setup"
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
              <h4 className="text-sm font-medium mb-2">Unlock Features:</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                This one-time registration unlocks access to stablecoin tools,
                portfolio management, and insights on base.
              </p>
              <div className="flex items-center text-xs text-blue-600">
                <a
                  href="https://base.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:underline"
                >
                  Learn about base.
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="pt-3 border-t border-green-100 dark:border-green-800">
              <div className="flex gap-2">
                {status === "not-registered" ||
                status === "error" ||
                status === "idle" ||
                status === "transaction-failed" ? (
                  <Button
                    onClick={handleRegister}
                    disabled={isLoading || !address}
                    size="sm"
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Register"
                    )}
                  </Button>
                ) : status === "transaction-success" ? (
                  <Button
                    onClick={handleComplete}
                    disabled={isLoading}
                    size="sm"
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Complete Registration"
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
