'use client';

import { useState } from 'react';
import { CeloPusoActionMessage } from './celo-puso-action-message';

interface CeloPusoActionHandlerProps {
  args: any[];
}

export function CeloPusoActionHandler({ args }: CeloPusoActionHandlerProps) {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = () => {
    setIsCompleted(true);
  };

  return (
    <div className="my-4 w-full">
      <CeloPusoActionMessage onComplete={handleComplete} />
    </div>
  );
}
