# Style Migration Guide

This guide outlines the process for migrating components to the new styling system.

## Migration Steps

### 1. Import Style Utilities

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

### 2. Replace Hardcoded Color Classes

#### Before:

```tsx
<div className="bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/30">
  <span className="text-blue-600 dark:text-blue-400">Content</span>
</div>
```

#### After:

```tsx
<div className={getChainStyle("BASE", "light", "bg")}>
  <span className={getChainStyle("BASE", "medium", "text")}>Content</span>
</div>
```

### 3. Replace Region-Specific Colors

#### Before:

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

#### After:

```tsx
<div className={getRegionStyle(token.region, "light", "bg")}>Content</div>
```

### 4. Replace Complex Component Styles

#### Before:

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

#### After:

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

### 5. Replace Mobile Component Styles

#### Before:

```tsx
<div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-2 flex items-center justify-between">
  {/* Content */}
</div>
```

#### After:

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

### 6. Replace Animation Classes

#### Before:

```tsx
<div className="animate-fade-in animation-delay-200">{/* Content */}</div>
```

#### After:

```tsx
<div className={getAnimationStyle(200)}>{/* Content */}</div>
```

### 7. Use Class Composition with cn()

#### Before:

```tsx
<div
  className={`base-class ${condition ? "active-class" : ""} ${
    anotherCondition ? "another-class" : ""
  }`}
>
  {/* Content */}
</div>
```

#### After:

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

## Migration Checklist

For each component:

1. [ ] Import necessary style utilities
2. [ ] Replace hardcoded color classes with utility functions
3. [ ] Replace conditional styling logic with utility functions
4. [ ] Replace complex class string concatenation with cn()
5. [ ] Test the component to ensure it looks the same as before
6. [ ] Document any component-specific styling decisions

## Migration Priority

1. High Priority:

   - Layout components (app/layout.tsx)
   - Sidebar components (left-sidebar.tsx, right-sidebar.tsx)
   - Mobile components (mobile-header.tsx, mobile-navigation.tsx)

2. Medium Priority:

   - UI components with complex styling
   - Components with region/chain-specific styling

3. Low Priority:
   - Simple components with minimal styling
   - Components that use shadcn/ui with minimal customization

## Testing

After migrating each component:

1. Test in both light and dark mode
2. Test on mobile and desktop viewports
3. Test with different regions selected
4. Test with different authentication states
