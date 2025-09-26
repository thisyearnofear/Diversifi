/**
 * UNIFIED Wallet Hook - Base Implementation
 * Consolidates from:
 * - app/hooks/use-wallet.ts (wagmi-based)
 * - apps/diversifi/hooks/use-wallet.ts (viem-based for MiniPay)
 * - hooks/wallet/use-wallet-connection.ts (basic connection)
 * - apps/diversifi/hooks/wallet/use-wallet-connection.ts (MiniPay optimized)
 * 
 * Environment-aware wallet management that adapts to MiniPay vs main app
 */

import { useState, useEffect, useCallback } from 'react';
import { createWalletClient, custom, type Address, type WalletClient } from 'viem';
import { celo, celoAlfajores } from 'viem/chains';
import { AppEnvironment } from '../utils/environment';

export interface WalletState {
  // Core state
  address: Address | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  chainId: number | null;
  
  // Environment-specific
  isMiniPay: boolean;
  client: WalletClient | null;
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  
  // Utilities
  formatAddress: (addr?: string) => string;
  formatBalance: (bal?: bigint) => string;
}

export interface UseWalletOptions {
  environment?: 'standard' | 'enhanced';
  autoConnect?: boolean;
  useTestnet?: boolean;
}

export function useWalletBase(options: UseWalletOptions = {}): WalletState {
  const {
    environment = AppEnvironment.getType(),
    autoConnect = true,
    useTestnet = process.env.NEXT_PUBLIC_USE_TESTNET === 'true'
  } = options;

  // State
  const [address, setAddress] = useState<Address | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [client, setClient] = useState<WalletClient | null>(null);
  const [isMiniPay, setIsMiniPay] = useState(false);

  // Initialize wallet client
  useEffect(() => {
    const initWallet = async () => {
      try {
        // Detect environment
        const inMiniPay = AppEnvironment.isMiniPay();
        setIsMiniPay(inMiniPay);

        // Check if ethereum provider exists
        if (typeof window === 'undefined' || !window.ethereum) {
          console.log('No ethereum provider found');
          return;
        }

        // Create wallet client for MiniPay/enhanced environment
        if (environment === 'enhanced' || inMiniPay) {
          const chain = useTestnet ? celoAlfajores : celo;
          const walletClient = createWalletClient({
            chain,
            transport: custom(window.ethereum),
          });
          setClient(walletClient);
          
          console.log('Wallet client initialized', {
            environment,
            inMiniPay,
            chain: chain.name,
            chainId: chain.id
          });
        }

        // Set up event listeners with proper guards
        const handleChainChanged = (chainId: string) => {
          console.log('Chain changed:', chainId);
          const newChainId = Number.parseInt(chainId, 16);
          setChainId(newChainId);
          
          // Reload page for MiniPay to ensure consistency
          if (inMiniPay) {
            window.location.reload();
          }
        };

        const handleAccountsChanged = (accounts: string[]) => {
          console.log('Accounts changed:', accounts);
          if (accounts.length === 0) {
            setAddress(null);
            setIsConnected(false);
          } else {
            setAddress(accounts[0] as Address);
            setIsConnected(true);
          }
        };

        // Add event listeners with proper guards
        if (typeof window !== 'undefined' && window.ethereum) {
          // Check if the methods exist before calling them
          if (window.ethereum.on) {
            window.ethereum.on('chainChanged', handleChainChanged);
            window.ethereum.on('accountsChanged', handleAccountsChanged);
          }

          // Get current chain ID
          try {
            if (window.ethereum.request) {
              const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
              setChainId(Number.parseInt(currentChainId as string, 16));
            }
          } catch (err) {
            console.warn('Could not get chain ID:', err);
          }
        }

        // Auto-connect in MiniPay or if requested
        if ((inMiniPay || autoConnect) && typeof window !== 'undefined' && window.ethereum) {
          // Small delay to ensure everything is loaded
          setTimeout(() => {
            connect();
          }, inMiniPay ? 500 : 100);
        }

        // Cleanup function
        return () => {
          if (typeof window !== 'undefined' && window.ethereum) {
            // Check if the methods exist before calling them
            if (window.ethereum.removeListener) {
              window.ethereum.removeListener('chainChanged', handleChainChanged);
              window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            }
          }
        };
      } catch (err: any) {
        console.error('Error initializing wallet:', err);
        setError(err.message || 'Failed to initialize wallet');
      }
    };

    initWallet();
  }, [environment, autoConnect, useTestnet]);

  // Connect function
  const connect = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('No Ethereum provider found');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      let accounts: string[];

      // Use viem client for enhanced/MiniPay environment
      if (client && (environment === 'enhanced' || isMiniPay)) {
        accounts = await client.requestAddresses();
      } else {
        // Use direct ethereum provider for standard environment
        if (window.ethereum.request) {
          accounts = await window.ethereum.request({
            method: 'eth_requestAccounts',
            params: [],
          });
        } else {
          throw new Error('Ethereum provider does not support request method');
        }
      }

      if (accounts && accounts.length > 0) {
        setAddress(accounts[0] as Address);
        setIsConnected(true);
        console.log('Connected to wallet:', {
          address: accounts[0],
          environment,
          isMiniPay
        });
      } else {
        setError('No accounts found');
      }
    } catch (err: any) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, [client, environment, isMiniPay]);

  // Disconnect function
  const disconnect = useCallback(() => {
    setAddress(null);
    setIsConnected(false);
    setError(null);
    console.log('Wallet disconnected');
  }, []);

  // Utility functions
  const formatAddress = useCallback((addr?: string): string => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }, []);

  const formatBalance = useCallback((bal?: bigint): string => {
    if (!bal) return '0';
    return (Number(bal) / 1e18).toFixed(4);
  }, []);

  return {
    // Core state
    address,
    isConnected,
    isConnecting,
    error,
    chainId,
    
    // Environment-specific
    isMiniPay,
    client,
    
    // Actions
    connect,
    disconnect,
    
    // Utilities
    formatAddress,
    formatBalance,
  };
}