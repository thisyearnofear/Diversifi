'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { BlueCreateWalletButton } from '../wallet/BlueCreateWalletButton';
import { toast } from 'sonner';

export function WalletSetupCompact() {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isConnected && address) {
      toast.success('Wallet connected successfully!');
      setIsLoading(false);
    }
  }, [isConnected, address]);

  // Handle connection errors
  useEffect(() => {
    const handleError = (event: any) => {
      if (
        event.detail?.message?.includes('popup') ||
        event.detail?.message?.includes('window')
      ) {
        setError(
          'Failed to open wallet connection. Please check if pop-ups are blocked.',
        );
        setIsLoading(false);
      }
    };

    window.addEventListener('wallet-connection-error', handleError);

    return () => {
      window.removeEventListener('wallet-connection-error', handleError);
    };
  }, []);

  return (
    <Card className="p-2.5 w-full max-w-md mx-auto my-1.5 border border-muted rounded-md">
      <div className="flex flex-col mb-2">
        <h3 className="font-medium text-sm mb-1">
          Set Up Your Ethereum Wallet
        </h3>
        <p className="text-xs text-muted-foreground">
          Create a secure Coinbase wallet to get started with Ethereum.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <CheckCircle className="size-4 text-green-500" />
          ) : isLoading ? (
            <Loader2 className="size-4 animate-spin text-blue-500" />
          ) : (
            <div className="size-4 rounded-full border border-gray-300" />
          )}
          <span className="text-xs font-medium">Connect Wallet</span>
          {isConnected && address && (
            <span className="text-xs text-gray-500 truncate">
              ({address.substring(0, 6)}...
              {address.substring(address.length - 4)})
            </span>
          )}
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-500 text-xs">
            <AlertCircle className="size-3" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          {!isConnected ? (
            <div className="flex justify-center">
              <BlueCreateWalletButton />
            </div>
          ) : (
            <div className="text-center text-green-600 text-xs font-medium">
              Wallet connected successfully! You're ready to use Ethereum.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
