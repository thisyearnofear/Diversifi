# Stable Station

## Description

Stable Station is a chat-based onboarding experience for Web3. We've evolved from a kit-based model to an action-based learning platform where users can:

- Complete specific actions
- Unlock features aligned with portfolio management, rebalancing, diversification & stablecoin procurement
- Track progress across different categories
- Learn through hands-on experience & ai assistance powered by agentkit

## How it's made

[stable-station.netlify.app/](https://stable-station.netlify.app/)

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
- CoinGecko API for real-time token pricing
- Custom smart contracts for in-app swaps

## Deployment

### Netlify Deployment

To deploy this project on Netlify:

1. Connect your GitHub repository to Netlify
2. Set the build command to `pnpm install --no-frozen-lockfile && pnpm build`
3. Set the publish directory to `.next`
4. Add the following environment variables:

Note: If you're adding dependencies during the build process, make sure to use the `-w` flag with pnpm to add them to the workspace root. For example: `pnpm add -D -w package-name`

- `OPENAI_API_KEY`: Your OpenAI API key
- `POSTGRES_URL`: Your PostgreSQL connection string (if using database features)
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: Your WalletConnect project ID
- `BRIAN_API_KEY`: Your Brian API key for Polygon DAI swaps
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
- Multi-chain support (Base, Celo, Ethereum, Polygon, Optimism)

## Design Philosophy

### Desktop Experience

- The desktop layout is intentionally left untouched for maximum stability and familiarity.
- All desktop grid, sidebar, and main content classes remain as originally designed.

### Mobile & Small Screen Improvements

- Mobile enhancements are implemented using Tailwind's responsive utilities (e.g., `md:`, `sm:`, `block md:hidden`).
- Mobile-specific UI (navigation bars, overlays, alternate tab navigation, etc.) is added without affecting desktop.
- Conditional rendering is used for mobile-only components as needed.

#### Current/Future Mobile Improvements

- Bottom navigation bar (mobile only)
- Mobile-friendly tab navigation
- Profile/dashboard mobile layout

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

### Monorepo Structure

The project is organized as a monorepo using pnpm workspaces:

```
/
├── apps/
│   ├── diversifi/         # MiniPay DiversiFi app
│   └── web/               # Main web app (if needed)
├── packages/
│   ├── mento-utils/       # Shared Mento utilities
│   ├── ui/                # Shared UI components
│   ├── config/            # Shared configs (TS, ESLint, etc.)
│   └── api/               # Shared API utilities
├── package.json           # Root package.json
└── pnpm-workspace.yaml    # Workspace config
```

#### Working with the Monorepo

```bash
# Install dependencies for all workspaces
pnpm install

# Run development server for the main app
pnpm dev

# Run development server for the DiversiFi app
pnpm dev:diversifi

# Run development server for all packages
pnpm dev:packages

# Build all workspaces
pnpm build:all

# Build only packages
pnpm build:packages

# Build only apps
pnpm build:apps

# Build only the DiversiFi app
pnpm build:diversifi

# Lint all workspaces
pnpm lint:all
```

### Neynar MCP Setup

To set up the Neynar MCP (Mintlify Command Palette) for enhanced documentation search:

1. Install the Neynar MCP:

```bash
npx @mintlify/mcp@latest add neynar
```

2. Start the MCP server:

```bash
node /Users/udingethe/.mcp/neynar/src/index.js
```

The MCP server will run in the background and enable Neynar documentation search functionality directly from Cursor.

## Current Progress

1. ✅ Database schema setup with Drizzle ORM
2. ✅ Action seeding system
3. ✅ Multi-chain wallet integration
4. ✅ Action sidebar UI
5. ✅ Category-based navigation
6. ✅ Basic action display
7. ✅ In-app token swaps with BaseAerodromeSwap contract
8. ✅ Real-time token pricing with CoinGecko API
9. ✅ Polygon DAI swap integration with Brian API
10. ✅ Consistent UI/UX for all stablecoin actions
11. ✅ Regional token selector implementation
12. ✅ cKES stablecoin integration on Celo

## Regional Token Selector Implementation

### Current Implementation

We've implemented a regional token selector in the right sidebar that filters the stablecoin options displayed in the left sidebar. This feature helps users discover stablecoins relevant to their region of interest.

### DiversiFi Feature

We've also added a simplified DiversiFi teaser in the right sidebar that shows users their geographical portfolio diversification. This serves as a preview of the full DiversiFi feature that will be developed as a separate mini-app.

### Future DiversiFi Mini-App Plans

The full DiversiFi feature will include:

1. **Advanced Visualization Options**

   - World map visualization with highlighted regions based on user holdings
   - Circular visualization showing portfolio distribution
   - Geographical heatmap showing concentration of holdings
   - 3D globe representation of geographical exposure

2. **Comprehensive Diversification Metrics**

   - Herfindahl-Hirschman Index (HHI) for measuring concentration
   - Shannon Entropy for measuring information diversity
   - Geographic Spread Ratio for measuring regional allocation
   - Custom diversification scores & insight/analytics

3. **Portfolio Rebalancing Insights**

   - Recommendations for improving geographical diversification
   - Suggested trades to achieve optimal diversification
   - Risk analysis based on geographical exposure
   - Historical performance analysis by region

4. **Interactive User Experience**
   - Ability to simulate portfolio changes and see impact on diversification
   - Customizable visualization options
   - Detailed token information and regional context
   - Educational content about the benefits of geographical diversification

### MiniPay Integration Plan for DiversiFi

We're participating in the Global Stablecoin Hackathon focused on MiniPay and Mento local stablecoins. Our plan is to adapt DiversiFi for MiniPay with a focus on the "Inflation Protection and Swapping" track.

#### Architecture Plan

1. **Project Structure**

   ```
   /
   ├── apps/
   │   ├── diversifi/           # New MiniPay-focused DiversiFi app
   │   │   ├── components/      # UI components specific to DiversiFi
   │   │   ├── hooks/           # Hooks for DiversiFi functionality
   │   │   ├── pages/           # Next.js pages for DiversiFi
   │   │   └── ...              # Other necessary files
   │   │
   │   └── main/                # Your existing main app (optional reorganization)
   │
   ├── packages/                # Shared packages
   │   ├── mento-utils/         # Your existing Mento utilities as a shared package
   │   ├── ui/                  # Shared UI components
   │   └── config/              # Shared configuration
   ```

2. **Environment Detection**

   - Automatically detect when the app is running in MiniPay
   - Render appropriate UI based on environment
   - Support URL-based routing for direct access

3. **Core Features for MiniPay**
   - Simple, mobile-optimized UI
   - Portfolio visualization (pie chart, world map, grid view)
   - Stablecoin swapping with Mento
   - Inflation protection education
   - Diversification metrics

#### Implementation Phases

1. **Phase 1: Project Setup (2-3 days)**

   - Create project structure
   - Extract shared code
   - Set up environment detection

2. **Phase 2: Core Implementation (5-7 days)**

   - Implement mobile-first UI
   - Create visualization components
   - Integrate stablecoin data and swapping

3. **Phase 3: MiniPay Integration (3-5 days)**

   - Implement MiniPay wallet detection
   - Add fee currency support
   - Test with MiniPay using ngrok

4. **Phase 4: Finalization (2-3 days)**
   - Create documentation
   - Record demo video
   - Deploy to production

#### MiniPay-Specific Considerations

- Mobile-responsive design is critical
- Use viem/wagmi for wallet integration
- Hide wallet connect button when in MiniPay
- Support fee currency for transactions
- Optimize for small screens and touch interfaces

### Implementation Plan

1. **Create Region Context**

   - Implement a React context to manage the selected region state
   - Define region types (Africa, Europe, USA, LatAm, Asia, RWA)
   - Provide a hook for components to access and update the selected region

2. **Define Token Data Structure**

   - Organize tokens by geographical regions
   - Include metadata like symbol, name, chain, and action prompts
   - Create helper functions to filter tokens by region

3. **Update Right Sidebar**

   - Replace social links section with region selector
   - Design intuitive UI for region selection
   - Implement visual indicators for the active region

4. **Update Left Sidebar**

   - Filter displayed tokens based on selected region
   - Maintain core navigation elements
   - Add visual indicators for available vs. coming soon tokens

5. **Optimize Performance**
   - Ensure efficient rendering when switching regions
   - Implement proper memoization for filtered token lists
   - Maintain responsive design across all screen sizes

### Token Categories by Region

- **Africa**: cKES, ZAR, NGN, cGHS, eXOF
- **Europe**: EURA, EURC, CEUR, EURt
- **USA**: USDC, USDT, cUSD, USDbC, DAI
- **LatAm**: cREAL, cCOP, MXNT, BRZ
- **Asia**: PUSO, IDRT, XSGD, JPYC
- **RWA**: XAUT, PAXG, $KAU, $KAG

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

## Deployed Contracts

### BaseAerodromeSwap

We've deployed a custom smart contract on Base to facilitate in-app token swaps:

- **Contract Address**: `0xc5dcc68069add8a7055234f23ec40a1d469693f8`
- **Network**: Base Mainnet
- **Features**:
  - Direct ETH to USDbC swaps
  - ERC20 token to USDbC swaps
  - Optimized gas usage
  - Transaction fee mechanism (0.25% default)
  - Security features (reentrancy protection, ownership controls)

The contract provides a simplified interface for swapping tokens directly within our application, eliminating the need to redirect users to external DEXs. It leverages Aerodrome's liquidity pools on Base for efficient swaps.

### OptimismVelodromeSwap

We've deployed a custom smart contract on Optimism to facilitate in-app token swaps for EURA:

- **Contract Address**: `0xD4fE775b3221769D8AC2cd52D5b1Cb50fB4B91A2`
- **Network**: Optimism Mainnet
- **Features**:
  - Direct ETH to EURA swaps
  - ERC20 token to EURA swaps
  - Support for both Velodrome V1 and V2 factories
  - Optimized gas usage
  - Transaction fee mechanism (0.25% default)
  - Security features (reentrancy protection, ownership controls)

The contract provides a simplified interface for swapping tokens directly within our application, eliminating the need to redirect users to external DEXs. It leverages Velodrome's liquidity pools on Optimism for efficient swaps. EURA (formerly agEUR) is an all-weather, multi-audited Euro stablecoin developed by Angle Protocol.

### SimpleCeloSwap

We've deployed a simplified smart contract on Celo to facilitate in-app token swaps for cUSD:

- **Contract Address**: `0xa27D6E9091778896FBf34bC36A3A2ef22d06F804`
- **Network**: Celo Mainnet
- **Features**:
  - Direct CELO to cUSD swaps
  - Simplified interface with minimal parameters
  - Optimized for reliability
  - Transaction fee mechanism (0.25% default)
  - Security features (reentrancy protection, ownership controls)

The contract provides a straightforward interface for swapping CELO tokens to cUSD directly within our application. It leverages Uniswap V3's liquidity pools on Celo for efficient swaps. The contract is designed to be simple and reliable, with a focus on user experience.

### Polygon DAI Integration

We've integrated the Brian API to facilitate in-app token swaps for DAI on Polygon:

- **Network**: Polygon Mainnet
- **Features**:
  - Direct MATIC to DAI swaps
  - Transaction preparation via Brian API
  - User-friendly confirmation flow
  - Detailed transaction information
  - Wallet-based transaction execution

The integration provides a seamless experience for swapping MATIC tokens to DAI directly within our application. It leverages the Brian API to prepare transactions and the user's wallet to execute them, ensuring a secure and transparent process.

### Celo cKES Integration

We've implemented direct cUSD to cKES swaps on Celo using the Mento protocol:

- **Network**: Celo Mainnet
- **Features**:
  - Direct cUSD to cKES swaps
  - Mento protocol integration
  - Manual gas limit fallback for reliable transactions
  - User-friendly approval and confirmation flow
  - Detailed transaction information

The implementation provides a seamless experience for acquiring Kenyan Shilling stablecoins (cKES) directly within our application. It uses the Mento protocol's broker contracts to find the best exchange path and execute swaps efficiently. The integration includes robust error handling and fallback mechanisms to ensure reliable transactions even when automatic gas estimation fails.

## SnelDAO Idea 🐌

### Overview

SnelDAO is a data-driven learning optimization system focused on Ethereum education, particularly stablecoins. It enhances the existing Stable Station platform by tracking anonymized user journeys and optimizing learning paths.

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

## Celo Stablecoin Implementation

We've implemented a robust system for Celo stablecoins using the Mento Protocol. Our implementation includes:

1. **Centralized Utilities**

   - Shared functionality in `utils/mento-utils.ts`
   - Consistent token addresses and ABIs
   - Caching system for exchange rates
   - Fallback values for reliability

2. **Direct Protocol Integration**

   - Direct integration with Mento Protocol
   - No dependency on external price APIs
   - More accurate exchange rates
   - Reduced API calls and rate limiting issues

3. **Supported Stablecoins**

   - cUSD (US Dollar)
   - cKES (Kenyan Shilling)
   - cCOP (Colombian Peso)
   - PUSO (Philippine Peso)

4. **Implementation Pattern**
   - Two-step process: registration and swap
   - Consistent UI across all Celo stablecoins
   - Proper error handling and user feedback
   - Network switching support

## New Token Integration Checklist

When adding a new stablecoin to Stable Station, follow this checklist to ensure all components are properly updated:

### 1. Research & Preparation

- [ ] **Token Information**

  - [ ] Gather token details (name, symbol, contract address, decimals)
  - [ ] Identify the blockchain network (Celo, Base, Polygon, etc.)
  - [ ] Determine the geographical region for the token
  - [ ] Research current exchange rates and price sources
  - [ ] Identify the swap protocol to use (Mento, Uniswap, etc.)

- [ ] **Contract Verification**

  - [ ] Verify the token contract on the blockchain explorer
  - [ ] Check token liquidity and trading volume
  - [ ] Test small transactions if possible
  - [ ] Identify any special requirements or limitations

### 2. Backend Implementation

- [ ] **Create Swap Hook**

  - [ ] Create a new hook file (e.g., `hooks/use-[chain]-[token].ts`)
  - [ ] Add token contract address and ABI to constants
  - [ ] Implement token approval functionality
  - [ ] Implement swap functionality using appropriate protocol
  - [ ] Add proper error handling with user-friendly messages
  - [ ] Implement network switching support
  - [ ] Add transaction tracking and confirmation
  - [ ] Implement exchange rate calculation with fallbacks

- [ ] **Database Integration**

  - [ ] Create a migration file to add the new token action
  - [ ] Include proper rewards with type field (e.g., 'POINTS')
  - [ ] Update schema if needed (e.g., add new enum values)
  - [ ] Test migration on development database
  - [ ] Verify action appears correctly in database

- [ ] **API Routes**

  - [ ] Create API route for the token action (`app/api/actions/[chain]/[token]/route.ts`)
  - [ ] Create API route for completing the token action (`app/api/actions/[chain]/[token]/complete/route.ts`)
  - [ ] Implement proper error handling and authentication
  - [ ] Update action completion handler to recognize the new token

### 3. Frontend Implementation

- [ ] **UI Components**

  - [ ] Create swap card component (`components/chat/[chain]-[token]-swap-card-compact.tsx`)
  - [ ] Create action message component (`components/chat/[chain]-[token]-action-message.tsx`)
  - [ ] Create action handler component (`components/chat/[chain]-[token]-action-handler.tsx`)
  - [ ] Include registration step if required
  - [ ] Add appropriate branding and token information
  - [ ] Ensure consistent UI with other token components

- [ ] **Update Token Data**

  - [ ] Add token to `lib/tokens/token-data.ts` with appropriate region
  - [ ] Add token to price hook in `hooks/use-token-price.ts`
  - [ ] Set appropriate fallback price for the token
  - [ ] Set `available: true` for the new token

- [ ] **Update Sidebar Components**

  - [ ] Ensure token appears in left sidebar when its region is selected
  - [ ] Add token to right sidebar's DiversiFi section under the appropriate region
  - [ ] Update wallet assets in right sidebar to include the new token

### 4. AI Integration

- [ ] **Update AI Prompts**

  - [ ] Add token action to `lib/ai/prompts/constants/user-actions.ts`
  - [ ] Add token description to `lib/ai/prompts/constants/regular.ts`
  - [ ] Update action numbering in both files
  - [ ] Add appropriate example arguments and descriptions

- [ ] **Update Interactive Elements**

  - [ ] Add token action handler to `components/interactive-element.tsx`
  - [ ] Import the new action handler component
  - [ ] Add the action to the render function
  - [ ] Ensure proper action detection in the AI

### 5. Testing

- [ ] **Type Checking**

  - [ ] Run type checking to ensure no type errors
  - [ ] Fix any type issues in the implementation
  - [ ] Ensure proper typing for all components and hooks

- [ ] **Local Testing**

  - [ ] Test token swap functionality on development environment
  - [ ] Test registration flow if applicable
  - [ ] Test network switching functionality
  - [ ] Test token approval process
  - [ ] Test transaction completion and verification
  - [ ] Test AI recognition of token commands
  - [ ] Verify token appears in correct region selector
  - [ ] Verify token balance displays correctly in DiversiFi section

- [ ] **Error Handling**

  - [ ] Test error scenarios (network issues, rejection, etc.)
  - [ ] Verify user-friendly error messages
  - [ ] Test fallback mechanisms

- [ ] **Production Deployment**

  - [ ] Deploy database migrations
  - [ ] Verify token functionality in production environment
  - [ ] Monitor for any errors or issues
  - [ ] Test with real users if possible

### 6. Documentation & Finalization

- [ ] **Update README**

  - [ ] Add token to the appropriate region in the "Token Categories by Region" section
  - [ ] Add token integration details to the "Deployed Contracts" section if applicable
  - [ ] Document any special considerations or requirements

- [ ] **Update User Documentation**

  - [ ] Add token to any user-facing documentation
  - [ ] Create guides or tutorials for the new token if needed
  - [ ] Update FAQ if applicable

- [ ] **Final Review**

  - [ ] Conduct a final review of all components
  - [ ] Check for any console errors or warnings
  - [ ] Verify all features work as expected
  - [ ] Get feedback from team members if applicable

Following this checklist ensures that all aspects of the token integration are properly addressed, from backend implementation to AI recognition and user interface updates.

## Next Steps

1. Set up local development environment
2. Implement Filecoin integration
3. Create data collection system
4. Develop personalization engine
5. Establish DAO governance structure
