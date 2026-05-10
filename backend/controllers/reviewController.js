import Review from '../models/Review.js';

// @desc    Get all approved reviews (Public)
// @route   GET /api/reviews
// @access  Public
export const getApprovedReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ status: 'approved' })
            .populate('author', 'name avatar role')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        next(error);
    }
};

// @desc    Submit a review
// @route   POST /api/reviews
// @access  Private (Registered Users)
export const submitReview = async (req, res, next) => {
    try {
        const { content, rating } = req.body;
        
        // Ensure user hasn't submitted a review recently or check if we want to allow multiple.
        // For now, let them submit, but it goes to pending.
        
        const review = await Review.create({
            author: req.user._id,
            content,
            rating,
            status: 'pending' // Default from schema, but explicitly stating
        });
        
        res.status(201).json({ message: 'Review submitted successfully and is pending approval', review });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews/admin
// @access  Private (Admin/SuperAdmin)
export const getAllReviewsAdmin = async (req, res, next) => {
    try {
        const reviews = await Review.find()
            .populate('author', 'name email avatar role')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        next(error);
    }
};

// @desc    Update review status
// @route   PATCH /api/reviews/:id/status
// @access  Private (Admin/SuperAdmin)
export const updateReviewStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        ).populate('author', 'name email avatar');

        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        res.json(review);
    } catch (error) {
        next(error);
    }
};

// @desc    Update review content and rating
// @route   PUT /api/reviews/:id
// @access  Private (Admin/SuperAdmin)
export const updateReview = async (req, res, next) => {
    try {
        const { content, rating, status } = req.body;

        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { content, rating, status },
            { new: true, runValidators: true }
        ).populate('author', 'name email avatar');

        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        res.json(review);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Admin/SuperAdmin)
export const deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        await review.deleteOne();
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        next(error);
    }
};
