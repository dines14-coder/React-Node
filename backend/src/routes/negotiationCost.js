const express = require('express');
const router = express.Router();
const NegotiationCost = require('../models/NegotiationCost');

// Create or update negotiation cost
router.post('/', async (req, res) => {
  try {
    const { influencerId, reelCost, youtubeShortsCoast, youtubeVideoCost } = req.body;
    const Influencer = require('../models/Influencer');

    const negotiationCost = await NegotiationCost.findOneAndUpdate(
      { influencerId },
      {
        reelCost,
        youtubeShortsCoast,
        youtubeVideoCost,
        status: 'negotiated'
      },
      { upsert: true, new: true }
    );

    // Update influencer negotiation_status to 1
    await Influencer.findByIdAndUpdate(influencerId, {
      negotiation_status: 1
    });

    res.status(200).json({
      success: true,
      data: negotiationCost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all negotiation costs
router.get('/all', async (req, res) => {
  try {
    const negotiationCosts = await NegotiationCost.find({})
      .populate('influencerId');

    res.status(200).json({
      success: true,
      data: negotiationCosts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get negotiation cost by influencer ID
router.get('/:influencerId', async (req, res) => {
  try {
    const negotiationCost = await NegotiationCost.findOne({ 
      influencerId: req.params.influencerId 
    }).populate('influencerId');

    res.status(200).json({
      success: true,
      data: negotiationCost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;