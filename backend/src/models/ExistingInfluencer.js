const mongoose = require('mongoose');

const existingInfluencerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  businessEmail: {
    type: String,
    default: null
  },
  name: {
    type: String,
    required: true
  },
  profileLink: {
    type: String,
    required: true
  },
  market: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'completed'],
    default: 'pending'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignStatus: {
    type: String,
    enum: ['unassigned', 'assigned', 'in_progress', 'completed'],
    default: 'unassigned'
  },
  influencerFormId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Influencer',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ExistingInfluencer', existingInfluencerSchema);