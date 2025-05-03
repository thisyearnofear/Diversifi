'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  CheckCircle,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCeloSwap } from '@/hooks/use-celo-swap';
import { useTokenPrice } from '@/hooks/use-token-price';

interface CeloSwapCardCompactProps {
  onComplete?: () => void;
}

export function CeloSwapCardCompact(_props: CeloSwapCardCompactProps) {
  const { address } = useAccount();
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    status,
    error,
    txHash,
    isCompleted,
    swap,
    isCorrectNetwork,
    switchToCelo,
    isSwitchingChain,
  } = useCeloSwap();

  // State for the swap form
  const [amount, setAmount] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  // Get real-time exchange rates from CoinGecko
  const { prices } = useTokenPrice(['CELO', 'USDC']);

  // Calculate exchange rate based on CoinGecko prices
  // Fallback rate: 1 CELO = $0.29
  let exchangeRate = 0.29;

  if (prices?.CELO && prices.USDC) {
    // 1 CELO = x cUSD (where cUSD is pegged to USD)
    exchangeRate = prices.CELO.usd / prices.USDC.usd;
  }

  const estimatedOutput = Number.parseFloat(amount || '0') * exchangeRate;

  // Determine if we're in a loading state
  const isLoading =
    [
      'swapping',
      'transaction-pending',
      'transaction-submitted',
      'transaction-confirming',
      'completing',
    ].includes(status) || isSwitchingChain;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setAmount(value);
    }
  };

  const handleReview = () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setIsReviewing(true);
  };

  const handleBack = () => {
    setIsReviewing(false);
  };

  const handleSwap = () => {
    try {
      if (!address) {
        toast.error('Please connect your wallet first');
        return;
      }

      if (!amount || Number.parseFloat(amount) <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }

      // Call the swap function from the hook
      swap({
        amount: Number.parseFloat(amount),
      });
    } catch (error) {
      console.error('Error performing swap:', error);
      toast.error('Failed to perform swap');
    }
  };

  if (isCompleted) {
    return (
      <Card className="p-4 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
        <div className="flex items-center gap-3">
          <CheckCircle className="size-5 text-green-600" />
          <div>
            <h3 className="font-medium">cUSD Acquired</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You now have USD-backed stablecoins on Celo!
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
    <Card className="overflow-hidden border-yellow-200">
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Get Stablecoins</h3>
                <Badge
                  variant="outline"
                  className="text-xs bg-yellow-100 dark:bg-yellow-900 border-yellow-200"
                >
                  Step 2
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Swap CELO for cUSD
              </p>
              {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
              {!isCorrectNetwork && (
                <p className="text-xs text-amber-600 mt-1">
                  Please switch to the Celo network
                </p>
              )}
              {status === 'transaction-pending' && (
                <p className="text-xs text-amber-600 mt-1">
                  Transaction pending...
                </p>
              )}
              {status === 'transaction-submitted' && (
                <p className="text-xs text-amber-600 mt-1">
                  Transaction submitted, waiting for confirmation...
                </p>
              )}
              {status === 'transaction-confirming' && (
                <p className="text-xs text-amber-600 mt-1">
                  Transaction confirming on the blockchain...
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
            {!isCorrectNetwork ? (
              <Button
                onClick={switchToCelo}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Switching to Celo...
                  </>
                ) : (
                  'Switch to Celo Network'
                )}
              </Button>
            ) : !isReviewing ? (
              <>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Amount to swap
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter CELO amount"
                    value={amount}
                    onChange={handleAmountChange}
                    disabled={isLoading}
                  />
                  {amount && !Number.isNaN(Number.parseFloat(amount)) && (
                    <p className="text-xs text-gray-500 mt-1">
                      ≈ {estimatedOutput.toFixed(2)} cUSD
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleReview}
                    disabled={!amount || Number.parseFloat(amount) <= 0 || isLoading}
                  >
                    Review Swap
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <h4 className="font-medium">Review Swap Details</h4>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-md space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">You pay:</span>
                      <span className="text-sm font-medium">{amount} CELO</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">
                        You receive:
                      </span>
                      <span className="text-sm font-medium">
                        ≈ {estimatedOutput.toFixed(2)} cUSD
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Rate:</span>
                      <span className="text-sm">
                        1 CELO ≈ {exchangeRate.toFixed(2)} cUSD
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <span>
                        Rate: 1 CELO ≈ ${exchangeRate.toFixed(2)} ($
                        {(exchangeRate * 100).toFixed(0)}¢)
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Info className="size-3 mr-1" />
                      <span>
                        A small 0.25% fee is applied to support development
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-amber-600 mt-1">
                      <Info className="size-3 mr-1" />
                      <span>
                        This requires two transactions: first approve, then swap
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                  <Button onClick={handleSwap} disabled={isLoading}>
                    {status === 'transaction-pending' && (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Preparing Transaction...
                      </>
                    )}
                    {status === 'transaction-submitted' && (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Waiting for Confirmation...
                      </>
                    )}
                    {status === 'transaction-confirming' && (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Confirming Transaction...
                      </>
                    )}
                    {status === 'swapping' && (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Processing Swap...
                      </>
                    )}
                    {status !== 'transaction-pending' &&
                      status !== 'transaction-submitted' &&
                      status !== 'transaction-confirming' &&
                      status !== 'swapping' &&
                      'Confirm Swap'}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
