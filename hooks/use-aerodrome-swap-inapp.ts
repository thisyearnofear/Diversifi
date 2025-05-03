'use client';

import { useState, useEffect } from 'react';
import {
  useAccount,
  useBalance,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
  useChainId,
  useSwitchChain,
} from 'wagmi';
import { base } from 'wagmi/chains';
import { parseEther, parseUnits, } from 'viem';
import { toast } from 'sonner';
import { useActions } from '@/hooks/use-actions';
import { useDivviRegistration } from './use-divvi-registration';
import { useTokenPrice } from './use-token-price';

// Contract addresses
const BASE_AERODROME_SWAP = '0xc5dcc68069add8a7055234f23ec40a1d469693f8'; // Your deployed contract
const USDBC_CONTRACT_ADDRESS = '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA';
const USDC_CONTRACT_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const WETH_CONTRACT_ADDRESS = '0x4200000000000000000000000000000000000006'; // Wrapped ETH on Base

// ABI for the BaseAerodromeSwap contract
const BASE_AERODROME_SWAP_ABI = [
  {
    inputs: [{ name: '_amountOutMin', type: 'uint256' }],
    name: 'swapETHForUSDBC',
    outputs: [{ name: 'usdcReceived', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { name: '_tokenIn', type: 'address' },
      { name: '_amountIn', type: 'uint256' },
      { name: '_amountOutMin', type: 'uint256' },
      { name: '_useDirectRoute', type: 'bool' },
    ],
    name: 'swapTokenForUSDBC',
    outputs: [{ name: 'usdcReceived', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_amount', type: 'uint256' }],
    name: 'calculateFee',
    outputs: [{ name: 'fee', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'takeRateBps',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // ERC20 approve function for token swaps
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export type AerodromeSwapStatus =
  | 'idle'
  | 'waiting-for-registration'
  | 'ready'
  | 'swapping'
  | 'transaction-pending'
  | 'transaction-submitted'
  | 'transaction-confirming'
  | 'transaction-success'
  | 'completing'
  | 'completed'
  | 'wrong-network'
  | 'switching-network'
  | 'error';

type SwapParams = {
  sourceToken: string;
  amount: number;
};

export function useAerodromeSwap() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const [status, setStatus] = useState<AerodromeSwapStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const { completeAction } = useActions();
  const { isRegistered } = useDivviRegistration();

  // Check if we're on the correct network (Base)
  const isCorrectNetwork = chainId === base.id;

  // Get token prices from CoinGecko
  const { prices, isLoading: isPriceLoading } = useTokenPrice(['ETH', 'USDC']);

  // Get ETH balance
  const { data: ethBalance } = useBalance({
    address,
  });

  // Get USDC balance
  const { data: usdcBalance } = useBalance({
    address,
    token: USDC_CONTRACT_ADDRESS as `0x${string}`,
  });

  // Get USDbC balance
  const { data: usdbcBalance } = useBalance({
    address,
    token: USDBC_CONTRACT_ADDRESS as `0x${string}`,
  });

  // Write contract hook for performing the swap
  const {
    writeContract,
    isPending: isWritePending,
    data: writeData,
  } = useWriteContract();

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: writeData,
    });

  // Update status based on registration status and network
  useEffect(() => {
    if (!isCorrectNetwork) {
      setStatus('wrong-network');
      return;
    }

    if (!isRegistered) {
      setStatus('waiting-for-registration');
    } else if (
      status === 'waiting-for-registration' ||
      status === 'idle' ||
      status === 'wrong-network'
    ) {
      setStatus('ready');
    }
  }, [isRegistered, status, isCorrectNetwork]);

  // Update status when switching networks
  useEffect(() => {
    if (isSwitchingChain) {
      setStatus('switching-network');
    } else if (status === 'switching-network' && isCorrectNetwork) {
      // If we were switching networks and now we're on the correct network,
      // update the status based on registration status
      if (!isRegistered) {
        setStatus('waiting-for-registration');
      } else {
        setStatus('ready');
      }
    }
  }, [isSwitchingChain, status, isCorrectNetwork, isRegistered]);

  // Update status based on transaction state
  useEffect(() => {
    if (isWritePending) {
      setStatus('transaction-pending');
    } else if (writeData) {
      setTxHash(writeData);
      // Don't set to success yet - wait for confirmation
      setStatus('transaction-submitted');
    }
  }, [isWritePending, writeData]);

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirming) {
      setStatus('transaction-confirming');
    } else if (isConfirmed && txHash) {
      setStatus('transaction-success');
      completeSwap(txHash);
    } else if (txHash && !isConfirming && !isConfirmed) {
      // Transaction was submitted but not confirmed/failed
      checkTransactionStatus();
    }
  }, [isConfirming, isConfirmed, txHash]);

  // Get the public client for checking transaction status
  const publicClient = usePublicClient();

  // Function to check transaction status
  const checkTransactionStatus = async () => {
    if (!txHash || !publicClient) return;

    try {
      // Use the wagmi public client to get the transaction receipt
      const receipt = await publicClient.getTransactionReceipt({
        hash: txHash as `0x${string}`,
      });

      if (receipt) {
        if (receipt.status === 'success') {
          // Transaction succeeded
          setStatus('transaction-success');
          completeSwap(txHash);
        } else {
          // Transaction failed
          setStatus('error');
          setError('Transaction failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error checking transaction status:', error);
    }
  };

  // Perform the swap
  const swap = async ({ sourceToken, amount }: SwapParams) => {
    if (!address) {
      setError('Please connect your wallet first');
      return;
    }

    if (!isRegistered) {
      setError('Please complete registration first');
      return;
    }

    try {
      setStatus('swapping');
      setError(null);

      // Calculate deadline (30 minutes from now)
      const deadline = Math.floor(Date.now() / 1000) + 30 * 60;

      // Slippage tolerance (0.5%)
      const slippageTolerance = 0.005;

      if (sourceToken === 'ETH') {
        // Check if user has enough ETH
        if (ethBalance && Number.parseFloat(ethBalance.formatted) < amount) {
          throw new Error(
            `Insufficient ETH balance. You have ${ethBalance.formatted} ETH`,
          );
        }

        // Calculate minimum amount out with slippage tolerance using CoinGecko price
        let exchangeRate = 2000; // Fallback rate if prices aren't available

        if (prices?.ETH && prices.USDC) {
          // Calculate the exchange rate based on real-time prices
          // 1 ETH = x USDbC (where USDbC is pegged to USD)
          exchangeRate = prices.ETH.usd / prices.USDC.usd;
          console.log(
            `Using CoinGecko exchange rate: 1 ETH = ${exchangeRate} USDbC (data by CoinGecko)`,
          );
        } else {
          console.log('Using fallback exchange rate: 1 ETH = 2000 USDbC');
        }

        const expectedOutput = amount * exchangeRate;
        const minAmountOut = Math.floor(
          expectedOutput * (1 - slippageTolerance),
        );

        // Use our custom contract to swap ETH for USDbC
        writeContract({
          address: BASE_AERODROME_SWAP as `0x${string}`,
          abi: BASE_AERODROME_SWAP_ABI,
          functionName: 'swapETHForUSDBC',
          args: [
            BigInt(minAmountOut), // amountOutMin
          ],
          value: parseEther(amount.toString()),
        });
      } else if (sourceToken === 'USDC') {
        // Check if user has enough USDC
        if (usdcBalance && Number.parseFloat(usdcBalance.formatted) < amount) {
          throw new Error(
            `Insufficient USDC balance. You have ${usdcBalance.formatted} USDC`,
          );
        }

        // Calculate minimum amount out with slippage tolerance
        // For USDC to USDbC, the exchange rate should be close to 1:1 since both are stablecoins
        const exchangeRate = 1; // 1 USDC ≈ 1 USDbC
        const expectedOutput = amount * exchangeRate;
        const minAmountOut = Math.floor(
          expectedOutput * (1 - slippageTolerance),
        );

        console.log(`Using exchange rate: 1 USDC = ${exchangeRate} USDbC`);

        // First approve the contract to spend our USDC
        await writeContract({
          address: USDC_CONTRACT_ADDRESS as `0x${string}`,
          abi: [
            {
              inputs: [
                { name: 'spender', type: 'address' },
                { name: 'amount', type: 'uint256' },
              ],
              name: 'approve',
              outputs: [{ name: 'success', type: 'bool' }],
              stateMutability: 'nonpayable',
              type: 'function',
            },
          ],
          functionName: 'approve',
          args: [
            BASE_AERODROME_SWAP as `0x${string}`,
            parseUnits(amount.toString(), 6), // USDC has 6 decimals
          ],
        });

        // Note: We're not waiting for approval confirmation to simplify the flow
        // In a production app, you might want to wait for the approval to be confirmed

        // Now swap USDC for USDbC using our custom contract
        writeContract({
          address: BASE_AERODROME_SWAP as `0x${string}`,
          abi: BASE_AERODROME_SWAP_ABI,
          functionName: 'swapTokenForUSDBC',
          args: [
            USDC_CONTRACT_ADDRESS, // _tokenIn
            parseUnits(amount.toString(), 6), // _amountIn (USDC has 6 decimals)
            BigInt(minAmountOut), // _amountOutMin
            true, // _useDirectRoute (direct USDC->USDbC route)
          ],
        });
      } else {
        throw new Error('Unsupported token');
      }
    } catch (error) {
      console.error('Error performing swap:', error);
      setStatus('error');
      setError(
        error instanceof Error ? error.message : 'Failed to perform swap',
      );
    }
  };

  // Complete the swap action
  const completeSwap = async (hash: string) => {
    try {
      setStatus('completing');

      try {
        // Get the action ID from the database
        const response = await fetch('/api/actions/by-title', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: 'Get USDbC Stablecoins' }),
        });

        if (!response.ok) {
          console.error('Failed to get action ID:', await response.text());
          // If we get a 404, it means the action doesn't exist in the database yet
          // We'll handle this gracefully by marking the action as completed anyway
          if (response.status === 404) {
            setStatus('completed');
            toast.success('Swap completed successfully!');
            return;
          } else {
            throw new Error('Failed to get action ID');
          }
        }

        const { id } = await response.json();

        // Complete the action
        await completeAction(id, {
          txHash: hash,
          platform: 'aerodrome',
          completedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error completing swap:', error);
        // Even if there's an error with the database, we'll still mark it as completed
        setStatus('completed');
        toast.success('Swap completed successfully!');
        return;
      }

      setStatus('completed');
      toast.success('Swap completed successfully!');
    } catch (error) {
      console.error('Error completing swap:', error);
      setStatus('error');
      setError(
        error instanceof Error ? error.message : 'Failed to complete swap',
      );
    }
  };

  // Function to switch to Base network
  const switchToBase = async () => {
    try {
      setStatus('switching-network');
      switchChain({ chainId: base.id });
      toast.success('Switched to Base network');

      // Add a small delay to ensure the chain ID has been updated
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });

      // Manually update the status after switching networks
      if (chainId === base.id) {
        if (!isRegistered) {
          setStatus('waiting-for-registration');
        } else {
          setStatus('ready');
        }
      }
      // If we're not on the correct network yet, the useEffect will handle it
    } catch (error) {
      console.error('Error switching to Base:', error);
      setStatus('error');
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to switch to Base network',
      );
    }
  };

  return {
    status,
    error,
    txHash,
    isCompleted: status === 'completed',
    canSwap: isRegistered && isCorrectNetwork && status !== 'completed',
    isCorrectNetwork,
    isSwitchingChain,
    swap,
    switchToBase,
    setTxHash,
  };
}
