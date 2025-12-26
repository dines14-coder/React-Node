const mongoose = require('mongoose');

const marketingSchema = new mongoose.Schema({
  onboarderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Basic Information
  brand: { type: String },
  product: { type: String },
  campaignTitle: { type: String },
  description: { type: String },

  // File Upload
  fileUpload: { type: String }, // File path for uploaded document

  // Status (0 or 1)
  status: {
    type: Number,
    enum: [0, 1],
    default: 1
  }
}, { timestamps: true });

module.exports = mongoose.model('Marketing', marketingSchema);