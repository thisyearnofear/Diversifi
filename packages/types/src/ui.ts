/**
 * UI Component Props and styling types
 */

/**
 * Common button variants
 */
export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

/**
 * Common states
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Chart data
 */
export interface ChartDataPoint {
  timestamp: number;
  value: number;
  label?: string;
}

/**
 * Toast notification
 */
export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'default' | 'success' | 'error' | 'info';
  duration?: number;
}
