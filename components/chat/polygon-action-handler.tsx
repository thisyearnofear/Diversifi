"use client";

// Import the polygon action message component
import { PolygonActionMessage } from "./polygon-action-message";

interface PolygonActionHandlerProps {
  args?: any[];
  onComplete?: () => void;
}

export function PolygonActionHandler({
  args = [],
  onComplete,
}: PolygonActionHandlerProps) {
  return (
    <PolygonActionMessage
      onComplete={() => {
        if (onComplete) {
          onComplete();
        }
      }}
    />
  );
}
