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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function DaoAction() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [daoName, setDaoName] = useState("");
  const [actionType, setActionType] = useState("vote");
  const [txHash, setTxHash] = useState("");
  const { completeAction } = useActions();

  const handleStart = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      // Open Snapshot in a new tab
      window.open("https://snapshot.org", "_blank");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!address || !daoName || !actionType || !txHash) return;

    setIsLoading(true);
    try {
      // Get the action ID from the database
      const response = await fetch("/api/actions/by-title", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: "Participate in DAO" }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to get action ID");
      }
      
      const { id } = await response.json();
      
      // Complete the action
      await completeAction(id, { 
        daoName,
        actionType,
        txHash,
        completedAt: new Date().toISOString(),
      });
      
      toast.success("Action completed successfully!");
      setDaoName("");
      setActionType("vote");
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
      <h3 className="text-xl font-semibold mb-4">Participate in DAO</h3>
      <p className="text-gray-600 mb-6">
        Join and participate in a DAO governance to earn rewards.
      </p>
      
      <div className="mb-6">
        <h4 className="font-medium mb-2">Steps:</h4>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Join a DAO (e.g., on Snapshot, Aragon, or DAOhaus)</li>
          <li>Get governance tokens</li>
          <li>Create a proposal or vote on existing proposals</li>
          <li>Copy the transaction hash or proposal ID</li>
          <li>Fill in the details below and click "Complete Action"</li>
        </ol>
      </div>
      
      <div className="mb-6">
        <h4 className="font-medium mb-2">Suggested DAOs:</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Uniswap</li>
          <li>Aave</li>
          <li>Compound</li>
          <li>ENS</li>
          <li>Gitcoin</li>
        </ul>
      </div>
      
      <div className="mb-6">
        <h4 className="font-medium mb-2">Rewards:</h4>
        <p className="text-green-600 font-medium">0.3 ETH</p>
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
            "Start DAO Participation"
          )}
        </Button>
        
        <div className="space-y-2">
          <Label htmlFor="daoName">DAO Name</Label>
          <Input
            id="daoName"
            placeholder="e.g., Uniswap, Aave, etc."
            value={daoName}
            onChange={(e) => setDaoName(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="actionType">Action Type</Label>
          <Select value={actionType} onValueChange={setActionType}>
            <SelectTrigger>
              <SelectValue placeholder="Select action type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vote">Vote on Proposal</SelectItem>
              <SelectItem value="create">Create Proposal</SelectItem>
              <SelectItem value="delegate">Delegate Votes</SelectItem>
              <SelectItem value="other">Other Participation</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="txHash">Transaction Hash or Proposal ID</Label>
          <Input
            id="txHash"
            placeholder="0x... or proposal ID"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
          />
        </div>
        
        <Button
          onClick={handleComplete}
          disabled={isLoading || !address || !daoName || !actionType || !txHash}
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
