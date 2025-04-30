/**
 * Mobile-specific styling utilities
 */
import { cn } from "@/lib/utils";

/**
 * Get the mobile header container classes
 * This handles the mobile header at the top of the screen
 */
export function getMobileHeaderContainer(className = ""): string {
  return cn(
    "fixed top-0 left-0 right-0 z-50",
    "bg-background/95 backdrop-blur-sm",
    "border-b border-gray-200 dark:border-gray-800",
    "px-4 py-2",
    "md:hidden",
    className
  );
}

/**
 * Get the mobile navigation container classes
 * This handles the mobile navigation bar at the bottom of the screen
 */
export function getMobileNavContainer(className = ""): string {
  return cn(
    "fixed bottom-4 left-1/2 -translate-x-1/2 z-50",
    "md:hidden",
    "bg-background/90 backdrop-blur-sm",
    "rounded-xl shadow-lg",
    "px-2 py-1.5",
    "w-[95vw] max-w-md",
    "flex justify-center items-end pointer-events-none",
    className
  );
}

/**
 * Get the main layout grid classes
 * This handles the responsive grid layout for the entire application
 */
export function getMainLayoutGrid(): string {
  return cn(
    "grid min-h-screen w-full",
    // On mobile, collapse the sidebars completely
    "grid-cols-1",
    // On desktop, use the auto-1fr-auto grid
    "md:grid-cols-[auto,1fr,auto]"
  );
}

/**
 * Get the main content container classes
 * This handles the content area that contains the main content
 */
export function getMainContentContainer(): string {
  return cn(
    "flex flex-col items-start w-full",
    // On mobile, take full width
    "px-2",
    // On desktop, center the content
    "md:px-0 md:justify-center"
  );
}

/**
 * Get the main content area classes
 * This handles the main content area that contains the children
 */
export function getMainContent(): string {
  return cn(
    "w-full mx-auto",
    // Mobile specific padding and margin
    "pb-24 mt-14",
    // Desktop specific padding and margin
    "md:pb-0 md:mt-0",
    // Max width for content
    "max-w-3xl"
  );
}

/**
 * Get the tab content container classes
 * This handles the tab content in the profile page
 */
export function getTabContentContainer(): string {
  return cn(
    "space-y-6 w-full"
  );
}

/**
 * Get the profile page container classes
 * This handles the profile page container
 */
export function getProfileContainer(): string {
  return cn(
    "w-full max-w-3xl mx-auto",
    "p-0 sm:p-6 pt-4 md:pt-6",
    "space-y-6 md:space-y-8",
    "px-2 md:px-0"
  );
}
