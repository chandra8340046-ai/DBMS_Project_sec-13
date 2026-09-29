import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import Property from '../models/Property.js';
import User from '../models/User.js';
import { sampleProperties } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

export const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/estatex';
    console.log(`[Seed] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('[Seed] Clearing existing properties...');
    await Property.deleteMany({});

    console.log(`[Seed] Inserting ${sampleProperties.length} initial properties...`);
    const createdProperties = await Property.insertMany(sampleProperties);

    console.log(`✅ [Seed] Successfully seeded ${createdProperties.length} properties!`);
    return createdProperties;
  } catch (error) {
    console.error(`❌ [Seed] Error seeding database: ${error.message}`);
    throw error;
  }
};

// If run directly from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase()
    .then(() => {
      console.log('Seeding finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
