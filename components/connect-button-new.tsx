"use client";

import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useStarterKit } from "@/hooks/use-starter-kit";
import { SparklesIcon } from "@/components/icons";
import { User, MessageCircle, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useAccount } from "wagmi";
import { SeparateAuthButtons } from "./separate-auth-buttons";

export function ConnectButton() {
  const isMobile = useIsMobile();
  const { claimed } = useStarterKit();
  const hasStarterKit = claimed > 0;
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { address, isConnected } = useAccount();
  const [isRequesting, setIsRequesting] = useState(false);

  if (isMobile) return null;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-center gap-3 mb-2">
        {/* Dashboard Icon */}
        <a href="/profile" className="flex items-center justify-center size-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Dashboard">
          <span className="size-4 text-green-600 dark:text-green-400 flex items-center justify-center"><User size={16} /></span>
        </a>
        {/* Social Icons */}
        <a href="https://warpcast.com/papa" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center size-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Farcaster">
          <span className="size-4 flex items-center justify-center text-purple-500"><MessageCircle size={16} /></span>
        </a>
        <a href="https://hey.xyz/u/papajams" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center size-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Lens">
          <span className="size-4 flex items-center justify-center text-green-500"><Globe size={16} /></span>
        </a>
        {/* Starter Kit Icon Only */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className={cn(
                "relative size-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors",
                { "animate-pulse": !hasStarterKit && !isRequesting }
              )}
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
                    headers: { "Content-Type": "application/json" },
                  });
                  const data = await response.json();
                  if (response.ok) {
                    toast.success(data.message || "Starter kit request successful!");
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
              title={hasStarterKit ? "You have a starter kit" : "Ask the agent for a starter kit!"}
            >
              <span className="size-4 flex items-center justify-center"><SparklesIcon size={16} /></span>
              {!hasStarterKit && !isRequesting && (
                <span className="absolute -top-1 -right-1 flex size-3">
                  <span className="animate-ping absolute inline-flex size-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full size-3 bg-sky-500"></span>
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {hasStarterKit ? "You have a starter kit" : "Ask the agent for a starter kit!"}
          </TooltipContent>
        </Tooltip>
      </div>

      <SeparateAuthButtons />
    </div>
  );
}
