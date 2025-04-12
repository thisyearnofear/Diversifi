"use client";

import { useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { celo } from "wagmi/chains";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { GetCUSDAction } from "./get-cusd-action";

export function CeloActionCard() {
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const [isLoading, setIsLoading] = useState(false);

  const handleSwitchNetwork = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      await switchChain({ chainId: celo.id });
      toast.success("Switched to Celo network");
    } catch (error) {
      console.error("Error switching network:", error);
      toast.error("Failed to switch network");
    } finally {
      setIsLoading(false);
    }
  };

  const isOnCelo = chainId === celo.id;

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Celo Actions</CardTitle>
      </CardHeader>
      <CardContent>
        {!address ? (
          <div className="text-center p-6">
            <p className="mb-4">Connect your wallet to access Celo actions</p>
          </div>
        ) : !isOnCelo ? (
          <div className="text-center p-6">
            <p className="mb-4">Switch to the Celo network to continue</p>
            <Button onClick={handleSwitchNetwork} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Switching...
                </>
              ) : (
                "Switch to Celo"
              )}
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="get-cusd">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="get-cusd">Get cUSD Stablecoins</TabsTrigger>
            </TabsList>
            <TabsContent value="get-cusd" className="mt-4">
              <GetCUSDAction />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-gray-500">
        <div>Chain: Celo</div>
        <div>Difficulty: Beginner</div>
      </CardFooter>
    </Card>
  );
}
