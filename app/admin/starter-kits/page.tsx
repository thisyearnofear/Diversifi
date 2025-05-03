'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useStarterKit } from '@/hooks/use-starter-kit';
import { toast } from 'sonner';

export default function AdminStarterKitsPage() {
  const { address } = useAccount();
  const { availableKits, createdKits } = useStarterKit();
  const [value, setValue] = useState<number>(100);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateStarterKit = async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/admin/create-starter-kit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creatorId: address,
          value,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create starter kit');
      }

      const data = await response.json();
      toast.success('Starter kit created successfully!');
      console.log('Created starter kit:', data.kit);
    } catch (error) {
      console.error('Error creating starter kit:', error);
      toast.error('Failed to create starter kit');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container p-8 space-y-8">
      <h1 className="text-2xl font-bold">Admin: Starter Kits</h1>

      <Card>
        <CardHeader>
          <CardTitle>Create Starter Kit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Creator Address
              </label>
              <Input
                value={address || ''}
                disabled
                placeholder="Connect your wallet to set creator address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Value</label>
              <Input
                type="number"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                placeholder="Enter starter kit value"
              />
            </div>
            <Button
              onClick={handleCreateStarterKit}
              disabled={!address || isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Starter Kit'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Starter Kits ({availableKits.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {availableKits.length === 0 ? (
            <p className="text-muted-foreground">No available starter kits</p>
          ) : (
            <ul className="space-y-4">
              {availableKits.map((kit) => (
                <li key={kit.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">ID: {kit.id}</p>
                    <p className="text-sm text-muted-foreground">
                      Creator: {kit.creatorId}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Value: {kit.value}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(kit.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Created Starter Kits ({createdKits.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {createdKits.length === 0 ? (
            <p className="text-muted-foreground">No created starter kits yet</p>
          ) : (
            <ul className="space-y-4">
              {createdKits.map((kit) => (
                <li key={kit.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">ID: {kit.id}</p>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(kit.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Value: {kit.value}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Balance: {kit.balance}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {kit.claimerId ? 'Claimed' : 'Unclaimed'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
