'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Loader2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useOptimismDivviRegistration } from '@/hooks/use-optimism-divvi-registration';

interface OptimismDivviRegistrationCardCompactProps {
  onComplete?: () => void;
}

export function OptimismDivviRegistrationCardCompact({
  onComplete,
}: OptimismDivviRegistrationCardCompactProps) {
  const { address } = useAccount();
  const {
    status,
    error,
    txHash,
    isRegistered,
    isCorrectNetwork,
    isSwitchingChain,
    register,
    completeRegistration,
    switchToOptimism,
  } = useOptimismDivviRegistration();

  // Set expanded state based on registration status
  const [isExpanded, setIsExpanded] = useState(!isRegistered);

  // Determine if we're in a loading state
  const isLoading = [
    'checking',
    'registering',
    'transaction-pending',
    'transaction-confirming',
    'completing',
    'switching-network',
  ].includes(status);

  // Determine if the registration is completed
  const isCompleted = isRegistered || status === 'completed';

  // Handle registration
  const handleRegister = async () => {
    if (!address) return;
    await register();
  };

  // Handle completion
  const handleComplete = async () => {
    if (!address || !txHash) return;
    await completeRegistration();

    if (onComplete) {
      onComplete();
    }
  };

  if (isCompleted) {
    return (
      <Card className="p-4 border-purple-200 bg-purple-50 dark:bg-purple-900/20">
        <div className="flex items-center gap-3">
          <CheckCircle className="size-5 text-purple-600" />
          <div>
            <h3 className="font-medium">Registration Complete ✓</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You're now registered with Stable Station on Optimism!
            </p>
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
              {status === 'transaction-success' ||
              status === 'transaction-confirming' ||
              status === 'transaction-pending' ? (
                <Loader2 className="size-5 text-amber-500 animate-spin" />
              ) : (
                <div className="size-5 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold">
                  !
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Register on Optimism</h3>
                <Badge
                  variant="outline"
                  className="text-xs bg-purple-100 dark:bg-purple-900 border-purple-200"
                >
                  Step 1 of 2
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Activate your account on the Optimism ecosystem
              </p>
              {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
              {status === 'wrong-network' && (
                <p className="text-xs text-amber-600 mt-1">
                  You need to switch to the Optimism network to continue
                </p>
              )}
              {status === 'transaction-pending' && (
                <p className="text-xs text-amber-600 mt-1">
                  Transaction pending...
                </p>
              )}
              {status === 'transaction-confirming' && (
                <p className="text-xs text-amber-600 mt-1">
                  Transaction confirming...
                </p>
              )}
              {status === 'transaction-success' && (
                <p className="text-xs text-green-600 mt-1">
                  Transaction successful! Click "Complete Setup"
                </p>
              )}
              {status === 'switching-network' && (
                <p className="text-xs text-amber-600 mt-1">
                  Switching to Optimism network...
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="size-8 p-0 rounded-full"
            onClick={() => setIsExpanded(!isExpanded)}
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
              <h4 className="text-sm font-medium mb-2">Unlock Features:</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                This one-time registration unlocks access to stablecoin tools,
                portfolio management, and insights on Optimism.
              </p>
              <div className="flex items-center text-xs text-blue-600">
                <a
                  href="https://www.optimism.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:underline"
                >
                  Learn about Optimism
                  <ExternalLink className="ml-1 size-3" />
                </a>
              </div>
            </div>

            <div className="pt-3 border-t border-purple-100 dark:border-purple-800">
              <div className="flex gap-2">
                {status === 'wrong-network' ? (
                  <Button
                    onClick={switchToOptimism}
                    disabled={isLoading}
                    size="sm"
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 size-3 animate-spin" />
                        Switching Network...
                      </>
                    ) : (
                      'Switch to Optimism Network'
                    )}
                  </Button>
                ) : status === 'not-registered' ||
                  status === 'error' ||
                  status === 'idle' ||
                  status === 'transaction-failed' ? (
                  <Button
                    onClick={handleRegister}
                    disabled={isLoading || !address}
                    size="sm"
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 size-3 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Register'
                    )}
                  </Button>
                ) : status === 'transaction-success' ? (
                  <Button
                    onClick={handleComplete}
                    disabled={isLoading}
                    size="sm"
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 size-3 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Complete Registration'
                    )}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
