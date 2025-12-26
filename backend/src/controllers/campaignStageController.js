const CampaignStage = require('../models/CampaignStage');

exports.createCampaignStage = async (req, res) => {
    try {
        const stage = new CampaignStage(req.body);
        await stage.save();
        res.status(201).json(stage);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getCampaignStages = async (req, res) => {
    try {
        const stages = await CampaignStage.find().sort({ createdAt: -1 });
        res.json(stages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateCampaignStage = async (req, res) => {
    try {
        const stage = await CampaignStage.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!stage) return res.status(404).json({ error: 'Campaign Stage not found' });
        res.json(stage);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteCampaignStage = async (req, res) => {
    try {
        const stage = await CampaignStage.findByIdAndDelete(req.params.id);
        if (!stage) return res.status(404).json({ error: 'Campaign Stage not found' });
        res.json({ message: 'Campaign Stage deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
