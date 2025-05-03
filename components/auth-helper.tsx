'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomConnectButton } from '@/components/custom-connect-button';
import { useAccount, useSignMessage } from 'wagmi';
import { useState } from 'react';
import { generateSiweChallenge, verifySiwe } from '@/app/auth-actions';
import { toast } from 'sonner';

interface AuthHelperProps {
  variant?: 'card' | 'compact';
  onAuthenticated?: () => void;
}

export function AuthHelper({
  variant = 'card',
  onAuthenticated,
}: AuthHelperProps) {
  const { isAuthenticated, isWeb3User } = useAuth();
  const { address, isConnected } = useAccount();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signMessageAsync } = useSignMessage();

  const handleSignIn = async () => {
    if (!address) return;

    try {
      setIsAuthenticating(true);
      setError(null);

      // Get the current URL's hostname to display to the user
      const currentHostname = window.location.hostname;
      console.log(
        `Initiating SIWE authentication for ${address} on ${currentHostname}`,
      );

      // Generate SIWE message
      const message = await generateSiweChallenge(address as `0x${string}`);

      // Show a toast to inform the user about the signature request
      toast.info(
        `Please check your wallet for a signature request from ${currentHostname}`,
        { duration: 10000 },
      );

      // Request signature from wallet using wagmi hook
      const signature = await signMessageAsync({
        message,
        account: address as `0x${string}`,
      });

      // Verify signature
      const result = await verifySiwe(message, signature as `0x${string}`);

      if (result.status === 'failed') {
        setError(result.error || 'Authentication failed');

        // Provide more specific error messages based on the error
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
        toast.success('Successfully authenticated!');

        // Call the onAuthenticated callback if provided
        if (onAuthenticated) {
          onAuthenticated();
        } else {
          // Otherwise, reload the page to update auth state
          window.location.reload();
        }
      }
    } catch (err: any) {
      console.error('Authentication error:', err);

      // Handle user rejection
      if (err.message?.includes('rejected') || err.code === 4001) {
        toast.error('You rejected the signature request. Please try again.');
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
      setError('Failed to authenticate. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Render the compact variant
  if (variant === 'compact') {
    if (isAuthenticated) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm text-green-600 font-medium">
            ✓ Authenticated
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        {!isConnected ? (
          <CustomConnectButton />
        ) : (
          <>
            <Button
              onClick={handleSignIn}
              disabled={isAuthenticating}
              size="sm"
            >
              {isAuthenticating ? 'Authenticating...' : 'Sign In'}
            </Button>
            {error && <span className="text-xs text-red-500">{error}</span>}
          </>
        )}
      </div>
    );
  }

  // Render the card variant (default)
  if (isAuthenticated) {
    return (
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Connected and Authenticated</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            You're ready to start completing actions and earning rewards!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>Connect Your Wallet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div>
            <p className="text-gray-600 mb-4">
              Connect your wallet to get started
            </p>
            <CustomConnectButton />
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">
              Sign in with your wallet to authenticate
            </p>
            <Button onClick={handleSignIn} disabled={isAuthenticating}>
              {isAuthenticating ? 'Authenticating...' : 'Sign In With Ethereum'}
            </Button>
            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
