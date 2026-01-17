# Stable Station

## Description

Stable Station is a chat-based Web3 onboarding platform where users learn through hands-on actions like portfolio management, rebalancing, and stablecoin procurement, powered by AI assistance.

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Initialize database
pnpm drizzle-kit push
pnpm db:seed

# Start development
pnpm dev
```

## Key Features

- **Action-Based Learning**: Complete real Web3 actions to unlock features
- **Multi-Chain Support**: Base, Celo, Ethereum, Polygon, Optimism
- **AI-Powered Assistance**: Built with OpenAI LLM and Agentkit
- **Wallet Integration**: ConnectKit and SIWE authentication
- **In-App Swaps**: Custom contracts for seamless token exchanges
- **Progress Tracking**: Action completion and reward system

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **AI**: OpenAI LLM, Vercel AI SDK, Agentkit
- **Blockchain**: Viem/Wagmi, ConnectKit, OnchainKit
- **Database**: PostgreSQL with Drizzle ORM
- **Smart Contracts**: Custom swap contracts on Base, Optimism, Celo, Polygon
- **APIs**: CoinGecko (pricing), Brian API (Polygon swaps)

## Documentation

- [Architecture Guide](docs/ARCHITECTURE.md) - Core architecture and patterns
- [Style Guide](docs/STYLE-GUIDE.md) - Styling conventions
- [Wallet Authentication](docs/wallet-authentication.md) - SIWE flow
- [Full Documentation](docs/) - Complete technical documentation

## Deployment

### Environment Variables

```bash
OPENAI_API_KEY=your_openai_key
POSTGRES_URL=your_database_url
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
BRIAN_API_KEY=your_brian_api_key
```

### Netlify Deployment

1. Connect GitHub repo to Netlify
2. Build command: `pnpm install --no-frozen-lockfile && pnpm build`
3. Publish directory: `.next`
4. Run migrations manually after deployment

## Monorepo Structure

```
/
├── apps/
│   ├── diversifi/    # MiniPay DiversiFi app (hackathon submission)
│   └── web/          # Main web app
├── packages/
│   ├── mento-utils/  # Shared Mento utilities
│   ├── ui/           # Shared UI components
│   └── config/       # Shared configurations
```

## Development Commands

```bash
pnpm dev              # Start main app
pnpm dev:diversifi    # Start DiversiFi app
pnpm build:all        # Build everything
pnpm lint:all         # Lint all workspaces
```

## DiversiFi MiniPay App

Live demo: [stable-station.netlify.app/diversifi](https://stable-station.netlify.app/diversifi)

Features:
- Inflation protection dashboard
- Portfolio visualization by region
- Mento stablecoin swapping
- MiniPay-optimized mobile experience

## Deployed Contracts

- **BaseAerodromeSwap**: `0xc5dcc68069add8a7055234f23ec40a1d469693f8`
- **OptimismVelodromeSwap**: `0xD4fE775b3221769D8AC2cd52D5b1Cb50fB4B91A2`
- **SimpleCeloSwap**: `0xa27D6E9091778896FBf34bC36A3A2ef22d06F804`

## Requirements

- Node 22
- pnpm
- PostgreSQL

Built with ❤️ for the Web3 ecosystem.