const mongoose = require('mongoose');

const negotiationCostSchema = new mongoose.Schema({
  influencerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Influencer',
    required: true,
    unique: true
  },
  reelCost: {
    type: Number,
    default: 0
  },
  youtubeShortsCoast: {
    type: Number,
    default: 0
  },
  youtubeVideoCost: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'negotiated'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('NegotiationCost', negotiationCostSchema);