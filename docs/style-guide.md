# Stable Station Style Guide

This document outlines the styling approach and patterns used in the Stable Station application, including migration guidelines for the new styling system.

## Core Principles

1. **Consistency**: Use the centralized theme and style utilities for consistent styling across components
2. **Maintainability**: Keep styling logic separate from component logic where possible
3. **Responsiveness**: Use Tailwind's responsive prefixes and the useIsMobile hook for responsive design
4. **Performance**: Minimize style recalculations and reflows by using consistent patterns

## Styling Architecture

### 1. Theme Configuration

All design tokens and color schemes are defined in `lib/styles/theme.ts`:

- Region colors (USA, Europe, Africa, LatAm, Asia, RWA)
- Chain colors (BASE, OPTIMISM, CELO, POLYGON)
- Component styles (cards, sidebars, buttons)
- Layout constants (sidebar widths, breakpoints)

### 2. Style Utilities

Style utility functions in `lib/styles/style-utils.ts` provide consistent styling:

- `getRegionStyle()` - Get region-specific styling
- `getChainStyle()` - Get chain-specific styling
- `getSidebarMenuButtonStyle()` - Get sidebar menu button styling
- `getCardStyle()` - Get card styling with appropriate gradient
- `getAnimationStyle()` - Get animation styling with optional delay

Mobile-specific styling utilities are available in `lib/styles/mobile.ts` and `lib/styles/layout.ts`:

- `getMobileHeaderContainer()` - Get mobile header container styling
- `getMobileNavContainer()` - Get mobile navigation container styling
- `getMainLayoutGrid()` - Get main layout grid styling
- `getMainContentContainer()` - Get main content container styling
- `getMainContent()` - Get main content area styling

### 3. Class Composition

Use the `cn()` utility from `lib/utils.ts` to compose class names conditionally:

```tsx
import { cn } from "@/lib/utils";

<div
  className={cn(
    "base-class",
    condition && "conditional-class",
    anotherCondition ? "true-class" : "false-class"
  )}
/>;
```

## Component Styling Patterns

### UI Components

UI components should use the class variance authority (cva) pattern for consistent styling with variants:

```tsx
const buttonVariants = cva("base-classes-here", {
  variants: {
    variant: {
      default: "default-variant-classes",
      secondary: "secondary-variant-classes",
    },
    size: {
      default: "default-size-classes",
      sm: "small-size-classes",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});
```

### Layout Components

Layout components should use CSS Grid and Flexbox with responsive prefixes:

```tsx
<div className="grid grid-cols-[auto,1fr,auto] md:grid-cols-[240px,1fr,240px]">
  <Sidebar />
  <main className="flex flex-col">{children}</main>
  <RightSidebar />
</div>
```

### Mobile Components

Mobile components should:

1. Use the `useIsMobile()` hook for conditional rendering
2. Use the mobile styling utilities from `lib/styles/mobile.ts` for consistent styling
3. Return `null` when not on mobile

```tsx
const isMobile = useIsMobile();
if (!isMobile) return null;

return (
  <div
    className={cn(
      getMobileHeaderContainer(),
      "flex items-center justify-between"
    )}
  >
    {/* Mobile header content */}
  </div>
);
```

## Color System

### Region Colors

Use the `getRegionStyle()` utility to apply region-specific colors:

```tsx
<div className={getRegionStyle("Europe", "medium", "bg")}>European content</div>
```

### Chain Colors

Use the `getChainStyle()` utility to apply chain-specific colors:

```tsx
<div className={getChainStyle("OPTIMISM", "light", "bg")}>Optimism content</div>
```

## Responsive Design

### Breakpoints

The application uses the following breakpoints:

- Mobile: < 768px
- Desktop: >= 768px

### Responsive Patterns

1. **Conditional Rendering**: Use the `useIsMobile()` hook
2. **Responsive Classes**: Use Tailwind's responsive prefixes (md:, lg:)
3. **Mobile-First**: Design for mobile first, then enhance for desktop

## Dark Mode

The application supports dark mode using CSS variables and Tailwind's dark mode:

```tsx
<div className="bg-white dark:bg-gray-900">Dark mode compatible content</div>
```

## Animation

Use the `getAnimationStyle()` utility for consistent animations:

```tsx
<div className={getAnimationStyle(200)}>Animated content with 200ms delay</div>
```

## Best Practices

1. **Avoid Inline Styles**: Use Tailwind classes or style utilities
2. **Minimize Style Props**: Avoid passing many style props to components
3. **Use Semantic HTML**: Use the appropriate HTML elements for accessibility
4. **Keep It DRY**: Don't repeat the same style patterns, use utilities
5. **Document Exceptions**: If you need to deviate from these patterns, document why

---

## Style Migration Guide

This section outlines the process for migrating components to the new styling system.

### Migration Steps

#### 1. Import Style Utilities

Add the necessary imports to your component:

```tsx
import {
  getRegionStyle,
  getChainStyle,
  getSidebarMenuButtonStyle,
  getCardStyle,
  getAnimationStyle,
} from "@/lib/styles/style-utils";
import {
  getMobileHeaderContainer,
  getMobileNavContainer,
} from "@/lib/styles/mobile";
import { cn } from "@/lib/utils";
```

#### 2. Replace Hardcoded Color Classes

**Before:**

```tsx
<div className="bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/30">
  <span className="text-blue-600 dark:text-blue-400">Content</span>
</div>
```

**After:**

```tsx
<div className={getChainStyle("BASE", "light", "bg")}>
  <span className={getChainStyle("BASE", "medium", "text")}>Content</span>
</div>
```

#### 3. Replace Region-Specific Colors

**Before:**

```tsx
// Determine a muted color based on the region
let bgColor = "bg-gray-50 dark:bg-gray-800/20";
if (token.region === "Europe") {
  bgColor = "bg-blue-50/30 dark:bg-blue-950/10";
} else if (token.region === "Africa") {
  bgColor = "bg-green-50/30 dark:bg-green-950/10";
}
// ...

<div className={bgColor}>Content</div>;
```

**After:**

```tsx
<div className={getRegionStyle(token.region, "light", "bg")}>Content</div>
```

#### 4. Replace Complex Component Styles

**Before:**

```tsx
<SidebarMenuButton
  disabled
  className={`${bgColor} ${textColor} cursor-not-allowed opacity-70`}
  tooltip={`${token.name} - Coming Soon`}
>
  <Clock className="text-gray-400 dark:text-gray-500" />
  Get {token.symbol}
</SidebarMenuButton>
```

**After:**

```tsx
<SidebarMenuButton
  disabled
  className={getSidebarMenuButtonStyle({
    isDisabled: true,
    region: token.region,
  })}
  tooltip={`${token.name} - Coming Soon`}
>
  <Clock className="text-gray-400 dark:text-gray-500" />
  Get {token.symbol}
</SidebarMenuButton>
```

#### 5. Replace Mobile Component Styles

**Before:**

```tsx
<div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-2 flex items-center justify-between">
  {/* Content */}
</div>
```

**After:**

```tsx
<div
  className={cn(
    getMobileHeaderContainer(),
    "flex items-center justify-between"
  )}
>
  {/* Content */}
</div>
```

#### 6. Replace Animation Classes

**Before:**

```tsx
<div className="animate-fade-in animation-delay-200">{/* Content */}</div>
```

**After:**

```tsx
<div className={getAnimationStyle(200)}>{/* Content */}</div>
```

#### 7. Use Class Composition with cn()

**Before:**

```tsx
<div
  className={`base-class ${condition ? "active-class" : ""} ${
    anotherCondition ? "another-class" : ""
  }`}
>
  {/* Content */}
</div>
```

**After:**

```tsx
<div
  className={cn(
    "base-class",
    condition && "active-class",
    anotherCondition && "another-class"
  )}
>
  {/* Content */}
</div>
```

### Migration Checklist

For each component:

1. [ ] Import necessary style utilities
2. [ ] Replace hardcoded color classes with utility functions
3. [ ] Replace conditional styling logic with utility functions
4. [ ] Replace complex class string concatenation with cn()
5. [ ] Test the component to ensure it looks the same as before
6. [ ] Document any component-specific styling decisions

### Migration Priority

1. **High Priority**:
   - Layout components (app/layout.tsx)
   - Sidebar components (left-sidebar.tsx, right-sidebar.tsx)
   - Mobile components (mobile-header.tsx, mobile-navigation.tsx)

2. **Medium Priority**:
   - UI components with complex styling
   - Components with region/chain-specific styling

3. **Low Priority**:
   - Simple components with minimal styling
   - Components that use shadcn/ui with minimal customization

### Testing

After migrating each component:

1. Test in both light and dark mode
2. Test on mobile and desktop viewports
3. Test with different regions selected
4. Test with different authentication states
