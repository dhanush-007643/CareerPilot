const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { runSeeder } = require('../utils/seeder');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/careerpilot';

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoURI);
    }
    console.log('MongoDB Connected successfully.');

    console.log('Running database seeder pipeline...');
    const result = await runSeeder();
    console.log('Database seeded successfully:', result);

    console.log('Seeding process completed successfully! 🎉');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    if (mongoose.connection) mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();
