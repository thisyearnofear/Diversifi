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
import { useAccount } from "wagmi";
import { AuthHelper } from "./auth-helper";

export function ConnectButton() {
  const { claimed } = useStarterKit();
  const hasStarterKit = claimed > 0;
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { address, isConnected } = useAccount();
  const [isRequesting, setIsRequesting] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn("relative", {
              "animate-pulse": !hasStarterKit,
            })}
            disabled={isRequesting}
            onClick={async () => {
              if (!isAuthenticated) {
                toast.error("Please connect and authenticate your wallet first");
                return;
              }

              if (isRequesting) return;

              setIsRequesting(true);
              try {
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
            <div>
              <AuthHelper 
                variant="compact" 
                onAuthenticated={() => window.location.reload()}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>Sign in with your wallet</TooltipContent>
        </Tooltip>
      )}

      {!isConnected && <CustomConnectButton />}
    </div>
  );
}
