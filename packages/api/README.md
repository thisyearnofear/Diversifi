# @stable-station/api

This package contains shared API utilities for Stable Station applications.

## Usage

```tsx
import { fetchExchangeRates, fetchInflationData } from '@stable-station/api';

// Fetch exchange rates
const rates = await fetchExchangeRates();

// Fetch inflation data
const inflationData = await fetchInflationData('USA');
```

## Features

- API client for external services
- Type-safe API responses with Zod validation
- Error handling utilities
- Caching mechanisms
- Rate limiting protection

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run in watch mode during development
pnpm dev
```
