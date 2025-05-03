'use client';

import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle } from 'lucide-react';
import { useCkesSwap } from '@/hooks/use-celo-ckes';

export function CeloCkesBalanceCard() {
  const { status, error, balance, isCorrectNetwork, isSwitchingChain } =
    useCkesSwap();

  if (!isCorrectNetwork) {
    return (
      <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-900/20">
        <div className="flex items-center gap-3">
          <Loader2 className="size-5 text-red-600 animate-spin" />
          <div>
            <h3 className="font-medium">Switch to Celo Network</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please switch your wallet to the Celo network to view your cKES
              balance.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (status === 'checking' || isSwitchingChain) {
    return (
      <Card className="p-4 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
        <div className="flex items-center gap-3">
          <Loader2 className="size-5 text-yellow-600 animate-spin" />
          <div>
            <h3 className="font-medium">Checking cKES Balance…</h3>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-900/20">
        <div className="flex items-center gap-3">
          <Loader2 className="size-5 text-red-600 animate-spin" />
          <div>
            <h3 className="font-medium">Error</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 border-green-200 bg-green-50 dark:bg-green-900/20">
      <div className="flex items-center gap-3">
        <CheckCircle className="size-5 text-green-600" />
        <div>
          <h3 className="font-medium">Your cKES Balance</h3>
          <p className="text-lg font-mono">{balance} cKES</p>
        </div>
      </div>
    </Card>
  );
}
