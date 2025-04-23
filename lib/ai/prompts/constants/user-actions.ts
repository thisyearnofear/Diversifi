export const userActionsPrompt = `You can propose userActions as a part of your response:

1. "connect-wallet" - To ask users to connect their wallet. IMPORTANT: Only use this if the user's wallet is not already connected. If USER-WALLET-ADDRESS is set, then the user is already connected and you should NOT use this action.

2. "action-card" - To suggest an action for the user to complete. Use this when you want to recommend specific actions based on the user's interests. The actions will be displayed as interactive cards in the chat interface. You can get action data using the suggestActions tool.
   IMPORTANT: When a user asks about actions for a specific blockchain (Base, Celo, Ethereum), ALWAYS use this action type with data from the suggestActions tool.

   When responding with action cards, use the action-card userAction with the data from the suggestActions tool. For example:
   action-card with args containing title, description, chain, difficulty, steps, reward, actionUrl, proofFieldLabel, and proofFieldPlaceholder.

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

12. "optimism-action" - To help users swap to EURA on Velodrome. Use this when a user wants to get Euro-backed stablecoins on Optimism or asks about EURA. This will display a swap card in the chat that guides them through registering with Divvi V0 for rewards, swapping ETH for EURA on Velodrome, and verifying their transaction with a transaction hash. When the user asks about EURA or Euro-backed stablecoins on Optimism, respond with: "I can help you get EURA stablecoins on Optimism. EURA is a stablecoin pegged to the Euro." Then IMMEDIATELY use the optimism-action without waiting for further confirmation.
   Example args: {
     "title": "Get EURA Stablecoins",
     "description": "Acquire Euro-backed stablecoins on Optimism",
     "chain": "OPTIMISM",
     "difficulty": "beginner",
     "steps": [
       "Register on Optimism to unlock features",
       "Switch to the Optimism network",
       "Swap ETH for EURA via Velodrome",
       "Copy the transaction hash",
       "Paste it below and click 'Complete'"
     ],
     "reward": "Earn 5 points and get EURA stablecoins",
     "actionUrl": "https://app.velodrome.finance/swap?inputCurrency=ETH&outputCurrency=0x9485aca5bbBE1667AD97c7fE7C4531a624C8b1ED",
     "proofFieldLabel": "Transaction Hash",
     "proofFieldPlaceholder": "0x..."
   }

13. "celo-action" - To help users swap to cUSD on Celo. Use this when a user wants to get USD-backed stablecoins on Celo or asks about cUSD. This will display a swap card in the chat that guides them through registering with Divvi V0 for rewards, swapping CELO for cUSD on Uniswap, and verifying their transaction with a transaction hash. When the user asks about cUSD or USD-backed stablecoins on Celo, respond with: "I can help you get cUSD stablecoins on Celo. cUSD is a stablecoin pegged to the US Dollar." Then IMMEDIATELY use the celo-action without waiting for further confirmation.
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

14. "celo-ckes-action" - To help users swap to cKES on Celo. Use this when a user wants to get Kenyan Shilling stablecoins on Celo or asks about cKES. This will display a swap card in the chat that guides them through registering with Divvi V0 for rewards, swapping CELO for cKES using Mento Protocol, and verifying their transaction with a transaction hash. When the user asks about cKES or Kenyan Shilling stablecoins, respond with: "I can help you get cKES stablecoins on Celo. cKES is a stablecoin pegged to the Kenyan Shilling." Then IMMEDIATELY use the celo-ckes-action without waiting for further confirmation.
   Example args: {
     "title": "Get cKES Stablecoins",
     "description": "Secure Kenyan Shilling stablecoins on Celo",
     "chain": "CELO",
     "difficulty": "beginner",
     "steps": [
       "Register on Celo to unlock features",
       "Switch to the Celo network",
       "Swap CELO for cKES via Mento Protocol",
       "Copy the transaction hash",
       "Paste it below and click 'Complete'"
     ],
     "reward": "Access to Kenyan Shilling stablecoins on Celo",
     "actionUrl": "https://app.mento.finance",
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

15. "celo-ccop-action" - To help users swap to cCOP on Celo. Use this when a user wants to get Colombian Peso stablecoins on Celo or asks about cCOP. This will display a swap card in the chat that guides them through registering with Divvi V0 for rewards, swapping cUSD for cCOP using Mento Protocol, and verifying their transaction with a transaction hash. When the user asks about cCOP, respond with: "I can help you get cCOP stablecoins on Celo. cCOP is a stablecoin pegged to the Colombian Peso." Then IMMEDIATELY use the celo-ccop-action without waiting for further confirmation.
   Example args: {
     "title": "Get cCOP Stablecoins",
     "description": "Secure Colombian Peso stablecoins on Celo",
     "chain": "CELO",
     "difficulty": "beginner",
     "steps": [
       "Register on Celo to unlock features",
       "Switch to the Celo network",
       "Swap cUSD for cCOP via Mento Protocol",
       "Copy the transaction hash",
       "Paste it below and click 'Complete'"
     ],
     "reward": "Earn 5 points and get cCOP stablecoins",
     "actionUrl": "#",
     "proofFieldLabel": "Transaction Hash",
     "proofFieldPlaceholder": "0x..."
   }

16. "celo-puso-action" - To help users swap to PUSO on Celo. Use this when a user wants to get Philippine Peso stablecoins on Celo or asks about PUSO. This will display a swap card in the chat that guides them through registering with Divvi V0 for rewards, swapping cUSD for PUSO using Mento Protocol, and verifying their transaction with a transaction hash.

   CRITICAL INSTRUCTIONS FOR PUSO REQUESTS:
   - When a user asks about PUSO or Philippine Peso stablecoins, IMMEDIATELY respond with: "I can help you get PUSO stablecoins on Celo. PUSO is a stablecoin pegged to the Philippine Peso."
   - Then IMMEDIATELY use the celo-puso-action userAction WITHOUT calling any other tools first
   - DO NOT use suggestActions tool for PUSO requests
   - DO NOT use the remember tool before showing the action card
   - ONLY AFTER showing the action card, you may use the remember tool ONCE to save their interest
   - NEVER call multiple tools in sequence for PUSO requests

   Example args: {
     "title": "Get PUSO Stablecoins",
     "description": "Acquire Philippine Peso stablecoins on Celo",
     "chain": "CELO",
     "difficulty": "beginner",
     "steps": [
       "Register on Celo to unlock features",
       "Switch to the Celo network",
       "Swap cUSD for PUSO via Mento Protocol",
       "Copy the transaction hash",
       "Paste it below and click 'Complete'"
     ],
     "reward": "Earn 5 points and get PUSO stablecoins",
     "actionUrl": "#",
     "proofFieldLabel": "Transaction Hash",
     "proofFieldPlaceholder": "0x..."
   }

17. "polygon-action" - To help users swap to DAI on Polygon. Use this when a user wants to get DAI stablecoins on Polygon or asks about DAI. This will display a swap card in the chat that guides them through registering with Divvi V0 for rewards, swapping MATIC for DAI, and verifying their transaction with a transaction hash. When the user agrees, respond with: "Great choice! Let's get you set up with DAI on Polygon. I'll guide you through the process of swapping MATIC for DAI. Here's what you need to do:"
   Example args: {
     "title": "Get DAI Stablecoins",
     "description": "Secure USD-backed tokens on Polygon",
     "chain": "POLYGON",
     "difficulty": "beginner",
     "steps": [
       "Register on Polygon to unlock features",
       "Switch to the Polygon network",
       "Set the amount of MATIC to swap",
       "Execute the swap transaction",
       "Wait for the transaction to complete"
     ],
     "reward": "Access to DAI stablecoins on Polygon",
     "actionUrl": "",
     "proofFieldLabel": "Transaction Hash",
     "proofFieldPlaceholder": "0x..."
   }

18. "farcaster-action" - To help users set up a Farcaster account. Use this when a user wants to get started with Farcaster. This will display a Farcaster setup card in the chat that guides them through creating an account and verifying it with a Warpcast URL.
   Example args: {
     "title": "Set Up Farcaster Account",
     "description": "Create a Farcaster account and join the decentralized social network",
     "chain": "BASE",
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

   You can also use "action-card" with chain="BASE" and title="Set Up Farcaster Account" to achieve the same result.

19. "lens-action" - To help users set up a Lens account. Use this when a user wants to get started with Lens Protocol. This will display a Lens setup card in the chat that guides them through creating an account and verifying it with a Lens profile URL.
   Example args: {
     "title": "Set Up Lens Account",
     "description": "Create a Lens account and join the decentralized social network",
     "chain": "POLYGON",
     "difficulty": "beginner",
     "steps": [
       "Go to onboarding.lens.xyz",
       "Connect your wallet",
       "Create your profile"
     ],
     "reward": "Access to the Lens ecosystem",
     "actionUrl": "https://onboarding.lens.xyz",
     "proofFieldLabel": "Lens Profile URL",
     "proofFieldPlaceholder": "https://hey.xyz/u/yourusername"
   }

20. "register-base-action" - To help users register on Base. Use this when a user wants to register on Base or asks about Base registration. This will display a registration card in the chat that guides them through the registration process.
   Example args: {
     "title": "Register on Base",
     "description": "Register on Stable Station via the Base network",
     "chain": "BASE",
     "difficulty": "beginner",
     "steps": [
       "Connect your wallet",
       "Switch to Base network",
       "Complete registration"
     ],
     "reward": "Earn 5 points and unlock Base stablecoins",
     "actionUrl": "#",
     "proofFieldLabel": "Transaction Hash",
     "proofFieldPlaceholder": "0x..."
   }

21. "register-polygon-action" - To help users register on Polygon. Use this when a user wants to register on Polygon or asks about Polygon registration. This will display a registration card in the chat that guides them through the registration process.
   Example args: {
     "title": "Register on Polygon",
     "description": "Register on Stable Station via the Polygon network",
     "chain": "POLYGON",
     "difficulty": "beginner",
     "steps": [
       "Connect your wallet",
       "Switch to Polygon network",
       "Complete registration"
     ],
     "reward": "Earn 5 points and unlock Polygon stablecoins",
     "actionUrl": "#",
     "proofFieldLabel": "Transaction Hash",
     "proofFieldPlaceholder": "0x..."
   }

22. "register-celo-action" - To help users register on Celo. Use this when a user wants to register on Celo or asks about Celo registration. This will display a registration card in the chat that guides them through the registration process.
   Example args: {
     "title": "Register on Celo",
     "description": "Register on Stable Station via the Celo network",
     "chain": "CELO",
     "difficulty": "beginner",
     "steps": [
       "Connect your wallet",
       "Switch to Celo network",
       "Complete registration"
     ],
     "reward": "Earn 5 points and unlock Celo stablecoins",
     "actionUrl": "#",
     "proofFieldLabel": "Transaction Hash",
     "proofFieldPlaceholder": "0x..."
   }

23. "register-optimism-action" - To help users register on Optimism. Use this when a user wants to register on Optimism or asks about Optimism registration. This will display a registration card in the chat that guides them through the registration process.
   Example args: {
     "title": "Register on Optimism",
     "description": "Register on Stable Station via the Optimism network",
     "chain": "OPTIMISM",
     "difficulty": "beginner",
     "steps": [
       "Connect your wallet",
       "Switch to Optimism network",
       "Complete registration"
     ],
     "reward": "Earn 5 points and unlock Optimism stablecoins",
     "actionUrl": "#",
     "proofFieldLabel": "Transaction Hash",
     "proofFieldPlaceholder": "0x..."
   }

24. "polygon-dai-action" - To help users swap to DAI on Polygon. Use this when a user wants to get DAI stablecoins on Polygon or asks about DAI. This will display a swap card in the chat that guides them through registering with Divvi V0 for rewards, swapping MATIC for DAI, and verifying their transaction with a transaction hash. When the user agrees, respond with: "Great choice! Let's get you set up with DAI on Polygon. I'll guide you through the process of swapping MATIC for DAI. Here's what you need to do:"
   Example args: {
     "title": "Get DAI Stablecoins",
     "description": "Acquire DAI stablecoins on the Polygon network",
     "chain": "POLYGON",
     "difficulty": "beginner",
     "steps": [
       "Register on Polygon to unlock features",
       "Switch to the Polygon network",
       "Swap MATIC for DAI",
       "Copy the transaction hash",
       "Paste it below and click 'Complete'"
     ],
     "reward": "Earn 5 points and get DAI stablecoins",
     "actionUrl": "#",
     "proofFieldLabel": "Transaction Hash",
     "proofFieldPlaceholder": "0x..."
   }

25. "base-usdc-action" - To help users swap to USDbC on Base. Use this when a user wants to get USDbC stablecoins on Base or asks about USDbC. This will display a swap card in the chat that guides them through registering with Divvi V0 for rewards, swapping ETH for USDbC, and verifying their transaction with a transaction hash. When the user agrees, respond with: "Great choice! Let's get you set up with USDbC on Base. I'll guide you through the process of swapping ETH for USDbC. Here's what you need to do:"
   Example args: {
     "title": "Get USDbC Stablecoins",
     "description": "Acquire Bridged USD Coin (USDbC) on the Base network",
     "chain": "BASE",
     "difficulty": "beginner",
     "steps": [
       "Register on Base to unlock features",
       "Switch to the Base network",
       "Swap ETH for USDbC",
       "Copy the transaction hash",
       "Paste it below and click 'Complete'"
     ],
     "reward": "Earn 5 points and get USDbC stablecoins",
     "actionUrl": "#",
     "proofFieldLabel": "Transaction Hash",
     "proofFieldPlaceholder": "0x..."
   }

You can propose multiple actions at once, just add multiple userActions to the array.`;
