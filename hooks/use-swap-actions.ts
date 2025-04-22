import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { useAuth } from "./use-auth";
import { useActions } from "./use-actions";
import { ADDRESSES, ABIS, SwapParams } from "../constants/celo-tokens";
import { handleSwapError } from "../utils/celo-utils";

export function useSwapActions(
  swapState: any,
  tokenApproval: any,
  networkState: any,
  exchangeRates: any
) {
  const { address } = useAccount();
  const { isAuthenticated } = useAuth();
  const { completeAction } = useActions();
  
  const { 
    status, 
    setStatus, 
    error, 
    setError, 
    txHash, 
    setTxHash, 
    isApproved, 
    setIsCompleted 
  } = swapState;
  
  const { isCorrectNetwork, switchToCelo } = networkState;
  const { exchangeRate } = exchangeRates;
  
  // Function to complete the swap process
  const completeSwap = async (transactionHash: string) => {
    try {
      setStatus("completing");
      
      // Record the completion in the database
      try {
        await completeAction("Get cKES Stablecoins", {
          transactionHash,
          network: "celo",
          tokenSymbol: "cKES"
        });
        
        // Update state
        setIsCompleted(true);
        setStatus("completed");
        toast.success("Successfully acquired cKES stablecoins!");
      } catch (apiError) {
        console.error("Error recording completion:", apiError);
        
        // Fallback to localStorage if API fails
        try {
          const completedActions = localStorage.getItem('completed-actions') || '[]';
          const actions = JSON.parse(completedActions);
          if (!actions.includes('Get cKES Stablecoins')) {
            actions.push('Get cKES Stablecoins');
            localStorage.setItem('completed-actions', JSON.stringify(actions));
          }
          
          // Update state
          setIsCompleted(true);
          setStatus("completed");
          toast.success("Successfully acquired cKES stablecoins!");
        } catch (storageError) {
          console.error("Error updating localStorage:", storageError);
          setStatus("error");
          setError("Failed to record completion. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error completing swap:", error);
      setStatus("error");
      setError("Failed to complete swap. Please try again.");
    }
  };
  
  // Function to perform the swap
  const swap = async ({ amount }: SwapParams) => {
    console.log("Swap function called with amount:", amount, "and isApproved:", isApproved);
    
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    if (!isAuthenticated) {
      toast.error("Please sign in first");
      return;
    }
    
    if (!isCorrectNetwork) {
      const success = await switchToCelo();
      if (!success) return;
    }
    
    // Check if window.ethereum is available
    if (typeof window === 'undefined' || !window.ethereum) {
      toast.error("Ethereum provider not available. Please use a Web3 browser.");
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
        const approved = await tokenApproval.approveToken(amount.toString());
        if (!approved) return;
      }
      
      // Perform the swap
      setStatus("swapping");
      toast.info("Performing swap...");
      
      try {
        // Get the cKES address
        const ckesAddr = ADDRESSES.CKES;
        const cUSDAddr = ADDRESSES.CUSD;
        const brokerAddress = ADDRESSES.BROKER;
        
        // Create a read-only provider for getting the quote
        const readProvider = new ethers.providers.JsonRpcProvider("https://forno.celo.org");
        
        // Get the list of exchange providers from the broker
        const brokerProvidersContract = new ethers.Contract(
          brokerAddress, 
          ABIS.BROKER_PROVIDERS, 
          readProvider
        );
        const exchangeProviders = await brokerProvidersContract.getExchangeProviders();
        
        // For each provider, get the exchanges and find the one for cUSD/cKES
        let exchangeProvider = "";
        let exchangeId = "";
        
        // Loop through each provider to find the cUSD/cKES exchange
        for (const providerAddress of exchangeProviders) {
          const exchangeContract = new ethers.Contract(
            providerAddress, 
            ABIS.EXCHANGE, 
            readProvider
          );
          const exchanges = await exchangeContract.getExchanges();
          
          // Check each exchange to see if it includes cUSD and cKES
          for (const exchange of exchanges) {
            const assets = exchange.assets.map((a: string) => a.toLowerCase());
            
            if (assets.includes(cUSDAddr.toLowerCase()) && assets.includes(ckesAddr.toLowerCase())) {
              exchangeProvider = providerAddress;
              exchangeId = exchange.exchangeId;
              break;
            }
          }
          
          if (exchangeProvider && exchangeId) break;
        }
        
        if (!exchangeProvider || !exchangeId) {
          throw new Error("Direct cUSD to cKES swaps are not currently available. Please try again later or contact support.");
        }
        
        // Create a contract instance for the Broker
        const brokerRateContract = new ethers.Contract(
          brokerAddress, 
          ABIS.BROKER_RATE, 
          readProvider
        );
        
        // Create a contract instance for the Broker with the signer
        const brokerSwapContract = new ethers.Contract(
          brokerAddress, 
          ABIS.BROKER_SWAP, 
          signer
        );
        
        // Get the quote
        const quoteAmountOut = await brokerRateContract.getAmountOut(
          exchangeProvider,
          exchangeId,
          cUSDAddr,
          ckesAddr,
          amountInWei.toString()
        );
        
        // Allow 1% slippage from quote
        const expectedAmountOut = ethers.BigNumber.from(quoteAmountOut).mul(99).div(100);
        
        try {
          // First try with automatic gas estimation
          const swapTx = await brokerSwapContract.swapIn(
            exchangeProvider,
            exchangeId,
            cUSDAddr,
            ckesAddr,
            amountInWei.toString(),
            expectedAmountOut.toString()
          );
          
          setTxHash(swapTx.hash);
          
          // Wait for the transaction to be confirmed
          const swapReceipt = await swapTx.wait();
          if (swapReceipt.status !== 1) throw new Error("Swap transaction failed");
          
          // Update state and complete the swap
          setStatus("transaction-success");
          completeSwap(swapTx.hash);
        } catch (swapError) {
          console.error("Error with automatic gas estimation, trying with manual gas limit:", swapError);
          
          // If automatic gas estimation fails, try with manual gas limit
          const options = {
            gasLimit: ethers.utils.hexlify(500000), // Manual gas limit of 500,000
          };
          
          // Try again with manual gas limit
          const swapTx = await brokerSwapContract.swapIn(
            exchangeProvider,
            exchangeId,
            cUSDAddr,
            ckesAddr,
            amountInWei.toString(),
            expectedAmountOut.toString(),
            options
          );
          
          setTxHash(swapTx.hash);
          
          // Wait for the transaction to be confirmed
          const swapReceipt = await swapTx.wait();
          if (swapReceipt.status !== 1) throw new Error("Swap transaction failed");
          
          // Update state and complete the swap
          setStatus("transaction-success");
          completeSwap(swapTx.hash);
        }
      } catch (error) {
        const errorMessage = handleSwapError(error, "performing swap");
        setStatus("error");
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage = handleSwapError(error, "swap process");
      setStatus("error");
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };
  
  return {
    swap,
    completeSwap
  };
}
