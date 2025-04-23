import { config } from "dotenv";
import postgres from "postgres";

// Load environment variables from .env file
config();

const addProofFields = async () => {
  if (!process.env.POSTGRES_URL) {
    console.error("❌ POSTGRES_URL is not defined");
    process.exit(1);
  }

  try {
    console.log("⏳ Connecting to database...");
    const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
    
    // Check if columns already exist
    console.log("⏳ Checking if proof field columns exist...");
    const columns = await connection.unsafe(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Action'
      AND column_name IN ('proofFieldLabel', 'proofFieldPlaceholder')
    `);
    
    const existingColumns = columns.map((col: any) => col.column_name);
    
    // Add columns if they don't exist
    if (!existingColumns.includes('proofFieldLabel')) {
      console.log("⏳ Adding proofFieldLabel column...");
      await connection.unsafe(`
        ALTER TABLE "Action" ADD COLUMN "proofFieldLabel" TEXT
      `);
    } else {
      console.log("✅ proofFieldLabel column already exists");
    }
    
    if (!existingColumns.includes('proofFieldPlaceholder')) {
      console.log("⏳ Adding proofFieldPlaceholder column...");
      await connection.unsafe(`
        ALTER TABLE "Action" ADD COLUMN "proofFieldPlaceholder" TEXT
      `);
    } else {
      console.log("✅ proofFieldPlaceholder column already exists");
    }
    
    // Define proof field mappings for different action types
    const proofFieldMappings = [
      {
        condition: `"category" = 'STABLECOIN'`,
        label: 'Transaction Hash',
        placeholder: '0x...'
      },
      {
        condition: `"title" = 'Set Up Lens Account'`,
        label: 'Lens Profile URL',
        placeholder: 'https://hey.xyz/u/yourusername'
      },
      {
        condition: `"title" = 'Set Up Farcaster Account'`,
        label: 'Farcaster Profile URL',
        placeholder: 'https://warpcast.com/yourusername'
      },
      {
        condition: `"category" = 'REGISTRATION'`,
        label: 'Transaction Hash',
        placeholder: '0x...'
      }
    ];
    
    // Update proof fields for each mapping
    for (const mapping of proofFieldMappings) {
      console.log(`⏳ Updating proof fields for ${mapping.condition}...`);
      await connection.unsafe(`
        UPDATE "Action" 
        SET 
          "proofFieldLabel" = '${mapping.label}',
          "proofFieldPlaceholder" = '${mapping.placeholder}'
        WHERE ${mapping.condition}
      `);
    }
    
    // Verify the updates
    console.log("⏳ Verifying updates...");
    const actions = await connection.unsafe(`
      SELECT "title", "category", "proofFieldLabel", "proofFieldPlaceholder"
      FROM "Action"
      ORDER BY "title"
    `);
    
    console.log("✅ Updated actions:");
    actions.forEach((action: any) => {
      console.log(`- ${action.title} (${action.category}): Label: "${action.proofFieldLabel}", Placeholder: "${action.proofFieldPlaceholder}"`);
    });
    
    // Close the connection
    await connection.end();
    console.log("✅ Proof fields added and updated successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to add proof fields");
    console.error(error);
    process.exit(1);
  }
};

addProofFields();
