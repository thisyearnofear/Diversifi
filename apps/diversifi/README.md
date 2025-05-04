# DiversiFi - Inflation Protection Through Stablecoin Diversification

DiversiFi is a MiniPay-compatible application that helps users protect their savings from inflation by diversifying their stablecoin portfolio across different geographical regions.

## Features

- **Inflation Protection**: Protect your savings from local currency inflation by diversifying across regions
- **Portfolio Visualization**: View your stablecoin holdings across different regions with intuitive visualizations
- **Personalized Recommendations**: Get tailored portfolio recommendations based on your home region
- **Real-World Use Cases**: See concrete examples of how stablecoin diversification helps in everyday life
- **Stablecoin Swaps**: Easily swap between different regional stablecoins to optimize your portfolio
- **MiniPay Integration**: Seamless integration with MiniPay wallet
- **Mobile-First Design**: Optimized for mobile devices

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

### Environment Variables

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_CELO_RPC=https://forno.celo.org
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_COINGECKO_API_KEY=your_coingecko_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## Testing with MiniPay

To test your app with MiniPay:

1. Start your development server:

   ```
   pnpm dev -p 3003  # Use any available port
   ```

2. Use ngrok to expose your local server:

   ```
   ngrok http 3003  # Use the same port as your dev server
   ```

3. Open the MiniPay app on your Android device:
   - Go to Settings
   - Tap the version number repeatedly to enable developer mode
   - Go back to Settings and select "Developer Settings"
   - Enable "Developer Mode" and toggle "Use Testnet" if you want to use the Alfajores testnet
   - Tap "Load Test Page"
   - Enter your ngrok URL: `https://xxxx-xx-xx-xx-xxx.ngrok-free.app/diversifi`
   - Click "Go" to launch your app in MiniPay

## MiniPay Integration Learnings

### Key Requirements for MiniPay Compatibility

1. **Headers Configuration**:

   - Set `X-Frame-Options: SAMEORIGIN` instead of `DENY` to allow embedding in MiniPay
   - Add `Content-Security-Policy: frame-ancestors 'self' *.minipay.app *.celo.org *.opera.com;`

2. **Meta Tags**:

   ```html
   <meta
     name="viewport"
     content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
   />
   <meta name="mobile-web-app-capable" content="yes" />
   <meta name="apple-mobile-web-app-capable" content="yes" />
   <meta
     name="apple-mobile-web-app-status-bar-style"
     content="black-translucent"
   />
   ```

3. **Wallet Connection**:

   - Use the basic `window.ethereum.request({ method: "eth_requestAccounts" })` approach
   - Auto-connect when MiniPay is detected: `window.ethereum.isMiniPay === true`
   - Add a small delay (e.g., 500ms) before checking for MiniPay to ensure everything is loaded
   - Hide connect button when in MiniPay environment

4. **Chain Configuration**:

   - MiniPay only supports Celo and Celo Alfajores Testnet
   - Chain IDs: 42220 (Celo Mainnet), 44787 (Celo Alfajores Testnet)

5. **Transaction Requirements**:

   - MiniPay uses Custom Fee Abstraction based transactions
   - Support the `feeCurrency` property when sending transactions
   - Only accept legacy transactions (not EIP-1559)

6. **UI/UX Considerations**:
   - Mobile-first design with simple, clean UI
   - Avoid heavy animations or complex interactions
   - Use tabs for navigation on small screens
   - Ensure all interactive elements are large enough for touch

### Debugging MiniPay Integration

1. **Environment Detection**:

   ```javascript
   const isMiniPay = window.ethereum && window.ethereum.isMiniPay === true;
   const isInIframe = window !== window.parent;
   const userAgent = navigator.userAgent;
   const referrer = document.referrer || "None";
   ```

2. **Console Logging**:

   - Log detection results to console: `console.log('MiniPay detection:', { isMiniPay, userAgent, isInIframe, referrer });`
   - Log connection results: `console.log('Connected to wallet:', { address, chainId });`

3. **Visual Indicators**:

   - Show MiniPay badge when detected
   - Display connection status clearly
   - Show chain ID and network name

4. **Testing Approach**:
   - Start with simple static HTML files to verify basic functionality
   - Test wallet connection separately from app functionality
   - Create a dedicated debug page with detailed environment information

## Project Structure

The DiversiFi app follows a modular architecture for better maintainability:

```
/apps/diversifi/
├── components/           # UI components
│   ├── tabs/             # Tab-specific components
│   │   ├── OverviewTab.tsx
│   │   ├── ProtectionTab.tsx
│   │   ├── AnalyticsTab.tsx
│   │   ├── StrategiesTab.tsx
│   │   ├── SwapTab.tsx
│   │   └── InfoTab.tsx
│   └── ...               # Other shared components
├── constants/            # Application constants
│   └── regions.ts        # Region and token data
├── hooks/                # Custom React hooks
│   ├── wallet/           # Wallet-related hooks
│   │   └── use-wallet-connection.ts
│   ├── use-diversification.ts
│   ├── use-inflation-data.ts
│   └── ...               # Other domain-specific hooks
├── pages/                # Next.js pages
│   ├── _app.tsx          # App wrapper
│   ├── diversifi.tsx     # Main application page
│   └── index.tsx         # Redirect to main app
├── utils/                # Utility functions
│   ├── api-services.ts   # API integration
│   ├── environment.ts    # Environment detection
│   └── mento-utils.ts    # Mento protocol utilities
└── types/                # TypeScript type definitions
```

## Project Progress

### Completed

- ✅ Basic project setup with Next.js and Tailwind CSS
- ✅ MiniPay compatibility implementation
- ✅ Wallet connection with auto-detection for MiniPay
- ✅ Mobile-friendly UI with tabbed interface
- ✅ Environment detection and debugging tools
- ✅ Chain ID detection and display
- ✅ Balance checking functionality
- ✅ Stablecoin portfolio visualization
- ✅ Inflation protection information and education
- ✅ Portfolio optimization recommendations
- ✅ Real-world use cases showcase
- ✅ Regional distribution visualization
- ✅ Swap interface implementation
- ✅ User region detection based on IP and locale
- ✅ Live stablecoin balance fetching with caching
- ✅ Historical performance tracking
- ✅ Portfolio analytics with diversification metrics
- ✅ Region-specific recommendations
- ✅ Code refactoring for better maintainability
- ✅ Component modularization with tab-based architecture

### In Progress

- 🔄 Improved mobile experience with touch-friendly interactions
- 🔄 Performance optimizations for low-end devices
- 🔄 Monorepo structure optimization

### Recently Completed

- ✅ Integration with Mento protocol for live stablecoin data
- ✅ Stablecoin swap transaction execution with the Mento broker
- ✅ Real-time exchange rate calculations
- ✅ Slippage tolerance controls for swaps
- ✅ Transaction status tracking and error handling
- ✅ Real-time inflation data integration with World Bank API
- ✅ Currency performance visualization showing value of $1 over time
- ✅ Enhanced swap interface with inflation impact information
- ✅ Alpha Vantage API integration for real currency exchange rates
- ✅ Comprehensive API services with caching and error handling
- ✅ Visual indicators for live vs. cached data

### Upcoming

- 📅 Transaction history tracking
- 📅 Offline support
- 📅 Multi-language support
- 📅 Push notifications for portfolio alerts
- 📅 Social sharing of portfolio performance

## Differentiation Strategy

DiversiFi stands out from similar applications by focusing on:

1. **Practical Inflation Protection**: Instead of abstract diversification metrics, we emphasize concrete benefits like "protect your savings from local currency inflation" with real examples and data.

2. **Simplicity First**: The app is extremely simple to use with clear, actionable steps rather than complex metrics.

3. **Educational Component**: We include simple, visual explanations of how local inflation affects purchasing power and how stablecoin diversification helps.

4. **Personalized Recommendations**: We provide tailored suggestions based on the user's country/region rather than generic diversification advice.

5. **Real-World Use Cases**: We show specific scenarios where diversification helps (e.g., "If you had diversified your portfolio this way last year, here's how much purchasing power you would have preserved").

## Mento Protocol Integration

DiversiFi leverages the Mento Protocol to enable seamless swaps between different regional stablecoins. The integration includes:

### Exchange Rate Discovery

- Real-time exchange rate calculations using the Mento broker
- Caching system to reduce API calls and improve performance
- Fallback rates for reliability when the network is unavailable

### Swap Execution

- Direct integration with the Mento broker contract
- Automatic token approval process
- Slippage tolerance controls to protect users from price movements
- Transaction status tracking with clear user feedback
- Error handling with user-friendly messages

### Supported Stablecoins

- **cUSD** (Celo Dollar) - USA region
- **cEUR** (Celo Euro) - Europe region
- **cREAL** (Celo Brazilian Real) - LatAm region
- **cKES** (Celo Kenyan Shilling) - Africa region
- **cCOP** (Celo Colombian Peso) - LatAm region
- **PUSO** (Philippine Peso) - Asia region
- **cGHS** (Celo Ghana Cedi) - Africa region
- **eXOF** (CFA Franc) - Africa region

## Built With

- Next.js
- React
- Tailwind CSS
- Chart.js
- viem/wagmi
- Mento Protocol
- ethers.js

## License

This project is licensed under the MIT License.
