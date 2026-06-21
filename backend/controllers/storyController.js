import Story from '../models/Story.js';
import { uploadToCloudinary, uploadUrlToCloudinary } from '../services/cloudinary.js';

// GET /api/stories (Public: only approved. Admin: all if requested)
export const listStories = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const query = {};
        // If not an admin requesting all, only show approved
        if (!req.user?.permissions?.manageStories || req.query.status === 'approved') {
            query.status = 'approved';
        } else if (req.query.status) {
            query.status = req.query.status;
        }

        const [stories, total] = await Promise.all([
            Story.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('createdBy', 'name avatar'),
            Story.countDocuments(query)
        ]);

        res.json({
            stories,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/stories/user/me
export const getMyStories = async (req, res, next) => {
    try {
        const stories = await Story.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
        res.json({ stories });
    } catch (error) {
        next(error);
    }
};

// GET /api/stories/:id
export const getStory = async (req, res, next) => {
    try {
        const story = await Story.findById(req.params.id).populate('createdBy', 'name avatar');
        if (!story) return res.status(404).json({ error: 'Story not found.' });
        res.json({ story });
    } catch (error) {
        next(error);
    }
};

// POST /api/stories or POST /api/stories/submit
export const createStory = async (req, res, next) => {
    try {
        const { title, excerpt, content, author, date, region } = req.body;

        let imageUrl = req.body.image || '';
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, {
                folder: 'mountaineer-mallu/stories',
                transformation: [
                    { width: 1600, crop: 'limit' },
                    { quality: 'auto', fetch_format: 'auto' }
                ]
            });
            imageUrl = result.secure_url;
        } else if (req.body.unsplashUrl) {
            const result = await uploadUrlToCloudinary(req.body.unsplashUrl, {
                folder: 'mountaineer-mallu/stories',
                transformation: [
                    { width: 1600, crop: 'limit' },
                    { quality: 'auto', fetch_format: 'auto' }
                ]
            });
            imageUrl = result.secure_url;
        }

        const isAdmin = req.user?.permissions?.manageStories;

        const story = await Story.create({
            title, excerpt, content, author, date, region,
            image: imageUrl,
            createdBy: req.user._id,
            status: isAdmin ? 'approved' : 'pending'
        });

        res.status(201).json({ message: isAdmin ? 'Story published.' : 'Story submitted for approval.', story });
    } catch (error) {
        next(error);
    }
};

// PUT /api/stories/:id
export const updateStory = async (req, res, next) => {
    try {
        const { title, excerpt, content, author, date, region } = req.body;
        const updates = { title, excerpt, content, author, date, region };

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, {
                folder: 'mountaineer-mallu/stories',
                transformation: [
                    { width: 1600, crop: 'limit' },
                    { quality: 'auto', fetch_format: 'auto' }
                ]
            });
            updates.image = result.secure_url;
        } else if (req.body.unsplashUrl) {
            const result = await uploadUrlToCloudinary(req.body.unsplashUrl, {
                folder: 'mountaineer-mallu/stories',
                transformation: [
                    { width: 1600, crop: 'limit' },
                    { quality: 'auto', fetch_format: 'auto' }
                ]
            });
            updates.image = result.secure_url;
        } else if (req.body.image) {
            updates.image = req.body.image;
        }

        // Remove undefined fields
        Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

        const story = await Story.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
        if (!story) return res.status(404).json({ error: 'Story not found.' });

        res.json({ message: 'Story updated.', story });
    } catch (error) {
        next(error);
    }
};

// PATCH /api/stories/:id/status
export const updateStoryStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status.' });
        }
        const story = await Story.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!story) return res.status(404).json({ error: 'Story not found.' });
        res.json({ message: `Story status updated to ${status}.`, story });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/stories/:id
export const deleteStory = async (req, res, next) => {
    try {
        const story = await Story.findByIdAndDelete(req.params.id);
        if (!story) return res.status(404).json({ error: 'Story not found.' });
        res.json({ message: 'Story deleted.' });
    } catch (error) {
        next(error);
    }
};
