# Hello World Computer

## Description

Hello World Computer is a chat-based onboarding experience. Newcomers to Ethereum can claim starter packs, which entitle them to a small Ethdrop to cover gas fees, a choice of NFTs, an ERC20 token (FLAUNCHY or AERO) to get started with Defi, and a basename all of their own!

Chatting through natural language, enhanced with interactive components, this is an enriched an helpful way to get started with Ethereum!

Meanwhile, Ethereum OGs can buy starter packs which are made available to newcomers as gifts!

## How it's made

[hello-world-computer.vercel.app/](https://hello-world-computer.vercel.app/)

## Stack

We used:
- OpenAI LLM
- Vercel ai-sdk
- Agentkit for action orchestration
- Forked Vercel's AI Chatbot
- Onchainkit for web3 login & displaying some components
- Privy server wallets for agent onchain actions

We built:
- Custom web3 login for Vercel's AI chatbot - next-auth compatible, powered by SIWE (backend session auth)
- Leveraged the latest structured model outputs from the ai-sdk to provide interactive in-chat experiences
- AI-SDK <-> Agentkit tool wrapper
- Privy Wallet provider for Agentkit https://github.com/coinbase/agentkit/pull/242
- <Checkout/> component from onchainkit to support EOAs  https://github.com/coinbase/onchainkit/pull/1937
- Basename creation & transfer action provider
- Gnosis safe creation & transaction action provider
- Zora NFT minting provider
- Custom Alchemy token balances action provider
- Custom interactive components in-chat (options, asking for help, connecting wallet, checkout)
- Coinbase Checkout lifecycle & backend purchase verification
- Simple memory solution for the agent across user chats

## Development

Requirements:
- Node 22
- pnpm
- Postgres

```bash
pnpm install
```

Set up environment variables:

```bash
cp .env.example .env
# Edit the .env file with your own values
```

Run the development server:

```bash
pnpm drizzle-kit push
pnpm dev
```

