"use client";

import { useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { celo } from "wagmi/chains";
import { stringToHex } from "viem";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const REGISTRY_CONTRACT_ADDRESS = "0xBa9655677f4E42DD289F5b7888170bC0c7dA8Cdc";
const REFERRER_ID = "papa";

// Registry Contract ABI (minimal version for our needs)
const registryContractAbi = [
  {
    inputs: [
      { name: "user", type: "address" },
      { name: "protocolIds", type: "bytes32[]" },
    ],
    name: "isUserRegistered",
    outputs: [{ name: "", type: "bool[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "referrerId", type: "bytes32" },
      { name: "protocolIds", type: "bytes32[]" },
    ],
    name: "registerReferrals",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export function UbeswapSwapAction() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is registered
  const { data: isRegistered } = useReadContract({
    address: REGISTRY_CONTRACT_ADDRESS,
    abi: registryContractAbi,
    functionName: "isUserRegistered",
    args: address ? [address, [stringToHex("celo", { size: 32 })]] : undefined,
  });

  // Register user with Divvi Protocol
  const { writeContract } = useWriteContract();

  const handleStart = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      // If user is not registered, register them first
      if (!isRegistered?.[0]) {
        await writeContract({
          address: REGISTRY_CONTRACT_ADDRESS,
          abi: registryContractAbi,
          functionName: "registerReferrals",
          args: [
            stringToHex(REFERRER_ID, { size: 32 }),
            [stringToHex("celo", { size: 32 })],
          ],
        });
      }
      // Here we would typically redirect to Ubeswap
      window.open("https://ubeswap.org", "_blank");
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Swap on Ubeswap</h3>
      <p className="text-gray-600 mb-6">
        Perform a token swap on Ubeswap and earn rewards through the Divvi
        Protocol.
      </p>
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
          "Start Swap"
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
