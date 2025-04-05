"use client";

import { Button } from "@/components/ui/button";
import { useAccount, useSignMessage } from "wagmi";
import { useState } from "react";
import { toast } from "sonner";
import { generateSiweChallenge, verifySiwe } from "@/app/auth-actions";

export function AuthHelper() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleAuthenticate = async () => {
    if (!address || !isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsAuthenticating(true);
    try {
      // Generate a SIWE challenge
      const message = await generateSiweChallenge(address);
      
      // Sign the message
      const signature = await signMessageAsync({ message });
      
      // Verify the signature
      const result = await verifySiwe(message, signature);
      
      if (result.status === "success") {
        toast.success("Authentication successful!");
      } else {
        toast.error("Authentication failed");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error("Authentication failed");
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 border rounded-lg">
      <h2 className="text-lg font-medium">Authentication Helper</h2>
      <p className="text-sm text-muted-foreground">
        Connect your wallet and authenticate to access protected features
      </p>
      
      <div className="flex flex-col gap-2 w-full">
        <div className="text-sm">
          <span className="font-medium">Status:</span>{" "}
          {isConnected ? (
            <span className="text-green-500">Connected</span>
          ) : (
            <span className="text-red-500">Not connected</span>
          )}
        </div>
        
        <div className="text-sm">
          <span className="font-medium">Address:</span>{" "}
          {address ? (
            <span className="font-mono">{address}</span>
          ) : (
            <span className="text-muted-foreground">Not connected</span>
          )}
        </div>
      </div>
      
      <Button
        onClick={handleAuthenticate}
        disabled={!isConnected || isAuthenticating}
        className="w-full"
      >
        {isAuthenticating ? "Authenticating..." : "Authenticate with Wallet"}
      </Button>
      
      <p className="text-xs text-muted-foreground">
        This will create a session that allows you to access protected features
      </p>
    </div>
  );
}
