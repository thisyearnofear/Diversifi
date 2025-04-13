import { db } from "./queries";
import { action } from "./schema";
import { eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";
import { seedLensAction } from "./seeds/lens-action";
import { seedBaseAction } from "./seeds/base-action";
import { seedOptimismActions } from "./seeds/optimism-action";
import { seedCeloActions } from "./seeds/celo-action";
// Temporarily comment out the Polygon actions import to fix build
// import { seedPolygonActions } from "./seeds/polygon-action";

type ActionInsert = InferInsertModel<typeof action>;

const actions: Omit<ActionInsert, "id" | "createdAt" | "updatedAt">[] = [
  // Social Actions
  {
    title: "Set up Farcaster Account",
    description:
      "Create a Farcaster account and join the decentralized social network",
    category: "SOCIAL",
    chain: "BASE",
    difficulty: "BEGINNER",
    prerequisites: ["Wallet with BASE"],
    steps: [
      "Go to https://www.farcaster.xyz on mobile and sign up",
      "Use an invite code e.g. EC235BN6F, MFRACUEJK, T3QOBXWTC",
      "Say hi to @papa as your first cast",
      "Copy your profile URL (e.g. https://warpcast.com/papa)",
    ],
    rewards: [
      {
        type: "SOCIAL",
        description: "Starter packs from the community",
      },
    ],
  },
  {
    title: "Set up Lens Account",
    description: "Create a Lens account and join the decentralized social network",
    category: "SOCIAL",
    chain: "BASE",
    difficulty: "BEGINNER",
    prerequisites: ["Wallet with ETH"],
    steps: [
      "Go to https://onboarding.lens.xyz and sign up",
      "Connect your wallet",
      "Create your profile",
      "Copy your profile URL (e.g. https://hey.xyz/u/username)",
    ],
    rewards: [
      {
        type: "SOCIAL",
        description: "Access to the Lens ecosystem",
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

  if (!db) {
    console.warn("⚠️ Database not available. Cannot seed actions.");
    return;
  }

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

  // Seed the Lens action
  await seedLensAction();

  // Seed the Base action
  await seedBaseAction();

  // Seed the Optimism actions
  await seedOptimismActions();

  // Seed the Celo actions
  await seedCeloActions();

  // Temporarily comment out the Polygon actions seeding to fix build
  // await seedPolygonActions();

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
