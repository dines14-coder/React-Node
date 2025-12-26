const mongoose = require('mongoose');

const influencerSchema = new mongoose.Schema({
  onboarderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  // Basic Information
  email: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true, enum: ['male', 'female', 'other'] },
  language: { type: String, required: true },
  category: { type: String, required: true},
  brandCollaboration: { type: String },
  
  // Contact Information
  instagramLink: { type: String },
  youtubeLink: { type: String },
  contactNumber: { type: String, required: true },
  address: { type: String, required: true },
  pincode: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  
  // Platform Information
  platformType: { type: String, enum: ['Paid', 'Barter'], default: 'Paid' },
  socialMediaPlatforms: { type: String },
  
  // Instagram Details
  reelCost: { type: Number },
  storyCost: { type: Number },
  instagramFollowers: { type: Number },
  instagramInfluencerType: { type: String, enum: ['Lower', 'Micro', 'Macro', 'Mid-tier', 'Mega', 'Celeb', '-'], default: '-' },
  instagramGenderScreenshot: { type: String }, // File path
  instagramAgeScreenshot: { type: String }, // File path
  instagramDemographyScreenshot: { type: String }, // File path
  last10ReelsViews: { type: String },
  last10ReelsReach: { type: String },
  instagramLikes: { type: String },
  instagramComments: { type: String },
  instagramSaves: { type: String },
  instagramShares: { type: String },
  instagramReposts: { type: String },
  
  // YouTube Details
  youtubeVideoCost: { type: Number },
  youtubeShortsCost: { type: Number },
  youtubeFollowers: { type: Number },
  youtubeInfluencerType: { type: String, enum: ['Lower', 'Micro', 'Macro', 'Mid-tier', 'Mega', 'Celeb', '-'], default: '-' },
  last10ShortsViews: { type: String },
  last10ShortsReach: { type: String },
  youtubeLikes: { type: String },
  youtubeComments: { type: String },
  youtubeSaves: { type: String },
  youtubeShares: { type: String },
  
  // Banking Information
  panNumber: { type: String, required: true },
  panCardImage: { type: String }, // File path
  bankAccountNumber: { type: String, required: true },
  ifscCode: { type: String, required: true },
  holderName: { type: String, required: true },
  bankName: { type: String, required: true },
  bankPassbookImage: { type: String }, // File path
  gstCertificate: { type: String }, // File path
  
  // Delivery Information
  deliveryAddressSame: { type: String, enum: ['yes', 'no'], default: 'yes' },
  deliveryAddress: { type: String },
  
  // Additional Fields
  agreeTerms: { type: Boolean, required: true, default: false },
  remarks: { type: String },
  
  // Status
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  negotiation_status: { type: Number, enum: [0, 1], default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Influencer', influencerSchema);