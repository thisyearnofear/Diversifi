'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { useAuth } from './use-auth';
import { useActions } from './use-actions';
import { toast } from 'sonner';
import { useNetworkState } from './use-network-state';
import { useTokenPrice } from './use-token-price';
import { ABIS } from '../constants/celo-tokens';
import {
  CELO_TOKENS,
  getMentoExchangeRate,
  getCachedData,
  setCachedData,
  CACHE_KEYS,
  handleMentoError,
  DEFAULT_EXCHANGE_RATES,
  MENTO_BROKER_ADDRESS,
} from '../utils/mento-utils';

// Swap status types
export type PusoSwapStatus =
  | 'idle'
  | 'checking'
  | 'not-swapped'
  | 'swapping'
  | 'approving'
  | 'approved'
  | 'transaction-pending'
  | 'transaction-submitted'
  | 'transaction-confirming'
  | 'transaction-success'
  | 'completing'
  | 'completed'
  | 'switching-network'
  | 'error';

// Contract addresses from mento-utils
const ADDRESSES = {
  CELO: CELO_TOKENS.CELO,
  PUSO: CELO_TOKENS.PUSO,
  CUSD: CELO_TOKENS.CUSD,
  BROKER: MENTO_BROKER_ADDRESS,
};

export interface SwapParams {
  amount: number;
}

export interface UsePusoSwapOptions {
  onComplete?: () => void;
}

export function usePusoSwap(options?: UsePusoSwapOptions) {
  const { address } = useAccount();
  const { isAuthenticated } = useAuth();
  const { completeAction } = useActions();
  const { prices } = useTokenPrice(['CELO', 'cKES'], 'usd', '0x42'); // 0x42 is Celo's chain ID

  // Core state
  const [status, setStatus] = useState<PusoSwapStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [approvalAmount, setApprovalAmount] = useState<string | null>(null);
  // These values are static for simplicity, but could be updated in a more complex implementation
  const balance = '0';

  // Network state
  const { isCorrectNetwork, isSwitchingChain, switchToCelo } =
    useNetworkState();

  // Get exchange rate from Mento SDK or cache
  const [exchangeRate, setExchangeRate] = useState<number>(
    DEFAULT_EXCHANGE_RATES.PUSO,
  );

  // Fetch exchange rate from Mento or cache
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        // Check cache first
        const cachedRate = getCachedData(CACHE_KEYS.EXCHANGE_RATE_PUSO);
        if (cachedRate !== null) {
          setExchangeRate(cachedRate);
          return;
        }

        // Fetch from Mento SDK
        const rate = await getMentoExchangeRate('PUSO');
        setExchangeRate(rate);

        // Cache the result
        setCachedData(CACHE_KEYS.EXCHANGE_RATE_PUSO, rate);
      } catch (error) {
        console.warn('Error fetching PUSO exchange rate:', error);
        // Keep default rate
      }
    };

    fetchExchangeRate();
  }, []);

  // Check if user has approved the token
  useEffect(() => {
    const checkApproval = async () => {
      if (!address || !isCorrectNetwork) return;

      try {
        setStatus('checking');

        // Get allowance
        const allowance = await getAllowance(address);
        setIsApproved(!allowance.isZero());

        setStatus('idle');
      } catch (err) {
        console.error('Error checking approval:', err);
        setStatus('idle');
      }
    };

    if (address && isCorrectNetwork) {
      checkApproval();
    }
  }, [address, isCorrectNetwork, isCompleted]);

  // Helper function to get allowance
  const getAllowance = async (userAddress: string) => {
    try {
      // Create a read-only provider for Celo mainnet
      const provider = new ethers.providers.JsonRpcProvider(
        'https://forno.celo.org',
      );

      // Get the broker address
      const brokerAddress = ADDRESSES.BROKER;

      // Create ERC20 contract instance
      const cusdToken = new ethers.Contract(
        ADDRESSES.CUSD,
        ABIS.ERC20_ALLOWANCE,
        provider,
      );

      // Get the allowance
      const allowance = await cusdToken.allowance(userAddress, brokerAddress);
      console.log('cUSD allowance:', ethers.utils.formatUnits(allowance, 18));

      return allowance;
    } catch (error) {
      console.error('Error checking allowance:', error);
      return ethers.constants.Zero;
    }
  };

  // Function to complete the swap process
  const completeSwap = async (transactionHash: string) => {
    try {
      setStatus('completing');

      // Record the completion in the database
      if (isAuthenticated) {
        try {
          // Pass the title and transaction hash as proof object
          await completeAction('Get PUSO Stablecoins', {
            transactionHash,
            network: 'celo',
            tokenSymbol: 'PUSO',
          });

          // Update state
          setIsCompleted(true);
          setStatus('completed');
          toast.success('Successfully acquired PUSO stablecoins!');

          // Call onComplete callback if provided
          if (options?.onComplete) {
            options.onComplete();
          }
        } catch (apiError) {
          console.error('Error recording completion:', apiError);

          // Fallback to localStorage if API fails
          try {
            const completedActions =
              localStorage.getItem('completed-actions') || '[]';
            const actions = JSON.parse(completedActions);
            if (!actions.includes('Get PUSO Stablecoins')) {
              actions.push('Get PUSO Stablecoins');
              localStorage.setItem(
                'completed-actions',
                JSON.stringify(actions),
              );
            }

            // Update state
            setIsCompleted(true);
            setStatus('completed');
            toast.success('Successfully acquired PUSO stablecoins!');

            // Call onComplete callback if provided
            if (options?.onComplete) {
              options.onComplete();
            }
          } catch (storageError) {
            console.error('Error updating localStorage:', storageError);
            setStatus('error');
            setError('Failed to record completion. Please try again.');
          }
        }
      } else {
        // Not authenticated, just update state
        setIsCompleted(true);
        setStatus('completed');
        toast.success('Swap completed successfully!');

        // Call onComplete callback if provided
        if (options?.onComplete) {
          options.onComplete();
        }
      }
    } catch (error) {
      console.error('Error completing swap:', error);
      setStatus('error');
      setError('Failed to complete swap. Please try again.');
    }
  };

  // Function to perform the swap
  const swap = async ({ amount }: SwapParams) => {
    console.log(
      'Swap function called with amount:',
      amount,
      'and isApproved:',
      isApproved,
    );

    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please sign in first');
      return;
    }

    if (!isCorrectNetwork) {
      const success = await switchToCelo();
      if (!success) return;
    }

    // Check if window.ethereum is available
    if (typeof window === 'undefined' || !window.ethereum) {
      toast.error(
        'Ethereum provider not available. Please use a Web3 browser.',
      );
      return;
    }

    // Initialize provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const signer = provider.getSigner();

    // Convert amount to Wei
    const amountInWei = ethers.utils.parseUnits(amount.toString(), 18);

    try {
      // Approval if needed
      if (!isApproved) {
        setStatus('approving');
        toast.info('Approving cUSD tokens...');

        // Define cUSD token address for approval
        const cUSDAddress = ADDRESSES.CUSD;

        // Get the broker address
        const brokerAddress = ADDRESSES.BROKER;

        // Create ERC20 contract instance
        const cusdToken = new ethers.Contract(
          cUSDAddress,
          ABIS.ERC20_APPROVE,
          signer,
        );

        // Approve the broker to spend cUSD
        const approveTx = await cusdToken.approve(brokerAddress, amountInWei);
        setTxHash(approveTx.hash);

        // Wait for the transaction to be confirmed
        const allowanceReceipt = await approveTx.wait();
        if (allowanceReceipt.status !== 1)
          throw new Error('Approval transaction failed');

        setIsApproved(true);
        setStatus('approved');
        toast.success('Approval successful!');
      }

      // Perform the swap
      setStatus('swapping');
      toast.info('Performing swap...');

      try {
        // Get the PUSO address
        const pusoAddr = ADDRESSES.PUSO;
        const cUSDAddr = ADDRESSES.CUSD;
        const brokerAddress = ADDRESSES.BROKER;

        // Create a read-only provider for getting the quote
        const readProvider = new ethers.providers.JsonRpcProvider(
          'https://forno.celo.org',
        );

        // Get the list of exchange providers from the broker
        const brokerProvidersContract = new ethers.Contract(
          brokerAddress,
          ABIS.BROKER_PROVIDERS,
          readProvider,
        );
        const exchangeProviders =
          await brokerProvidersContract.getExchangeProviders();

        // For each provider, get the exchanges and find the one for cUSD/PUSO
        let exchangeProvider = '';
        let exchangeId = '';

        // Loop through each provider to find the cUSD/PUSO exchange
        for (const providerAddress of exchangeProviders) {
          const exchangeContract = new ethers.Contract(
            providerAddress,
            ABIS.EXCHANGE,
            readProvider,
          );
          const exchanges = await exchangeContract.getExchanges();

          // Check each exchange to see if it includes cUSD and PUSO
          for (const exchange of exchanges) {
            const assets = exchange.assets.map((a: string) => a.toLowerCase());

            if (
              assets.includes(cUSDAddr.toLowerCase()) &&
              assets.includes(pusoAddr.toLowerCase())
            ) {
              exchangeProvider = providerAddress;
              exchangeId = exchange.exchangeId;
              break;
            }
          }

          if (exchangeProvider && exchangeId) break;
        }

        if (!exchangeProvider || !exchangeId) {
          throw new Error(
            'Direct cUSD to PUSO swaps are not currently available. Please try again later or contact support.',
          );
        }

        // Create a contract instance for the Broker
        const brokerRateContract = new ethers.Contract(
          brokerAddress,
          ABIS.BROKER_RATE,
          readProvider,
        );

        // Create a contract instance for the Broker with the signer
        const brokerSwapContract = new ethers.Contract(
          brokerAddress,
          ABIS.BROKER_SWAP,
          signer,
        );

        // Get the quote
        const quoteAmountOut = await brokerRateContract.getAmountOut(
          exchangeProvider,
          exchangeId,
          cUSDAddr,
          pusoAddr,
          amountInWei.toString(),
        );

        // Allow 1% slippage from quote
        const expectedAmountOut = ethers.BigNumber.from(quoteAmountOut)
          .mul(99)
          .div(100);

        try {
          // First try with automatic gas estimation
          const swapTx = await brokerSwapContract.swapIn(
            exchangeProvider,
            exchangeId,
            cUSDAddr,
            pusoAddr,
            amountInWei.toString(),
            expectedAmountOut.toString(),
          );

          setTxHash(swapTx.hash);

          // Wait for the transaction to be confirmed
          const swapReceipt = await swapTx.wait();
          if (swapReceipt.status !== 1)
            throw new Error('Swap transaction failed');

          // Update state and complete the swap
          setStatus('transaction-success');
          completeSwap(swapTx.hash);
        } catch (swapError) {
          console.error(
            'Error with automatic gas estimation, trying with manual gas limit:',
            swapError,
          );

          // If automatic gas estimation fails, try with manual gas limit
          const options = {
            gasLimit: ethers.utils.hexlify(500000), // Manual gas limit of 500,000
          };

          // Try again with manual gas limit
          const swapTx = await brokerSwapContract.swapIn(
            exchangeProvider,
            exchangeId,
            cUSDAddr,
            pusoAddr,
            amountInWei.toString(),
            expectedAmountOut.toString(),
            options,
          );

          setTxHash(swapTx.hash);

          // Wait for the transaction to be confirmed
          const swapReceipt = await swapTx.wait();
          if (swapReceipt.status !== 1)
            throw new Error('Swap transaction failed');

          // Update state and complete the swap
          setStatus('transaction-success');
          completeSwap(swapTx.hash);
        }
      } catch (error) {
        const errorMessage = handleMentoError(error, 'performing swap');
        setStatus('error');
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage = handleMentoError(error, 'swap process');
      setStatus('error');
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Return combined state and actions
  return {
    status,
    error,
    txHash,
    isCompleted,
    isApproved,
    approvalAmount,
    balance,
    isCorrectNetwork,
    isSwitchingChain,
    exchangeRate,
    swap,
    switchToCelo,
  };
}
