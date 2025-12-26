const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
    description: { type: String },
    categoryId: { type: String },
    link: { type: String },
    priceCost: { type: Number },
    active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
