"use client";

import { useState } from "react";
import { DivviRegistrationCardCompact } from "./divvi-registration-card-compact";
import { useDivviRegistration } from "@/hooks/use-divvi-registration";
import { CeloCkesApproveCardCompact } from "./celo-ckes-approve-card-compact";
import { CeloCkesConfirmCardCompact } from "./celo-ckes-confirm-card-compact";
import { useCkesSwap } from "@/hooks/use-celo-ckes";

interface CeloCkesActionMessageProps {
  onComplete?: () => void;
}

export function CeloCkesActionMessage({
  onComplete,
}: CeloCkesActionMessageProps) {
  const { isRegistered } = useDivviRegistration("celo");
  // @ts-ignore - Ignoring type issues with the hook
  const { isApproved, isCompleted, status } = useCkesSwap() || {
    isApproved: false,
    isCompleted: false,
    status: "",
  };
  const [amount, setAmount] = useState<number>(0);

  // Track if the user has clicked "Proceed to Swap"
  const [proceedingToSwap, setProceedingToSwap] = useState<boolean>(false);

  // Check if approval is completed
  const isApprovalCompleted = isApproved || status === "approved";
  console.log(
    "Action Message - isApproved:",
    isApproved,
    "status:",
    status,
    "isApprovalCompleted:",
    isApprovalCompleted
  );

  // Check if confirmation is completed
  const isConfirmationCompleted = isCompleted;

  // Function to go back to the approval step
  const handleEditAmount = () => {
    setProceedingToSwap(false);
  };

  // Actions for getting cKES on Celo
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
        <CeloCkesApproveCardCompact
          onComplete={(value: number) => {
            console.log(
              "CeloCkesApproveCardCompact onComplete called with value:",
              value
            );
            setAmount(value);
            setProceedingToSwap(true);
          }}
        />
      ),
      isCompleted: isApprovalCompleted && proceedingToSwap,
    },
    {
      id: "celo-confirm",
      component: (
        <CeloCkesConfirmCardCompact
          amount={amount}
          onComplete={onComplete}
          onEditAmount={handleEditAmount}
        />
      ),
      isCompleted: isConfirmationCompleted,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-semibold">Get cKES Stablecoins on Celo</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Follow these steps to swap cUSD for Kenyan Shilling stablecoins on the
          Celo network. You'll need cUSD tokens in your wallet to proceed.
        </p>
      </div>

      <div className="space-y-4">
        {actions.map((action, index) => {
          // For the first two steps (registration and approval), only show if previous steps are completed
          // For the confirmation step, show it when the user clicks "Proceed to Swap"
          const shouldShow =
            index === 0 || // Always show registration
            (index === 1 && isRegistered) || // Show approval if registered
            (index === 2 && isApprovalCompleted && proceedingToSwap); // Show confirmation when proceeding to swap

          console.log(
            "Action step",
            index,
            "shouldShow:",
            shouldShow,
            "isRegistered:",
            isRegistered,
            "isApprovalCompleted:",
            isApprovalCompleted,
            "proceedingToSwap:",
            proceedingToSwap
          );

          if (!shouldShow) {
            return null;
          }

          return (
            <div key={action.id} className="relative">
              {index > 0 && (
                <div className="absolute left-4 -top-4 h-4 w-0.5 bg-gray-200 dark:bg-gray-700" />
              )}
              <div className="relative">
                <div className="flex items-center space-x-2 mb-2">
                  <div
                    className={`flex items-center justify-center size-8 rounded-full ${
                      action.isCompleted
                        ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                        : "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="font-medium">
                    {index === 0
                      ? "Register with Stable Station"
                      : index === 1
                      ? "Set Amount & Approve cUSD"
                      : "Confirm cUSD to cKES Swap"}
                  </span>
                </div>
                {action.component}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
