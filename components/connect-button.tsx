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
      // Generate a SIWE challenge
      const message = await generateSiweChallenge(address);

      // Sign the message
      const signature = await signMessageAsync({ message });

      // Verify the signature
      const result = await verifySiwe(message, signature);

      if (result.status === "success") {
        toast.success("Authentication successful!");
        // Refresh the page to update auth state
        window.location.reload();
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
              className="relative animate-pulse"
              onClick={handleAuthenticate}
              disabled={isAuthenticating}
            >
              🔑
            </Button>
          </TooltipTrigger>
          <TooltipContent>Sign in with your wallet</TooltipContent>
        </Tooltip>
      )}

      <CustomConnectButton />
    </div>
  );
}
