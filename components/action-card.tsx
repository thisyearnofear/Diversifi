"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { type action } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useActions } from "@/hooks/use-actions";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { toast } from "sonner";

interface ActionCardProps {
  action: typeof action.$inferSelect;
  userAction?: any;
}

interface Step {
  title: string;
  description: string;
  link?: string;
}

interface Reward {
  type: "TOKEN" | "NFT" | "ENS" | "SOCIAL" | "OTHER";
  description: string;
}

export function ActionCard({ action, userAction }: ActionCardProps) {
  const steps = action.steps as Step[];
  const rewards = action.rewards as Reward[];
  const { isAuthenticated } = useAuth();
  const { startAction, completeAction } = useActions();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartAction = async () => {
    if (!isAuthenticated) {
      toast.error(
        "Please connect your wallet and authenticate to start actions"
      );
      return;
    }

    setIsLoading(true);
    try {
      await startAction(action.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteAction = async () => {
    if (!isAuthenticated) {
      toast.error(
        "Please connect your wallet and authenticate to complete actions"
      );
      return;
    }

    setIsLoading(true);
    try {
      await completeAction(action.id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        "rounded-lg border p-6 transition-colors",
        "hover:shadow-md",
        {
          "border-blue-200 bg-blue-50": action.chain === "BASE",
          "border-yellow-200 bg-yellow-50": action.chain === "CELO",
          "border-purple-200 bg-purple-50": action.chain === "ETHEREUM",
        }
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{action.title}</h3>
          <p className="mt-1 text-sm text-gray-600">{action.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium">
            {action.difficulty}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Steps:</h4>
        <ul className="space-y-2">
          {steps.map((step: Step, index: number) => (
            <li key={index} className="flex items-start gap-2">
              <Circle className="mt-1 h-4 w-4 flex-shrink-0 text-gray-400" />
              <div>
                <p className="text-sm font-medium">{step.title}</p>
                <p className="text-sm text-gray-600">{step.description}</p>
                {step.link && (
                  <a
                    href={step.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-xs text-blue-500 hover:underline"
                  >
                    Learn more →
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700">Rewards:</h4>
        <ul className="mt-2 space-y-1">
          {rewards.map((reward: Reward, index: number) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>{reward.description}</span>
            </li>
          ))}
        </ul>
      </div>

      {userAction ? (
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Badge
              className={cn(
                userAction.status === "COMPLETED"
                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                  : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
              )}
            >
              {userAction.status === "COMPLETED" ? (
                <>
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Completed
                </>
              ) : (
                <>
                  <Clock className="mr-1 h-3 w-3" />
                  In Progress
                </>
              )}
            </Badge>
            {userAction.status === "IN_PROGRESS" && (
              <Button
                size="sm"
                onClick={handleCompleteAction}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Complete Action"}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <Button
          className="mt-4 w-full"
          onClick={handleStartAction}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Start Action"}
        </Button>
      )}
    </motion.div>
  );
}
