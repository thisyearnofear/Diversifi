'use client';

import { useState } from 'react';
import { CeloCcopActionMessage } from './celo-ccop-action-message';

interface CeloCcopActionHandlerProps {
  args: any[];
}

export function CeloCcopActionHandler({ args }: CeloCcopActionHandlerProps) {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = () => {
    setIsCompleted(true);
    // No additional message needed
  };

  return (
    <div className="my-4 w-full">
      <CeloCcopActionMessage onComplete={handleComplete} />
    </div>
  );
}
