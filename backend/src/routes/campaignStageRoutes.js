const express = require('express');
const router = express.Router();
const campaignStageController = require('../controllers/campaignStageController');

router.post('/', campaignStageController.createCampaignStage);
router.get('/', campaignStageController.getCampaignStages);
router.put('/:id', campaignStageController.updateCampaignStage);
router.delete('/:id', campaignStageController.deleteCampaignStage);

module.exports = router;
