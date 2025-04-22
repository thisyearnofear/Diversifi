"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { validateWarpcastUrl as validateWarpcastProfileUrl } from "@/lib/actions/farcaster-action";
import { useAccount } from "wagmi";

interface FarcasterActionCardCompactProps {
  title: string;
  description: string;
  steps: string[];
  reward: string;
  actionUrl: string;
  proofFieldLabel: string;
  proofFieldPlaceholder: string;
  onComplete?: (proof: string) => void;
}

export function FarcasterActionCardCompact({
  title,
  description,
  steps,
  reward,
  actionUrl,
  proofFieldLabel,
  proofFieldPlaceholder,
  onComplete,
}: FarcasterActionCardCompactProps) {
  const { address } = useAccount();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [proofUrl, setProofUrl] = useState("");
  const [error, setError] = useState("");

  const handleOpenFarcaster = () => {
    window.open(actionUrl, "_blank");
  };

  const handleComplete = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsCompleting(true);
    setError("");

    try {
      // Validate the Warpcast URL
      if (!proofUrl) {
        setError("Please enter your Warpcast URL");
        setIsCompleting(false);
        return;
      }

      if (!validateWarpcastProfileUrl(proofUrl)) {
        setError(
          "Please enter a valid Warpcast profile URL (e.g. https://warpcast.com/username)"
        );
        setIsCompleting(false);
        return;
      }

      // Save the completion to the database
      const response = await fetch("/api/actions/farcaster/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ proofUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to complete action");
      }

      // Mark as completed
      setIsCompleted(true);
      toast.success("Farcaster action completed successfully!");

      // Show guidance about starter packs
      toast.success(
        "Check out these starter packs to follow interesting people!",
        {
          duration: 10000,
          action: {
            label: "View Packs",
            onClick: () =>
              window.open("https://warpcast.com/~/packs", "_blank"),
          },
        }
      );

      // Call the onComplete callback if provided
      if (onComplete) {
        onComplete(proofUrl);
      }
    } catch (error) {
      console.error("Error completing Farcaster action:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to complete action";
      setError(errorMessage);
      toast.error("Failed to complete action");
    } finally {
      setIsCompleting(false);
    }
  };

  // Check if the user has already completed this action
  useEffect(() => {
    if (!address) return;

    const checkCompletion = async () => {
      try {
        const response = await fetch("/api/actions/farcaster/complete");
        const data = await response.json();

        if (response.ok && data.completed) {
          setIsCompleted(true);
          // Handle the proof which is now a JSON object with a url property
          if (
            data.completion.proof &&
            typeof data.completion.proof === "object"
          ) {
            setProofUrl(data.completion.proof.url || "");
          } else {
            setProofUrl("");
          }
        }
      } catch (error) {
        console.error("Error checking action completion:", error);
      }
    };

    checkCompletion();
  }, [address]);

  return (
    <Card className="p-2.5 w-full max-w-md mx-auto my-1.5 border border-muted rounded-md">
      <div className="flex flex-col mb-2">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-sm mb-1">{title}</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      {isExpanded && (
        <div className="space-y-2 mb-2">
          <div className="text-xs font-medium">Steps:</div>
          <ol className="text-xs space-y-1 list-decimal list-inside">
            {steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>

          <div className="text-xs font-medium">Reward:</div>
          <p className="text-xs">{reward}</p>
        </div>
      )}

      <div className="space-y-2">
        {!isCompleted ? (
          <>
            <div className="flex flex-col gap-1.5">
              <Button
                onClick={handleOpenFarcaster}
                className="w-full h-7 text-xs flex items-center gap-1"
                variant="outline"
              >
                <ExternalLink className="h-3 w-3" />
                Open Farcaster
              </Button>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium">
                  {proofFieldLabel}:
                </label>
                <Input
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  placeholder={proofFieldPlaceholder}
                  className="h-7 text-xs"
                />
              </div>

              <Button
                onClick={handleComplete}
                disabled={isCompleting || !proofUrl}
                className="w-full h-7 text-xs"
              >
                {isCompleting ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Complete Action"
                )}
              </Button>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-500 text-xs">
                <AlertCircle className="h-3 w-3" />
                <span>{error}</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center space-x-2 text-green-600 text-xs font-medium">
              <CheckCircle className="size-4" />
              <span>Action completed successfully!</span>
            </div>

            <div className="text-xs p-2 bg-gray-50 rounded-md">
              <p className="font-medium mb-1">Check out these starter packs:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>
                  <a
                    href="https://warpcast.com/papa/pack/Onchain-Writers-nyijte"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Writers
                  </a>
                </li>
                <li>
                  <a
                    href="https://warpcast.com/web3pm/pack/Builders-at-the-pqclhk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Builders
                  </a>
                </li>
                <li>
                  <a
                    href="https://warpcast.com/jayme/pack/Founders-3jqlp0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Founders
                  </a>
                </li>
                <li>
                  <a
                    href="https://warpcast.com/langchain/pack/Journalists-02swtf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Journalists
                  </a>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
