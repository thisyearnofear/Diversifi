'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';

// Define types for actions
export interface Action {
  id: string;
  title: string;
  description: string;
  category: string;
  chain: string;
  difficulty: string;
  prerequisites: string[];
  steps: string[];
  rewards: string[];
}

export interface UserAction {
  id: string;
  actionId: string;
  status: 'started' | 'completed';
  startedAt: string;
  completedAt: string | null;
  proof: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  action: Action | null;
}

// Fallback hook for when the API is not available
export function useActionsFallback() {
  const { isAuthenticated, activeAddress } = useAuth();
  const [userActions, setUserActions] = useState<UserAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user actions from localStorage
  useEffect(() => {
    const loadUserActions = () => {
      try {
        setIsLoading(true);

        // Try to get actions from localStorage
        const storedActions = localStorage.getItem('completed-actions');
        if (storedActions) {
          const actionTitles = JSON.parse(storedActions) as string[];

          // Create UserAction objects from the titles
          const actions: UserAction[] = actionTitles.map((title, index) => ({
            id: `local-${index}`,
            actionId: `action-${index}`,
            status: 'completed',
            startedAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            proof: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            action: {
              id: `action-${index}`,
              title,
              description: '',
              category: 'stablecoins',
              chain: '',
              difficulty: 'beginner',
              prerequisites: [],
              steps: [],
              rewards: [],
            },
          }));

          setUserActions(actions);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading actions from localStorage:', err);
        setError('Failed to load actions');
        setIsLoading(false);
      }
    };

    if (isAuthenticated && activeAddress) {
      loadUserActions();
    } else {
      setUserActions([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, activeAddress]);

  // Function to complete an action
  const completeAction = async (
    title: string,
    proof: Record<string, any> = {},
  ) => {
    try {
      // First try to use the API
      try {
        const response = await fetch('/api/actions/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, proof }),
        });

        if (response.ok) {
          // If the API call succeeds, we're done
          return;
        }
      } catch (apiError) {
        console.warn('API call failed, using localStorage fallback:', apiError);
      }

      // Fallback to localStorage
      const storedActions = localStorage.getItem('completed-actions') || '[]';
      const actions = JSON.parse(storedActions) as string[];

      if (!actions.includes(title)) {
        actions.push(title);
        localStorage.setItem('completed-actions', JSON.stringify(actions));
      }

      // Update the local state
      const newAction: UserAction = {
        id: `local-${userActions.length}`,
        actionId: `action-${userActions.length}`,
        status: 'completed',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        proof,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        action: {
          id: `action-${userActions.length}`,
          title,
          description: '',
          category: 'stablecoins',
          chain: '',
          difficulty: 'beginner',
          prerequisites: [],
          steps: [],
          rewards: [],
        },
      };

      setUserActions([...userActions, newAction]);
    } catch (err) {
      console.error('Error completing action:', err);
      throw err;
    }
  };

  // Check if an action is completed
  const isActionCompleted = (title: string): boolean => {
    return userActions.some(
      (ua) => ua.action?.title === title && ua.status === 'completed',
    );
  };

  return {
    userActions,
    isLoading,
    error,
    completeAction,
    isActionCompleted,
  };
}
