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

export function CeloNftAction() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [nftUrl, setNftUrl] = useState("");
  const { completeAction } = useActions();

  const handleStart = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      // Open Celo NFT platform in a new tab
      window.open("https://nft.celo.org", "_blank");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!address || !nftUrl) return;

    setIsLoading(true);
    try {
      // Get the action ID from the database
      const response = await fetch("/api/actions/by-title", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: "Mint Celo NFT" }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to get action ID");
      }
      
      const { id } = await response.json();
      
      // Complete the action
      await completeAction(id, { 
        nftUrl,
        completedAt: new Date().toISOString(),
      });
      
      toast.success("Action completed successfully!");
      setNftUrl("");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to complete action");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Mint Celo NFT</h3>
      <p className="text-gray-600 mb-6">
        Create and mint an NFT on Celo to earn rewards.
      </p>
      
      <div className="mb-6">
        <h4 className="font-medium mb-2">Steps:</h4>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Visit celo.art or any Celo NFT platform</li>
          <li>Connect your wallet</li>
          <li>Create your NFT</li>
          <li>Mint it to your wallet</li>
          <li>Copy the NFT URL or ID</li>
          <li>Paste it below and click "Complete Action"</li>
        </ol>
      </div>
      
      <div className="mb-6">
        <h4 className="font-medium mb-2">Rewards:</h4>
        <p className="text-green-600 font-medium">10 CELO</p>
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
            "Start Minting"
          )}
        </Button>
        
        <div className="space-y-2">
          <Label htmlFor="nftUrl">NFT URL or ID</Label>
          <Input
            id="nftUrl"
            placeholder="https://celo.art/nft/..."
            value={nftUrl}
            onChange={(e) => setNftUrl(e.target.value)}
          />
        </div>
        
        <Button
          onClick={handleComplete}
          disabled={isLoading || !address || !nftUrl}
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
