"use client";

import { useState } from "react";
import { AerodromeSwapCardInapp } from "./aerodrome-swap-card-inapp";
import { DivviRegistrationCardCompact } from "./divvi-registration-card-compact";
import { useDivviRegistration } from "@/hooks/use-divvi-registration";
import { useAerodromeSwap } from "@/hooks/use-aerodrome-swap-inapp";

interface BaseActionMessageProps {
  onComplete?: () => void;
}

export function BaseActionMessage({ onComplete }: BaseActionMessageProps) {
  // Get registration and swap status
  const { isRegistered } = useDivviRegistration();
  const { isCompleted: isSwapCompleted } = useAerodromeSwap();

  // Calculate overall progress
  const totalSteps = 2;
  const completedSteps = (isRegistered ? 1 : 0) + (isSwapCompleted ? 1 : 0);
  const progressPercentage = (completedSteps / totalSteps) * 100;

  // Actions for getting USDbC on Base
  const actions = [
    {
      id: "divvi-registration",
      component: <DivviRegistrationCardCompact onComplete={() => {}} />,
      isCompleted: isRegistered,
    },
    {
      id: "aerodrome-swap",
      component: <AerodromeSwapCardInapp onComplete={onComplete} />,
      isCompleted: isSwapCompleted,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 mb-2">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium">
            Get USD-backed stablecoins on Base
          </div>
          <div className="text-xs text-gray-500">
            {completedSteps}/{totalSteps} steps completed
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-300 ease-in-out"
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
