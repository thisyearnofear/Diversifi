
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { ADDRESSES, ABIS } from '../constants/celo-tokens';
import { handleSwapError } from '../utils/celo-utils';

export function useTokenApproval(swapState: any, networkState: any) {
  const { address } = useAccount();
  const { setStatus, setError, setTxHash, setIsApproved, setApprovalAmount } =
    swapState;
  const { isCorrectNetwork, switchToCelo } = networkState;

  // Function to approve token spending
  const approveToken = async (amount: string) => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return false;
    }

    if (!isCorrectNetwork) {
      toast.info('Switching to Celo network...');
      const success = await switchToCelo();
      if (!success) return false;
    }

    // Check if window.ethereum is available
    if (typeof window === 'undefined' || !window.ethereum) {
      toast.error(
        'Ethereum provider not available. Please use a Web3 browser.',
      );
      return false;
    }

    // Initialize provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const signer = provider.getSigner();

    // Convert amount to Wei
    const amountInWei = ethers.utils.parseUnits(amount.toString(), 18);

    try {
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

      // Update state
      setIsApproved(true);
      setApprovalAmount(amount.toString());
      setStatus('approved');
      toast.success('Approval confirmed! Now you can swap.');
      return true;
    } catch (error) {
      const errorMessage = handleSwapError(error, 'approving tokens');
      setStatus('error');
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  };

  // Function to check token allowance
  const checkAllowance = async (userAddress: string | undefined) => {
    if (!userAddress) {
      console.warn('Cannot check allowance: user address is undefined');
      return ethers.constants.Zero;
    }

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

      return allowance;
    } catch (error) {
      console.error('Error checking allowance:', error);
      return ethers.constants.Zero;
    }
  };

  return {
    approveToken,
    checkAllowance,
  };
}
