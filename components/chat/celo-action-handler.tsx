"use client";

import { useState } from "react";
import { CeloActionMessage } from "./celo-action-message";

interface CeloActionHandlerProps {
  args: any[];
}

export function CeloActionHandler({ args }: CeloActionHandlerProps) {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = () => {
    setIsCompleted(true);
    // No additional message needed
  };

  return (
    <div className="my-4 w-full">
      <CeloActionMessage onComplete={handleComplete} />
    </div>
  );
}
