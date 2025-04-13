"use client";

import { useState } from "react";
import { PolygonDivviRegistrationCardCompact } from "./polygon-divvi-registration-card-compact";
import { PolygonSwapCardCompact } from "./polygon-swap-card-compact";
import { usePolygonDivviRegistration } from "@/hooks/use-polygon-divvi-registration";
import { usePolygonDaiSwap } from "@/hooks/use-polygon-dai-swap";

interface PolygonActionMessageProps {
  onComplete?: () => void;
}

export function PolygonActionMessage({ onComplete }: PolygonActionMessageProps) {
  const [showAll, setShowAll] = useState(false);

  // Get registration and swap status
  const { isRegistered } = usePolygonDivviRegistration();
  const { isCompleted: isSwapCompleted } = usePolygonDaiSwap();

  // Actions for getting DAI on Polygon
  const actions = [
    {
      id: "polygon-divvi-registration",
      component: <PolygonDivviRegistrationCardCompact onComplete={() => {}} />,
      isCompleted: isRegistered,
      title: "Step 1: Register with Divvi",
      description:
        "Register with Divvi to unlock portfolio tracking & rebalancing features.",
    },
    {
      id: "polygon-swap",
      component: <PolygonSwapCardCompact onComplete={onComplete} />,
      isCompleted: isSwapCompleted,
      title: "Step 2: Get DAI",
      description:
        "Swap MATIC for DAI stablecoins on Polygon.",
    },
  ];

  // Always show all actions since they're sequential steps
  const visibleActions = actions;

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm text-gray-500 mb-1">
        Follow these steps to get DAI stablecoins on Polygon:
      </div>

      {visibleActions.map((action) => (
        <div key={action.id} className="flex flex-col gap-2">
          <div className="flex flex-col">
            <h3 className="text-sm font-medium">{action.title}</h3>
            <p className="text-xs text-gray-500">{action.description}</p>
          </div>
          {action.component}
        </div>
      ))}
    </div>
  );
}
