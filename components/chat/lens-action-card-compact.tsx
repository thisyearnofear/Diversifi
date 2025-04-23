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
import { validateLensUrl } from "@/lib/actions/lens-action";
import { useAccount } from "wagmi";

interface LensActionCardCompactProps {
  title: string;
  description: string;
  steps: string[];
  reward: string;
  actionUrl: string;
  proofFieldLabel: string;
  proofFieldPlaceholder: string;
  onComplete?: (proof: string) => void;
}

export function LensActionCardCompact({
  title,
  description,
  steps,
  reward,
  actionUrl,
  proofFieldLabel,
  proofFieldPlaceholder,
  onComplete,
}: LensActionCardCompactProps) {
  const { address } = useAccount();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [proofUrl, setProofUrl] = useState("");
  const [error, setError] = useState("");

  const handleOpenLens = () => {
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
      // Validate the Lens URL
      if (!proofUrl) {
        setError("Please enter your Lens profile URL");
        setIsCompleting(false);
        return;
      }

      if (!validateLensUrl(proofUrl)) {
        setError(
          "Please enter a valid Lens profile URL (e.g. https://hey.xyz/u/username)"
        );
        setIsCompleting(false);
        return;
      }

      // Save the completion to the database
      const response = await fetch("/api/actions/lens/complete", {
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
      toast.success("Lens action completed successfully!");

      // Show guidance about starter packs
      toast.success(
        "Check out these curated starter packs for different interests!",
        {
          duration: 10000,
          action: {
            label: "View Packs",
            onClick: () => window.open("https://hey.xyz/explore", "_blank"),
          },
        }
      );

      // Call the onComplete callback if provided
      if (onComplete) {
        onComplete(proofUrl);
      }
    } catch (error) {
      console.error("Error completing Lens action:", error);
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
        const response = await fetch("/api/actions/lens/complete");
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
            className="size-6 p-0"
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
        <div className="mb-2">
          <h4 className="text-xs font-medium mb-1">Steps:</h4>
          <ol className="list-decimal text-xs pl-4 space-y-1">
            {steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>

          <h4 className="text-xs font-medium mt-2 mb-1">Reward:</h4>
          <p className="text-xs text-green-600 font-medium">{reward}</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1 text-xs text-red-500 mb-2">
          <AlertCircle className="size-3" />
          {error}
        </div>
      )}

      <div className="space-y-2">
        {!isCompleted ? (
          <>
            <div className="flex flex-col gap-1.5">
              <Button
                onClick={handleOpenLens}
                className="w-full h-7 text-xs flex items-center gap-1"
                variant="outline"
              >
                <ExternalLink className="size-3" />
                Open Lens
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
                    <Loader2 className="mr-1 size-3 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Complete Action"
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1 text-xs text-green-600">
            <CheckCircle className="size-3" />
            Action completed successfully!
          </div>
        )}
      </div>
    </Card>
  );
}
