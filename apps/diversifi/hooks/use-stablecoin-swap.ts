import { useState } from 'react';
import { ethers } from 'ethers';
import {
  CELO_TOKENS,
  MENTO_BROKER_ADDRESS,
  MENTO_ABIS,
  handleMentoError,
} from '@stable-station/mento-utils';

interface SwapParams {
  fromToken: string;
  toToken: string;
  amount: string;
  slippageTolerance?: number; // in percentage, e.g., 0.5 for 0.5%
}

export function useStablecoinSwap() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const swap = async ({ fromToken, toToken, amount, slippageTolerance = 0.5 }: SwapParams) => {
    if (!window.ethereum) {
      setError('No wallet detected. Please install a wallet like MiniPay or MetaMask.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTxHash(null);
    setIsCompleted(false);

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const userAddress = accounts[0];

      // Create a Web3Provider from the Ethereum provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Get token addresses
      const fromTokenAddress = CELO_TOKENS[fromToken as keyof typeof CELO_TOKENS];
      const toTokenAddress = CELO_TOKENS[toToken as keyof typeof CELO_TOKENS];

      if (!fromTokenAddress || !toTokenAddress) {
        throw new Error('Invalid token selection');
      }

      // Convert amount to wei
      const amountInWei = ethers.utils.parseUnits(amount, 18);

      // Step 1: Approve the broker to spend tokens
      const tokenContract = new ethers.Contract(
        fromTokenAddress,
        MENTO_ABIS.ERC20_APPROVE,
        signer
      );

      // Check if approval is needed
      const allowance = await tokenContract.allowance(userAddress, MENTO_BROKER_ADDRESS);
      if (allowance.lt(amountInWei)) {
        const approveTx = await tokenContract.approve(MENTO_BROKER_ADDRESS, amountInWei);
        await approveTx.wait();
      }

      // Step 2: Find the exchange for the token pair
      const brokerContract = new ethers.Contract(
        MENTO_BROKER_ADDRESS,
        MENTO_ABIS.BROKER_PROVIDERS,
        provider
      );

      const exchangeProviders = await brokerContract.getExchangeProviders();

      // Find the exchange for the token pair
      let exchangeProvider = '';
      let exchangeId = '';

      // Loop through providers to find the right exchange
      for (const providerAddress of exchangeProviders) {
        const exchangeContract = new ethers.Contract(
          providerAddress,
          MENTO_ABIS.EXCHANGE,
          provider
        );

        const exchanges = await exchangeContract.getExchanges();

        // Check each exchange
        for (const exchange of exchanges) {
          const assets = exchange.assets.map((a: string) => a.toLowerCase());

          if (
            assets.includes(fromTokenAddress.toLowerCase()) &&
            assets.includes(toTokenAddress.toLowerCase())
          ) {
            exchangeProvider = providerAddress;
            exchangeId = exchange.exchangeId;
            break;
          }
        }

        if (exchangeProvider && exchangeId) break;
      }

      if (!exchangeProvider || !exchangeId) {
        throw new Error(`No exchange found for ${fromToken}/${toToken}`);
      }

      // Step 3: Get the expected amount out
      const brokerRateContract = new ethers.Contract(
        MENTO_BROKER_ADDRESS,
        MENTO_ABIS.BROKER_RATE,
        provider
      );

      const expectedAmountOut = await brokerRateContract.getAmountOut(
        exchangeProvider,
        exchangeId,
        fromTokenAddress,
        toTokenAddress,
        amountInWei
      );

      // Apply slippage tolerance
      const minAmountOut = expectedAmountOut.mul(
        ethers.BigNumber.from(Math.floor((100 - slippageTolerance) * 100))
      ).div(ethers.BigNumber.from(10000));

      // Step 4: Execute the swap
      const brokerSwapContract = new ethers.Contract(
        MENTO_BROKER_ADDRESS,
        MENTO_ABIS.BROKER_SWAP,
        signer
      );

      // Try with automatic gas estimation first
      try {
        const swapTx = await brokerSwapContract.swapIn(
          exchangeProvider,
          exchangeId,
          fromTokenAddress,
          toTokenAddress,
          amountInWei,
          minAmountOut
        );

        setTxHash(swapTx.hash);

        // Wait for the transaction to be confirmed
        const swapReceipt = await swapTx.wait();
        if (swapReceipt.status !== 1) {
          throw new Error('Swap transaction failed');
        }

        setIsCompleted(true);
      } catch (swapError) {
        console.error('Error with automatic gas estimation, trying with manual gas limit:', swapError);

        // If automatic gas estimation fails, try with manual gas limit
        const options = {
          gasLimit: ethers.utils.hexlify(500000), // Manual gas limit of 500,000
        };

        const swapTx = await brokerSwapContract.swapIn(
          exchangeProvider,
          exchangeId,
          fromTokenAddress,
          toTokenAddress,
          amountInWei,
          minAmountOut,
          options
        );

        setTxHash(swapTx.hash);

        // Wait for the transaction to be confirmed
        const swapReceipt = await swapTx.wait();
        if (swapReceipt.status !== 1) {
          throw new Error('Swap transaction failed');
        }

        setIsCompleted(true);
      }
    } catch (error) {
      console.error('Error swapping tokens:', error);
      setError(handleMentoError(error, 'swap tokens'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    swap,
    isLoading,
    error,
    txHash,
    isCompleted,
  };
}
