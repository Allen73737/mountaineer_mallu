import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
    prompt: {
        type: String,
        required: true,
        trim: true
    },
    subject: {
        type: String,
        default: ''
    },
    preheader: {
        type: String,
        default: ''
    },
    headline: {
        type: String,
        default: ''
    },
    bodyHtml: {
        type: String,
        default: ''
    },
    ctaText: {
        type: String,
        default: ''
    },
    ctaUrl: {
        type: String,
        default: ''
    },
    audienceCriteria: {
        description: { type: String, default: '' },
        filters: {
            hasExpeditions: { type: Boolean, default: null },
            minExpeditions: { type: Number, default: null },
            difficulty: { type: String, default: null }
        }
    },
    estimatedImpact: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['draft', 'approved', 'sending', 'sent', 'failed'],
        default: 'draft'
    },
    recipientCount: {
        type: Number,
        default: 0
    },
    sentAt: {
        type: Date,
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

campaignSchema.index({ status: 1, createdAt: -1 });

const Campaign = mongoose.model('Campaign', campaignSchema);
export default Campaign;
