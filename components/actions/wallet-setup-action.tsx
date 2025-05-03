'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function WalletSetupAction() {
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
      const response = await fetch('/api/wallet/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create wallet');
      }

      setWalletCreated(true);
      setWalletAddress(data.wallet.address);
      toast.success('Wallet created successfully!');

      // Check if the wallet already has a balance
      await checkBalance();
    } catch (error) {
      console.error('Error creating wallet:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create wallet';
      setError(errorMessage);
      toast.error('Failed to create wallet');
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
    } catch (error) {
      console.error('Error funding wallet:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fund wallet';
      setError(errorMessage);
      toast.error('Failed to fund wallet');
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
    } catch (error) {
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
    } catch (error) {
      console.error('Error starting wallet setup:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to start wallet setup';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 w-full max-w-md mx-auto my-2">
      <h3 className="text-xl font-semibold mb-4">
        Set Up Your Ethereum Wallet
      </h3>
      <p className="text-gray-600 mb-6">
        Create a secure Coinbase-managed wallet to get started with Ethereum.
      </p>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          {walletCreated ? (
            <CheckCircle className="size-5 text-green-500" />
          ) : isCreating ? (
            <Loader2 className="size-5 animate-spin text-blue-500" />
          ) : (
            <div className="size-5 rounded-full border border-gray-300" />
          )}
          <span className="font-medium">Create Wallet</span>
          {walletCreated && walletAddress && (
            <span className="text-xs text-gray-500 truncate">
              ({walletAddress.substring(0, 6)}...
              {walletAddress.substring(walletAddress.length - 4)})
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {walletFunded ? (
            <CheckCircle className="size-5 text-green-500" />
          ) : isFunding ? (
            <Loader2 className="size-5 animate-spin text-blue-500" />
          ) : (
            <div className="size-5 rounded-full border border-gray-300" />
          )}
          <span className="font-medium">Fund Wallet</span>
          {walletBalance && (
            <span className="text-xs text-gray-500">
              (Balance: {Number.parseFloat(walletBalance).toFixed(6)} ETH)
            </span>
          )}
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-500 text-sm">
            <AlertCircle className="size-4" />
            <span>{error}</span>
          </div>
        )}

        {!walletCreated ? (
          <Button
            onClick={handleStart}
            disabled={isLoading || isCreating || !address}
            className="w-full"
          >
            {isLoading || isCreating ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Creating Wallet...
              </>
            ) : (
              'Create Wallet'
            )}
          </Button>
        ) : !walletFunded ? (
          <Button
            onClick={fundWallet}
            disabled={isLoading || isFunding}
            className="w-full"
          >
            {isLoading || isFunding ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Funding Wallet...
              </>
            ) : (
              'Fund Wallet'
            )}
          </Button>
        ) : (
          <div className="text-center text-green-600 font-medium">
            Wallet setup complete! You're ready to use Ethereum.
          </div>
        )}

        {!address && (
          <p className="mt-2 text-sm text-gray-500">
            Please connect your wallet to continue
          </p>
        )}
      </div>
    </Card>
  );
}
