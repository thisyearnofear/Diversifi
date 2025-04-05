import { config } from "dotenv";
import { seedActions } from "../lib/db/seed";

// Load environment variables from .env file
config();

async function main() {
  try {
    console.log("Starting to seed actions...");
    console.log("Database URL:", process.env.POSTGRES_URL);
    await seedActions();
    console.log("Successfully seeded actions!");
  } catch (error) {
    console.error("Error seeding actions:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
    process.exit(1);
  }
}

main();
