"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useActions } from "@/hooks/use-actions";
import { toast } from "sonner";

// Aerodrome and USDbC constants
const AERODROME_URL = "https://aerodrome.finance/swap";
const USDBC_CONTRACT_ADDRESS = "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA";

export function AerodromeSwapAction() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const { completeAction } = useActions();

  const handleStart = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    // Open Aerodrome in a new tab with USDbC pre-selected
    window.open(
      `${AERODROME_URL}?inputCurrency=ETH&outputCurrency=${USDBC_CONTRACT_ADDRESS}`,
      "_blank"
    );
    toast.info("Aerodrome opened in a new tab");
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
        body: JSON.stringify({ title: "Swap to USDbC on Aerodrome" }),
      });

      if (!response.ok) {
        throw new Error("Failed to get action ID");
      }

      const { id } = await response.json();

      // Complete the action
      await completeAction(id, {
        txHash,
        platform: "aerodrome",
        completedAt: new Date().toISOString(),
      });

      toast.success("Action completed successfully!");
      setTxHash("");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to complete action. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Swap to USDbC on Aerodrome</h3>
      <p className="text-gray-600 mb-6">
        Swap your ETH for USDbC stablecoins on Aerodrome.
      </p>

      <div className="mb-6">
        <h4 className="font-medium mb-2">Steps:</h4>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Click "Open Aerodrome" to go to the swap interface</li>
          <li>Connect your wallet to Aerodrome</li>
          <li>Swap ETH for USDbC (already pre-selected)</li>
          <li>Confirm the transaction</li>
          <li>Copy the transaction hash</li>
          <li>Paste it below and click "Complete Action"</li>
        </ol>
      </div>

      <div className="mb-6">
        <h4 className="font-medium mb-2">About USDbC:</h4>
        <p className="text-sm text-gray-600 mb-2">
          USD Base Coin (USDbC) is a bridged version of USDC on the Base
          network. It provides a stable value pegged to the US dollar.
        </p>
        <div className="flex items-center text-sm text-blue-600">
          <a
            href="https://docs.base.org/tokens/usdbc"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:underline"
          >
            Learn more about USDbC
            <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </div>
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
            "Open Aerodrome"
          )}
        </Button>

        <div className="pt-4 border-t">
          <div className="mb-4">
            <label htmlFor="txHash" className="block text-sm font-medium mb-1">
              Transaction Hash
            </label>
            <Input
              id="txHash"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="0x..."
              className="w-full"
            />
          </div>

          <Button
            onClick={handleComplete}
            disabled={isLoading || !address || !txHash}
            variant="outline"
            className="w-full"
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
      </div>

      {!address && (
        <p className="mt-2 text-sm text-gray-500">
          Please connect your wallet to continue
        </p>
      )}
    </Card>
  );
}
