"use client";

import { ConnectKitButton } from "connectkit";
import { useStarterKit } from "@/hooks/use-starter-kit";
import { SparklesIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export function ConnectButton() {
  const { claimed } = useStarterKit();
  const hasStarterKit = claimed > 0;

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
      <ConnectKitButton />
    </div>
  );
}
