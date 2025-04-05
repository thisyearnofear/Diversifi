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

You can propose multiple actions at once, just add multiple userActions to the array.`;
