'use client';
import { DivviRegistrationCardCompact } from './divvi-registration-card-compact';
import { useDivviRegistration } from '@/hooks/use-divvi-registration';

interface BaseActionMessageProps {
  onComplete?: () => void;
}

export function BaseActionMessage({ onComplete }: BaseActionMessageProps) {
  // Get registration status
  const { isRegistered } = useDivviRegistration();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 mb-2">
        <div className="text-sm font-medium">
          Register on Base
        </div>
      </div>

      <DivviRegistrationCardCompact onComplete={onComplete} />
    </div>
  );
}
