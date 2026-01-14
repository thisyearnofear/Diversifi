'use client';

import { usePolygonDivviRegistration } from '@/hooks/use-polygon-divvi-registration';
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

  // If registration is completed, trigger onComplete
  useEffect(() => {
    if (isRegistered && onComplete) {
      onComplete();
    }
  }, [isRegistered, onComplete]);

  return (
    <div className="flex flex-col gap-4">
      <div className="prose dark:prose-invert">
        <p>
          I can help you with Polygon chain actions. Register to get started.
        </p>
      </div>
    </div>
  );
}
