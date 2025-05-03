'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function WalletSetupCardCompact() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [walletCreated, setWalletCreated] = useState(false);
  const [walletFunded, setWalletFunded] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletBalance, setWalletBalance] = useState('');
  const [error, setError] = useState('');

  const createWallet = async () => {
    setIsCreating(true);
    setError('');

    try {
      console.log('Calling wallet creation API...');
      const response = await fetch('/api/wallet/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Wallet creation API response:', data);

      if (!response.ok) {
        console.error('Wallet creation failed with status:', response.status);
        throw new Error(data.error || 'Failed to create wallet');
      }

      setWalletCreated(true);
      setWalletAddress(data.wallet.address);
      toast.success('Wallet created successfully!');

      // Check if the wallet already has a balance
      await checkBalance();
    } catch (error: any) {
      console.error('Error creating wallet:', error);
      setError(error.message || 'Failed to create wallet');
      toast.error(
        `Failed to create wallet: ${error.message || 'Unknown error'}`,
      );
    } finally {
      setIsCreating(false);
    }
  };

  const fundWallet = async () => {
    setIsFunding(true);
    setError('');

    try {
      const response = await fetch('/api/wallet/fund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fund wallet');
      }

      setWalletFunded(true);
      toast.success('Wallet funded successfully!');

      // Check the updated balance
      await checkBalance();
    } catch (error: any) {
      console.error('Error funding wallet:', error);
      setError(error.message || 'Failed to fund wallet');
      toast.error(
        `Failed to fund wallet: ${error.message || 'Unknown error'}`,
      );
    } finally {
      setIsFunding(false);
    }
  };

  const checkBalance = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/wallet/balance');

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get wallet balance');
      }

      setWalletBalance(data.balance);

      if (Number.parseFloat(data.balance) > 0) {
        setWalletFunded(true);
      }
    } catch (error: any) {
      console.error('Error checking balance:', error);
      // Don't show an error toast for balance check
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);

    try {
      // First, check if the user already has a wallet
      const response = await fetch('/api/wallet/balance');
      const data = await response.json();

      if (response.ok) {
        // User already has a wallet
        setWalletCreated(true);
        setWalletAddress(data.address);
        setWalletBalance(data.balance);

        if (Number.parseFloat(data.balance) > 0) {
          setWalletFunded(true);
        }

        toast.success('Found your existing wallet!');
      } else {
        // User doesn't have a wallet, create one
        await createWallet();
      }
    } catch (error: any) {
      console.error('Error starting wallet setup:', error);
      setError(error.message || 'Failed to start wallet setup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-2.5 w-full max-w-md mx-auto my-1.5 border border-muted rounded-md">
      <div className="flex flex-col mb-2">
        <h3 className="font-medium text-sm mb-1">
          Set Up Your Ethereum Wallet
        </h3>
        <p className="text-xs text-muted-foreground">
          Create a secure Coinbase-managed wallet to get started with Ethereum.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          {walletCreated ? (
            <CheckCircle className="size-4 text-green-500" />
          ) : isCreating ? (
            <Loader2 className="size-4 animate-spin text-blue-500" />
          ) : (
            <div className="size-4 rounded-full border border-gray-300" />
          )}
          <span className="text-xs font-medium">Create Wallet</span>
          {walletCreated && walletAddress && (
            <span className="text-xs text-gray-500 truncate">
              ({walletAddress.substring(0, 6)}...
              {walletAddress.substring(walletAddress.length - 4)})
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {walletFunded ? (
            <CheckCircle className="size-4 text-green-500" />
          ) : isFunding ? (
            <Loader2 className="size-4 animate-spin text-blue-500" />
          ) : (
            <div className="size-4 rounded-full border border-gray-300" />
          )}
          <span className="text-xs font-medium">Fund Wallet</span>
          {walletBalance && (
            <span className="text-xs text-gray-500">
              (Balance: {Number.parseFloat(walletBalance).toFixed(6)} ETH)
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
          {!walletCreated ? (
            <Button
              onClick={handleStart}
              disabled={isLoading || isCreating || !address}
              className="w-full h-7 text-xs"
            >
              {isLoading || isCreating ? (
                <>
                  <Loader2 className="mr-1 size-3 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Wallet'
              )}
            </Button>
          ) : !walletFunded ? (
            <Button
              onClick={fundWallet}
              disabled={isLoading || isFunding}
              className="w-full h-7 text-xs"
            >
              {isLoading || isFunding ? (
                <>
                  <Loader2 className="mr-1 size-3 animate-spin" />
                  Funding...
                </>
              ) : (
                'Fund Wallet'
              )}
            </Button>
          ) : (
            <div className="text-center text-green-600 text-xs font-medium">
              Wallet setup complete! You're ready to use Ethereum.
            </div>
          )}

          {!address && (
            <p className="text-xs text-gray-500">
              Please connect your wallet to continue
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
