const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const Influencer = require('../models/Influencer');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

router.get('/pending', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    let query = { negotiation_status: 0, platformType: { $ne: 'Barter' } };
    if (currentUser.role !== 'super_admin') {
      query.onboarderId = req.user.id;
    }

    const pendingInfluencers = await Influencer.find(query);

    res.status(200).json({
      success: true,
      data: pendingInfluencers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


router.get('/completed', authMiddleware, async (req, res) => {
  try {
    const NegotiationCost = require('../models/NegotiationCost');
    const currentUser = await User.findById(req.user.id);

    let query = { negotiation_status: 1, platformType: { $ne: 'Barter' } };
    if (currentUser.role !== 'super_admin') {
      query.onboarderId = req.user.id;
    }

    const completedInfluencers = await Influencer.find(query);
    const influencersWithCosts = await Promise.all(
      completedInfluencers.map(async (influencer) => {
        const negotiationCost = await NegotiationCost.findOne({
          influencerId: influencer._id
        });

        return {
          ...influencer.toObject(),
          negotiationCostData: negotiationCost || null
        };
      })
    );

    res.status(200).json({
      success: true,
      data: influencersWithCosts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/export/pending', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    let query = { negotiation_status: 0, platformType: { $ne: 'Barter' } };
    if (currentUser.role !== 'super_admin') {
      query.onboarderId = req.user.id;
    }

    const pendingInfluencers = await Influencer.find(query).populate('onboarderId', 'name email');

    const exportData = pendingInfluencers.map(influencer => ({
      'Name': influencer.name,
      'Email': influencer.email,
      'Contact': influencer.contactNumber,
      'Location': influencer.location,
      'Age': influencer.age,
      'Gender': influencer.gender,
      'Category': influencer.category,
      'Platform Type': influencer.platformType,
      'Instagram Followers': influencer.instagramFollowers || 0,
      'YouTube Followers': influencer.youtubeFollowers || 0,
      'Reel Cost': influencer.reelCost || 0,
      'Story Cost': influencer.storyCost || 0,
      'YouTube Video Cost': influencer.youtubeVideoCost || 0,
      'YouTube Shorts Cost': influencer.youtubeShortsCost || 0,
      'Status': influencer.status,
      'Onboarder': influencer.onboarderId?.name || 'N/A',
      'Created Date': new Date(influencer.createdAt).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pending Negotiations');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=pending_negotiations.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/export/completed', authMiddleware, async (req, res) => {
  try {
    const NegotiationCost = require('../models/NegotiationCost');
    const currentUser = await User.findById(req.user.id);

    let query = { negotiation_status: 1, platformType: { $ne: 'Barter' } };
    if (currentUser.role !== 'super_admin') {
      query.onboarderId = req.user.id;
    }

    const completedInfluencers = await Influencer.find(query).populate('onboarderId', 'name email');
    const influencersWithCosts = await Promise.all(
      completedInfluencers.map(async (influencer) => {
        const negotiationCost = await NegotiationCost.findOne({
          influencerId: influencer._id
        });
        return { influencer, negotiationCost };
      })
    );

    const exportData = influencersWithCosts.map(({ influencer, negotiationCost }) => ({
      'Name': influencer.name,
      'Email': influencer.email,
      'Contact': influencer.contactNumber,
      'Location': influencer.location,
      'Age': influencer.age,
      'Gender': influencer.gender,
      'Category': influencer.category,
      'Platform Type': influencer.platformType,
      'Instagram Followers': influencer.instagramFollowers || 0,
      'YouTube Followers': influencer.youtubeFollowers || 0,
      'Original Reel Cost': influencer.reelCost || 0,
      'Original Story Cost': influencer.storyCost || 0,
      'Original YouTube Video Cost': influencer.youtubeVideoCost || 0,
      'Original YouTube Shorts Cost': influencer.youtubeShortsCost || 0,
      'Negotiated Reel Cost': negotiationCost?.reelCost || 0,
      'Negotiated YouTube Video Cost': negotiationCost?.youtubeVideoCost || 0,
      'Negotiated YouTube Shorts Cost': negotiationCost?.youtubeShortsCoast || 0,
      'Negotiation Status': negotiationCost?.status || 'N/A',
      'Status': influencer.status,
      'Onboarder': influencer.onboarderId?.name || 'N/A',
      'Created Date': new Date(influencer.createdAt).toLocaleDateString(),
      'Completed Date': new Date(influencer.updatedAt).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Completed Negotiations');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=completed_negotiations.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;