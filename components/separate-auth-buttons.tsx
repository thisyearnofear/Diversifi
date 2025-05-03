'use client';

import { useState, useEffect } from 'react';
import { ConnectKitButton } from 'connectkit';
import { useAccount, useSignMessage } from 'wagmi';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { generateSiweChallenge, verifySiwe } from '@/app/auth-actions';
import { useAuth } from '@/hooks/use-auth';
import { CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRegionStyle, getAnimationStyle } from '@/lib/styles/style-utils';

export function SeparateAuthButtons() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [hasAttemptedAuth, setHasAttemptedAuth] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { isAuthenticated } = useAuth();

  // Reset auth attempt flag when wallet is disconnected
  useEffect(() => {
    if (!isConnected) {
      setHasAttemptedAuth(false);
      setShowSuccess(false);
    }
  }, [isConnected]);

  // Show success message temporarily when authenticated
  useEffect(() => {
    if (isAuthenticated && isConnected) {
      setShowSuccess(true);
      // Hide success message after 3 seconds
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isConnected]);

  // Log authentication state for debugging
  useEffect(() => {
    console.log('Auth state:', {
      isConnected,
      hasAddress: !!address,
      isAuthenticated,
      isAuthenticating,
      hasAttemptedAuth,
    });
  }, [
    isConnected,
    address,
    isAuthenticated,
    isAuthenticating,
    hasAttemptedAuth,
  ]);

  const handleAuthenticate = async () => {
    // Skip if already authenticated
    if (isAuthenticated) {
      console.log('Already authenticated, skipping authentication');
      return;
    }

    // Skip if no address or not connected
    if (!address || !isConnected) {
      console.log('No address or not connected, skipping authentication');
      return;
    }

    try {
      setIsAuthenticating(true);
      setHasAttemptedAuth(true);

      // Get the current URL's hostname to display to the user
      const currentHostname = window.location.hostname;
      console.log(
        `Initiating SIWE authentication for ${address} on ${currentHostname}`,
      );

      // Show a toast to inform the user about the signature request
      toast.info(
        `Please check your wallet for a signature request from ${currentHostname}`,
        { duration: 10000 },
      );

      // Generate SIWE message
      console.log('Generating SIWE challenge...');
      const message = await generateSiweChallenge(address as `0x${string}`);
      console.log('SIWE challenge generated');

      // Request signature from wallet
      console.log('Requesting signature from wallet...');
      const signature = await signMessageAsync({
        message,
        account: address as `0x${string}`,
      });
      console.log('Signature received');

      // Verify signature
      console.log('Verifying signature...');
      const result = await verifySiwe(message, signature as `0x${string}`);
      console.log('Verification result:', result);

      if (result.status === 'failed') {
        console.error('Authentication failed:', result.error);
        if (result.error?.includes('Domain mismatch')) {
          toast.error(
            "Authentication failed: The domain in the signature request doesn't match the site you're using. This could be due to a misconfiguration.",
          );
        } else {
          toast.error(
            `Authentication failed: ${result.error || 'Unknown error'}`,
          );
        }
      } else {
        console.log('Authentication successful');
        toast.success('Successfully authenticated!');

        // Reload the page to update auth state
        console.log('Reloading page to update auth state...');
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (err: any) {
      console.error('Authentication error:', err);

      // Handle user rejection
      if (err.message?.includes('rejected') || err.code === 4001) {
        toast.error(
          'You rejected the signature request. Authentication canceled.',
        );
      }
      // Handle popup/window issues
      else if (
        err.message?.includes('window') ||
        err.message?.includes('popup')
      ) {
        toast.error(
          'Failed to open signature window. Please check if pop-ups are blocked.',
        );
      }
      // Handle domain mismatch issues
      else if (
        err.message?.includes('domain') ||
        err.message?.includes('site')
      ) {
        toast.error(
          "There appears to be a domain mismatch. Please ensure you're using the correct URL.",
        );
      }
      // Generic error
      else {
        toast.error(
          `Failed to authenticate: ${err.message || 'Unknown error'}`,
        );
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  // If authenticated and not showing success message, show only the wallet button
  if (isAuthenticated && !showSuccess) {
    return (
      <div className="flex items-center justify-between w-full">
        <div>
          <h3 className="text-sm font-medium">Wallet</h3>
        </div>
        <ConnectKitButton.Custom>
          {({ show, ensName }) => (
            <Button
              onClick={show}
              size="sm"
              variant="outline"
              className="text-xs py-1 h-8"
            >
              {ensName ||
                (address
                  ? `${address.slice(0, 6)}...${address.slice(-4)}`
                  : 'Wallet')}
            </Button>
          )}
        </ConnectKitButton.Custom>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Wallet</h3>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <div
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-md',
                getRegionStyle('Africa', 'light', 'bg'),
                getRegionStyle('Africa', 'medium', 'text'),
              )}
            >
              <CheckCircle className="size-3.5" />
              <span className="text-xs font-medium">Connected</span>
            </div>
          ) : (
            <ConnectKitButton.Custom>
              {({ show }) => (
                <Button onClick={show} size="sm" className="py-1 h-8">
                  Connect
                </Button>
              )}
            </ConnectKitButton.Custom>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Auth</h3>
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-md',
                getRegionStyle('Africa', 'light', 'bg'),
                getRegionStyle('Africa', 'medium', 'text'),
              )}
            >
              <CheckCircle className="size-3.5" />
              <span className="text-xs font-medium">Verified</span>
            </div>
          ) : (
            <Button
              onClick={handleAuthenticate}
              disabled={!isConnected || isAuthenticating}
              size="sm"
              variant={isConnected ? 'default' : 'outline'}
              className="py-1 h-8"
            >
              {isAuthenticating ? (
                <>
                  <Loader2
                    className={cn('mr-1.5 size-3.5', getAnimationStyle())}
                  />
                  Signing...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
