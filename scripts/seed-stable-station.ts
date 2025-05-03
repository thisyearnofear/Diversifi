import { config } from 'dotenv';
import { seedStableStationActions } from '../lib/db/seeds/stable-station-action';

// Load environment variables from .env file
config();

async function main() {
  try {
    console.log('Starting to seed Stable Station actions...');
    await seedStableStationActions();
    console.log('Successfully seeded Stable Station actions!');
  } catch (error) {
    console.error('Error seeding Stable Station actions:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
