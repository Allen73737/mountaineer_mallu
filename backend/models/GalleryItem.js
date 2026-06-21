import mongoose from 'mongoose';

const galleryItemSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['image', 'video'],
        required: true
    },
    url: {
        type: String,
        required: [true, 'Media URL is required']
    },
    title: {
        type: String,
        required: [true, 'Media title is required'],
        trim: true,
        maxlength: 100
    },
    span: {
        type: String,
        default: 'col-span-1 row-span-1'
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    aiTags: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

galleryItemSchema.index({ status: 1, createdAt: -1 });

const GalleryItem = mongoose.model('GalleryItem', galleryItemSchema);
export default GalleryItem;
