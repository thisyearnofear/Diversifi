"use client";

import { useState } from "react";
import { OptimismDivviRegistrationCardCompact } from "./optimism-divvi-registration-card-compact";
import { VelodromeSwapCardCompact } from "./velodrome-swap-card-compact";
import { useOptimismDivviRegistration } from "@/hooks/use-optimism-divvi-registration";
import { useVelodromeSwap } from "@/hooks/use-velodrome-swap";

interface EuraActionMessageProps {
  onComplete?: () => void;
}

export function EuraActionMessage({ onComplete }: EuraActionMessageProps) {
  // Get registration and swap status
  const { isRegistered } = useOptimismDivviRegistration();
  const { isCompleted: isSwapCompleted } = useVelodromeSwap();

  // Calculate overall progress
  const totalSteps = 2;
  const completedSteps = (isRegistered ? 1 : 0) + (isSwapCompleted ? 1 : 0);
  const progressPercentage = (completedSteps / totalSteps) * 100;

  // Actions for getting EURA on Optimism
  const actions = [
    {
      id: "optimism-divvi-registration",
      component: <OptimismDivviRegistrationCardCompact onComplete={() => {}} />,
      isCompleted: isRegistered,
    },
    {
      id: "velodrome-swap",
      component: <VelodromeSwapCardCompact onComplete={onComplete} />,
      isCompleted: isSwapCompleted,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 mb-2">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium">
            Get Euro-backed stablecoins on Optimism
          </div>
          <div className="text-xs text-gray-500">
            {completedSteps}/{totalSteps} steps completed
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {actions.map((action) => (
        <div key={action.id}>{action.component}</div>
      ))}
    </div>
  );
}
