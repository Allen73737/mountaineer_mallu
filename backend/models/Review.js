import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: [true, 'Review content is required'],
        validate: [
            {
                validator: function(v) {
                    return v.trim().split(/\s+/).length <= 50;
                },
                message: 'Review content cannot exceed 50 words'
            }
        ]
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
