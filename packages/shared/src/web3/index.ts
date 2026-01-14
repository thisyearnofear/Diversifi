/**
 * @diversifi/shared/web3
 * 
 * Web3/blockchain functionality
 * Entry point for wallet, swap, and blockchain interactions
 */
export { useWalletBase } from '../hooks/use-wallet-base';
export { useWalletWagmi } from '../hooks/use-wallet-wagmi';
export { useSwapBase } from '../hooks/use-swap-base';
export { useSwapCelo } from '../hooks/use-swap-celo';

export type { WalletState, UseWalletOptions } from '../hooks/use-wallet-base';
