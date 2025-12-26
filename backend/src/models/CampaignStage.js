const mongoose = require('mongoose');

const campaignStageSchema = new mongoose.Schema(
    {
        stageName: {
            type: String,
            required: true,
            trim: true
        },
        stakeholders: {
            type: String,
            default: null,
            trim: true
        },
        ackFrom: {
            type: String,
            default: null,
            trim: true
        },
        workflowType: {
            type: String,
            enum: ['sequence', 'parallel'],
            default: 'sequence'
        },
        stageOrder: {
            type: Number,
            default: 0
        },
        sla: {
            type: String,
            default: null,
            trim: true
        },
        status: {
            type: String,
            enum: ['pending', 'inprogress', 'completed'],
            default: 'pending'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('CampaignStage', campaignStageSchema);
