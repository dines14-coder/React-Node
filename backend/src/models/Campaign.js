const mongoose = require('mongoose');


const influencerNegotiationSchema = new mongoose.Schema(
    {
        influencerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Influencer',
            required: true
        },
        negotiationCost: {
            type: Number,
            default: 0
        },
        status: {
            type: Number,
            default: 0
        }
    },
    { _id: false }
);

const influencerEmpanelmentSchema = new mongoose.Schema(
    {
        influencerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Influencer',
            required: true
        },
        ndaSigned: {
            type: Number,
            default: 0
        },
        brandGuidelines: {
            type: Number,
            default: 0
        },
        influencerDetails: {
            type: Number,
            default: 0
        },
        ndaDocument: {
            type: String,
            default: null
        },
        status: {
            type: Number,
            default: 0
        }
    },
    { _id: false }
);

const budgetReleaseSchema = new mongoose.Schema(
    {
        influencerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Influencer',
            required: true
        },
        cost: {
            type: Number,
            default: 0
        },
        budgetRelease: {
            type: Number,
            default: 0
        },
        releaseDate: {
            type: Date,
            default: null
        },
        status: {
            type: Number,
            default: 0
        }
    },
    { _id: false }
);

const PODispatchSchema = new mongoose.Schema(
    {
        influencerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Influencer',
            required: true
        },
        uploadPO: {
            type: String,
            default: null
        },
        sentToInfluencer: {
            type: Number,
            default: 0
        },
        status: {
            type: Number,
            default: 0
        }
    },
    { _id: false }
);

const ProductRequirementSchema = new mongoose.Schema(
    {
        influencerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Influencer',
            required: true
        },
        productCount: {
            type: Number,
            default: 0
        },
        address: {
            type: String,
            default: null
        },
        sentToInfluencer: {
            type: Number,
            default: 0
        },
        status: {
            type: Number,
            default: 0
        }
    },
    { _id: false }
);

const contentCoordinationSchema = new mongoose.Schema(
    {
        influencerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Influencer',
            required: true
        },
        contentApproved: {
            type: Number,
            default: 0
        },
        whatsappLink: {
            type: String,
            default: null
        },
        status: {
            type: Number,
            default: 0
        }
    },
    { _id: false }
);

const logisticsTrackingSchema = new mongoose.Schema(
    {
        influencerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Influencer',
            required: true
        },
        dispatchDate: {
            type: Date,
            default: null
        },
        ETADate: {
            type: Date,
            default: null
        },
        ActualArrivalDate: {
            type: Date,
            default: null
        },
        status: {
            type: Number,
            default: 0
        }
    },
    { _id: false }
);

const contentSectionSchema = new mongoose.Schema(
    {
        influencerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Influencer',
            required: true
        },
        contentFirstDraft: {
            type: Number,
            default: 0
        },
        AIEvaluation: {
            type: Number,
            default: 0
        },
        campaignManagerApproval: {
            type: Number,
            default: 0
        },
        influencerManagerApproval: {
            type: Number,
            default: 0
        },
        contentLink: {
            type: String,
            default: null
        },
        status: {
            type: Number,
            default: 0
        }
    },
    { _id: false }
);

const assetCollectionSchema = new mongoose.Schema(
    {
        influencerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Influencer',
            required: true
        },
        assetCollectionFile: {
            type: String,
            default: null
        },
        status: {
            type: Number,
            default: 0
        }
    },
    { _id: false }
);
const billingConfirmationSchema = new mongoose.Schema(
    {
        influencerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Influencer',
            required: true
        },
        billingSent: {
            type: Number,
            default: 0
        },
        billingNumber: {
            type: Number,
            default: 0
        },
        billingVerified: {
            type: Number,
            default: 0
        },
        status: {
            type: Number,
            default: 0
        }
    },
    { _id: false }
);



// main model

const CampaignSchema = new mongoose.Schema({
    campaignName: {
        type: String,
        required: true,
        trim: true
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        default: null
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        default: null
    },
    campaignBrief: {
        type: String,
        default: null,
    },
    description: {
        type: String,
        default: null,
        trim: true
    },
    strategyDocument: {
        type: String,
        default: null
    },
    stageTwoNotes: {
        type: String,
        default: null,
    },
    strategyApproveStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    strategyRejectedRemarks: {
        type: String,
        default: null
    },
    influencerList: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Influencer'
        }
    ],
    influencerShortList: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Influencer'
        }
    ],
    influencerApproveList: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Influencer'
        }
    ],
    influencerNegotiation: {
        type: [influencerNegotiationSchema],
        default: []
    },
    influencerEmpanelment: {
        type: [influencerEmpanelmentSchema],
        default: []
    },
    budgetRelease: {
        type: [budgetReleaseSchema],
        default: []
    },
    PODispatch: {
        type: [PODispatchSchema],
        default: []
    },
    productRequirement: {
        type: [ProductRequirementSchema],
        default: []
    },
    contentCoordination: {
        type: [contentCoordinationSchema],
        default: []
    },
    logisticsTracking: {
        type: [logisticsTrackingSchema],
        default: []
    },
    contentSection: {
        type: [contentSectionSchema],
        default: []
    },
    assetCollection: {
        type: [assetCollectionSchema],
        default: []
    },
    billingConfirmation: {
        type: [billingConfirmationSchema],
        default: []
    },
    stageStatus: {
        type: Number,
        default: 0
    },
    status: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Campaign', CampaignSchema);

