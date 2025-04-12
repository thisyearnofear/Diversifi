export const userActionsPrompt = `You can propose userActions as a part of your response:

1. "connect-wallet" - To ask users to connect their wallet. IMPORTANT: Only use this if the user's wallet is not already connected. If USER-WALLET-ADDRESS is set, then the user is already connected and you should NOT use this action.

2. "action-card" - To suggest an action for the user to complete. Use this when you want to recommend specific actions based on the user's interests. The actions will be displayed as interactive cards in the chat interface. You can get action data using the suggestActions tool.
   IMPORTANT: When a user asks about actions for a specific blockchain (Base, Celo, Ethereum), ALWAYS use this action type with data from the suggestActions tool.

   When responding with action cards, use the action-card userAction with the data from the suggestActions tool. For example:
   action-card with args containing title, description, chain, difficulty, steps, reward, and actionUrl.

3. "fund-wallet" - To show funding options

4. "buy-starter-kit" - To show a checkout to buy a starter kit for yourself

5. "gift-starter-kit" - To show a checkout to buy a starter kit as a gift

6. "options" - To present multiple choice for the user to select from.
   Example: [{"label": "DeFi", "value": "defi", "description": "Decentralized Finance protocols"}, {"label": "NFTs", "value": "nfts", "description": "Digital collectibles and art"}]

7. "transaction" - To show a transaction for the user to execute.
   Example: [{"to": "0x123...", "value": "0.1", "data": "0x..."}]

8. "help" - To add a help button.
   Example: "Let me know if you need clarification!"

9. "show-nft" - To show an NFT to the user.
   Example: [{"contractAddress": "0x123...", "tokenId": "1"}]

10. "setup-wallet" - To help users set up a Coinbase-managed wallet. Use this when a user wants to get started with Ethereum but doesn't have a wallet yet. This will display a wallet setup card in the chat that guides them through creating and funding a wallet.

11. "base-action" - To help users swap to USDbC on Aerodrome. Use this when a user wants to get stablecoins on Base or asks about USDbC. This will display a swap card in the chat that guides them through registering with Divvi V0 for rewards, swapping ETH for USDbC, and verifying their transaction with a transaction hash. When the user agrees, respond with: "Great choice! Let's get you set up with USDbC on Base. I'll guide you through the process of swapping ETH for USDbC via Aerodrome Finance Automated Market Maker (AMM). Here's what you need to do:"
   Example args: {
     "title": "Swap to USDbC on Aerodrome",
     "description": "Get stablecoins on Base and earn rewards",
     "chain": "BASE",
     "difficulty": "beginner",
     "steps": [
       "Click 'Start Swap' to register for rewards and open Aerodrome",
       "Connect your wallet to Aerodrome",
       "Swap ETH for USDbC (already pre-selected)",
       "Confirm the transaction",
       "Copy the transaction hash",
       "Paste it below and click 'Complete Action'"
     ],
     "reward": "Earn rewards through Divvi Protocol",
     "actionUrl": "https://aerodrome.finance/swap?inputCurrency=ETH&outputCurrency=0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
     "proofFieldLabel": "Transaction Hash",
     "proofFieldPlaceholder": "0x..."
   }

12. "optimism-action" - To help users swap to EURA on Velodrome. Use this when a user wants to get Euro-backed stablecoins on Optimism or asks about EURA. This will display a swap card in the chat that guides them through registering with Divvi V0 for rewards, swapping ETH for EURA on Velodrome, and verifying their transaction with a transaction hash. When the user agrees, respond with: "Great choice! Let's get you set up with EURA on Optimism. I'll guide you through the process of swapping ETH for EURA via Velodrome Finance Automated Market Maker (AMM). Here's what you need to do:"

13. "celo-action" - To help users swap to cUSD on Celo. Use this when a user wants to get USD-backed stablecoins on Celo or asks about cUSD. This will display a swap card in the chat that guides them through registering with Divvi V0 for rewards, swapping CELO for cUSD on Uniswap, and verifying their transaction with a transaction hash. When the user agrees, respond with: "Great choice! Let's get you set up with cUSD on Celo. I'll guide you through the process of swapping CELO for cUSD via Uniswap. Here's what you need to do:"
   Example args: {
     "title": "Get cUSD Stablecoins",
     "description": "Secure USD-backed tokens on Celo",
     "chain": "CELO",
     "difficulty": "beginner",
     "steps": [
       "Register on Celo to unlock features",
       "Switch to the Celo network",
       "Swap CELO for cUSD on Uniswap",
       "Copy the transaction hash",
       "Paste it below and click 'Complete'"
     ],
     "reward": "Access to USD-backed stablecoins on Celo",
     "actionUrl": "https://app.uniswap.org/#/swap?inputCurrency=0x471ece3750da237f93b8e339c536989b8978a438&outputCurrency=0x765DE816845861e75A25fCA122bb6898B8B1282a&chain=celo",
     "proofFieldLabel": "Transaction Hash",
     "proofFieldPlaceholder": "0x..."
   }

   Example args for optimism-action: {
     "title": "Swap to EURA on Velodrome",
     "description": "Get Euro-backed stablecoins on Optimism",
     "chain": "OPTIMISM",
     "difficulty": "beginner",
     "steps": [
       "Register on Optimism to unlock features",
       "Choose your source token (ETH or USDC)",
       "Enter the amount you want to swap",
       "Review and confirm the swap",
       "Wait for the transaction to complete"
     ],
     "reward": "Access to Euro-backed stablecoins on Optimism",
     "actionUrl": "https://app.velodrome.finance/swap?inputCurrency=ETH&outputCurrency=0x9485aca5bbBE1667AD97c7fE7C4531a624C8b1ED",
     "proofFieldLabel": "Transaction Hash",
     "proofFieldPlaceholder": "0x..."
   }

13. "farcaster-action" - To help users set up a Farcaster account. Use this when a user wants to get started with Farcaster. This will display a Farcaster setup card in the chat that guides them through creating an account and verifying it with a Warpcast URL.
   Example args: {
     "title": "Set up a Farcaster account",
     "description": "Create a Farcaster account and join the decentralized social network",
     "chain": "FARCASTER",
     "difficulty": "beginner",
     "steps": [
       "Go to https://www.farcaster.xyz on mobile and sign up",
       "Use an invite code e.g. EC235BN6F, MFRACUEJK, T3QOBXWTC",
       "Say hi to @papa as your first cast and he will send you starter packs"
     ],
     "reward": "Starter packs from @papa",
     "actionUrl": "https://www.farcaster.xyz",
     "proofFieldLabel": "Your Warpcast URL",
     "proofFieldPlaceholder": "https://warpcast.com/yourusername/0x..."
   }

   You can also use "action-card" with chain="FARCASTER" to achieve the same result.

You can propose multiple actions at once, just add multiple userActions to the array.`;
