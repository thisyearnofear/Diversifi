'use client';

import { useState, useEffect } from 'react';
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
import { usePolygonDivviRegistration } from '@/hooks/use-polygon-divvi-registration';

interface PolygonDivviRegistrationCardCompactProps {
  onComplete?: () => void;
}

export function PolygonDivviRegistrationCardCompact({
  onComplete,
}: PolygonDivviRegistrationCardCompactProps) {
  const { address } = useAccount();
  const [isExpanded, setIsExpanded] = useState(true);
  const {
    status,
    error,
    txHash,
    isRegistered,
    isCorrectNetwork,
    isSwitchingChain,
    register,
    completeRegistration,
    switchToPolygon,
  } = usePolygonDivviRegistration();

  // Determine if we're in a loading state
  const isLoading = [
    'checking',
    'registering',
    'transaction-pending',
    'transaction-confirming',
    'transaction-submitted',
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
        await switchToPolygon();
      }

      await register();
    } catch (error) {
      console.error('Error registering:', error);
    }
  };

  // Handle completion
  const handleComplete = async () => {
    if (!address || !txHash) return;
    await completeRegistration(txHash);

    if (onComplete) {
      onComplete();
    }
  };

  // Call onComplete when status changes to completed
  const [hasCalledOnComplete, setHasCalledOnComplete] = useState(false);

  useEffect(() => {
    if (status === 'completed' && onComplete && !hasCalledOnComplete) {
      console.log('Registration completed, calling onComplete');
      setHasCalledOnComplete(true);
      onComplete();
    }
  }, [status, onComplete, hasCalledOnComplete]);

  if (isCompleted) {
    return (
      <Card className="p-4 border-purple-200 bg-purple-50 dark:bg-purple-900/20">
        <div className="flex items-center gap-3">
          <CheckCircle className="size-5 text-purple-600" />
          <div>
            <h3 className="font-medium">Registration Complete</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You're now registered with Stable Station on Polygon!
            </p>
            {txHash && (
              <a
                href={`https://polygonscan.com/tx/${txHash}`}
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
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Register with Stable Station</h3>
                <Badge
                  variant="outline"
                  className="text-xs bg-purple-100 dark:bg-purple-900 border-purple-200"
                >
                  Step 1
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Activate your Stable Station account on Polygon
              </p>
              {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
              {status === 'wrong-network' && (
                <p className="text-xs text-amber-600 mt-1">
                  You need to switch to the Polygon network to continue
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
                  Transaction successful! Click "Complete Registration"
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
                portfolio management, and insights on Polygon.
              </p>
              <div className="flex items-center text-xs text-blue-600">
                <a
                  href="https://polygon.technology"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:underline"
                >
                  Learn about Polygon
                  <ExternalLink className="ml-1 size-3" />
                </a>
              </div>
            </div>

            <div className="pt-3 border-t border-purple-100 dark:border-purple-800">
              <div className="flex gap-2">
                {!isCorrectNetwork ? (
                  <Button
                    onClick={switchToPolygon}
                    disabled={isLoading || !address || isSwitchingChain}
                    size="sm"
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    {isSwitchingChain ? (
                      <>
                        <Loader2 className="mr-2 size-3 animate-spin" />
                        Switching Network...
                      </>
                    ) : (
                      'Switch to Polygon Network'
                    )}
                  </Button>
                ) : status === 'not-registered' ||
                  status === 'error' ||
                  status === 'idle' ||
                  status === 'checking' ||
                  (status === 'transaction-pending' && error) ? (
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
