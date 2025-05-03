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
import { useDivviRegistration } from '@/hooks/use-divvi-registration';

interface DivviRegistrationCardCompactProps {
  chain?: string;
  onComplete?: () => void;
}

export function DivviRegistrationCardCompact({
  chain = 'aerodrome',
  onComplete,
}: DivviRegistrationCardCompactProps) {
  const { address } = useAccount();
  // Initialize isExpanded to true by default if not registered
  const {
    status,
    error,
    txHash,
    isRegistered,
    isCorrectNetwork,
    isSwitchingChain,
    switchToCorrectNetwork,
    register,
    completeRegistration,
  } = useDivviRegistration(chain);

  // Set expanded state based on registration status
  const [isExpanded, setIsExpanded] = useState(!isRegistered);

  // Determine if we're in a loading state
  const isLoading = [
    'checking',
    'registering',
    'transaction-pending',
    'transaction-confirming',
    'completing',
  ].includes(status);

  // Determine if the registration is completed
  const isCompleted = isRegistered || status === 'completed';

  // Handle registration
  const handleRegister = async () => {
    if (!address) return;

    try {
      // First check if we're on the correct network
      if (!isCorrectNetwork) {
        await switchToCorrectNetwork();
      }

      await register();
    } catch (error) {
      console.error('Error registering:', error);
    }
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
      <Card className="p-4 border-green-200 bg-green-50 dark:bg-green-900/20">
        <div className="flex items-center gap-3">
          <CheckCircle className="size-5 text-green-600" />
          <div>
            <h3 className="font-medium">Registration Complete ✓</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {chain === 'celo'
                ? "You're now registered with Stable Station on Celo!"
                : "You're now registered with Stable Station on Base!"}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={`overflow-hidden ${
        chain === 'celo' ? 'border-yellow-200' : 'border-green-200'
      }`}
    >
      <div
        className={`p-4 ${
          chain === 'celo'
            ? 'bg-yellow-50 dark:bg-yellow-900/20'
            : 'bg-green-50 dark:bg-green-900/20'
        }`}
      >
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
                <h3 className="font-medium">Register</h3>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    chain === 'celo'
                      ? 'bg-yellow-100 dark:bg-yellow-900 border-yellow-200'
                      : 'bg-green-100 dark:bg-green-900 border-green-200'
                  }`}
                >
                  Step 1 of 2
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Activate your Stable Station account on{' '}
                {chain === 'celo' ? 'Celo' : 'Base'}
              </p>
              {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
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
                portfolio management, and insights on{' '}
                {chain === 'celo' ? 'Celo' : 'Base'}.
              </p>
              <div className="flex items-center text-xs text-blue-600">
                <a
                  href={
                    chain === 'celo' ? 'https://celo.org' : 'https://base.org'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:underline"
                >
                  Learn about {chain === 'celo' ? 'Celo' : 'Base'}.
                  <ExternalLink className="ml-1 size-3" />
                </a>
              </div>
            </div>

            <div
              className={`pt-3 border-t ${
                chain === 'celo'
                  ? 'border-yellow-100 dark:border-yellow-800'
                  : 'border-green-100 dark:border-green-800'
              }`}
            >
              <div className="flex gap-2">
                {!isCorrectNetwork ? (
                  <Button
                    onClick={switchToCorrectNetwork}
                    disabled={isLoading || !address || isSwitchingChain}
                    size="sm"
                    className="flex-1"
                  >
                    {isSwitchingChain ? (
                      <>
                        <Loader2 className="mr-2 size-3 animate-spin" />
                        Switching Network...
                      </>
                    ) : (
                      `Switch to ${chain === 'celo' ? 'Celo' : 'Base'}`
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
