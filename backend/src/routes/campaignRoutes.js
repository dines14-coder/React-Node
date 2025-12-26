const express = require('express');
const router = express.Router();
const { createCampaign, getAllCampaigns, getCampaignById, updateCampaign, getCampaignInfluencers, getCampaignShortlistedInfluencers, getCampaignApprovedInfluencers, updateInfluencerFinalCosts, updateInfluencerEmpanelment, updateBudgetRelease, updatePODispatch, updateProductRequirement, updateContentCoordination, updateLogisticsTracking, updateContentSection, updateAssetCollection, updateBillingConfirmation } = require('../controllers/campaignController');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');

const campaignFile = [
    { name: 'strategyDocument', maxCount: 1 },
    { name: 'campaignBrief', maxCount: 1 },
    { name: 'uploadPO', maxCount: 1 },
    { name: 'ndaDocument', maxCount: 1 },
    { name: 'assetCollectionFile', maxCount: 1 }
]

router.post('/campaign', authMiddleware, createCampaign);
router.get('/campaign', authMiddleware, getAllCampaigns);
router.get('/campaign/:id', authMiddleware, getCampaignById);
router.get('/campaign/:id/influencers', authMiddleware, getCampaignInfluencers);
router.get('/campaign/:id/shortlisted-influencers', authMiddleware, getCampaignShortlistedInfluencers);
router.get('/campaign/:id/approved-influencers', authMiddleware, getCampaignApprovedInfluencers);
router.put('/campaign/:id/final-costs', authMiddleware, updateInfluencerFinalCosts);
router.put('/campaign/:id/empanelment', authMiddleware, upload.single('ndaDocument'), updateInfluencerEmpanelment);
router.put('/campaign/:id/budget-release', authMiddleware, updateBudgetRelease);
router.put('/campaign/:id/po-dispatch', authMiddleware, updatePODispatch);
router.put('/campaign/:id/billing-confirmation', authMiddleware, updateBillingConfirmation);
router.put('/campaign/:id/asset-collection', authMiddleware, updateAssetCollection);
router.put('/campaign/:id/content-section', authMiddleware, updateContentSection);
router.put('/campaign/:id/logistics-tracking', authMiddleware, updateLogisticsTracking);
router.put('/campaign/:id/content-coordination', authMiddleware, updateContentCoordination);
router.put('/campaign/:id/product-requirement', authMiddleware, updateProductRequirement);
router.put('/campaign/:id', authMiddleware, upload.fields(campaignFile), updateCampaign);

module.exports = router;