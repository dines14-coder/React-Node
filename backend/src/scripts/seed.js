require('dotenv').config();
const connectDB = require('../config/database');
const Auth = require('../models/Auth');

const runSeed = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting seed process...');
    
    await Auth.seedUsers();
    console.log('✅ Users seeded successfully');
    
    console.log('🎉 Seed completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

// runSeed();