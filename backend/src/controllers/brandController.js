const Brand = require('../models/Brand');

exports.createBrand = async (req, res) => {
    try {
        const brand = await Brand.create(req.body);
        res.status(201).json(brand);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getBrands = async (req, res) => {
    try {
        const brands = await Brand.find({ active: true }).sort({ createdAt: -1 });
        res.json(brands);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateBrand = async (req, res) => {
    try {
        const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(brand);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteBrand = async (req, res) => {
    try {
        await Brand.findByIdAndUpdate(req.params.id, { active: false });
        res.json({ message: 'Brand deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
