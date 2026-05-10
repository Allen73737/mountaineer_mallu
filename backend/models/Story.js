import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Story title is required'],
        trim: true,
        maxlength: 200
    },
    excerpt: {
        type: String,
        required: [true, 'Story excerpt is required'],
        maxlength: 500
    },
    content: {
        type: String,
        default: ''
    },
    author: {
        type: String,
        required: [true, 'Author name is required'],
        trim: true
    },
    date: {
        type: String,
        required: true
    },
    region: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: [true, 'Story image is required']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

storySchema.index({ createdAt: -1 });

const Story = mongoose.model('Story', storySchema);
export default Story;
