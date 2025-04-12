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
  const [showAll, setShowAll] = useState(false);

  // Get registration and swap status
  const { isRegistered } = useOptimismDivviRegistration();
  const { isCompleted: isSwapCompleted } = useVelodromeSwap();

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

  // Always show all actions since they're sequential steps
  const visibleActions = actions;

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm text-gray-500 mb-1">
        Follow these steps to get Euro-backed stablecoins on Optimism:
      </div>

      {visibleActions.map((action) => (
        <div key={action.id}>{action.component}</div>
      ))}
    </div>
  );
}
