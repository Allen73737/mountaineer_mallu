import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Group name is required'],
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: [true, 'Group description is required'],
        maxlength: 500
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    moderators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    pendingRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    pinnedMessage: {
        type: String,
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const Group = mongoose.model('Group', groupSchema);
export default Group;
