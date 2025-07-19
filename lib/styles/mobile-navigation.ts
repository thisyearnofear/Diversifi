import { clsx } from 'clsx';

export const mobileNavStyles = {
  container: clsx(
    "fixed bottom-0 inset-x-0 z-50",
    "bg-background/95 backdrop-blur-sm border-t border-border",
    "md:hidden" // Only show on mobile
  ),
  nav: clsx(
    "flex items-center justify-around",
    "px-4 py-2 safe-area-pb"
  ),
  navItem: clsx(
    "flex flex-col items-center gap-1",
    "p-2 rounded-lg transition-colors",
    "hover:bg-muted active:bg-muted/80"
  ),
  navIcon: clsx(
    "size-5 text-muted-foreground",
    "group-hover:text-foreground transition-colors"
  ),
  navLabel: clsx(
    "text-xs text-muted-foreground",
    "group-hover:text-foreground transition-colors"
  ),
  activeNavItem: clsx(
    "bg-primary/10 text-primary",
    "hover:bg-primary/20"
  ),
  activeNavIcon: "text-primary",
  activeNavLabel: "text-primary"
};

export const mobileLayoutStyles = {
  main: clsx(
    "pb-16 md:pb-0" // Add bottom padding on mobile for nav bar
  ),
  chatContainer: clsx(
    "h-[calc(100dvh-4rem)] md:h-dvh" // Account for mobile nav height
  ),
  actionCards: clsx(
    "grid grid-cols-1 gap-3",
    "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
  ),
  mobileOptimizedCard: clsx(
    "p-4 rounded-lg border bg-card",
    "touch-manipulation", // Optimize for touch
    "active:scale-95 transition-transform" // Touch feedback
  )
};
