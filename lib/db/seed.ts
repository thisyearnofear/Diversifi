import { db } from "./queries";
import { action } from "./schema";
import { eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

type ActionInsert = InferInsertModel<typeof action>;

const actions: Omit<ActionInsert, "id" | "createdAt" | "updatedAt">[] = [
  // Based Actions (BASE)
  {
    title: "Set up Farcaster Account",
    description: "Create a Farcaster account and connect it to your wallet",
    category: "SOCIAL",
    chain: "BASE",
    difficulty: "BEGINNER",
    prerequisites: ["Wallet with BASE"],
    steps: [
      "Visit farcaster.xyz",
      "Connect your wallet",
      "Create your account",
      "Set up your profile",
    ],
    rewards: [
      {
        type: "TOKEN",
        description: "0.1 ETH",
      },
    ],
  },
  {
    title: "Bridge to Base",
    description: "Bridge assets from Ethereum to Base",
    category: "DEFI",
    chain: "BASE",
    difficulty: "INTERMEDIATE",
    prerequisites: ["Wallet with ETH"],
    steps: [
      "Visit bridge.base.org",
      "Connect your wallet",
      "Select amount to bridge",
      "Confirm transaction",
    ],
    rewards: [
      {
        type: "TOKEN",
        description: "0.2 ETH",
      },
    ],
  },

  // Stable Actions (CELO)
  {
    title: "Mint Celo NFT",
    description: "Create and mint an NFT on Celo",
    category: "NFT",
    chain: "CELO",
    difficulty: "INTERMEDIATE",
    prerequisites: ["Wallet with CELO"],
    steps: [
      "Visit celo.art",
      "Connect your wallet",
      "Create your NFT",
      "Mint it to your wallet",
    ],
    rewards: [
      {
        type: "TOKEN",
        description: "10 CELO",
      },
    ],
  },
  {
    title: "Swap on Ubeswap",
    description: "Perform a token swap on Ubeswap",
    category: "TRADING",
    chain: "CELO",
    difficulty: "BEGINNER",
    prerequisites: ["Wallet with CELO"],
    steps: [
      "Visit ubeswap.org",
      "Connect your wallet",
      "Select tokens to swap",
      "Confirm transaction",
    ],
    rewards: [
      {
        type: "TOKEN",
        description: "5 CELO",
      },
    ],
  },

  // Global Actions (ETHEREUM)
  {
    title: "Deploy Smart Contract",
    description: "Deploy a simple smart contract to Ethereum",
    category: "DEFI",
    chain: "ETHEREUM",
    difficulty: "ADVANCED",
    prerequisites: ["Wallet with ETH", "Basic Solidity knowledge"],
    steps: [
      "Write your contract",
      "Compile it",
      "Deploy to testnet",
      "Verify on Etherscan",
    ],
    rewards: [
      {
        type: "TOKEN",
        description: "0.5 ETH",
      },
    ],
  },
  {
    title: "Participate in DAO",
    description: "Join and participate in a DAO governance",
    category: "DEFI",
    chain: "ETHEREUM",
    difficulty: "INTERMEDIATE",
    prerequisites: ["Wallet with ETH"],
    steps: [
      "Join a DAO",
      "Get governance tokens",
      "Create a proposal",
      "Vote on proposals",
    ],
    rewards: [
      {
        type: "TOKEN",
        description: "0.3 ETH",
      },
    ],
  },
];

export async function seedActions() {
  console.log("Seeding actions...");
  console.log("Database URL:", process.env.POSTGRES_URL);

  for (const actionData of actions) {
    const existingAction = await db
      .select()
      .from(action)
      .where(eq(action.title, actionData.title))
      .limit(1);

    if (existingAction.length === 0) {
      await db.insert(action).values({
        ...actionData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`Seeded action: ${actionData.title}`);
    } else {
      console.log(`Action already exists: ${actionData.title}`);
    }
  }

  console.log("Seeding complete!");
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedActions()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error seeding database:", error);
      process.exit(1);
    });
}
