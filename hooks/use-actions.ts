"use client";

import useSWR from "swr";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useActionsFallback } from "./use-actions-fallback";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useActions() {
  const { isAuthenticated } = useAuth();
  const fallback = useActionsFallback();

  // Try to use the API first
  const { data: apiUserActions, error: userActionsError, mutate: mutateUserActions } = useSWR(
    isAuthenticated ? "/api/actions/user" : null,
    fetcher,
    {
      onError: (err) => {
        console.warn("Error fetching user actions from API, using fallback:", err);
      },
    }
  );

  // Determine if we should use the fallback
  const useApiFallback = userActionsError || !apiUserActions;

  // Combine API and fallback data
  const userActions = useApiFallback ? fallback.userActions : apiUserActions;

  const completeAction = async (actionTitle: string, proof?: any) => {
    if (!isAuthenticated) {
      toast.error("Please authenticate to complete actions");
      return false;
    }

    try {
      // First try to use the API
      try {
        const response = await fetch("/api/actions/complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ actionId: actionTitle, proof }),
        });

        if (response.ok) {
          toast.success("Action completed successfully!");
          mutateUserActions();
          return true;
        }

        // If the API call fails, we'll fall through to the fallback
        const error = await response.json();
        console.warn("API error, using fallback:", error);
      } catch (apiError) {
        console.warn("API call failed, using fallback:", apiError);
      }

      // Use the fallback implementation
      await fallback.completeAction(actionTitle, proof);
      toast.success("Action completed successfully!");
      return true;
    } catch (error) {
      console.error("Error completing action:", error);
      toast.error("Failed to complete action");
      return false;
    }
  };

  const startAction = async (actionId: string) => {
    if (!isAuthenticated) {
      toast.error("Please authenticate to start actions");
      return false;
    }

    try {
      const response = await fetch("/api/actions/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ actionId }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Failed to start action");
        return false;
      }

      toast.success("Action started successfully!");
      mutateUserActions();
      return true;
    } catch (error) {
      console.error("Error starting action:", error);
      toast.error("Failed to start action");
      return false;
    }
  };

  return {
    userActions: userActions || [],
    isLoading: !useApiFallback ? (!userActionsError && !apiUserActions) : fallback.isLoading,
    error: useApiFallback ? fallback.error : userActionsError,
    completeAction,
    startAction,
    mutateUserActions,
    isActionCompleted: (title: string) => {
      if (useApiFallback) {
        return fallback.isActionCompleted(title);
      }

      // Check if the action is completed in the API data
      return userActions?.some((ua: { action?: { title?: string }, status?: string }) =>
        ua.action?.title === title && ua.status === "completed"
      ) || false;
    }
  };
}
