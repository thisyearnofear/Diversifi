"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useActions } from "@/hooks/use-actions";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function BridgeAction() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const { completeAction } = useActions();

  const handleStart = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      // Open Base Bridge in a new tab
      window.open("https://bridge.base.org", "_blank");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!address || !txHash) return;

    setIsLoading(true);
    try {
      // Get the action ID from the database
      const response = await fetch("/api/actions/by-title", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: "Bridge to Base" }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to get action ID");
      }
      
      const { id } = await response.json();
      
      // Complete the action
      await completeAction(id, { 
        txHash,
        completedAt: new Date().toISOString(),
      });
      
      toast.success("Action completed successfully!");
      setTxHash("");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to complete action");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Bridge to Base</h3>
      <p className="text-gray-600 mb-6">
        Bridge assets from Ethereum to Base and earn rewards.
      </p>
      
      <div className="mb-6">
        <h4 className="font-medium mb-2">Steps:</h4>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Visit bridge.base.org</li>
          <li>Connect your wallet</li>
          <li>Select amount to bridge</li>
          <li>Confirm transaction</li>
          <li>Copy the transaction hash</li>
          <li>Paste it below and click "Complete Action"</li>
        </ol>
      </div>
      
      <div className="mb-6">
        <h4 className="font-medium mb-2">Rewards:</h4>
        <p className="text-green-600 font-medium">0.2 ETH</p>
      </div>
      
      <div className="space-y-4">
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
            "Start Bridge"
          )}
        </Button>
        
        <div className="space-y-2">
          <Label htmlFor="txHash">Transaction Hash</Label>
          <Input
            id="txHash"
            placeholder="0x..."
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
          />
        </div>
        
        <Button
          onClick={handleComplete}
          disabled={isLoading || !address || !txHash}
          className="w-full"
          variant="outline"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Complete Action"
          )}
        </Button>
      </div>
      
      {!address && (
        <p className="mt-2 text-sm text-gray-500">
          Please connect your wallet to continue
        </p>
      )}
    </Card>
  );
}
