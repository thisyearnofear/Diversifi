import type { StarterKit } from "@/lib/db/schema";
import { useAuth } from "@/hooks/use-auth";
import {
  useAvailableStarterKits,
  useClaimedStarterKits,
  useCreatedStarterKits
} from "./api/use-starter-kit-queries";

export function useStarterKit() {
  const { isAuthenticated } = useAuth();

  // Use React Query hooks with proper caching
  const {
    data: availableKits = [],
    isLoading: isLoadingAvailable,
    error: availableError
  } = useAvailableStarterKits();

  const {
    data: claimedKits = [],
    isLoading: isLoadingClaimed,
    error: claimedError
  } = useClaimedStarterKits();

  const {
    data: createdKits = [],
    isLoading: isLoadingCreated,
    error: createdError
  } = useCreatedStarterKits();

  const isLoading = isLoadingAvailable || isLoadingClaimed || isLoadingCreated;
  const error = availableError || claimedError || createdError;

  // For backward compatibility
  const kits = availableKits;
  const claimed = claimedKits;
  const created = createdKits;

  return {
    available: kits.length,
    claimed: claimed.length,
    created: created.length,
    availableKits: kits,
    claimedKits: claimed,
    createdKits: created,
    isLoading,
    error,
  };
}
