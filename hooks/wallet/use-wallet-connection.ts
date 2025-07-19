import { useState, useEffect } from 'react';

export function useWalletConnection() {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInMiniPay, setIsInMiniPay] = useState(false);

  // Check if we're in MiniPay environment
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMiniPay = 
        window.ethereum?.isMiniPay || 
        (typeof window.ethereum !== 'undefined' && 
         window.navigator.userAgent.includes('MiniPay'));
      
      setIsInMiniPay(!!isMiniPay);
    }
  }, []);

  // Connect wallet function
  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('No wallet detected');
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      // Request accounts
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
        
        // Get chain ID
        const chainIdHex = await window.ethereum.request({ 
          method: 'eth_chainId' 
        });
        
        setChainId(Number.parseInt(chainIdHex, 16));
      } else {
        setError('No accounts found');
      }
    } catch (err: any) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Format address for display
  const formatAddress = (address: string | null): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return {
    address,
    chainId,
    isConnecting,
    error,
    isInMiniPay,
    connectWallet,
    formatAddress
  };
}
