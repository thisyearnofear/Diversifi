'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useActions } from '@/hooks/use-actions';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ActionCardCompactProps {
  title: string;
  description: string;
  chain: string;
  difficulty: string;
  steps: string[];
  reward: string;
  actionUrl: string;
  proofFieldLabel?: string;
  proofFieldPlaceholder?: string;
  onComplete?: () => void;
}

export function ActionCardCompact({
  title,
  description,
  chain,
  difficulty,
  steps,
  reward,
  actionUrl,
  proofFieldLabel = 'Proof',
  proofFieldPlaceholder = 'Transaction hash, URL, etc.',
  onComplete,
}: ActionCardCompactProps) {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [proof, setProof] = useState('');
  const { completeAction } = useActions();

  const handleStart = () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    window.open(actionUrl, '_blank');
  };

  const handleComplete = async () => {
    if (!address || !proof) return;

    setIsLoading(true);
    try {
      // Get the action ID from the database
      const response = await fetch('/api/actions/by-title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error('Failed to get action ID');
      }

      const { id } = await response.json();

      // Complete the action
      await completeAction(id, {
        proof,
        completedAt: new Date().toISOString(),
      });

      toast.success('Action completed successfully!');
      setProof('');

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to complete action';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-2.5 w-full max-w-md mx-auto my-1.5 border border-muted rounded-md">
      <div className="flex flex-col mb-2">
        <div className="flex items-center gap-1 mb-1">
          <h3 className="font-medium text-sm">{title}</h3>
          <Badge variant="outline" className="capitalize text-xs py-0 h-5">
            {chain.toLowerCase()}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              'capitalize text-xs py-0 h-5',
              difficulty.toLowerCase() === 'beginner' &&
                'bg-green-50 text-green-700',
              difficulty.toLowerCase() === 'intermediate' &&
                'bg-yellow-50 text-yellow-700',
              difficulty.toLowerCase() === 'advanced' &&
                'bg-red-50 text-red-700',
            )}
          >
            {difficulty.toLowerCase()}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="text-xs">
          <span className="font-medium">Reward:</span>{' '}
          <span className="text-green-600">{reward}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-0 size-5"
        >
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-1 mb-2 text-xs">
          <div className="mb-1">
            <span className="font-medium">Steps:</span>
            <ol className="list-decimal pl-4 mt-0.5 space-y-0.5">
              {steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Button
          size="sm"
          onClick={handleStart}
          disabled={isLoading}
          className="w-full h-7 text-xs"
        >
          <ExternalLink className="mr-1 size-3" />
          Start Action
        </Button>

        <div className="flex gap-1.5">
          <Input
            size={1}
            placeholder={proofFieldPlaceholder}
            value={proof}
            onChange={(e) => setProof(e.target.value)}
            className="text-xs h-7"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleComplete}
            disabled={isLoading || !proof}
            className="whitespace-nowrap h-7 text-xs"
          >
            {isLoading ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              'Complete'
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
