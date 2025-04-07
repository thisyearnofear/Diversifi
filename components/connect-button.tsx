"use client";

import { useState } from "react";
import { CustomConnectButton } from "./custom-connect-button";
import { useStarterKit } from "@/hooks/use-starter-kit";
import { SparklesIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { eventBus, EVENTS } from "@/lib/events";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useAccount, useSignMessage } from "wagmi";
import { generateSiweChallenge, verifySiwe } from "@/app/auth-actions";

export function ConnectButton() {
  const { claimed } = useStarterKit();
  const hasStarterKit = claimed > 0;
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [isRequesting, setIsRequesting] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleAuthenticate = async () => {
    if (!address || !isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsAuthenticating(true);
    try {
      // Add a small delay to ensure the browser recognizes this as a user action
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Generate a SIWE challenge
      console.log("Generating SIWE challenge for address:", address);
      const message = await generateSiweChallenge(address);
      console.log("Generated SIWE message:", message);

      // Sign the message with a try-catch to handle popup errors
      try {
        console.log("Requesting signature for message...");
        const signature = await signMessageAsync({ message });
        console.log("Signature received:", signature.slice(0, 10) + "...");

        // Verify the signature
        console.log("Verifying signature...");
        const result = await verifySiwe(message, signature);
        console.log("Verification result:", result);

        if (result.status === "success") {
          toast.success("Authentication successful!");
          console.log("Authentication successful, redirecting...");

          // Instead of reloading immediately, wait a moment for cookies to be set
          setTimeout(() => {
            // Navigate to home page first, then reload
            window.location.href = "/";
          }, 500);
        } else {
          console.error("Authentication failed:", result.error);
          toast.error("Authentication failed: " + (result.error || ""));
        }
      } catch (signError: any) {
        console.error("Signing error:", signError);
        if (
          signError.message?.includes("window") ||
          signError.message?.includes("popup")
        ) {
          toast.error(
            "Failed to open signature window. Please check if pop-ups are blocked."
          );
        } else {
          toast.error(
            "Failed to sign message: " + (signError.message || "Unknown error")
          );
        }
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast.error(
        "Authentication failed: " + (error.message || "Unknown error")
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "relative",
              hasStarterKit && "text-yellow-500 hover:text-yellow-600"
            )}
            onClick={async () => {
              if (!isAuthenticated) {
                toast.error("Please connect your wallet and sign in first");
                return;
              }

              setIsRequesting(true);
              try {
                // Direct API call to request a starter kit
                const response = await fetch("/api/starter-kit/request", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                });

                const data = await response.json();

                if (response.ok) {
                  toast.success(
                    data.message || "Starter kit request successful!"
                  );
                  // Refresh starter kit data
                  window.location.reload();
                } else {
                  toast.error(data.error || "Failed to request starter kit");
                }
              } catch (error) {
                console.error("Error requesting starter kit:", error);
                toast.error("An error occurred while requesting a starter kit");
              } finally {
                setIsRequesting(false);
              }
            }}
          >
            <SparklesIcon />
            {!hasStarterKit && (
              <span className="absolute -top-1 -right-1 flex size-3">
                <span className="animate-ping absolute inline-flex size-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full size-3 bg-sky-500"></span>
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {hasStarterKit
            ? "You have a starter kit"
            : "Ask the agent for a starter kit!"}
        </TooltipContent>
      </Tooltip>
      {isConnected && !isAuthenticated && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={`relative ${isAuthenticating ? "" : "animate-pulse"}`}
              onClick={handleAuthenticate}
              disabled={isAuthenticating}
            >
              {isAuthenticating ? (
                <span className="animate-spin">⌛</span>
              ) : (
                <span>🔑</span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Sign in with your wallet</TooltipContent>
        </Tooltip>
      )}

      <CustomConnectButton />
    </div>
  );
}
