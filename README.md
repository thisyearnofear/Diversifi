# Hello World Computer

## Description

Hello World Computer is a chat-based onboarding experience for Web3. We've evolved from a kit-based model to an action-based learning platform where users can:

- Complete specific actions on different chains (Base, Celo, Ethereum)
- Earn rewards for completing actions
- Track their progress across different categories
- Learn through hands-on experience

## Categories

1. **Based Actions**

   - Explore the Base ecosystem
   - Social actions (Farcaster)
   - DeFi activities
   - NFT interactions

2. **Stable Actions**

   - Build on Celo's stable ecosystem
   - NFT creation and minting
   - DeFi trading
   - Stablecoin interactions

3. **Global Actions**
   - Connect with Ethereum's global network
   - Smart contract deployment
   - DAO participation
   - Advanced DeFi activities

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
- Drizzle ORM for database management
- ConnectKit for wallet management
- Framer Motion for animations

We built:

- Custom web3 login for Vercel's AI chatbot - next-auth compatible, powered by SIWE (backend session auth)
- Leveraged the latest structured model outputs from the ai-sdk to provide interactive in-chat experiences
- AI-SDK <-> Agentkit tool wrapper
- Privy Wallet provider for Agentkit https://github.com/coinbase/agentkit/pull/242
- <Checkout/> component from onchainkit to support EOAs https://github.com/coinbase/onchainkit/pull/1937
- Basename creation & transfer action provider
- Gnosis safe creation & transaction action provider
- Zora NFT minting provider
- Custom Alchemy token balances action provider
- Custom interactive components in-chat (options, asking for help, connecting wallet, checkout)
- Coinbase Checkout lifecycle & backend purchase verification
- Simple memory solution for the agent across user chats
- Action-based learning system with rewards
- Multi-chain support (Base, Celo, Ethereum)

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
# Set up the database
pnpm drizzle-kit push

# Seed the database with actions
pnpm db:seed

# Start the development server
pnpm dev
```

## Current Progress

1. ✅ Database schema setup with Drizzle ORM
2. ✅ Action seeding system
3. ✅ Multi-chain wallet integration
4. ✅ Action sidebar UI
5. ✅ Category-based navigation
6. ✅ Basic action display

## Next Steps

1. Implement action completion tracking
2. Add reward distribution system
3. Create user progress dashboard
4. Integrate with more protocols on each chain
5. Add social features for sharing achievements
6. Implement leaderboards and achievements
7. Add more interactive tutorials
8. Create a mobile-responsive design

## SnelDAO Enhancement Plan 🐌

### Overview

SnelDAO is a data-driven learning optimization system focused on Ethereum education, particularly stablecoins. It enhances the existing Hello World Computer platform by tracking anonymized user journeys and optimizing learning paths.

### Core Components

1. **Data Collection & Privacy**

   - Anonymized user journey tracking
   - Learning path optimization
   - Success metrics monitoring
   - Privacy-preserving data storage on Filecoin

2. **Learning Path System**

   - Personalized learning paths
   - Progress tracking
   - Success metrics
   - Content optimization

3. **Filecoin Integration**

   - Decentralized storage for:
     - Learning materials
     - User journey data
     - Feedback datasets
     - Research data

4. **DAO Governance**
   - Content validation
   - Path optimization
   - Metric definition
   - Community-driven improvements

### Technical Implementation

```typescript
// Core data structures
interface SnelDAOData {
  journeyId: string;
  timestamp: number;
  learningPath: {
    initialInterests: string[];
    selectedPath: string;
    completedModules: string[];
    timeSpent: number;
  };
  onchainActivity: {
    firstTransaction: {
      type: "stablecoin" | "nft" | "defi";
      protocol?: string;
      timestamp: number;
    };
    subsequentActions: {
      type: string;
      protocol: string;
      timestamp: number;
      success: boolean;
    }[];
  };
  feedback: {
    moduleRatings: {
      moduleId: string;
      rating: number;
      comments: string;
    }[];
    difficulty: number;
    engagement: number;
  };
}

interface LearningPath {
  id: string;
  name: string;
  focus: "stablecoins" | "defi" | "nfts" | "general";
  modules: {
    id: string;
    title: string;
    content: {
      text: string;
      filecoinCid: string;
      type: "text" | "video" | "interactive";
    };
    prerequisites: string[];
    successMetrics: {
      onchainAction: string;
      protocol: string;
      minimumValue?: number;
    };
  }[];
  successRate: number;
  averageCompletionTime: number;
  userRetention: number;
}
```

### Success Metrics

- User progression tracking
- Onchain activity monitoring
- Engagement measurement
- Completion rates
- Long-term retention

### Privacy Features

- Zero-knowledge proofs
- Differential privacy
- Anonymized data storage
- Secure data sharing

### Token Economics (SNEL)

- Governance token
- Reward distribution
- Contribution incentives
- Research funding

## Next Steps

1. Set up local development environment
2. Implement Filecoin integration
3. Create data collection system
4. Develop personalization engine
5. Establish DAO governance structure
