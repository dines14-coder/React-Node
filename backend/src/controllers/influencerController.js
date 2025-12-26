const Influencer = require('../models/Influencer');
const XLSX = require('xlsx');
const { sendConfirmationEmail, sendApprovalEmail, sendRejectionEmail } = require('../services/emailService');

exports.onboard = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);

    // Validate required fields
    const requiredFields = ['email', 'name', 'contactNumber', 'panNumber', 'bankAccountNumber', 'ifscCode', 'holderName', 'bankName'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Calculate influencer types based on follower counts
    const getInfluencerType = (followers) => {
      if (!followers || followers === 0) return '-';
      if (followers >= 10000 && followers < 100000) return 'Micro';
      if (followers >= 100000 && followers < 500000) return 'Macro';
      if (followers >= 500000 && followers < 1000000) return 'Mid-tier';
      if (followers >= 1000000 && followers < 5000000) return 'Mega';
      if (followers >= 5000000) return 'Celeb';
      return 'Lower';
    };

    const instagramFollowers = req.body.instagramFollowers ? parseInt(req.body.instagramFollowers) : null;
    const youtubeFollowers = req.body.youtubeFollowers ? parseInt(req.body.youtubeFollowers) : null;

    // Extract all form data
    const formData = {
      // Basic Information
      email: req.body.email,
      dateOfBirth: req.body.dateOfBirth,
      name: req.body.name,
      location: req.body.location,
      age: parseInt(req.body.age),
      gender: req.body.gender,
      language: req.body.language,
      category: req.body.category,
      brandCollaboration: req.body.brandCollaboration,

      // Contact Information
      instagramLink: req.body.instagramLink,
      youtubeLink: req.body.youtubeLink,
      contactNumber: req.body.contactNumber,
      address: req.body.address,
      pincode: req.body.pincode,
      state: req.body.state,
      city: req.body.city,

      // Platform Information
      platformType: req.body.platformType,
      socialMediaPlatforms: req.body.socialMediaPlatforms,

      // Instagram Details
      reelCost: req.body.reelCost ? parseFloat(req.body.reelCost) : null,
      storyCost: req.body.storyCost ? parseFloat(req.body.storyCost) : null,
      instagramFollowers: instagramFollowers,
      instagramInfluencerType: getInfluencerType(instagramFollowers),
      last10ReelsViews: req.body.last10ReelsViews,
      last10ReelsReach: req.body.last10ReelsReach,
      instagramLikes: req.body.instagramLikes,
      instagramComments: req.body.instagramComments,
      instagramSaves: req.body.instagramSaves,
      instagramShares: req.body.instagramShares,
      instagramReposts: req.body.instagramReposts,

      // YouTube Details
      youtubeVideoCost: req.body.youtubeVideoCost ? parseFloat(req.body.youtubeVideoCost) : null,
      youtubeShortsCost: req.body.youtubeShortsCost ? parseFloat(req.body.youtubeShortsCost) : null,
      youtubeFollowers: youtubeFollowers,
      youtubeInfluencerType: getInfluencerType(youtubeFollowers),
      last10ShortsViews: req.body.last10ShortsViews,
      last10ShortsReach: req.body.last10ShortsReach,
      youtubeLikes: req.body.youtubeLikes,
      youtubeComments: req.body.youtubeComments,
      youtubeSaves: req.body.youtubeSaves,
      youtubeShares: req.body.youtubeShares,

      // Banking Information
      panNumber: req.body.panNumber,
      bankAccountNumber: req.body.bankAccountNumber,
      ifscCode: req.body.ifscCode,
      holderName: req.body.holderName,
      bankName: req.body.bankName,

      // File uploads
      instagramGenderScreenshot: req.files?.instagramGenderScreenshot?.[0]?.filename,
      instagramAgeScreenshot: req.files?.instagramAgeScreenshot?.[0]?.filename,
      instagramDemographyScreenshot: req.files?.instagramDemographyScreenshot?.[0]?.filename,
      panCardImage: req.files?.panCardImage?.[0]?.filename,
      bankPassbookImage: req.files?.bankPassbookImage?.[0]?.filename,
      gstCertificate: req.files?.gstCertificate?.[0]?.filename,

      // Delivery Information
      deliveryAddressSame: req.body.deliveryAddressSame,
      deliveryAddress: req.body.deliveryAddress,

      // Additional Fields
      agreeTerms: req.body.agreeTerms === true || req.body.agreeTerms === 'true',
      remarks: req.body.remarks,
      onboarderId: req.body.onboarderId
    };

    console.log('Form data to save:', formData);

    const influencer = await Influencer.create(formData);

    console.log('Influencer created successfully:', influencer._id);

    const emailResult = await sendConfirmationEmail(influencer.email, influencer.name);

    res.status(201).json({
      status: true,
      message: 'Influencer application submitted successfully!',
      influencer: {
        id: influencer._id,
        name: influencer.name,
        email: influencer.email,
        status: influencer.status
      },
      emailSent: emailResult.success
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    console.error('Error stack:', error.stack);

    // Removed email uniqueness constraint

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: false,
        error: 'Validation failed',
        details: validationErrors
      });
    }

    res.status(500).json({
      status: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const NegotiationCost = require('../models/NegotiationCost');
    const User = require('../models/User');
    
    // Get current user from token
    const currentUser = await User.findById(req.user.id);
    
    let query = { platformType: { $ne: 'Barter' } };
    // If not super_admin, filter by onboarderId
    if (currentUser.role !== 'super_admin') {
      query.onboarderId = req.user.id;
    }
    
    const influencers = await Influencer.find(query)
      .populate('onboarderId', 'name')
      .sort({ createdAt: -1 });
    
    // Get negotiation costs for all influencers
    const influencerIds = influencers.map(inf => inf._id);
    const negotiationCosts = await NegotiationCost.find({
      influencerId: { $in: influencerIds }
    });
    
    // Create a map for quick lookup
    const negotiationCostMap = {};
    negotiationCosts.forEach(nc => {
      negotiationCostMap[nc.influencerId.toString()] = nc;
    });
    
    // Add negotiation cost to each influencer
    const influencersWithNegotiation = influencers.map(inf => {
      const influencerObj = inf.toObject();
      influencerObj.negotiationCost = negotiationCostMap[inf._id.toString()] || null;
      return influencerObj;
    });
    
    return res.status(200).json(influencersWithNegotiation);

  } catch (error) {
    console.error("Get influencers error:", error);
    return res.status(500).json({ error: error.message });
  }
};



exports.getBarterInfluencers = async (req, res) => {
  try {
    const barterInfluencers = await Influencer.find({ platformType: 'Barter' })
      .populate('onboarderId', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      status: true,
      data: barterInfluencers
    });
  } catch (error) {
    console.error('Get barter influencers error:', error);
    res.status(500).json({ error: 'Failed to fetch influencer' });
  }
};

exports.getById = async (req, res) => {
  try {
    const influencer = await Influencer.findById(req.params.id);
    if (!influencer) {
      return res.status(404).json({ error: 'Influencer not found' });
    }
    res.json(influencer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch influencer' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const influencer = await Influencer.findById(id);
    if (!influencer) {
      return res.status(404).json({ error: 'Influencer not found' });
    }

    influencer.status = status;
    await influencer.save();

    let emailResult = { success: false };
    if (status === 'approved') {
      emailResult = await sendApprovalEmail(influencer.email, influencer.name);
    } else if (status === 'rejected') {
      emailResult = await sendRejectionEmail(influencer.email, influencer.name, reason || '');
    }

    res.json({
      status: true,
      message: `Influencer status updated to ${status}`,
      influencer: {
        id: influencer._id,
        name: influencer.name,
        email: influencer.email,
        status: influencer.status
      },
      emailSent: emailResult.success
    });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Failed to update status', message: error.message });
  }
};

exports.exportFiltered = async (req, res) => {
  try {
    const NegotiationCost = require('../models/NegotiationCost');
    const User = require('../models/User');
    
    const currentUser = await User.findById(req.user.id);
    const filters = req.body;
    
    let query = { negotiation_status: 1, platformType: { $ne: 'Barter' } };
    if (currentUser.role !== 'super_admin') {
      query.onboarderId = req.user.id;
    }
    
    // Apply filters
    if (filters.state) query.state = filters.state;
    if (filters.city) query.city = filters.city;
    if (filters.category) query.category = filters.category;
    if (filters.platformType) query.platformType = filters.platformType;
    if (filters.socialMediaPlatforms) {
      if (filters.socialMediaPlatforms === 'Intagram') {
        query.socialMediaPlatforms = { $regex: 'instagram', $options: 'i' };
      } else if (filters.socialMediaPlatforms === 'Youtube') {
        query.socialMediaPlatforms = { $regex: 'youtube', $options: 'i' };
      }
    }
    if (filters.influencerType) {
      query.$or = [
        { instagramInfluencerType: filters.influencerType },
        { youtubeInfluencerType: filters.influencerType }
      ];
    }
    
    const influencers = await Influencer.find(query).populate('onboarderId', 'name email');
    const influencerIds = influencers.map(inf => inf._id);
    const negotiationCosts = await NegotiationCost.find({
      influencerId: { $in: influencerIds }
    });
    
    const negotiationCostMap = {};
    negotiationCosts.forEach(nc => {
      negotiationCostMap[nc.influencerId.toString()] = nc;
    });
    
    // Apply engagement and view filters
    let filteredInfluencers = influencers.filter(influencer => {
      const calculateEngagementRate = (influencer, platform) => {
        if (platform === 'instagram') {
          const likes = Number(influencer.instagramLikes) || 0;
          const comments = Number(influencer.instagramComments) || 0;
          const saves = Number(influencer.instagramSaves) || 0;
          const shares = Number(influencer.instagramShares) || 0;
          const reposts = Number(influencer.instagramReposts) || 0;
          const totalReach = Number(influencer.last10ReelsReach);
          if (!totalReach || isNaN(totalReach)) return 0;
          const avgReach = totalReach / 10;
          return avgReach === 0 ? 0 : ((likes + comments + saves + shares + reposts) / avgReach) * 100;
        } else {
          const likes = Number(influencer.youtubeLikes) || 0;
          const comments = Number(influencer.youtubeComments) || 0;
          const saves = Number(influencer.youtubeSaves) || 0;
          const shares = Number(influencer.youtubeShares) || 0;
          const totalReach = Number(influencer.last10ShortsReach);
          if (!totalReach || isNaN(totalReach)) return 0;
          const avgReach = totalReach / 10;
          return avgReach === 0 ? 0 : ((likes + comments + saves + shares) / avgReach) * 100;
        }
      };
      
      const calculateAverageViews = (influencer, platform) => {
        if (platform === 'instagram') {
          const totalViews = Number(influencer.last10ReelsViews);
          return totalViews && !isNaN(totalViews) ? totalViews / 10 : 0;
        } else {
          const totalViews = Number(influencer.last10ShortsViews);
          return totalViews && !isNaN(totalViews) ? totalViews / 10 : 0;
        }
      };
      
      const instagramEngagement = calculateEngagementRate(influencer, 'instagram');
      const youtubeEngagement = calculateEngagementRate(influencer, 'youtube');
      const instagramViews = calculateAverageViews(influencer, 'instagram');
      const youtubeViews = calculateAverageViews(influencer, 'youtube');
      
      const matchesInstagramEngagement = !filters.engagementRateInstagram || instagramEngagement >= Number(filters.engagementRateInstagram);
      const matchesYoutubeEngagement = !filters.engagementRateYoutube || youtubeEngagement >= Number(filters.engagementRateYoutube);
      const matchesInstagramViews = !filters.averageViewInstagram || instagramViews >= Number(filters.averageViewInstagram);
      const matchesYoutubeViews = !filters.averageViewYoutube || youtubeViews >= Number(filters.averageViewYoutube);
      
      return matchesInstagramEngagement && matchesYoutubeEngagement && matchesInstagramViews && matchesYoutubeViews;
    });
    
    const exportData = filteredInfluencers.map((influencer, index) => {
      const negotiationCost = negotiationCostMap[influencer._id.toString()];
      return {
        'S.No': index + 1,
        'Name': influencer.name,
        'Email': influencer.email,
        'Contact': influencer.contactNumber,
        'State': influencer.state,
        'City': influencer.city,
        'Age': influencer.age,
        'Gender': influencer.gender,
        'Category': influencer.category,
        'Platform Type': influencer.platformType,
        'Social Media Platforms': influencer.socialMediaPlatforms,
        'Instagram Followers': influencer.instagramFollowers || 0,
        'YouTube Followers': influencer.youtubeFollowers || 0,
        'Instagram Type': influencer.instagramInfluencerType || '-',
        'YouTube Type': influencer.youtubeInfluencerType || '-',
        'Reel Cost': influencer.reelCost || 0,
        'Story Cost': influencer.storyCost || 0,
        'YouTube Video Cost': influencer.youtubeVideoCost || 0,
        'YouTube Shorts Cost': influencer.youtubeShortsCost || 0,
        'Negotiated Reel Cost': negotiationCost?.reelCost || 0,
        'Negotiated YouTube Video Cost': negotiationCost?.youtubeVideoCost || 0,
        'Negotiated YouTube Shorts Cost': negotiationCost?.youtubeShortsCoast || 0,
        'Status': influencer.status,
        'Onboarder': influencer.onboarderId?.name || 'N/A',
        'Created Date': new Date(influencer.createdAt).toLocaleDateString()
      };
    });
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Filtered Dashboard Data');
    
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Disposition', 'attachment; filename=filtered_dashboard_data.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.exportAll = async (req, res) => {
  try {
    const NegotiationCost = require('../models/NegotiationCost');
    const User = require('../models/User');
    
    const currentUser = await User.findById(req.user.id);
    
    let query = { platformType: { $ne: 'Barter' } };
    if (currentUser.role !== 'super_admin') {
      query.onboarderId = req.user.id;
    }
    
    const influencers = await Influencer.find(query).populate('onboarderId', 'name email');
    const influencerIds = influencers.map(inf => inf._id);
    const negotiationCosts = await NegotiationCost.find({
      influencerId: { $in: influencerIds }
    });
    
    const negotiationCostMap = {};
    negotiationCosts.forEach(nc => {
      negotiationCostMap[nc.influencerId.toString()] = nc;
    });
    
    const exportData = influencers.map((influencer, index) => {
      const negotiationCost = negotiationCostMap[influencer._id.toString()];
      return {
        'S.No': index + 1,
        'Name': influencer.name,
        'Email': influencer.email,
        'Contact': influencer.contactNumber,
        'Location': influencer.location,
        'Age': influencer.age,
        'Gender': influencer.gender,
        'Category': influencer.category,
        'Platform Type': influencer.platformType,
        'Social Media Platforms': influencer.socialMediaPlatforms,
        'Instagram Followers': influencer.instagramFollowers || 0,
        'YouTube Followers': influencer.youtubeFollowers || 0,
        'Instagram Type': influencer.instagramInfluencerType || '-',
        'YouTube Type': influencer.youtubeInfluencerType || '-',
        'Reel Cost': influencer.reelCost || 0,
        'Story Cost': influencer.storyCost || 0,
        'YouTube Video Cost': influencer.youtubeVideoCost || 0,
        'YouTube Shorts Cost': influencer.youtubeShortsCost || 0,
        'Negotiated Reel Cost': negotiationCost?.reelCost || 0,
        'Negotiated YouTube Video Cost': negotiationCost?.youtubeVideoCost || 0,
        'Negotiated YouTube Shorts Cost': negotiationCost?.youtubeShortsCoast || 0,
        'Negotiation Status': influencer.negotiation_status === 1 ? 'Completed' : 'Pending',
        'Status': influencer.status,
        'Onboarder': influencer.onboarderId?.name || 'N/A',
        'Created Date': new Date(influencer.createdAt).toLocaleDateString(),
        'Instagram Link': influencer.instagramLink || '-',
        'YouTube Link': influencer.youtubeLink || '-',
        'PAN Number': influencer.panNumber,
        'Bank Account': influencer.bankAccountNumber,
        'IFSC Code': influencer.ifscCode,
        'Bank Name': influencer.bankName
      };
    });
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'All Influencers');
    
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Disposition', 'attachment; filename=all_influencers.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};