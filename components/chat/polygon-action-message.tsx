"use client";

import { useState } from "react";
import { PolygonDivviRegistrationCardCompact } from "./polygon-divvi-registration-card-compact";
import { PolygonSwapCardCompact } from "./polygon-swap-card-compact";
import { usePolygonDivviRegistration } from "@/hooks/use-polygon-divvi-registration";
import { usePolygonDaiSwap } from "@/hooks/use-polygon-dai-swap";

interface PolygonActionMessageProps {
  onComplete?: () => void;
}

export function PolygonActionMessage({
  onComplete,
}: PolygonActionMessageProps) {
  // Get registration and swap status
  const { isRegistered } = usePolygonDivviRegistration();
  const { isCompleted: isSwapCompleted } = usePolygonDaiSwap();

  // Calculate overall progress
  const totalSteps = 2;
  const completedSteps = (isRegistered ? 1 : 0) + (isSwapCompleted ? 1 : 0);
  const progressPercentage = (completedSteps / totalSteps) * 100;

  // Actions for getting DAI on Polygon
  const actions = [
    {
      id: "polygon-divvi-registration",
      component: <PolygonDivviRegistrationCardCompact onComplete={() => {}} />,
      isCompleted: isRegistered,
    },
    {
      id: "polygon-swap",
      component: <PolygonSwapCardCompact onComplete={onComplete} />,
      isCompleted: isSwapCompleted,
    },
  ];

  // Filter actions based on completion status
  // Only show the next uncompleted step and all completed steps
  const visibleActions = actions.filter((action, index) => {
    // Always show completed steps
    if (action.isCompleted) return true;

    // Show the first uncompleted step
    const previousCompleted = index === 0 || actions[index - 1].isCompleted;
    return previousCompleted;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 mb-2">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium">
            Get DAI stablecoins on Polygon
          </div>
          <div className="text-xs text-gray-500">
            {completedSteps} of {totalSteps} steps completed
          </div>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {visibleActions.map((action) => (
        <div key={action.id}>{action.component}</div>
      ))}
    </div>
  );
}
