import { cn } from '@/lib/utils';
import { regionColors, chainColors, componentStyles } from './theme';
import type { Region } from '@/contexts/region-context';

/**
 * Get region-specific styling classes
 * @param region The region to get styles for
 * @param variant The style variant to use (light, medium, strong)
 * @param type The type of style to return (bg, text, border)
 */
export function getRegionStyle(
  region: Region | string = 'default',
  variant: 'light' | 'medium' | 'strong' | 'hover' = 'medium',
  type: 'bg' | 'text' | 'border' = 'bg'
): string {
  const regionData = regionColors[region as keyof typeof regionColors] || regionColors.default;

  if (type === 'bg') {
    return regionData.bg[variant] || '';
  }

  return regionData[type] || '';
}

/**
 * Get chain-specific styling classes
 * @param chain The blockchain to get styles for
 * @param variant The style variant to use (light, medium, hover)
 * @param type The type of style to return (bg, text)
 */
export function getChainStyle(
  chain: string = 'BASE',
  variant: 'light' | 'medium' | 'hover' = 'medium',
  type: 'bg' | 'text' = 'bg'
): string {
  const chainData = chainColors[chain as keyof typeof chainColors] || chainColors.BASE;

  if (type === 'bg') {
    return chainData.bg[variant] || '';
  }

  return chainData[type] || '';
}

/**
 * Get sidebar menu button styling with appropriate colors
 * @param isActive Whether the button is active
 * @param region Optional region for region-specific coloring
 * @param chain Optional chain for chain-specific coloring
 * @param isDisabled Whether the button is disabled
 */
export function getSidebarMenuButtonStyle({
  isActive = false,
  region,
  chain,
  isDisabled = false,
  className = '',
}: {
  isActive?: boolean;
  region?: Region | string;
  chain?: string;
  isDisabled?: boolean;
  className?: string;
}): string {
  // Base styles
  const baseStyle = componentStyles.sidebar.menuButton;

  // Determine color scheme
  let colorStyle = '';

  if (isDisabled) {
    colorStyle = 'bg-gray-50 dark:bg-gray-800/20 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-70';
  } else if (region) {
    colorStyle = cn(
      getRegionStyle(region, 'light', 'bg'),
      getRegionStyle(region, 'hover', 'bg'),
      getRegionStyle(region, 'medium', 'text')
    );
  } else if (chain) {
    colorStyle = cn(
      getChainStyle(chain, 'light', 'bg'),
      getChainStyle(chain, 'hover', 'bg'),
      getChainStyle(chain, 'medium', 'text')
    );
  } else {
    // Default style
    colorStyle = 'bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-700/30 text-gray-600 dark:text-gray-400';
  }

  // Active state
  if (isActive && !isDisabled) {
    colorStyle = colorStyle.replace('bg-', 'bg-opacity-80 bg-');
    colorStyle += ' font-medium';
  }

  return cn(baseStyle, colorStyle, className);
}

/**
 * Get card styling with appropriate gradient
 * @param variant The card variant (default, blue, neutral)
 * @param className Additional classes to apply
 */
export function getCardStyle({
  variant = 'default',
  className = '',
}: {
  variant?: 'default' | 'blue' | 'neutral';
  className?: string;
}): string {
  const baseStyle = componentStyles.card.base;
  let gradientStyle = '';

  if (variant === 'blue') {
    gradientStyle = componentStyles.card.gradient.blue;
  } else if (variant === 'neutral') {
    gradientStyle = componentStyles.card.gradient.neutral;
  }

  return cn(baseStyle, gradientStyle, className);
}

// Mobile styling is now handled by layout.ts

/**
 * Get animation styling with optional delay
 * @param delay Optional delay in ms (100, 200, 300, 400, 500)
 * @param className Additional classes to apply
 */
export function getAnimationStyle(
  delay?: 100 | 200 | 300 | 400 | 500,
  className = ''
): string {
  const baseStyle = componentStyles.animation.fadeIn;
  const delayStyle = delay ? componentStyles.animation.delays[delay] : '';

  return cn(baseStyle, delayStyle, className);
}
