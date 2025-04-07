"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomConnectButton } from "@/components/custom-connect-button";
import { useAccount } from "wagmi";
import { useState } from "react";
import { generateSiweMessage, verifySiweSignature } from "@/app/auth-actions";

export function AuthHelper() {
  const { isAuthenticated, isWeb3User } = useAuth();
  const { address, isConnected } = useAccount();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!address) return;
    
    try {
      setIsAuthenticating(true);
      setError(null);
      
      // Generate SIWE message
      const message = await generateSiweMessage(address as `0x${string}`);
      
      // Request signature from wallet
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, address],
      });
      
      // Verify signature
      const result = await verifySiweSignature(message, signature);
      
      if (result.status === "failed") {
        setError(result.error || "Authentication failed");
      }
      
      // Reload the page to update auth state
      window.location.reload();
    } catch (err) {
      console.error("Authentication error:", err);
      setError("Failed to authenticate. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (isAuthenticated) {
    return (
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Connected and Authenticated</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            You're ready to start completing actions and earning rewards!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>Connect Your Wallet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div>
            <p className="text-gray-600 mb-4">
              Connect your wallet to get started
            </p>
            <CustomConnectButton />
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">
              Sign in with your wallet to authenticate
            </p>
            <Button 
              onClick={handleSignIn} 
              disabled={isAuthenticating}
            >
              {isAuthenticating ? "Authenticating..." : "Sign In With Ethereum"}
            </Button>
            {error && (
              <p className="text-red-500 mt-2 text-sm">{error}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
