"use client";

import { useState } from "react";
import { DivviRegistrationCardCompact } from "./divvi-registration-card-compact";
import { useDivviRegistration } from "@/hooks/use-divvi-registration";
import { CeloSwapCardCompact } from "./celo-swap-card-compact";
import { CeloApproveCardCompact } from "./celo-approve-card-compact";
import { CeloConfirmCardCompact } from "./celo-confirm-card-compact";
import { useCeloSwap } from "@/hooks/use-celo-swap";

interface CeloActionMessageProps {
  onComplete?: () => void;
}

export function CeloActionMessage({ onComplete }: CeloActionMessageProps) {
  const [showAll, setShowAll] = useState(false);

  // Get registration and swap status
  const { isRegistered } = useDivviRegistration("celo");
  const {
    isCompleted: isSwapCompleted,
    status: swapStatus,
    isApproved,
    approvalAmount,
  } = useCeloSwap();

  // Determine which steps are completed
  const isApprovalCompleted =
    isApproved || swapStatus === "approved" || swapStatus === "completed";
  const isConfirmationCompleted = isSwapCompleted || swapStatus === "completed";

  // Calculate the number of completed steps
  const completedSteps = [
    isRegistered,
    isApprovalCompleted,
    isConfirmationCompleted,
  ].filter(Boolean).length;

  // Total number of steps
  const totalSteps = 3;

  // Calculate progress percentage
  const progressPercentage = (completedSteps / totalSteps) * 100;

  // Create a shared state for the amount to be passed between approve and confirm steps
  const [amount, setAmount] = useState<number | null>(null);

  // Actions for getting cUSD on Celo
  const actions = [
    {
      id: "celo-divvi-registration",
      component: (
        <DivviRegistrationCardCompact chain="celo" onComplete={() => {}} />
      ),
      isCompleted: isRegistered,
    },
    {
      id: "celo-approve",
      component: (
        <CeloApproveCardCompact onComplete={(value) => setAmount(value)} />
      ),
      isCompleted: isApprovalCompleted,
    },
    {
      id: "celo-confirm",
      component: (
        <CeloConfirmCardCompact amount={amount} onComplete={onComplete} />
      ),
      isCompleted: isConfirmationCompleted,
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
            Get USD-backed stablecoins on Celo
          </div>
          <div className="text-xs text-gray-500">
            {completedSteps}/{totalSteps} steps completed
          </div>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-500 rounded-full transition-all duration-300 ease-in-out"
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
