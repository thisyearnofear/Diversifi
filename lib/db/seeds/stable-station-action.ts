import { db } from "@/lib/db/queries";
import { action } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Seeds the database with Stable Station actions.
 */
export async function seedStableStationActions() {
  console.log("Seeding Stable Station actions...");

  if (!db) {
    console.warn("⚠️ Database not available. Cannot seed Stable Station actions.");
    return;
  }

  // Check if the Divvi registration action already exists
  const existingDivviAction = await db
    .select()
    .from(action)
    .where(eq(action.title, "Register on Stable Station"))
    .limit(1);

  if (existingDivviAction.length === 0) {
    // Create the Divvi registration action
    await db.insert(action).values({
      title: "Register on Stable Station",
      description: "Enable portfolio tracking on Base",
      category: "STABLECOIN",
      chain: "BASE",
      difficulty: "BEGINNER",
      prerequisites: [],
      steps: [
        {
          title: "Connect wallet",
          description: "Connect your wallet to continue",
        },
        {
          title: "Register on Base",
          description: "Click 'Register' to enable portfolio tracking",
        },
        {
          title: "Confirm transaction",
          description: "Confirm the transaction in your wallet",
        },
        {
          title: "Complete registration",
          description: "Click 'Complete Registration' to finish",
        },
      ],
      rewards: [
        {
          type: "FEATURE",
          description: "Access portfolio tracking and future rebalancing features",
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("Created Stable Station registration action");
  } else {
    console.log("Stable Station registration action already exists");
  }

  // Check if the Celo registration action already exists
  const existingCeloAction = await db
    .select()
    .from(action)
    .where(eq(action.title, "Register on Celo"))
    .limit(1);

  if (existingCeloAction.length === 0) {
    // Create the Celo registration action
    await db.insert(action).values({
      title: "Register on Celo",
      description: "Enable portfolio tracking on Celo",
      category: "STABLECOIN",
      chain: "CELO",
      difficulty: "BEGINNER",
      prerequisites: [],
      steps: [
        {
          title: "Connect wallet",
          description: "Connect your wallet to continue",
        },
        {
          title: "Register on Celo",
          description: "Click 'Register' to enable portfolio tracking",
        },
        {
          title: "Confirm transaction",
          description: "Confirm the transaction in your wallet",
        },
        {
          title: "Complete registration",
          description: "Click 'Complete Registration' to finish",
        },
      ],
      rewards: [
        {
          type: "FEATURE",
          description: "Access portfolio tracking and future rebalancing features",
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("Created Celo registration action");
  } else {
    console.log("Celo registration action already exists");
  }
}
