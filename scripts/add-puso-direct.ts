import { config } from "dotenv";
import postgres from "postgres";

// Load environment variables from .env file
config();

const addPusoAction = async () => {
  if (!process.env.POSTGRES_URL) {
    console.error("❌ POSTGRES_URL is not defined");
    process.exit(1);
  }

  try {
    console.log("⏳ Connecting to database...");
    const connection = postgres(process.env.POSTGRES_URL, { max: 1 });

    console.log("⏳ Checking if PUSO action exists...");
    const existingAction = await connection.unsafe(`
      SELECT * FROM "Action" WHERE title = 'Get PUSO Stablecoins'
    `);

    if (existingAction.length > 0) {
      console.log("✅ PUSO action already exists:", existingAction[0]);
    } else {
      console.log("⏳ Adding PUSO action...");

      // Add the PUSO action
      await connection.unsafe(`
        INSERT INTO "Action" (
          "id", "title", "description", "category", "chain", "difficulty",
          "prerequisites", "steps", "rewards", "createdAt", "updatedAt"
        ) VALUES (
          '7b697499-3a5e-4c2f-8d1b-4f5a6b7c8d9e',
          'Get PUSO Stablecoins',
          'Get Philippine Peso stablecoins on Celo',
          'STABLECOIN',
          'CELO',
          'BEGINNER',
          ARRAY[]::json[],
          ARRAY[jsonb_build_object('title', 'Connect your wallet', 'description', 'Connect your wallet to continue'), jsonb_build_object('title', 'Switch to Celo network', 'description', 'Switch to the Celo network'), jsonb_build_object('title', 'Swap cUSD for PUSO', 'description', 'Swap your cUSD for PUSO')]::json[],
          ARRAY[jsonb_build_object('type', 'POINTS', 'description', 'Earn 5 points and get PUSO stablecoins')]::json[],
          NOW(),
          NOW()
        )
      `);

      console.log("✅ PUSO action added successfully");
    }

    // Close the connection
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to add PUSO action:", error);
    process.exit(1);
  }
};

// Run the function
addPusoAction();
