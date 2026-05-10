import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 1000
    }
}, {
    timestamps: true
});

const postSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Post content is required'],
        maxlength: 5000
    },
    image: {
        type: String,
        default: ''
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comments: [commentSchema]
}, {
    timestamps: true
});

postSchema.index({ group: 1, createdAt: -1 });

const Post = mongoose.model('Post', postSchema);
export default Post;
