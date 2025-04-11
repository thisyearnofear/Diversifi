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
  const [showAll, setShowAll] = useState(false);

  // Get registration and swap status
  const { isRegistered } = useDivviRegistration();
  const { isCompleted: isSwapCompleted } = useAerodromeSwap();

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

  // Always show all actions since they're sequential steps
  const visibleActions = actions;

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm text-gray-500 mb-1">
        Follow these steps to get USD-backed stablecoins on Base:
      </div>

      {visibleActions.map((action) => (
        <div key={action.id}>{action.component}</div>
      ))}
    </div>
  );
}
