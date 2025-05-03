'use client';

import { useState } from 'react';
import type { Message } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CeloPusoSwapCardCompact } from './celo-puso-swap-card-compact';
import { DivviRegistrationCardCompact } from './divvi-registration-card-compact';
import { useAccount } from 'wagmi';
import { useAuth } from '@/hooks/use-auth';
import { Coins } from 'lucide-react';
import { useDivviRegistration } from '@/hooks/use-divvi-registration';

interface CeloPusoActionMessageProps {
  message?: Message;
  onComplete?: () => void;
}

export function CeloPusoActionMessage({
  message,
  onComplete,
}: CeloPusoActionMessageProps) {
  const [showAction, setShowAction] = useState(false);
  const { address } = useAccount();
  const { isAuthenticated } = useAuth();
  const { isRegistered } = useDivviRegistration('celo');

  const handleStartAction = () => {
    setShowAction(true);
  };

  return (
    <div className="group relative flex items-start gap-3 py-4">
      <div className="flex size-8 shrink-0 select-none items-center justify-center rounded-md border bg-background shadow-sm">
        <Coins className="size-4 text-purple-500" />
      </div>
      <div className="flex-1 space-y-2 overflow-hidden px-1">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="font-semibold">Stable Station</div>
          </div>
          <div className="prose prose-sm max-w-none">
            <p>
              Get PUSO stablecoins on Celo. PUSO is a stablecoin pegged to the
              Philippine Peso.
            </p>
          </div>
        </div>
        {!showAction && (
          <Button
            size="sm"
            className="mt-2"
            onClick={handleStartAction}
            disabled={!address || !isAuthenticated}
          >
            Get PUSO
          </Button>
        )}
        {showAction && (
          <div className="mt-4 space-y-4">
            <Card className="overflow-hidden">
              <div className="bg-muted p-4">
                <h3 className="font-semibold">Get PUSO Stablecoins</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Follow these steps to get PUSO stablecoins on Celo.
                </p>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-4">
                  <DivviRegistrationCardCompact chain="celo" />
                  <CeloPusoSwapCardCompact isRegistered={isRegistered} />
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
