# Monorepo Structure Recommendations

This document outlines recommendations for organizing the monorepo structure to better support the DiversiFi app and future applications.

## Current Structure

```
/
├── apps/
│   └── diversifi/         # MiniPay DiversiFi app
├── package.json           # Root package.json
└── pnpm-workspace.yaml    # Workspace config
```

## Recommended Structure

```
/
├── apps/
│   ├── diversifi/         # MiniPay DiversiFi app
│   └── web/               # Main web app (if needed)
├── packages/
│   ├── mento-utils/       # Shared Mento utilities (already exists)
│   ├── ui/                # Shared UI components
│   ├── config/            # Shared configs (TS, ESLint, etc.)
│   └── api/               # Shared API utilities
├── package.json           # Root package.json
└── pnpm-workspace.yaml    # Workspace config
```

## Implementation Steps

1. **Create Packages Directory**:
   ```bash
   mkdir -p packages/ui packages/config packages/api
   ```

2. **Extract Shared UI Components**:
   - Move common components like charts, buttons, and layouts to `packages/ui`
   - Create a package.json for the UI package
   - Export components with proper TypeScript types

3. **Extract Shared Configurations**:
   - Move TypeScript, ESLint, and other configs to `packages/config`
   - Create a package.json for the config package
   - Make configs extendable for different apps

4. **Extract Shared API Utilities**:
   - Move API services and utilities to `packages/api`
   - Create a package.json for the API package
   - Ensure proper error handling and caching

5. **Update Root Package.json**:
   - Add scripts to build all packages and apps
   - Add scripts to run tests for all packages and apps
   - Add scripts to lint all packages and apps

## Build Scripts

Add these scripts to the root package.json:

```json
{
  "scripts": {
    "build:all": "pnpm -r build",
    "build:packages": "pnpm --filter \"./packages/**\" build",
    "build:apps": "pnpm --filter \"./apps/**\" build",
    "dev:diversifi": "pnpm --filter diversifi dev",
    "build:diversifi": "pnpm --filter diversifi build",
    "start:diversifi": "pnpm --filter diversifi start",
    "test:all": "pnpm -r test",
    "lint:all": "pnpm -r lint"
  }
}
```

## Package Structure Example

Each package should follow this structure:

```
/packages/ui/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   └── ...
│   ├── hooks/
│   │   └── ...
│   ├── utils/
│   │   └── ...
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Benefits of This Structure

1. **Code Reusability**: Shared components and utilities can be used across multiple apps
2. **Consistency**: Shared configurations ensure consistent code style and quality
3. **Maintainability**: Smaller, focused packages are easier to maintain
4. **Scalability**: New apps can be added easily by leveraging existing packages
5. **Versioning**: Packages can be versioned independently
6. **Testing**: Packages can be tested independently
7. **Documentation**: Each package can have its own documentation

## Next Steps

1. Start by creating the basic package structure
2. Identify common components and utilities in the DiversiFi app
3. Extract these components and utilities to the appropriate packages
4. Update imports in the DiversiFi app to use the new packages
5. Add proper documentation for each package
6. Add tests for each package
