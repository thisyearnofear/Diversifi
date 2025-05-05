# DiversiFi: Inflation Protection Through Stablecoin Diversification

## Project Overview

DiversiFi is a MiniPay-optimized application that helps users protect their savings from inflation by strategically diversifying their stablecoin portfolio across different geographical regions. By leveraging Mento's local stablecoins, DiversiFi enables users to hedge against local currency inflation, maintain purchasing power, and optimize their savings strategy based on real-world economic data.

## Problem Statement

In many emerging markets, local currencies face significant inflation challenges, eroding people's savings and purchasing power. While stablecoins offer a potential solution, simply holding a single stablecoin (like cUSD) doesn't provide optimal protection against regional economic fluctuations. Users need a simple way to:

1. Understand how inflation affects their savings in different regions
2. Diversify their stablecoin holdings across multiple regional currencies
3. Easily swap between stablecoins based on their personal financial needs
4. Make informed decisions about which stablecoins to hold based on real economic data

## Solution: DiversiFi

DiversiFi addresses these challenges by providing:

1. **Personalized Inflation Protection**: Analyzes the user's home region and recommends an optimal stablecoin portfolio mix based on inflation rates and economic indicators.

2. **Visual Portfolio Management**: Intuitive visualizations show users their current stablecoin distribution across regions, helping them understand their exposure and diversification metrics.

3. **Seamless Stablecoin Swaps**: Direct integration with the Mento protocol enables users to easily swap between different regional stablecoins (cUSD, cEUR, cREAL, eXOF, cKES, PUSO, cCOP, cGHS) with minimal friction.

4. **Real-World Use Cases**: Contextualizes stablecoin diversification with practical examples relevant to the user's region, such as remittances, education expenses, travel, and business needs.

5. **Educational Components**: Helps users understand inflation impacts through interactive visualizations showing how their money loses value over time in different currencies.

## Technical Implementation

DiversiFi is built as a mobile-responsive web application optimized for MiniPay, with several key technical features:

1. **MiniPay Integration**: Seamless detection and integration with MiniPay wallet, including auto-connection, custom fee abstraction, and optimized mobile UI.

2. **Mento Protocol Integration**: Direct integration with Mento's broker contract for stablecoin swaps, with real-time exchange rate calculations and slippage protection.

3. **Multi-Currency Support**: Support for all Mento stablecoins across different regions (USA, Europe, Africa, Latin America, Asia).

4. **Real-Time Data**: Integration with World Bank and Alpha Vantage APIs for up-to-date inflation and currency exchange data.

5. **Intelligent Swap Routing**: Smart routing for stablecoin swaps, including direct swaps, two-step swaps via intermediary tokens, and simulated swaps when needed.

6. **Responsive Design**: Mobile-first design with touch-friendly interactions, optimized for the MiniPay environment.

## Hackathon Track Alignment

### Primary Track: Inflation Protection and Swapping

DiversiFi directly addresses the Inflation Protection and Swapping track by:

- Enabling users to swap between different Mento stablecoins based on their personal financial needs
- Providing visual tools to understand inflation impacts across different regions
- Offering personalized portfolio recommendations based on the user's home region
- Integrating real-world use cases that demonstrate how local stablecoins solve specific pain points

### Additional Track Relevance

#### Cross-border Payments and Remittances
- DiversiFi helps users optimize their cross-border payment strategy by holding the right mix of stablecoins for their specific corridors
- The app includes specific use cases for remittances, showing users how to minimize costs when sending money across borders

#### Multi-currency Borrow/Lending or Yield
- While not implementing lending directly, DiversiFi helps users understand which stablecoins might offer better long-term value preservation
- The inflation analytics provide insights into which currencies might be better for savings vs. spending

#### Best Use Case for Everyday Life
- DiversiFi focuses on practical, everyday use cases like education expenses, travel preparation, and business payments
- The app is designed for simplicity and accessibility, making it useful for everyday MiniPay users in emerging markets

## User Experience

1. **Connect Wallet**: Users connect their MiniPay wallet with a single tap (auto-connects when in MiniPay)
2. **View Portfolio**: Users see their current stablecoin holdings visualized by region
3. **Get Recommendations**: Based on the user's home region, DiversiFi suggests an optimal portfolio allocation
4. **Understand Inflation Impact**: Interactive visualizations show how inflation erodes purchasing power over time
5. **Swap Stablecoins**: Users can easily swap between different regional stablecoins with real-time rates
6. **Track Performance**: Users can monitor how their diversified portfolio performs against their local currency

## Key Differentiators

1. **Practical Approach**: Instead of abstract financial concepts, DiversiFi focuses on concrete benefits and real-world use cases
2. **Educational Value**: The app helps users understand inflation and currency dynamics through simple visualizations
3. **Regional Personalization**: All recommendations and insights are tailored to the user's specific region
4. **MiniPay Optimization**: Built specifically for the MiniPay environment with careful attention to mobile UX
5. **Data-Driven Decisions**: All recommendations are based on real economic data, not arbitrary allocations

## Future Development

1. **Transaction History**: Track past swaps and portfolio changes over time
2. **Offline Support**: Enable basic functionality when offline
3. **Multi-Language Support**: Add support for regional languages
4. **Push Notifications**: Alert users to significant inflation changes or portfolio opportunities
5. **Social Sharing**: Allow users to share their portfolio performance with friends

## Technical Requirements Compliance

### Mento Integration
- Uses Mento decentralized stablecoins (cUSD, cEUR, cREAL, eXOF, cKES, PUSO, cCOP, cGHS)
- Integrates with Mento's broker contract for swaps
- Focuses exclusively on stablecoins

### MiniPay Compatibility
- Mobile responsive design optimized for small screens
- Uses viem/wagmi for wallet connection
- Auto-connects when in MiniPay environment
- Supports custom fee abstraction with cUSD
- Accepts legacy transactions only

### Documentation
- Comprehensive README with setup instructions
- Clear code organization and comments
- Open source GitHub repository
- Detailed project description

## Conclusion

DiversiFi transforms how MiniPay users interact with stablecoins, moving beyond simple payments to intelligent portfolio management for inflation protection. By making it easy to diversify across Mento's local stablecoins, DiversiFi helps users in emerging markets preserve their purchasing power and make more informed financial decisions.
