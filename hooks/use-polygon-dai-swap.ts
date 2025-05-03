'use client';

import { useState, useEffect } from 'react';
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useSendTransaction,
} from 'wagmi';
import { polygon } from 'wagmi/chains';
import { toast } from 'sonner';
import { useAuth } from './use-auth';
import { useActions } from './use-actions';

export function usePolygonDaiSwap() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const { sendTransactionAsync } = useSendTransaction();
  const { isAuthenticated } = useAuth();
  const { completeAction } = useActions();

  const [status, setStatus] = useState<
    | 'idle'
    | 'checking'
    | 'wrong-network'
    | 'preparing'
    | 'prepared'
    | 'executing'
    | 'transaction-pending'
    | 'transaction-confirming'
    | 'transaction-success'
    | 'transaction-failed'
    | 'completing'
    | 'completed'
    | 'error'
  >('idle');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [estimatedDai, setEstimatedDai] = useState<string | null>(null);
  const [transactionData, setTransactionData] = useState<any | null>(null);
  const [transactionDetails, setTransactionDetails] = useState<any | null>(
    null,
  );

  // Check if we're on the correct network
  const isCorrectNetwork = chainId === polygon.id;

  // Effect to check network on mount
  useEffect(() => {
    if (isConnected && !isCorrectNetwork) {
      setStatus('wrong-network');
    } else if (isConnected && isCorrectNetwork) {
      setStatus('idle');
    }
  }, [isConnected, isCorrectNetwork]);

  // Effect to update status when chain changes
  useEffect(() => {
    if (chainId === polygon.id) {
      setStatus((prevStatus) =>
        prevStatus === 'wrong-network' ? 'idle' : prevStatus,
      );
      setError(null);
    } else if (isConnected) {
      setStatus('wrong-network');
    }
  }, [chainId, isConnected]);

  // Switch to Polygon network
  const switchToPolygon = async () => {
    try {
      setStatus('checking');
      switchChain({ chainId: polygon.id });
      toast.success('Switching to Polygon network...');

      // Add a small delay to ensure the chain ID has been updated
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });

      // Check if we successfully switched to Polygon
      if (chainId === polygon.id) {
        toast.success('Successfully switched to Polygon network');
        setError(null);
        return true;
      }
    } catch (error) {
      console.error('Error switching to Polygon:', error);
      setError('Failed to switch to Polygon network');
      toast.error('Failed to switch to Polygon network');
    }
    return false;
  };

  // Prepare the swap transaction using Brian API
  const prepareSwap = async (amount: string) => {
    if (!address) {
      setError('Please connect your wallet first');
      return;
    }

    if (!isCorrectNetwork) {
      const switched = await switchToPolygon();
      if (!switched) {
        return;
      }
    }

    try {
      setStatus('preparing');
      setError(null);

      // Call our API endpoint to prepare the transaction
      const response = await fetch('/api/actions/polygon/prepare-swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          address,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 'Failed to prepare swap transaction',
        );
      }

      const data = await response.json();
      console.log('Prepared transaction:', data);

      // Store the transaction data for execution
      setTransactionData(data);

      // Set estimated DAI amount if available
      if (data.estimatedDai) {
        setEstimatedDai(data.estimatedDai);
      }

      // Store transaction details for UI display
      if (data.result && data.result.length > 0) {
        setTransactionDetails({
          solver: data.result[0].solver,
          action: data.result[0].action,
          description:
            data.result[0].data?.description ||
            `Swap ${amount} MATIC for DAI on Polygon`,
          fromToken: data.result[0].data?.fromToken || { symbol: 'MATIC' },
          toToken: data.result[0].data?.toToken || { symbol: 'DAI' },
          fromAmount: data.result[0].data?.fromAmount || amount,
          toAmount: data.result[0].data?.toAmount || estimatedDai,
        });
      }

      setStatus('prepared');
      toast.success('Swap transaction prepared successfully!');
    } catch (error) {
      console.error('Error preparing swap:', error);
      setStatus('error');

      // Provide a user-friendly error message
      let errorMessage = 'Failed to prepare swap';
      if (error instanceof Error) {
        // Check for common error patterns
        if (error.message.includes('Internal Server Error')) {
          errorMessage =
            'The Brian API is currently unavailable. Please try again later.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage =
            'Network error. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Execute the prepared swap transaction
  const executeSwap = async () => {
    if (!address || !transactionData) {
      setError('No transaction data available');
      return;
    }

    try {
      setStatus('executing');
      setError(null);

      // Get the transaction data from our API
      const response = await fetch('/api/actions/polygon/execute-swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionData,
          address,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 'Failed to prepare swap transaction',
        );
      }

      const data = await response.json();
      console.log('Transaction data for execution:', data);

      // Check if we have a valid transaction from the API (either Brian API or 0xProtocol)
      if (data.transaction) {
        setStatus('transaction-pending');
        console.log(
          'Transaction data structure:',
          JSON.stringify(data.transaction, null, 2),
        );

        // Extract the transaction details from the response
        // Handle different API formats
        let txDetails;
        let apiType = 'unknown';

        // First check if we have steps in the data property (Brian API format)
        if (
          data.transaction.data?.steps &&
          data.transaction.data.steps.length > 0
        ) {
          console.log('Found steps in data property - using Brian API format');
          txDetails = data.transaction.data.steps[0];
          apiType = 'brian';
        }
        // Then check if we have a direct transaction property (alternative format)
        else if (data.transaction.transaction) {
          console.log(
            'Found direct transaction property - using alternative format',
          );
          txDetails = data.transaction.transaction;
          apiType = 'alternative';
        }
        // Check for 0xProtocol format
        else if (
          data.transaction.to &&
          data.transaction.data &&
          data.transaction.value !== undefined
        ) {
          console.log('Found 0xProtocol format');
          txDetails = data.transaction;
          apiType = '0xprotocol';
        }
        // Finally check if the transaction itself is the details (fallback)
        else if (data.transaction.to && data.transaction.data) {
          console.log(
            'Transaction itself contains details - using fallback format',
          );
          txDetails = data.transaction;
          apiType = 'fallback';
        } else {
          // No recognizable format
          console.error('Unexpected transaction format:', data.transaction);
          throw new Error(
            "Invalid transaction format. The API response doesn't contain the expected transaction details.",
          );
        }

        console.log(`Using API type: ${apiType} for transaction execution`);

        console.log('Executing transaction:', txDetails);

        // Send the transaction using wagmi's useSendTransaction hook
        const txResult = await sendTransactionAsync({
          to: txDetails.to as `0x${string}`,
          value: BigInt(txDetails.value || 0),
          data: txDetails.data as `0x${string}`,
          chainId: polygon.id,
        });

        console.log('Transaction sent:', txResult);

        // Store the transaction hash
        setTxHash(txResult);
        setStatus('transaction-success');
        toast.success('Swap transaction executed successfully!');

        // For 0xProtocol API, we can auto-complete the swap
        if (apiType === '0xprotocol') {
          console.log('Using 0xProtocol API, will auto-complete the swap');
          // We'll let the component handle the auto-completion
        }
      } else {
        console.error('Invalid transaction data:', data);
        throw new Error(
          'No valid transaction steps found in the response. Please try again.',
        );
      }
    } catch (error) {
      console.error('Error executing swap:', error);
      setStatus('error');
      setError(
        error instanceof Error ? error.message : 'Failed to execute swap',
      );
      toast.error('Failed to execute swap transaction');
    }
  };

  // Complete the swap
  const completeSwap = async (hash: string) => {
    // If hash is null or empty, this is likely a canceled transaction
    if (!hash) {
      console.log(
        'No transaction hash provided, likely a canceled transaction',
      );
      setStatus('error');
      setError('Transaction was canceled. You can try again when ready.');
      return;
    }

    // Make sure we have the transaction hash stored
    setTxHash(hash);

    try {
      setStatus('completing');

      try {
        // Get the action ID from the database
        const actionResponse = await fetch('/api/actions/by-title', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: 'Get DAI Stablecoins' }),
        });

        if (actionResponse.ok) {
          const actionData = await actionResponse.json();
          if (actionData.id) {
            // Mark the action as completed
            await completeAction(actionData.id, hash);
          }
        } else {
          // Handle the case where the action is not found
          console.warn(
            'Action not found in database, marking as completed anyway',
          );
          // We'll still mark the swap as completed in the local state
        }
      } catch (error) {
        console.error('Error completing action:', error);
        // Continue even if this fails
      }

      // Mark the swap as completed
      const response = await fetch('/api/actions/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'polygon-dai-swap',
          txHash: hash,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to complete swap');
      }

      // Make sure isCompleted is set to true
      setIsCompleted(true);
      setStatus('completed');
      console.log('Swap completed, isCompleted set to true');
      toast.success('DAI swap on Polygon completed successfully!');
    } catch (error) {
      console.error('Error completing swap:', error);
      setStatus('error');
      setError(
        error instanceof Error ? error.message : 'Failed to complete swap',
      );
    }
  };

  return {
    status,
    error,
    txHash,
    isCompleted,
    isCorrectNetwork,
    isSwitchingChain,
    prepareSwap,
    executeSwap,
    completeSwap,
    switchToPolygon,
    estimatedDai,
    transactionDetails,
    setStatus, // Expose setStatus for cancellation
  };
}
