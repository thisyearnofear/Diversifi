"use client";

import useSWR from "swr";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useActions() {
  const { isAuthenticated } = useAuth();

  const { data: userActions, error: userActionsError, mutate: mutateUserActions } = useSWR(
    isAuthenticated ? "/api/actions/user" : null,
    fetcher
  );

  const completeAction = async (actionId: string, proof?: any) => {
    if (!isAuthenticated) {
      toast.error("Please authenticate to complete actions");
      return false;
    }

    try {
      const response = await fetch("/api/actions/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ actionId, proof }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Failed to complete action");
        return false;
      }

      toast.success("Action completed successfully!");
      mutateUserActions();
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
    isLoading: !userActionsError && !userActions,
    error: userActionsError,
    completeAction,
    startAction,
    mutateUserActions,
  };
}
