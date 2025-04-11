import { db } from "@/lib/db/queries";
import { action } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function seedLensAction() {
  console.log("Seeding Lens action...");

  if (!db) {
    console.warn("⚠️ Database not available. Cannot seed Lens action.");
    return;
  }

  // Check if the Lens action already exists
  const existingActions = await db
    .select()
    .from(action)
    .where(eq(action.title, "Set up Lens Account"));

  if (existingActions.length > 0) {
    console.log("Lens action already exists, skipping seed");
    return;
  }

  // Create the Lens action
  await db.insert(action).values({
    title: "Set up Lens Account",
    description:
      "Create a Lens account and join the decentralized social network",
    category: "SOCIAL",
    chain: "BASE", // Using BASE as a fallback
    difficulty: "BEGINNER",
    prerequisites: [],
    steps: [
      {
        title: "Go to Lens Onboarding",
        description: "Visit https://onboarding.lens.xyz and sign up",
      },
      {
        title: "Connect your wallet",
        description: "Connect your wallet to create a profile",
      },
      {
        title: "Create your profile",
        description: "Set up your profile with a username and profile picture",
      },
    ],
    rewards: [
      {
        title: "Lens Ecosystem Access",
        description: "Access to the Lens ecosystem and curated starter packs",
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("Lens action seeded successfully");
}
