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
import { Textarea } from "@/components/ui/textarea";

export function DeployContractAction() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [contractAddress, setContractAddress] = useState("");
  const [etherscanUrl, setEtherscanUrl] = useState("");
  const { completeAction } = useActions();

  const handleStart = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      // Open Remix IDE in a new tab
      window.open("https://remix.ethereum.org", "_blank");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!address || !contractAddress || !etherscanUrl) return;

    setIsLoading(true);
    try {
      // Get the action ID from the database
      const response = await fetch("/api/actions/by-title", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: "Deploy Smart Contract" }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to get action ID");
      }
      
      const { id } = await response.json();
      
      // Complete the action
      await completeAction(id, { 
        contractAddress,
        etherscanUrl,
        completedAt: new Date().toISOString(),
      });
      
      toast.success("Action completed successfully!");
      setContractAddress("");
      setEtherscanUrl("");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to complete action");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Deploy Smart Contract</h3>
      <p className="text-gray-600 mb-6">
        Deploy a simple smart contract to Ethereum and earn rewards.
      </p>
      
      <div className="mb-6">
        <h4 className="font-medium mb-2">Steps:</h4>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Write your contract (you can use Remix IDE)</li>
          <li>Compile it</li>
          <li>Deploy to testnet</li>
          <li>Verify on Etherscan</li>
          <li>Copy the contract address and Etherscan URL</li>
          <li>Paste them below and click "Complete Action"</li>
        </ol>
      </div>
      
      <div className="mb-6">
        <h4 className="font-medium mb-2">Sample Contract:</h4>
        <Textarea
          readOnly
          className="font-mono text-xs h-40"
          value={`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HelloWorld {
    string public message;
    
    constructor(string memory initialMessage) {
        message = initialMessage;
    }
    
    function updateMessage(string memory newMessage) public {
        message = newMessage;
    }
}`}
        />
      </div>
      
      <div className="mb-6">
        <h4 className="font-medium mb-2">Rewards:</h4>
        <p className="text-green-600 font-medium">0.5 ETH</p>
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
            "Start Deployment"
          )}
        </Button>
        
        <div className="space-y-2">
          <Label htmlFor="contractAddress">Contract Address</Label>
          <Input
            id="contractAddress"
            placeholder="0x..."
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="etherscanUrl">Etherscan URL</Label>
          <Input
            id="etherscanUrl"
            placeholder="https://etherscan.io/address/..."
            value={etherscanUrl}
            onChange={(e) => setEtherscanUrl(e.target.value)}
          />
        </div>
        
        <Button
          onClick={handleComplete}
          disabled={isLoading || !address || !contractAddress || !etherscanUrl}
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
