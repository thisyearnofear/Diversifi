# @stable-station/config

This package contains shared configuration files for Stable Station applications.

## Usage

### TypeScript

```json
{
  "extends": "@stable-station/config/typescript/nextjs.json"
}
```

### ESLint

```js
module.exports = {
  extends: ["@stable-station/config/eslint-preset"]
};
```

### Tailwind CSS

```js
module.exports = {
  presets: [require("@stable-station/config/tailwind")]
};
```

## Configurations

The package includes the following configurations:

- TypeScript configurations for different project types
- ESLint configurations
- Tailwind CSS configurations
- Prettier configurations
