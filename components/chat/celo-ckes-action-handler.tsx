'use client';

import { useState } from 'react';
import { CeloCkesActionMessage } from './celo-ckes-action-message';

interface CeloCkesActionHandlerProps {
  args: any[];
}

export function CeloCkesActionHandler({ args }: CeloCkesActionHandlerProps) {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = () => {
    setIsCompleted(true);
    // No additional message needed
  };

  return (
    <div className="my-4 w-full">
      <CeloCkesActionMessage onComplete={handleComplete} />
    </div>
  );
}
