import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    actor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    type: {
        type: String,
        enum: [
            'comment', 'reaction', 'mention', 'join_request', 'join_approved',
            'story_status', 'media_status', 'review_status',
            'event_registered', 'event_message', 'system'
        ],
        required: true
    },
    title: { type: String, required: true, maxlength: 200 },
    body: { type: String, default: '', maxlength: 500 },
    link: { type: String, default: '' },
    read: { type: Boolean, default: false }
}, {
    timestamps: true
});

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });
// Old notifications clear themselves out after 90 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
