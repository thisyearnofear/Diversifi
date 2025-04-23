import { config } from "dotenv";
import postgres from "postgres";
import { v4 as uuidv4 } from "uuid";

// Load environment variables from .env file
config();

// Function to generate ID based on database type
const generateId = (idType: string) => {
  if (idType === 'uuid') {
    return uuidv4();
  } else {
    // For text type, generate a UUID string
    return uuidv4();
  }
};

// Define all the actions we want in the database
let actions = [
  {
    id: uuidv4(),
    title: "Set Up Farcaster Account",
    description: "Create a Farcaster account and join the decentralized social network",
    category: "SOCIAL",
    chain: "BASE",
    difficulty: "BEGINNER",
    prerequisites: [],
    steps: [
      { title: "Go to Warpcast", description: "Visit warpcast.com" },
      { title: "Connect wallet", description: "Connect your wallet" },
      { title: "Create profile", description: "Set up your profile" }
    ],
    rewards: [
      { type: "POINTS", description: "Access to the Farcaster ecosystem" }
    ],
    proofLabel: "Farcaster Profile URL",
    proofPlaceholder: "https://warpcast.com/yourusername"
  },
  {
    id: uuidv4(),
    title: "Set Up Lens Account",
    description: "Create a Lens account and join the decentralized social network",
    category: "SOCIAL",
    chain: "POLYGON",
    difficulty: "BEGINNER",
    prerequisites: [],
    steps: [
      { title: "Go to onboarding.lens.xyz", description: "Visit the Lens onboarding site" },
      { title: "Connect wallet", description: "Connect your wallet" },
      { title: "Create profile", description: "Set up your profile" }
    ],
    rewards: [
      { type: "POINTS", description: "Access to the Lens ecosystem" }
    ],
    proofLabel: "Lens Profile URL",
    proofPlaceholder: "https://hey.xyz/u/yourusername"
  },
  {
    id: uuidv4(),
    title: "Register on Optimism",
    description: "Register on Stable Station via the Optimism network",
    category: "REGISTRATION",
    chain: "OPTIMISM",
    difficulty: "BEGINNER",
    prerequisites: [],
    steps: [
      { title: "Connect your wallet", description: "Connect your wallet to continue" },
      { title: "Switch to Optimism network", description: "Switch to the Optimism network" },
      { title: "Complete registration", description: "Register with Stable Station" }
    ],
    rewards: [
      { type: "POINTS", description: "Earn 5 points and unlock Optimism stablecoins" }
    ],
    proofLabel: "Transaction Hash",
    proofPlaceholder: "0x..."
  },
  {
    id: uuidv4(),
    title: "Register on Celo",
    description: "Register on Stable Station via the Celo network",
    category: "REGISTRATION",
    chain: "CELO",
    difficulty: "BEGINNER",
    prerequisites: [],
    steps: [
      { title: "Connect your wallet", description: "Connect your wallet to continue" },
      { title: "Switch to Celo network", description: "Switch to the Celo network" },
      { title: "Complete registration", description: "Register with Stable Station" }
    ],
    rewards: [
      { type: "POINTS", description: "Earn 5 points and unlock Celo stablecoins" }
    ],
    proofLabel: "Transaction Hash",
    proofPlaceholder: "0x..."
  },
  {
    id: uuidv4(),
    title: "Register on Polygon",
    description: "Register on Stable Station via the Polygon network",
    category: "REGISTRATION",
    chain: "POLYGON",
    difficulty: "BEGINNER",
    prerequisites: [],
    steps: [
      { title: "Connect your wallet", description: "Connect your wallet to continue" },
      { title: "Switch to Polygon network", description: "Switch to the Polygon network" },
      { title: "Complete registration", description: "Register with Stable Station" }
    ],
    rewards: [
      { type: "POINTS", description: "Earn 5 points and unlock Polygon stablecoins" }
    ],
    proofLabel: "Transaction Hash",
    proofPlaceholder: "0x..."
  },
  {
    id: uuidv4(),
    title: "Register on Base",
    description: "Register on Stable Station via the Base network",
    category: "REGISTRATION",
    chain: "BASE",
    difficulty: "BEGINNER",
    prerequisites: [],
    steps: [
      { title: "Connect your wallet", description: "Connect your wallet to continue" },
      { title: "Switch to Base network", description: "Switch to the Base network" },
      { title: "Complete registration", description: "Register with Stable Station" }
    ],
    rewards: [
      { type: "POINTS", description: "Earn 5 points and unlock Base stablecoins" }
    ],
    proofLabel: "Transaction Hash",
    proofPlaceholder: "0x..."
  },
  {
    id: uuidv4(),
    title: "Get cKES Stablecoins",
    description: "Acquire Kenyan Shilling stablecoins (cKES) on the Celo network",
    category: "STABLECOIN",
    chain: "CELO",
    difficulty: "BEGINNER",
    prerequisites: [],
    steps: [
      { title: "Connect your wallet", description: "Connect your wallet to continue" },
      { title: "Switch to Celo network", description: "Switch to the Celo network" },
      { title: "Swap cUSD for cKES", description: "Swap your cUSD for cKES" }
    ],
    rewards: [
      { type: "POINTS", description: "Earn 5 points and get cKES stablecoins" }
    ],
    proofLabel: "Transaction Hash",
    proofPlaceholder: "0x..."
  },
  {
    id: uuidv4(),
    title: "Get EURA Stablecoins",
    description: "Acquire Euro stablecoins (EURA) on the Optimism network",
    category: "STABLECOIN",
    chain: "OPTIMISM",
    difficulty: "BEGINNER",
    prerequisites: [],
    steps: [
      { title: "Connect your wallet", description: "Connect your wallet to continue" },
      { title: "Switch to Optimism network", description: "Switch to the Optimism network" },
      { title: "Swap ETH for EURA", description: "Swap your ETH for EURA" }
    ],
    rewards: [
      { type: "POINTS", description: "Earn 5 points and get EURA stablecoins" }
    ],
    proofLabel: "Transaction Hash",
    proofPlaceholder: "0x..."
  },
  {
    id: uuidv4(),
    title: "Get cCOP Stablecoins",
    description: "Acquire Colombian Peso stablecoins (cCOP) on the Celo network",
    category: "STABLECOIN",
    chain: "CELO",
    difficulty: "BEGINNER",
    prerequisites: [],
    steps: [
      { title: "Connect your wallet", description: "Connect your wallet to continue" },
      { title: "Switch to Celo network", description: "Switch to the Celo network" },
      { title: "Swap cUSD for cCOP", description: "Swap your cUSD for cCOP" }
    ],
    rewards: [
      { type: "POINTS", description: "Earn 5 points and get cCOP stablecoins" }
    ],
    proofLabel: "Transaction Hash",
    proofPlaceholder: "0x..."
  },
  {
    id: "7b697499-3a5e-4c2f-8d1b-4f5a6b7c8d9e", // Keep the existing ID for PUSO
    title: "Get PUSO Stablecoins",
    description: "Acquire Philippine Peso stablecoins (PUSO) on the Celo network",
    category: "STABLECOIN",
    chain: "CELO",
    difficulty: "BEGINNER",
    prerequisites: [],
    steps: [
      { title: "Connect your wallet", description: "Connect your wallet to continue" },
      { title: "Switch to Celo network", description: "Switch to the Celo network" },
      { title: "Swap cUSD for PUSO", description: "Swap your cUSD for PUSO" }
    ],
    rewards: [
      { type: "POINTS", description: "Earn 5 points and get PUSO stablecoins" }
    ],
    proofLabel: "Transaction Hash",
    proofPlaceholder: "0x..."
  },
  {
    id: uuidv4(),
    title: "Get cUSD Stablecoins",
    description: "Acquire Celo Dollar stablecoins (cUSD) on the Celo network",
    category: "STABLECOIN",
    chain: "CELO",
    difficulty: "BEGINNER",
    prerequisites: [],
    steps: [
      { title: "Connect your wallet", description: "Connect your wallet to continue" },
      { title: "Switch to Celo network", description: "Switch to the Celo network" },
      { title: "Swap CELO for cUSD", description: "Swap your CELO for cUSD" }
    ],
    rewards: [
      { type: "POINTS", description: "Earn 5 points and get cUSD stablecoins" }
    ],
    proofLabel: "Transaction Hash",
    proofPlaceholder: "0x..."
  },
  {
    id: uuidv4(),
    title: "Get DAI Stablecoins",
    description: "Acquire DAI stablecoins on the Polygon network",
    category: "STABLECOIN",
    chain: "POLYGON",
    difficulty: "BEGINNER",
    prerequisites: [],
    steps: [
      { title: "Connect your wallet", description: "Connect your wallet to continue" },
      { title: "Switch to Polygon network", description: "Switch to the Polygon network" },
      { title: "Swap MATIC for DAI", description: "Swap your MATIC for DAI" }
    ],
    rewards: [
      { type: "POINTS", description: "Earn 5 points and get DAI stablecoins" }
    ],
    proofLabel: "Transaction Hash",
    proofPlaceholder: "0x..."
  },
  {
    id: uuidv4(),
    title: "Get USDbC Stablecoins",
    description: "Acquire Bridged USD Coin (USDbC) on the Base network",
    category: "STABLECOIN",
    chain: "BASE",
    difficulty: "BEGINNER",
    prerequisites: [],
    steps: [
      { title: "Connect your wallet", description: "Connect your wallet to continue" },
      { title: "Switch to Base network", description: "Switch to the Base network" },
      { title: "Swap ETH for USDbC", description: "Swap your ETH for USDbC" }
    ],
    rewards: [
      { type: "POINTS", description: "Earn 5 points and get USDbC stablecoins" }
    ],
    proofLabel: "Transaction Hash",
    proofPlaceholder: "0x..."
  }
];

// Define region mappings
const regionMappings = {
  "Get cKES Stablecoins": "Africa",
  "Get EURA Stablecoins": "Europe",
  "Get cCOP Stablecoins": "LatAm",
  "Get PUSO Stablecoins": "Asia",
  "Get cUSD Stablecoins": "Africa",
  "Get DAI Stablecoins": "USA",
  "Get USDbC Stablecoins": "USA"
};

const updateAllActions = async () => {
  if (!process.env.POSTGRES_URL) {
    console.error("❌ POSTGRES_URL is not defined");
    process.exit(1);
  }

  try {
    console.log("⏳ Connecting to database...");
    const connection = postgres(process.env.POSTGRES_URL, { max: 1 });

    // Check if the action_region table exists
    const tableCheck = await connection.unsafe(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'action_region'
      );
    `);

    const actionRegionTableExists = tableCheck[0].exists;

    // Check the type of the id column in the Action table
    const idTypeCheck = await connection.unsafe(`
      SELECT data_type
      FROM information_schema.columns
      WHERE table_name = 'Action'
      AND column_name = 'id';
    `);

    const idType = idTypeCheck[0]?.data_type || 'uuid';
    console.log(`Action.id column type: ${idType}`);

    if (!actionRegionTableExists) {
      console.log("⏳ Creating action_region table...");
      if (idType === 'uuid') {
        await connection.unsafe(`
          CREATE TABLE IF NOT EXISTS "action_region" (
            "actionId" UUID NOT NULL,
            "region" TEXT NOT NULL,
            PRIMARY KEY ("actionId", "region"),
            CONSTRAINT "action_region_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action"("id") ON DELETE CASCADE
          );
        `);
      } else {
        await connection.unsafe(`
          CREATE TABLE IF NOT EXISTS "action_region" (
            "actionId" TEXT NOT NULL,
            "region" TEXT NOT NULL,
            PRIMARY KEY ("actionId", "region"),
            CONSTRAINT "action_region_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action"("id") ON DELETE CASCADE
          );
        `);
      }
    }

    // Get existing actions
    console.log("⏳ Getting existing actions...");
    const existingActions = await connection.unsafe(`
      SELECT * FROM "Action"
    `);

    const existingTitles = existingActions.map((a: any) => a.title);
    console.log("Existing actions:", existingTitles);

    // Update action IDs based on the database type
    actions = actions.map(action => ({
      ...action,
      id: action.id === "7b697499-3a5e-4c2f-8d1b-4f5a6b7c8d9e" ? action.id : generateId(idType)
    }));

    // Process each action
    for (const action of actions) {
      const existingAction = existingActions.find((a: any) => a.title === action.title);

      if (existingAction) {
        console.log(`⏳ Updating action: ${action.title}`);

        // Update the existing action
        await connection.unsafe(`
          UPDATE "Action" SET
            "description" = $1,
            "category" = $2,
            "chain" = $3,
            "difficulty" = $4,
            "prerequisites" = ARRAY[]::json[],
            "steps" = ARRAY[${action.steps.map((_, i) => `$${5 + i}::json`).join(', ')}]::json[],
            "rewards" = ARRAY[${action.rewards.map((_, i) => `$${5 + action.steps.length + i}::json`).join(', ')}]::json[],
            "updatedAt" = NOW()
          WHERE "title" = $${5 + action.steps.length + action.rewards.length}
        `, [
          action.description,
          action.category,
          action.chain,
          action.difficulty,
          ...action.steps.map(step => JSON.stringify(step)),
          ...action.rewards.map(reward => JSON.stringify(reward)),
          action.title
        ]);
      } else {
        console.log(`⏳ Adding new action: ${action.title}`);

        // Add the new action
        if (idType === 'uuid') {
          await connection.unsafe(`
            INSERT INTO "Action" (
              "id", "title", "description", "category", "chain", "difficulty",
              "prerequisites", "steps", "rewards", "createdAt", "updatedAt"
            ) VALUES (
              $1, $2, $3, $4, $5, $6,
              ARRAY[]::json[],
              ARRAY[${action.steps.map((_, i) => `$${7 + i}::json`).join(', ')}]::json[],
              ARRAY[${action.rewards.map((_, i) => `$${7 + action.steps.length + i}::json`).join(', ')}]::json[],
              NOW(), NOW()
            )
          `, [
            action.id,
            action.title,
            action.description,
            action.category,
            action.chain,
            action.difficulty,
            ...action.steps.map(step => JSON.stringify(step)),
            ...action.rewards.map(reward => JSON.stringify(reward))
          ]);
        } else {
          await connection.unsafe(`
            INSERT INTO "Action" (
              "id", "title", "description", "category", "chain", "difficulty",
              "prerequisites", "steps", "rewards", "createdAt", "updatedAt"
            ) VALUES (
              $1, $2, $3, $4, $5, $6,
              ARRAY[]::json[],
              ARRAY[${action.steps.map((_, i) => `$${7 + i}::json`).join(', ')}]::json[],
              ARRAY[${action.rewards.map((_, i) => `$${7 + action.steps.length + i}::json`).join(', ')}]::json[],
              NOW(), NOW()
            )
          `, [
            action.id,
            action.title,
            action.description,
            action.category,
            action.chain,
            action.difficulty,
            ...action.steps.map(step => JSON.stringify(step)),
            ...action.rewards.map(reward => JSON.stringify(reward))
          ]);
        }
      }

      // Add region mapping if applicable
      if (regionMappings[action.title as keyof typeof regionMappings] && actionRegionTableExists) {
        const region = regionMappings[action.title as keyof typeof regionMappings];
        const actionId = existingAction ? existingAction.id : action.id;

        console.log(`⏳ Adding region mapping: ${action.title} -> ${region}`);

        // Check if mapping already exists
        const existingMapping = await connection.unsafe(`
          SELECT * FROM "action_region"
          WHERE "actionId" = $1 AND "region" = $2
        `, [actionId, region]);

        if (existingMapping.length === 0) {
          await connection.unsafe(`
            INSERT INTO "action_region" ("actionId", "region")
            VALUES ($1, $2)
            ON CONFLICT ("actionId", "region") DO NOTHING
          `, [actionId, region]);
        }
      }
    }

    // Update the proof fields in the database
    console.log("⏳ Updating proof fields...");
    for (const action of actions) {
      if (action.proofLabel && action.proofPlaceholder) {
        await connection.unsafe(`
          UPDATE "Action" SET
            "proofFieldLabel" = $1,
            "proofFieldPlaceholder" = $2
          WHERE "title" = $3
        `, [
          action.proofLabel,
          action.proofPlaceholder,
          action.title
        ]);
      }
    }

    console.log("✅ All actions updated successfully");

    // List all actions to verify
    const updatedActions = await connection.unsafe(`
      SELECT id, title, description, category, chain FROM "Action" ORDER BY title
    `);

    console.log("✅ Updated actions in database:");
    updatedActions.forEach((row: any) => {
      console.log(`- ${row.title} (${row.chain}): ${row.description}`);
    });

    // Close the connection
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to update actions:", error);
    process.exit(1);
  }
};

// Run the function
updateAllActions();
