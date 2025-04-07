"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle, AlertCircle, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { validateWarpcastUrl } from "@/lib/actions/farcaster-action";

interface FarcasterActionCardProps {
  title: string;
  description: string;
  steps: string[];
  reward: string;
  actionUrl: string;
  proofFieldLabel: string;
  proofFieldPlaceholder: string;
  onComplete?: (proof: string) => void;
}

export function FarcasterActionCard({
  title,
  description,
  steps,
  reward,
  actionUrl,
  proofFieldLabel,
  proofFieldPlaceholder,
  onComplete
}: FarcasterActionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [proofUrl, setProofUrl] = useState("");
  const [error, setError] = useState("");

  const handleOpenFarcaster = () => {
    window.open(actionUrl, "_blank");
  };

  const handleComplete = () => {
    setIsCompleting(true);
    setError("");
    
    try {
      // Validate the Warpcast URL
      if (!proofUrl) {
        setError("Please enter your Warpcast URL");
        setIsCompleting(false);
        return;
      }
      
      if (!validateWarpcastUrl(proofUrl)) {
        setError("Please enter a valid Warpcast URL (e.g. https://warpcast.com/username/0x123...)");
        setIsCompleting(false);
        return;
      }
      
      // Mark as completed
      setIsCompleted(true);
      toast.success("Farcaster action completed successfully!");
      
      // Call the onComplete callback if provided
      if (onComplete) {
        onComplete(proofUrl);
      }
    } catch (error) {
      console.error("Error completing Farcaster action:", error);
      setError("Failed to complete action");
    } finally {
      setIsCompleting(false);
    }
  };

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
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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
                <label className="text-xs font-medium">{proofFieldLabel}:</label>
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
          <div className="flex items-center justify-center space-x-2 text-green-600 text-xs font-medium">
            <CheckCircle className="h-4 w-4" />
            <span>Action completed successfully!</span>
          </div>
        )}
      </div>
    </Card>
  );
}
