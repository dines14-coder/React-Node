const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const negotiationCostRoutes = require('./routes/negotiationCost');
const negotiationRoutes = require('./routes/negotiationRoutes');
const existingInfluencerRoutes = require('./routes/existingInfluencerRoutes');
const marketingRoutes = require('./routes/marketingRoutes');
const brandRoutes = require('./routes/brandRoutes');
const productRoutes = require('./routes/productRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const campaignStageRoutes = require('./routes/campaignStageRoutes');
const errorHandler = require('./middleware/errorHandler');
const Auth = require('./models/Auth');
// Multer dependency installed

const app = express();

// Connect to MongoDB
connectDB().then(async () => {
  // Drop unique email index if it exists
  try {
    const Influencer = require('./models/Influencer');
    await Influencer.collection.dropIndex('email_1');
    console.log('Dropped unique email index');
  } catch (error) {
    console.log('Email index not found or already dropped');
  }

  // Seed admin users
  // Auth.seedUsers();
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('src/uploads'));
app.use('/api', userRoutes);
app.use('/api/negotiation-cost', negotiationCostRoutes);
app.use('/api/negotiation', negotiationRoutes);
app.use('/api/existing-influencers', existingInfluencerRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/products', productRoutes);
app.use('/api/campaign-stages', campaignStageRoutes);
app.use('/api', campaignRoutes);
app.use(errorHandler);

module.exports = app;