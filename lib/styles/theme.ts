/**
 * Central theme configuration for the application
 * This file defines color schemes, spacing, and other design tokens
 */

// Region color schemes - used consistently across the application
export const regionColors = {
  USA: {
    bg: {
      light: 'bg-red-50 dark:bg-red-950/30',
      medium: 'bg-red-100 dark:bg-red-900/30',
      strong: 'bg-red-400 dark:bg-red-600',
      hover: 'hover:bg-red-100 dark:hover:bg-red-900/30',
    },
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
  },
  Europe: {
    bg: {
      light: 'bg-blue-50 dark:bg-blue-950/30',
      medium: 'bg-blue-100 dark:bg-blue-900/30',
      strong: 'bg-blue-400 dark:bg-blue-600',
      hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30',
    },
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
  },
  Africa: {
    bg: {
      light: 'bg-green-50 dark:bg-green-950/30',
      medium: 'bg-green-100 dark:bg-green-900/30',
      strong: 'bg-green-400 dark:bg-green-600',
      hover: 'hover:bg-green-100 dark:hover:bg-green-900/30',
    },
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
  },
  LatAm: {
    bg: {
      light: 'bg-yellow-50 dark:bg-yellow-950/30',
      medium: 'bg-yellow-100 dark:bg-yellow-900/30',
      strong: 'bg-yellow-400 dark:bg-yellow-600',
      hover: 'hover:bg-yellow-100 dark:hover:bg-yellow-900/30',
    },
    text: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
  Asia: {
    bg: {
      light: 'bg-purple-50 dark:bg-purple-950/30',
      medium: 'bg-purple-100 dark:bg-purple-900/30',
      strong: 'bg-purple-400 dark:bg-purple-600',
      hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/30',
    },
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
  },
  RWA: {
    bg: {
      light: 'bg-amber-50 dark:bg-amber-950/30',
      medium: 'bg-amber-100 dark:bg-amber-900/30',
      strong: 'bg-amber-400 dark:bg-amber-600',
      hover: 'hover:bg-amber-100 dark:hover:bg-amber-900/30',
    },
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
  },
  // Default/fallback colors
  default: {
    bg: {
      light: 'bg-gray-50 dark:bg-gray-950/30',
      medium: 'bg-gray-100 dark:bg-gray-900/30',
      strong: 'bg-gray-400 dark:bg-gray-600',
      hover: 'hover:bg-gray-100 dark:hover:bg-gray-900/30',
    },
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-800',
  },
};

// Chain-specific color schemes
export const chainColors = {
  BASE: {
    bg: {
      light: 'bg-blue-50 dark:bg-blue-950/30',
      medium: 'bg-blue-100 dark:bg-blue-900/30',
      hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30',
    },
    text: 'text-blue-600 dark:text-blue-400',
  },
  OPTIMISM: {
    bg: {
      light: 'bg-purple-50 dark:bg-purple-950/30',
      medium: 'bg-purple-100 dark:bg-purple-900/30',
      hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/30',
    },
    text: 'text-purple-600 dark:text-purple-400',
  },
  CELO: {
    bg: {
      light: 'bg-yellow-50 dark:bg-yellow-950/30',
      medium: 'bg-yellow-100 dark:bg-yellow-900/30',
      hover: 'hover:bg-yellow-100 dark:hover:bg-yellow-900/30',
    },
    text: 'text-yellow-600 dark:text-yellow-400',
  },
  POLYGON: {
    bg: {
      light: 'bg-indigo-50 dark:bg-indigo-950/30',
      medium: 'bg-indigo-100 dark:bg-indigo-900/30',
      hover: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/30',
    },
    text: 'text-indigo-600 dark:text-indigo-400',
  },
};

// Common component styles
export const componentStyles = {
  card: {
    base: 'rounded-lg border bg-card text-card-foreground shadow-sm',
    gradient: {
      blue: 'bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20',
      neutral: 'bg-gradient-to-br from-zinc-50 to-gray-50 dark:from-zinc-900 dark:to-gray-900',
    },
  },
  sidebar: {
    menuButton: 'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
  },
  mobile: {
    header: 'fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-2',
    navigation: 'fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden bg-background/90 backdrop-blur-sm rounded-xl shadow-lg px-2 py-1.5 w-[98vw] max-w-md',
  },
  button: {
    base: 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors',
    sizes: {
      sm: 'h-9 px-3 py-1',
      md: 'h-10 px-4 py-2',
      lg: 'h-11 px-6 py-2.5',
    },
  },
  animation: {
    fadeIn: 'animate-fade-in',
    delays: {
      100: 'animation-delay-100',
      200: 'animation-delay-200',
      300: 'animation-delay-300',
      400: 'animation-delay-400',
      500: 'animation-delay-500',
    },
  },
};

// Layout constants
export const layout = {
  sidebar: {
    width: 'var(--sidebar-width)',
    collapsedWidth: 'var(--sidebar-width-icon)',
  },
  maxContentWidth: 'max-w-3xl',
  breakpoints: {
    mobile: 768, // Matches the useIsMobile hook default
  },
};
