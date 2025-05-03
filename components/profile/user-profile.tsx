'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useAuth } from '@/hooks/use-auth';
import { useWeb3Profile } from '@/hooks/use-web3-profile';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Copy, Check, User, ExternalLink } from 'lucide-react';
import Image from 'next/image';

export function UserProfile() {
  const { address, isConnected } = useAccount();
  const { isAuthenticated } = useAuth();
  const {
    primaryProfile,
    profiles,
    isLoading: isProfileLoading,
  } = useWeb3Profile();
  const [copied, setCopied] = useState(false);
  const [joinDate, setJoinDate] = useState<string | null>(null);

  useEffect(() => {
    // Set a join date - in a real app this would come from your backend
    setJoinDate(new Date().toLocaleDateString());
  }, []);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isConnected || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isProfileLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">
          Loading profile data...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
      <div className="flex flex-col items-center text-center gap-6">
        <div className="shrink-0 flex items-center justify-center bg-muted rounded-full size-24 overflow-hidden">
          {primaryProfile?.avatar ? (
            <Image
              src={primaryProfile.avatar}
              alt={primaryProfile.displayName || 'Profile'}
              width={96}
              height={96}
              className="object-cover size-full"
              unoptimized
            />
          ) : (
            <User className="size-12 text-muted-foreground" />
          )}
        </div>

        <div className="space-y-4 w-full">
          <div className="text-center">
            <h2 className="text-xl font-semibold">
              {primaryProfile?.displayName || 'Wallet'}
              {primaryProfile?.platform && (
                <span className="ml-2 text-sm text-muted-foreground">
                  via {primaryProfile.platform}
                </span>
              )}
            </h2>
            {primaryProfile?.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {primaryProfile.description}
              </p>
            )}
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center gap-2 bg-muted px-3 py-1 rounded-md">
              <span className="text-sm font-mono">
                {address
                  ? `${address.slice(0, 6)}...${address.slice(-4)}`
                  : 'Not connected'}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
                onClick={copyAddress}
              >
                {copied ? (
                  <Check className="size-3 text-green-500" />
                ) : (
                  <Copy className="size-3" />
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium">
                {isAuthenticated ? (
                  <span className="text-green-600">Authenticated</span>
                ) : (
                  <span className="text-amber-600">Not Authenticated</span>
                )}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Joined</p>
              <p className="font-medium">{joinDate || 'Unknown'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <Card className="p-4 bg-muted/50">
          <h3 className="font-medium mb-3 text-center">Web3 Profiles</h3>
          <div className="space-y-2">
            {profiles && profiles.length > 0 ? (
              profiles.map((profile, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`size-2 rounded-full ${
                        profile.platform === 'ens'
                          ? 'bg-blue-500'
                          : profile.platform === 'farcaster'
                            ? 'bg-purple-500'
                            : profile.platform === 'lens'
                              ? 'bg-green-500'
                              : 'bg-gray-500'
                      }`}
                    />
                    <span className="capitalize">{profile.platform}</span>
                    {profile.identity && (
                      <span className="text-xs text-muted-foreground">
                        {profile.identity}
                      </span>
                    )}
                  </div>
                  {profile.links && Object.keys(profile.links).length > 0 && (
                    <a
                      href={Object.values(profile.links)[0].link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center">
                No web3 profiles found
              </div>
            )}
          </div>
        </Card>

        <Card className="p-4 bg-muted/50">
          <h3 className="font-medium mb-3 text-center">Connected Networks</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <div className="size-2 rounded-full bg-green-500" />
              <span>Base</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="size-2 rounded-full bg-green-500" />
              <span>Optimism</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="size-2 rounded-full bg-green-500" />
              <span>Celo</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="size-2 rounded-full bg-green-500" />
              <span>Polygon</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
