# Configuration Files

This directory contains configuration files for various tools and libraries used in the project.

- `biome.jsonc` - Configuration for Biome linter and formatter
- `components.json` - Configuration for UI components
- `postcss.config.mjs` - Configuration for PostCSS
- `tailwind.config.ts` - Configuration for Tailwind CSS
- `.eslintrc.json` - Configuration for ESLint
- `drizzle.config.ts` - Configuration for Drizzle ORM

These files are referenced from the root directory through symlinks or direct imports in the build process. The original files remain in the root directory to ensure compatibility with tools that expect them there.
