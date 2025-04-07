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

We use:

- OpenAI LLM
- Vercel ai-sdk
- Agentkit for action orchestration
- Forked Vercel's AI Chatbot
- Onchainkit for displaying web3 components
- Drizzle ORM for database management
- ConnectKit for wallet management
- Framer Motion for animations
- SIWE (Sign-In With Ethereum) for authentication

## Deployment

### Netlify Deployment

To deploy this project on Netlify:

1. Connect your GitHub repository to Netlify
2. Set the build command to `pnpm install --no-frozen-lockfile && pnpm build`
3. Set the publish directory to `.next`
4. Add the following environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `POSTGRES_URL`: Your PostgreSQL connection string (if using database features)
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: Your WalletConnect project ID
   - Other environment variables as needed

The build process is configured to skip database migrations during the Netlify build process to avoid connection issues. Instead, you should run migrations manually after deployment using one of these methods:

1. **Run migrations locally against your production database:**

   ```bash
   POSTGRES_URL=your_production_db_url pnpm db:migrate
   ```

2. **Set up a separate CI/CD step or scheduled task to run migrations**

This approach ensures your database schema stays up-to-date without causing build failures.

We've built:

- Custom web3 login for Vercel's AI chatbot - next-auth compatible, powered by SIWE (backend session auth)
- Interactive in-chat experiences using structured model outputs from the ai-sdk
- AI-SDK <-> Agentkit tool wrapper
- ConnectKit wallet provider for Agentkit
- Custom interactive components in-chat (options, asking for help, connecting wallet, action cards)
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

## Clean-Up and Refocusing Plan

After encountering several challenges with the current implementation, we've decided to clean up the codebase and refocus our efforts on a more streamlined approach. Here's our plan:

### Phase 1: Clean-Up (1-2 days)

1. **Fix Critical Issues**

   - Resolve the Zod schema error in the AI tools
   - Fix the chat functionality to ensure it works reliably
   - Address navigation issues with the sidebar buttons

2. **Remove Unnecessary Complexity**

   - Remove unused or problematic components
   - Simplify the action integration approach
   - Focus on a minimal viable implementation

3. **Consolidate Wallet Integration**
   - Standardize on ConnectKit for client-side wallet operations
   - Document server-side limitations and workarounds

### Phase 2: Core Implementation (1-2 weeks)

1. **Chat-Based Action System**

   - Implement a reliable way for the AI to suggest actions
   - Create compact action cards that work within the chat
   - Ensure actions can be completed without leaving the chat

2. **Action Completion Flow**

   - Implement a simple action completion tracking system
   - Add basic reward distribution
   - Provide clear feedback for completed actions

3. **Mobile-Friendly Design**
   - Optimize the UI for mobile devices
   - Ensure the chat and action cards work well on small screens

### Phase 3: Enhancement (2-4 weeks)

1. **Expand Action Library**

   - Add more actions for each blockchain
   - Create guided learning paths
   - Implement progressive difficulty levels

2. **User Progress Tracking**

   - Create a user dashboard
   - Implement achievement badges
   - Add leaderboards and social features

3. **Advanced Features**
   - Implement more interactive tutorials
   - Add advanced action types
   - Integrate with more protocols

## Next Steps

1. Begin Phase 1 clean-up
2. Fix the chat functionality
3. Implement a simplified action card system
4. Test the core user flow

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
