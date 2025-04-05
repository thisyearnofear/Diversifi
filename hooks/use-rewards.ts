"use client";

import useSWR from "swr";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useRewards() {
  const { isAuthenticated } = useAuth();

  const { data: userRewards, error: userRewardsError, mutate: mutateUserRewards } = useSWR(
    isAuthenticated ? "/api/rewards/user" : null,
    fetcher
  );

  const claimReward = async (rewardId: string) => {
    if (!isAuthenticated) {
      toast.error("Please authenticate to claim rewards");
      return false;
    }

    try {
      const response = await fetch("/api/rewards/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rewardId }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Failed to claim reward");
        return false;
      }

      toast.success("Reward claimed successfully!");
      mutateUserRewards();
      return true;
    } catch (error) {
      console.error("Error claiming reward:", error);
      toast.error("Failed to claim reward");
      return false;
    }
  };

  return {
    userRewards: userRewards || [],
    isLoading: !userRewardsError && !userRewards,
    error: userRewardsError,
    claimReward,
    mutateUserRewards,
  };
}
