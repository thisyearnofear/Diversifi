'use client';

// Import the polygon action message component
import { PolygonActionMessage } from './polygon-action-message';
import { usePolygonDivviRegistration } from '@/hooks/use-polygon-divvi-registration';
import { usePolygonDaiSwap } from '@/hooks/use-polygon-dai-swap';
import { useEffect } from 'react';

interface PolygonActionHandlerProps {
  args?: any[];
  onComplete?: () => void;
}

export function PolygonActionHandler({
  args = [],
  onComplete,
}: PolygonActionHandlerProps) {
  const { isRegistered } = usePolygonDivviRegistration();
  const { isCompleted: isSwapCompleted } = usePolygonDaiSwap();

  // If both registration and swap are completed, trigger onComplete
  useEffect(() => {
    if (isRegistered && isSwapCompleted && onComplete) {
      onComplete();
    }
  }, [isRegistered, isSwapCompleted, onComplete]);

  return (
    <div className="flex flex-col gap-4">
      <div className="prose dark:prose-invert">
        <p>
          I can help you get DAI stablecoins on Polygon. DAI is a decentralized
          stablecoin pegged to the US Dollar.
        </p>
      </div>
      <PolygonActionMessage onComplete={onComplete} />
    </div>
  );
}
