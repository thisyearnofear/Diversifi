import { useChainId, useSwitchChain } from "wagmi";
import { celo } from "wagmi/chains";
import { toast } from "sonner";

export function useNetworkState() {
  const chainId = useChainId();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  // Check if we're on the correct network (Celo)
  const isCorrectNetwork = chainId === celo.id;

  // Function to switch to Celo network
  const switchToCelo = async () => {
    if (isCorrectNetwork) return true;

    try {
      await switchChain({ chainId: celo.id });
      return true;
    } catch (error) {
      console.error("Error switching to Celo network:", error);
      toast.error("Failed to switch to Celo network. Please try manually.");
      return false;
    }
  };

  return {
    isCorrectNetwork,
    isSwitchingChain,
    switchToCelo
  };
}
