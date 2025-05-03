'use client';

import { useState } from 'react';
import { EuraActionMessage } from './eura-action-message';

interface OptimismActionHandlerProps {
  args: any[];
}

export function OptimismActionHandler({ args }: OptimismActionHandlerProps) {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = () => {
    setIsCompleted(true);
  };

  return (
    <div className="my-4 w-full">
      <EuraActionMessage onComplete={handleComplete} />
    </div>
  );
}
