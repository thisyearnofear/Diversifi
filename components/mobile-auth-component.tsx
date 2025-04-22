"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileAuthButtons } from "./mobile-auth-buttons";
import { User, UserCheck } from "lucide-react";

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
      <div className="flex flex-col gap-3 pointer-events-auto">
        <div className="bg-background/80 backdrop-blur-sm p-2 rounded-lg shadow-md flex items-center justify-center">
          {isAuthenticated && showSuccess ? (
            <div className="flex items-center gap-2 px-2 py-1">
              <UserCheck className="size-5 text-green-500" />
              <span className="text-xs font-medium text-green-600">
                Authenticated
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-1">
              {isAuthenticated ? null : (
                <User className="size-5 text-amber-500" />
              )}
              <MobileAuthButtons />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
