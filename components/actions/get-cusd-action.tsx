"use client";

import { useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { celo } from "wagmi/chains";
import { stringToHex } from "viem";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useActions } from "@/hooks/use-actions";

// Divvi Registry Contract on Celo
const REGISTRY_CONTRACT_ADDRESS = "0xBa9655677f4E42DD289F5b7888170bC0c7dA8Cdc";
const REFERRER_ID = "Papa";

// Simplified ABI for the registry contract
const registryContractAbi = [
  {
    inputs: [
      { internalType: "bytes32", name: "_referrerId", type: "bytes32" },
      { internalType: "bytes32[]", name: "_chains", type: "bytes32[]" },
    ],
    name: "registerReferrals",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_user", type: "address" },
      { internalType: "bytes32[]", name: "_chains", type: "bytes32[]" },
    ],
    name: "isUserRegistered",
    outputs: [{ internalType: "bool[]", name: "", type: "bool[]" }],
    stateMutability: "view",
    type: "function",
  },
];

export function GetCUSDAction() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const { completeAction } = useActions();

  // Check if user is registered
  const { data: isRegistered } = useReadContract({
    address: REGISTRY_CONTRACT_ADDRESS,
    abi: registryContractAbi,
    functionName: "isUserRegistered",
    args: address ? [address, [stringToHex("celo", { size: 32 })]] : undefined,
    chainId: celo.id,
  });

  // Register user with Divvi Protocol
  const { writeContract } = useWriteContract();

  const handleRegister = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      // Register the user with Divvi Protocol
      await writeContract({
        address: REGISTRY_CONTRACT_ADDRESS,
        abi: registryContractAbi,
        functionName: "registerReferrals",
        args: [
          stringToHex(REFERRER_ID, { size: 32 }),
          [stringToHex("celo", { size: 32 })],
        ],
        chainId: celo.id,
      });

      toast.success("Successfully registered with Divvi Protocol!");
    } catch (error) {
      console.error("Error registering with Divvi:", error);
      toast.error("Failed to register with Divvi Protocol");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwap = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      // Open Uniswap in a new tab with CELO and cUSD pre-selected
      window.open(
        "https://app.uniswap.org/#/swap?inputCurrency=0x471ece3750da237f93b8e339c536989b8978a438&outputCurrency=0x765DE816845861e75A25fCA122bb6898B8B1282a&chain=celo",
        "_blank"
      );
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
        body: JSON.stringify({ title: "Get cUSD Stablecoins" }),
      });

      if (!response.ok) {
        throw new Error("Failed to get action ID");
      }

      const { id } = await response.json();

      // Complete the action
      await completeAction(id, {
        transactionHash: txHash,
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
      <h3 className="text-xl font-semibold mb-4">Get cUSD Stablecoins</h3>
      <p className="text-gray-600 mb-6">
        Secure USD-backed tokens on Celo by swapping CELO for cUSD.
      </p>

      <div className="mb-6">
        <h4 className="font-medium mb-2">Steps:</h4>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Register with Divvi Protocol (one-time setup)</li>
          <li>Swap CELO for cUSD using Uniswap</li>
          <li>Copy the transaction hash</li>
          <li>Paste it below and click "Complete Action"</li>
        </ol>
      </div>

      <div className="mb-6">
        <h4 className="font-medium mb-2">Rewards:</h4>
        <p className="text-green-600 font-medium">
          Access to USD-backed stablecoins on Celo
        </p>
      </div>

      <div className="space-y-4">
        {!isRegistered?.[0 as keyof typeof isRegistered] && (
          <Button
            onClick={handleRegister}
            disabled={isLoading || !address}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              "1. Register with Divvi Protocol"
            )}
          </Button>
        )}

        <Button
          onClick={handleSwap}
          disabled={isLoading || !address}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "2. Swap CELO for cUSD"
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
            "3. Complete Action"
          )}
        </Button>
      </div>
    </Card>
  );
}
