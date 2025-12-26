const Campaign = require('../models/Campaign');
const Influencer = require('../models/Influencer');

exports.createCampaign = async (req, res) => {
    try {
        const { name } = req.body;
        const campaign = await Campaign.create({
            campaignName: name,
            status: 1,
            stageStatus: 1
        });
        res.status(201).json(campaign);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getCampaignInfluencers = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id).select('influencerList');
        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Campaign not found' });
        }
        
        const influencers = await Influencer.find({ _id: { $in: campaign.influencerList } });
        res.status(200).json({ success: true, data: influencers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCampaignShortlistedInfluencers = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id).select('influencerShortList');
        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Campaign not found' });
        }
        
        const influencers = await Influencer.find({ _id: { $in: campaign.influencerShortList } });
        res.status(200).json({ success: true, data: influencers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCampaignApprovedInfluencers = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id)
            .select('influencerApproveList influencerNegotiation')
            .populate('influencerNegotiation.influencerId', 'name reelCost');
        
        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Campaign not found' });
        }
        
        const influencers = await Influencer.find({ _id: { $in: campaign.influencerApproveList } });
        
        // Merge negotiation costs with influencer data
        const influencersWithCosts = influencers.map(influencer => {
            const negotiation = campaign.influencerNegotiation && campaign.influencerNegotiation.find(
                neg => neg.influencerId.toString() === influencer._id.toString()
            );
            
            return {
                ...influencer.toObject(),
                finalCost: negotiation ? negotiation.negotiationCost : influencer.reelCost || 0
            };
        });
        
        res.status(200).json({ success: true, data: influencersWithCosts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateInfluencerFinalCosts = async (req, res) => {
    try {
        const { finalCosts, status = 1 } = req.body;
        const campaign = await Campaign.findById(req.params.id);
        
        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Campaign not found' });
        }

        // Update or create negotiation records for each influencer
        for (const cost of finalCosts) {
            const existingNegotiation = campaign.influencerNegotiation.find(
                neg => neg.influencerId.toString() === cost.influencerId
            );

            if (existingNegotiation) {
                existingNegotiation.negotiationCost = cost.finalCost;
                existingNegotiation.status = status;
            } else {
                campaign.influencerNegotiation.push({
                    influencerId: cost.influencerId,
                    negotiationCost: cost.finalCost,
                    status: status
                });
            }
        }

        // Update campaign stageStatus to 8 when final save (status = 1)
        if (status === 1) {
            campaign.stageStatus = 8;
        }

        await campaign.save();
        const message = status === 0 ? 'Draft saved successfully' : 'Final costs updated successfully';
        res.status(200).json({ success: true, message });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateInfluencerEmpanelment = async (req, res) => {
    try {
        const { empanelmentData, stageStatus } = req.body;
        const campaign = await Campaign.findById(req.params.id);
        
        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Campaign not found' });
        }

        // Update or create empanelment records for each influencer
        for (const data of empanelmentData) {
            const existingEmpanelment = campaign.influencerEmpanelment.find(
                emp => emp.influencerId.toString() === data.influencerId
            );

            if (existingEmpanelment) {
                existingEmpanelment.ndaSigned = data.ndaSigned;
                existingEmpanelment.brandGuidelines = data.brandGuidelines;
                existingEmpanelment.influencerDetails = data.influencerDetails;
                if (data.ndaDocument) existingEmpanelment.ndaDocument = data.ndaDocument;
                existingEmpanelment.status = 1;
            } else {
                campaign.influencerEmpanelment.push({
                    influencerId: data.influencerId,
                    ndaSigned: data.ndaSigned,
                    brandGuidelines: data.brandGuidelines,
                    influencerDetails: data.influencerDetails,
                    ndaDocument: data.ndaDocument || null,
                    status: 1
                });
            }
        }

        // Update campaign stageStatus if provided
        if (stageStatus) {
            campaign.stageStatus = stageStatus;
        }

        await campaign.save();
        res.status(200).json({ success: true, message: 'Empanelment data updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateBudgetRelease = async (req, res) => {
    try {
        const { budgetData, stageStatus } = req.body;
        const campaign = await Campaign.findById(req.params.id);
        
        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Campaign not found' });
        }

        // Update or create budget release records for each influencer
        for (const data of budgetData) {
            const existingBudget = campaign.budgetRelease.find(
                budget => budget.influencerId.toString() === data.influencerId
            );

            if (existingBudget) {
                existingBudget.cost = data.cost;
                existingBudget.budgetRelease = data.budgetRelease;
                existingBudget.releaseDate = data.releaseDate;
                existingBudget.status = 1;
            } else {
                campaign.budgetRelease.push({
                    influencerId: data.influencerId,
                    cost: data.cost,
                    budgetRelease: data.budgetRelease,
                    releaseDate: data.releaseDate,
                    status: 1
                });
            }
        }

        // Update campaign stageStatus if provided
        if (stageStatus) {
            campaign.stageStatus = stageStatus;
        }

        await campaign.save();
        res.status(200).json({ success: true, message: 'Budget release data updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updatePODispatch = async (req, res) => {
    try {
        const { poData, stageStatus } = req.body;
        const campaign = await Campaign.findById(req.params.id);
        
        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Campaign not found' });
        }

        // Update or create PO dispatch records for each influencer
        for (const data of poData) {
            const existingPO = campaign.PODispatch.find(
                po => po.influencerId.toString() === data.influencerId
            );

            if (existingPO) {
                existingPO.uploadPO = data.uploadPO;
                existingPO.sentToInfluencer = data.sentToInfluencer;
                existingPO.status = 1;
            } else {
                campaign.PODispatch.push({
                    influencerId: data.influencerId,
                    uploadPO: data.uploadPO,
                    sentToInfluencer: data.sentToInfluencer,
                    status: 1
                });
            }
        }

        // Update campaign stageStatus if provided
        if (stageStatus) {
            campaign.stageStatus = stageStatus;
        }

        await campaign.save();
        res.status(200).json({ success: true, message: 'PO dispatch data updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProductRequirement = async (req, res) => {
    try {
        const { productData, stageStatus } = req.body;
        const campaign = await Campaign.findById(req.params.id);
        
        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Campaign not found' });
        }

        // Update or create product requirement records for each influencer
        for (const data of productData) {
            const existingProduct = campaign.productRequirement.find(
                prod => prod.influencerId.toString() === data.influencerId
            );

            if (existingProduct) {
                existingProduct.productCount = data.productCount;
                existingProduct.address = data.address;
                existingProduct.sentToInfluencer = data.sentToInfluencer;
                existingProduct.status = 1;
            } else {
                campaign.productRequirement.push({
                    influencerId: data.influencerId,
                    productCount: data.productCount,
                    address: data.address,
                    sentToInfluencer: data.sentToInfluencer,
                    status: 1
                });
            }
        }

        // Update campaign stageStatus if provided
        if (stageStatus) {
            campaign.stageStatus = stageStatus;
        }

        await campaign.save();
        res.status(200).json({ success: true, message: 'Product requirement data updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateContentCoordination = async (req, res) => {
    try {
        const { contentData, stageStatus } = req.body;
        const campaign = await Campaign.findById(req.params.id);
        
        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Campaign not found' });
        }

        // Update or create content coordination records for each influencer
        for (const data of contentData) {
            const existingContent = campaign.contentCoordination.find(
                content => content.influencerId.toString() === data.influencerId
            );

            if (existingContent) {
                existingContent.contentApproved = data.contentApproved;
                existingContent.whatsappLink = data.whatsappLink;
                existingContent.status = 1;
            } else {
                campaign.contentCoordination.push({
                    influencerId: data.influencerId,
                    contentApproved: data.contentApproved,
                    whatsappLink: data.whatsappLink,
                    status: 1
                });
            }
        }

        // Update campaign stageStatus if provided
        if (stageStatus) {
            campaign.stageStatus = stageStatus;
        }

        await campaign.save();
        res.status(200).json({ success: true, message: 'Content coordination data updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateLogisticsTracking = async (req, res) => {
    try {
        const { logisticsData, stageStatus } = req.body;
        const campaign = await Campaign.findById(req.params.id);
        
        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Campaign not found' });
        }

        // Update or create logistics tracking records for each influencer
        for (const data of logisticsData) {
            const existingLogistics = campaign.logisticsTracking.find(
                logistics => logistics.influencerId.toString() === data.influencerId
            );

            if (existingLogistics) {
                existingLogistics.dispatchDate = data.dispatchDate;
                existingLogistics.ETADate = data.ETADate;
                existingLogistics.ActualArrivalDate = data.ActualArrivalDate;
                existingLogistics.status = 1;
            } else {
                campaign.logisticsTracking.push({
                    influencerId: data.influencerId,
                    dispatchDate: data.dispatchDate,
                    ETADate: data.ETADate,
                    ActualArrivalDate: data.ActualArrivalDate,
                    status: 1
                });
            }
        }

        // Update campaign stageStatus if provided
        if (stageStatus) {
            campaign.stageStatus = stageStatus;
        }

        await campaign.save();
        res.status(200).json({ success: true, message: 'Logistics tracking data updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateContentSection = async (req, res) => {
    try {
        const { contentData, stageStatus } = req.body;
        const campaign = await Campaign.findById(req.params.id);
        
        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Campaign not found' });
        }

        // Update or create content section records for each influencer
        for (const data of contentData) {
            const existingContent = campaign.contentSection.find(
                content => content.influencerId.toString() === data.influencerId
            );

            if (existingContent) {
                existingContent.contentFirstDraft = data.contentFirstDraft;
                existingContent.AIEvaluation = data.AIEvaluation;
                existingContent.campaignManagerApproval = data.campaignManagerApproval;
                existingContent.influencerManagerApproval = data.influencerManagerApproval;
                existingContent.contentLink = data.contentLink;
                existingContent.status = 1;
            } else {
                campaign.contentSection.push({
                    influencerId: data.influencerId,
                    contentFirstDraft: data.contentFirstDraft,
                    AIEvaluation: data.AIEvaluation,
                    campaignManagerApproval: data.campaignManagerApproval,
                    influencerManagerApproval: data.influencerManagerApproval,
                    contentLink: data.contentLink,
                    status: 1
                });
            }
        }

        // Update campaign stageStatus if provided
        if (stageStatus) {
            campaign.stageStatus = stageStatus;
        }

        await campaign.save();
        res.status(200).json({ success: true, message: 'Content section data updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateAssetCollection = async (req, res) => {
    try {
        const { assetData, stageStatus } = req.body;
        const campaign = await Campaign.findById(req.params.id);
        
        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Campaign not found' });
        }

        // Update or create asset collection records for each influencer
        for (const data of assetData) {
            const existingAsset = campaign.assetCollection.find(
                asset => asset.influencerId.toString() === data.influencerId
            );

            if (existingAsset) {
                existingAsset.assetCollectionFile = data.assetCollectionFile;
                existingAsset.status = 1;
            } else {
                campaign.assetCollection.push({
                    influencerId: data.influencerId,
                    assetCollectionFile: data.assetCollectionFile,
                    status: 1
                });
            }
        }

        // Update campaign stageStatus if provided
        if (stageStatus) {
            campaign.stageStatus = stageStatus;
        }

        await campaign.save();
        res.status(200).json({ success: true, message: 'Asset collection data updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateBillingConfirmation = async (req, res) => {
    try {
        const { billingData, stageStatus } = req.body;
        const campaign = await Campaign.findById(req.params.id);
        
        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Campaign not found' });
        }

        // Update or create billing confirmation records for each influencer
        for (const data of billingData) {
            const existingBilling = campaign.billingConfirmation.find(
                billing => billing.influencerId.toString() === data.influencerId
            );

            if (existingBilling) {
                existingBilling.billingSent = data.billingSent;
                existingBilling.billingNumber = data.billingNumber;
                existingBilling.billingVerified = data.billingVerified;
                existingBilling.status = 1;
            } else {
                campaign.billingConfirmation.push({
                    influencerId: data.influencerId,
                    billingSent: data.billingSent,
                    billingNumber: data.billingNumber,
                    billingVerified: data.billingVerified,
                    status: 1
                });
            }
        }

        // Update campaign stageStatus if provided
        if (stageStatus) {
            campaign.stageStatus = stageStatus;
        }

        await campaign.save();
        res.status(200).json({ success: true, message: 'Billing confirmation data updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find()
            .populate('brand', 'name')
            .populate('product', 'productName')
            .populate('influencerList', 'name instagramId followers')
            .populate('influencerShortList', 'name instagramId followers')
            .populate('influencerApproveList', 'name instagramId followers')
            .populate('influencerNegotiation.influencerId', 'name instagramId followers')
            .populate('influencerEmpanelment.influencerId', 'name instagramId')
            .populate('budgetRelease.influencerId', 'name instagramId')
            .populate('PODispatch.influencerId', 'name instagramId')
            .populate('productRequirement.influencerId', 'name instagramId')
            .populate('contentCoordination.influencerId', 'name instagramId')
            .populate('logisticsTracking.influencerId', 'name instagramId')
            .populate('contentSection.influencerId', 'name instagramId')
            .populate('assetCollection.influencerId', 'name instagramId')
            .populate('billingConfirmation.influencerId', 'name instagramId')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: campaigns.length,
            data: campaigns
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getCampaignById = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id)
            .populate('brand', 'name')
            .populate('product', 'name')
            .populate('influencerList', 'name instagramId followers')
            .populate('influencerShortList', 'name instagramId followers')
            .populate('influencerApproveList', 'name instagramId followers')
            .populate('influencerNegotiation.influencerId', 'name instagramId followers')
            .populate('influencerEmpanelment.influencerId', 'name instagramId')
            .populate('budgetRelease.influencerId', 'name instagramId')
            .populate('PODispatch.influencerId', 'name instagramId')
            .populate('productRequirement.influencerId', 'name instagramId')
            .populate('contentCoordination.influencerId', 'name instagramId')
            .populate('logisticsTracking.influencerId', 'name instagramId')
            .populate('contentSection.influencerId', 'name instagramId')
            .populate('assetCollection.influencerId', 'name instagramId')
            .populate('billingConfirmation.influencerId', 'name instagramId');

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        res.status(200).json({
            success: true,
            data: campaign
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateCampaign = async (req, res) => {
    try {
        const updateData = { ...req.body };


        if (req.files) {
            if (req.files.strategyDocument) {
                updateData.strategyDocument = req.files.strategyDocument[0].filename;
            }
            if (req.files.campaignBrief) {
                updateData.campaignBrief = req.files.campaignBrief[0].filename;
            }
            if (req.files.uploadPO) {
                updateData['PODispatch.uploadPO'] = req.files.uploadPO[0].filename;
            }
            if (req.files.ndaDocument) {
                updateData['influencerEmpanelment.ndaDocument'] = req.files.ndaDocument[0].filename;
            }
            if (req.files.assetCollectionFile) {
                updateData['assetCollection.assetCollectionFile'] = req.files.assetCollectionFile[0].filename;
            }
        }

        updateData.status = 1;

        const campaign = await Campaign.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        res.status(200).json({
            success: true,
            data: campaign
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getPendingCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find({ status: 1 })
            .populate('brand', 'name')
            .populate('product', 'productName')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: campaigns.length,
            data: campaigns
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};