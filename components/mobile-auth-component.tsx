'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileAuthButtons } from './mobile-auth-buttons';
import { User, UserCheck } from 'lucide-react';
import Link from 'next/link';

export function MobileAuthComponent() {
  const [showSuccess, setShowSuccess] = useState(false);
  const { isAuthenticated } = useAuth();
  const isMobile = useIsMobile();

  // Show success message temporarily when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setShowSuccess(true);
      // Hide success message after 3 seconds
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  if (!isMobile) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-3 pointer-events-none">
      <div className="flex flex-col gap-3 pointer-events-auto animate-fade-in">
        <div className="bg-background/80 backdrop-blur-sm p-2.5 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 flex items-center justify-center transition-all duration-200">
          {isAuthenticated && showSuccess ? (
            <div className="flex items-center gap-2 px-2 py-1.5 animate-fade-in">
              <UserCheck className="size-5 text-green-500" />
              <span className="text-sm font-medium text-green-600">
                Authenticated
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-1.5 py-0.5">
              {isAuthenticated ? null : (
                <User className="size-5 text-amber-500" />
              )}
              <MobileAuthButtons />
            </div>
          )}
        </div>

        {isAuthenticated && !showSuccess && (
          <div className="bg-background/80 backdrop-blur-sm p-2.5 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 animate-fade-in animation-delay-100">
            <Link
              href="/profile"
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all duration-150"
            >
              <User className="size-4.5 text-green-600" />
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
