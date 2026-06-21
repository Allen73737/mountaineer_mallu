import mongoose from 'mongoose';

const securityLogSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['login_success', 'login_failure', 'admin_action', 'page_view'],
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    email: {
        type: String,
        default: ''
    },
    ip: {
        type: String,
        default: ''
    },
    userAgent: {
        type: String,
        default: ''
    },
    details: {
        type: String,
        default: ''
    },
    page: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Auto-expire logs after 30 days
securityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Compound index for fast aggregation queries
securityLogSchema.index({ type: 1, createdAt: -1 });

const SecurityLog = mongoose.model('SecurityLog', securityLogSchema);
export default SecurityLog;
