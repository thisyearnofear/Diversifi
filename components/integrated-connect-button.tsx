"use client";

import { ConnectKitButton } from "connectkit";
import { useCallback, useState, useEffect } from "react";
import { toast } from "sonner";
import { useAccount, useSignMessage } from "wagmi";
import { generateSiweChallenge, verifySiwe } from "@/app/auth-actions";
import { useAuth } from "@/hooks/use-auth";

export function IntegratedConnectButton() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [hasAttemptedAuth, setHasAttemptedAuth] = useState(false);
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { isAuthenticated } = useAuth();

  // Reset auth attempt flag when wallet is disconnected
  useEffect(() => {
    if (!isConnected) {
      setHasAttemptedAuth(false);
    }
  }, [isConnected]);

  // Auto-trigger SIWE when wallet is connected but not authenticated
  useEffect(() => {
    // Only attempt authentication once per connection session
    if (
      isConnected &&
      address &&
      !isAuthenticated &&
      !isAuthenticating &&
      !hasAttemptedAuth
    ) {
      console.log("Attempting automatic authentication");
      setHasAttemptedAuth(true);
      handleAuthenticate();
    }
  }, [
    isConnected,
    address,
    isAuthenticated,
    isAuthenticating,
    hasAttemptedAuth,
  ]);

  const handleAuthenticate = async () => {
    if (!address || !isConnected) return;

    try {
      setIsAuthenticating(true);

      // Get the current URL's hostname to display to the user
      const currentHostname = window.location.hostname;
      console.log(
        `Initiating SIWE authentication for ${address} on ${currentHostname}`
      );

      // Show a toast to inform the user about the signature request
      toast.info(
        `Please check your wallet for a signature request from ${currentHostname}`,
        { duration: 10000 }
      );

      // Generate SIWE message
      const message = await generateSiweChallenge(address as `0x${string}`);

      // Request signature from wallet
      const signature = await signMessageAsync({
        message,
        account: address as `0x${string}`,
      });

      // Verify signature
      const result = await verifySiwe(message, signature as `0x${string}`);

      if (result.status === "failed") {
        if (result.error?.includes("Domain mismatch")) {
          toast.error(
            "Authentication failed: The domain in the signature request doesn't match the site you're using. This could be due to a misconfiguration."
          );
          // Reset the attempt flag so user can try again if they want
          setHasAttemptedAuth(false);
        } else {
          toast.error(
            "Authentication failed: " + (result.error || "Unknown error")
          );
          // Reset the attempt flag so user can try again if they want
          setHasAttemptedAuth(false);
        }
      } else {
        toast.success("Successfully authenticated!");

        // Reload the page to update auth state
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (err: any) {
      console.error("Authentication error:", err);

      // Handle user rejection
      if (err.message?.includes("rejected") || err.code === 4001) {
        toast.error(
          "You rejected the signature request. Authentication canceled."
        );
        // Keep hasAttemptedAuth as true to prevent further prompts
      }
      // Handle popup/window issues
      else if (
        err.message?.includes("window") ||
        err.message?.includes("popup")
      ) {
        toast.error(
          "Failed to open signature window. Please check if pop-ups are blocked."
        );
        // Reset the attempt flag so user can try again if they want
        setHasAttemptedAuth(false);
      }
      // Handle domain mismatch issues
      else if (
        err.message?.includes("domain") ||
        err.message?.includes("site")
      ) {
        toast.error(
          "There appears to be a domain mismatch. Please ensure you're using the correct URL."
        );
        // Reset the attempt flag so user can try again if they want
        setHasAttemptedAuth(false);
      }
      // Generic error
      else {
        toast.error(
          "Failed to authenticate: " + (err.message || "Unknown error")
        );
        // Reset the attempt flag so user can try again if they want
        setHasAttemptedAuth(false);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Custom render function for ConnectKitButton
  const customButtonRender = useCallback(
    ({ show, isConnected, address, ensName }: any) => {
      const handleConnect = async () => {
        if (isConnecting) return;

        setIsConnecting(true);
        try {
          // Add a small delay to ensure the browser recognizes this as a user action
          await new Promise((resolve) => setTimeout(resolve, 50));
          await show();
        } catch (error) {
          console.error("Connection error:", error);
          toast.error(
            "Failed to open wallet connection. Please check if pop-ups are blocked."
          );
        } finally {
          setIsConnecting(false);
        }
      };

      // If connected but not authenticated, show authenticating state
      const showAuthenticatingState =
        isConnected && !isAuthenticated && isAuthenticating;

      return (
        <button
          onClick={
            isConnected && !isAuthenticated && !hasAttemptedAuth
              ? handleAuthenticate
              : isConnected && !isAuthenticated && hasAttemptedAuth
              ? () => {
                  // Allow manual retry if user wants to try again
                  setHasAttemptedAuth(false);
                  handleAuthenticate();
                }
              : handleConnect
          }
          disabled={isConnecting || isAuthenticating}
          className="flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isConnected ? (
            isAuthenticated ? (
              // Connected and authenticated
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>
                  {ensName || `${address?.slice(0, 6)}...${address?.slice(-4)}`}
                </span>
              </div>
            ) : showAuthenticatingState ? (
              // Connected but authenticating
              <div className="flex items-center gap-2">
                <span className="animate-spin">⌛</span>
                <span>Signing in...</span>
              </div>
            ) : (
              // Connected but not authenticated
              <div className="flex items-center gap-2">
                <span className="animate-pulse">🔑</span>
                <span>{hasAttemptedAuth ? "Retry Sign in" : "Sign in"}</span>
              </div>
            )
          ) : isConnecting ? (
            <span>Connecting...</span>
          ) : (
            <span>Connect Wallet</span>
          )}
        </button>
      );
    },
    [isConnecting, isAuthenticating, isAuthenticated, hasAttemptedAuth]
  );

  return (
    <ConnectKitButton.Custom>{customButtonRender}</ConnectKitButton.Custom>
  );
}
