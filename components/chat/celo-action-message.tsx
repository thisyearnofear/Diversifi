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
      title: "Step 1: Register with Divvi",
      description:
        "Register with Divvi to unlock portfolio tracking & rebalancing features.",
    },
    {
      id: "celo-approve",
      component: (
        <CeloApproveCardCompact onComplete={(value) => setAmount(value)} />
      ),
      isCompleted: isApprovalCompleted,
      title: "Step 2: Set Amount & Approve",
      description:
        "Set the amount of CELO to swap and approve the transaction.",
    },
    {
      id: "celo-confirm",
      component: (
        <CeloConfirmCardCompact amount={amount} onComplete={onComplete} />
      ),
      isCompleted: isConfirmationCompleted,
      title: "Step 3: Confirm & Swap",
      description: "Confirm and execute the swap to receive cUSD.",
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
      <div className="text-sm text-gray-500 mb-1">
        Follow these steps to get USD-backed stablecoins on Celo:
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
