"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useActions } from "@/hooks/use-actions";
import { toast } from "sonner";

export function FarcasterAction() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const { completeAction } = useActions();

  const handleStart = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      // Open Farcaster in a new tab
      window.open("https://farcaster.xyz", "_blank");
      
      // Ask the user if they completed the action
      const confirmed = window.confirm(
        "Did you create a Farcaster account and connect it to your wallet? Click OK to confirm and complete this action."
      );
      
      if (confirmed) {
        // Get the action ID from the database
        const response = await fetch("/api/actions/by-title", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: "Set up Farcaster Account" }),
        });
        
        if (!response.ok) {
          throw new Error("Failed to get action ID");
        }
        
        const { id } = await response.json();
        
        // Complete the action
        await completeAction(id, { 
          platform: "farcaster",
          completedAt: new Date().toISOString(),
        });
        
        toast.success("Action completed successfully!");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to complete action");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Set up Farcaster Account</h3>
      <p className="text-gray-600 mb-6">
        Create a Farcaster account and connect it to your wallet to earn rewards.
      </p>
      
      <div className="mb-6">
        <h4 className="font-medium mb-2">Steps:</h4>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Visit farcaster.xyz</li>
          <li>Connect your wallet</li>
          <li>Create your account</li>
          <li>Set up your profile</li>
        </ol>
      </div>
      
      <div className="mb-6">
        <h4 className="font-medium mb-2">Rewards:</h4>
        <p className="text-green-600 font-medium">0.1 ETH</p>
      </div>
      
      <Button
        onClick={handleStart}
        disabled={isLoading || !address}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Start Action"
        )}
      </Button>
      {!address && (
        <p className="mt-2 text-sm text-gray-500">
          Please connect your wallet to continue
        </p>
      )}
    </Card>
  );
}
