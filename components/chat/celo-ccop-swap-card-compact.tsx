'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCcopSwap } from '@/hooks/use-celo-ccop';
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
  Loader2,
} from 'lucide-react';

interface CeloCcopSwapCardCompactProps {
  isRegistered?: boolean;
}

export function CeloCcopSwapCardCompact({
  isRegistered = false,
}: CeloCcopSwapCardCompactProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [amount, setAmount] = useState('10');

  const {
    status,
    error,
    txHash,
    isCompleted,
    isCorrectNetwork,
    isSwitchingChain,
    exchangeRate,
    swap,
    switchToCelo,
  } = useCcopSwap();

  const canSwap =
    isRegistered && isCorrectNetwork && amount && Number.parseFloat(amount) > 0;

  const calculateEstimatedOutput = () => {
    if (!amount || Number.isNaN(Number.parseFloat(amount))) return '0';
    const output = Number.parseFloat(amount) * exchangeRate;
    return output.toFixed(2);
  };

  const handleSwap = () => {
    if (canSwap) {
      swap({ amount: Number.parseFloat(amount) });
    }
  };

  // If the swap is completed, show a success card
  if (isCompleted) {
    return (
      <Card className="p-4 border-purple-200 bg-purple-50 dark:bg-purple-900/20">
        <div className="flex items-center gap-3">
          <CheckCircle className="size-5 text-purple-600" />
          <div>
            <h3 className="font-medium">Swap Complete ✓</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You've successfully swapped for cCOP on Celo!
            </p>
            {txHash && (
              <a
                href={`https://explorer.celo.org/mainnet/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 flex items-center mt-1 hover:underline"
              >
                View transaction
                <ExternalLink className="size-3 ml-1" />
              </a>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-purple-200">
      <div className="p-4 bg-purple-50 dark:bg-purple-900/20">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              {/* Status indicator icon */}
              {isRegistered ? (
                status === 'swapping' ||
                status === 'completing' ||
                status === 'switching-network' ? (
                  <Loader2 className="size-5 text-purple-500 animate-spin" />
                ) : (
                  <div className="size-5 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                    2
                  </div>
                )
              ) : (
                <div className="size-5 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
                  2
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Swap to cCOP</h3>
                <Badge
                  variant="outline"
                  className="text-xs bg-purple-100 dark:bg-purple-900 border-purple-200"
                >
                  Step 2 of 2
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Get Colombian Peso stablecoins on Celo
              </p>
              {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
              {!isRegistered && (
                <p className="text-xs text-amber-600 mt-1">
                  Complete registration in Step 1 to unlock this step
                </p>
              )}
              {isRegistered && !isCorrectNetwork && (
                <p className="text-xs text-amber-600 mt-1">
                  You need to switch to the Celo network to continue
                </p>
              )}
              {isSwitchingChain && (
                <p className="text-xs text-amber-600 mt-1">
                  Switching to Celo network...
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="size-8 p-0 rounded-full"
            onClick={() => setIsExpanded(!isExpanded)}
            disabled={!isRegistered}
          >
            {isExpanded ? (
              <ChevronUp className="size-3" />
            ) : (
              <ChevronDown className="size-3" />
            )}
          </Button>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">About cCOP:</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                cCOP is a Colombian Peso stablecoin on the Celo blockchain,
                providing a stable digital asset pegged to the Colombian Peso.
              </p>
              <div className="flex items-center text-xs text-blue-600">
                <a
                  href="https://explorer.celo.org/mainnet/token/0x8A567e2aE79CA692Bd748aB832081C45de4041eA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:underline"
                >
                  View on Celo Explorer
                  <ExternalLink className="ml-1 size-3" />
                </a>
              </div>
            </div>

            {!isCorrectNetwork ? (
              <div className="space-y-3">
                <Button
                  onClick={switchToCelo}
                  disabled={isSwitchingChain}
                  size="sm"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isSwitchingChain ? (
                    <>
                      <Loader2 className="mr-2 size-3 animate-spin" />
                      Switching Network...
                    </>
                  ) : (
                    'Switch to Celo Network'
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium">From (cUSD)</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="number"
                      placeholder="Amount"
                      className="flex-1 h-8 text-xs"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between">
                    <label className="text-xs font-medium">
                      Estimated cCOP
                    </label>
                    <span className="text-xs text-gray-500">
                      {calculateEstimatedOutput()}
                    </span>
                  </div>
                  <div className="flex items-center mt-1 text-xs text-amber-600">
                    <Info className="size-3 mr-1" />
                    <span>Exchange rates may vary</span>
                  </div>
                </div>

                <Button
                  onClick={handleSwap}
                  disabled={
                    !canSwap || status === 'swapping' || status === 'approving'
                  }
                  size="sm"
                  className="w-full"
                >
                  {status === 'swapping' || status === 'approving' ? (
                    <>
                      <Loader2 className="mr-2 size-3 animate-spin" />
                      {status === 'approving' ? 'Approving...' : 'Swapping...'}
                    </>
                  ) : (
                    'Swap to cCOP'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
