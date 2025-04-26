"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileAuthButtons } from "./mobile-auth-buttons";
import { User, UserCheck } from "lucide-react";
import Link from "next/link";

export function MobileHeader() {
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
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center">
        <span className="font-medium text-sm">Stable Station</span>
      </div>

      <div className="flex items-center gap-2">
        {isAuthenticated && !showSuccess && (
          <Link
            href="/profile"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all duration-150"
          >
            <User className="size-4 text-green-600" />
            <span className="text-xs font-medium">Dashboard</span>
          </Link>
        )}

        <div className="bg-background/80 backdrop-blur-sm rounded-md flex items-center justify-center">
          {isAuthenticated && showSuccess ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 animate-fade-in">
              <UserCheck className="size-4 text-green-500" />
              <span className="text-xs font-medium text-green-600">
                Authenticated
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-1.5 py-0.5">
              {isAuthenticated ? null : (
                <User className="size-4 text-amber-500" />
              )}
              <MobileAuthButtons />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
