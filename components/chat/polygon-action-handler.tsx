"use client";

import { PolygonActionMessage } from "./polygon-action-message";

interface PolygonActionHandlerProps {
  args?: any[];
  onComplete?: () => void;
}

export function PolygonActionHandler({ args = [], onComplete }: PolygonActionHandlerProps) {
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
