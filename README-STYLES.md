# Stable Station Styling System

This document provides an overview of the styling system implemented in the Stable Station application.

## Overview

The styling system is designed to provide a consistent, maintainable, and flexible approach to styling components across the application. It uses a combination of:

1. **Tailwind CSS** for utility-based styling
2. **CSS Variables** for theming and design tokens
3. **Style Utilities** for consistent application of styles
4. **Component Variants** for reusable component styling

## Key Files

- `lib/styles/theme.ts` - Central theme configuration
- `lib/styles/style-utils.ts` - Style utility functions
- `docs/style-guide.md` - Documentation for the styling approach
- `docs/style-migration-guide.md` - Migration guide for updating components

## Style Utilities

The style utilities provide a consistent way to apply styles across the application:

```tsx
// Get region-specific styling
<div className={getRegionStyle('Europe', 'medium', 'bg')}>
  European content
</div>

// Get chain-specific styling
<div className={getChainStyle('OPTIMISM', 'light', 'bg')}>
  Optimism content
</div>

// Get sidebar menu button styling
<SidebarMenuButton
  className={getSidebarMenuButtonStyle({
    isActive: true,
    region: 'Africa',
  })}
>
  Button content
</SidebarMenuButton>

// Get card styling
<div className={getCardStyle({ variant: 'blue', className: 'p-4' })}>
  Card content
</div>

// Get mobile component styling
<div className={getMobileStyle('header', 'flex items-center')}>
  Mobile header content
</div>

// Get animation styling
<div className={getAnimationStyle(200)}>
  Animated content with 200ms delay
</div>
```

## Color System

The application uses a consistent color system based on regions and chains:

### Regions

- **USA**: Red
- **Europe**: Blue
- **Africa**: Green
- **LatAm**: Yellow
- **Asia**: Purple
- **RWA**: Amber

### Chains

- **BASE**: Blue
- **OPTIMISM**: Purple
- **CELO**: Yellow
- **POLYGON**: Indigo

## Responsive Design

The application uses a mobile-first approach with responsive breakpoints:

- **Mobile**: < 768px
- **Desktop**: >= 768px

The `useIsMobile()` hook is used for conditional rendering of mobile components.

## Best Practices

1. **Use Style Utilities**: Always use the style utilities for consistent styling
2. **Compose Classes with cn()**: Use the `cn()` utility for conditional class composition
3. **Follow the Style Guide**: Refer to the style guide for component-specific styling patterns
4. **Keep It DRY**: Don't repeat styling patterns, use the utilities
5. **Document Exceptions**: If you need to deviate from the patterns, document why

## Migration

When migrating existing components to the new styling system:

1. Import the necessary style utilities
2. Replace hardcoded color classes with utility functions
3. Replace conditional styling logic with utility functions
4. Replace complex class string concatenation with cn()
5. Test the component to ensure it looks the same as before

For detailed migration instructions, see `docs/style-migration-guide.md`.

## Further Reading

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [CSS Variables Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Class Variance Authority](https://cva.style/docs)
