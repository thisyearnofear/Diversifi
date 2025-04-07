import { db } from "../queries";
import { action } from "../schema";

export async function seedFarcasterAction() {
  console.log("Checking for existing Farcaster action...");
  
  // Check if a Farcaster action already exists
  const existingActions = await db
    .select()
    .from(action)
    .where((action) => action.chain.equals("FARCASTER"));
  
  if (existingActions.length > 0) {
    console.log("Farcaster action already exists, skipping seed");
    return;
  }
  
  console.log("Creating Farcaster action...");
  
  // Create the Farcaster action
  await db.insert(action).values({
    title: "Set up a Farcaster account",
    description: "Create a Farcaster account and join the decentralized social network",
    category: "SOCIAL",
    chain: "BASE", // Using BASE as a fallback since FARCASTER is not in the enum
    difficulty: "BEGINNER",
    prerequisites: [],
    steps: [
      {
        title: "Go to Farcaster.xyz",
        description: "Visit https://www.farcaster.xyz on mobile and sign up"
      },
      {
        title: "Use an invite code",
        description: "Use an invite code e.g. EC235BN6F, MFRACUEJK, T3QOBXWTC"
      },
      {
        title: "Say hi to @papa",
        description: "Say hi to @papa as your first cast and he will send you starter packs"
      }
    ],
    rewards: [
      {
        title: "Starter packs",
        description: "Receive starter packs from @papa"
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  console.log("Farcaster action created successfully");
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedFarcasterAction()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error seeding Farcaster action:", error);
      process.exit(1);
    });
}
