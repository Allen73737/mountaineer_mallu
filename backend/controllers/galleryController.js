import GalleryItem from '../models/GalleryItem.js';
import { uploadToCloudinary } from '../services/cloudinary.js';

// GET /api/gallery — approved media only
export const listApproved = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            GalleryItem.find({ status: 'approved' }).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('uploadedBy', 'name'),
            GalleryItem.countDocuments({ status: 'approved' })
        ]);

        res.json({
            items,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/gallery/pending — admin
export const listPending = async (req, res, next) => {
    try {
        const items = await GalleryItem.find({ status: 'pending' })
            .sort({ createdAt: -1 })
            .populate('uploadedBy', 'name email avatar');
        res.json({ items });
    } catch (error) {
        next(error);
    }
};

// GET /api/gallery/all — admin (all items for management)
export const listAll = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const status = req.query.status;

        const filter = status ? { status } : {};

        const [items, total] = await Promise.all([
            GalleryItem.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('uploadedBy', 'name email'),
            GalleryItem.countDocuments(filter)
        ]);

        res.json({
            items,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/gallery — upload media (user)
export const uploadMedia = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No media file provided.' });
        }

        const { title, type, span } = req.body;
        const mediaType = type || (req.file.mimetype.startsWith('video') ? 'video' : 'image');

        const uploadOptions = {
            folder: 'mountaineer-mallu/gallery',
            resource_type: mediaType === 'video' ? 'video' : 'image',
            transformation: []
        };

        if (mediaType === 'image') {
            uploadOptions.transformation = [
                { width: 2000, crop: 'limit' },
                { quality: 'auto', fetch_format: 'auto' }
            ];
        } else if (mediaType === 'video') {
            // Smart compression for videos: auto quality, auto format (MP4/WebM), limit width
            uploadOptions.transformation = [
                { width: 1280, crop: 'limit' }, // Cap at 720p for fast web delivery
                { quality: 'auto', fetch_format: 'auto' }
            ];
        }

        const result = await uploadToCloudinary(req.file.buffer, uploadOptions);

        const isAdmin = req.user.role === 'Admin' || req.user.role === 'SuperAdmin';
        
        const item = await GalleryItem.create({
            type: mediaType,
            url: result.secure_url,
            title: title || 'Untitled',
            span: span || 'col-span-1 row-span-1',
            uploadedBy: req.user._id,
            status: isAdmin ? 'approved' : 'pending',
            ...(isAdmin && { approvedBy: req.user._id })
        });

        res.status(201).json({ message: isAdmin ? 'Media uploaded and approved.' : 'Media uploaded. Awaiting approval.', item });
    } catch (error) {
        next(error);
    }
};

// PUT /api/gallery/:id — admin (update title/span)
export const updateMedia = async (req, res, next) => {
    try {
        const { title, span } = req.body;
        const item = await GalleryItem.findByIdAndUpdate(
            req.params.id,
            { title, span },
            { new: true }
        );
        if (!item) return res.status(404).json({ error: 'Media not found.' });
        res.json({ message: 'Media updated.', item });
    } catch (error) {
        next(error);
    }
};

// GET /api/gallery/user/me
export const getMyMedia = async (req, res, next) => {
    try {
        const items = await GalleryItem.find({ uploadedBy: req.user._id }).sort({ createdAt: -1 });
        res.json({ items });
    } catch (error) {
        next(error);
    }
};

// POST /api/gallery/:id/like
export const toggleLike = async (req, res, next) => {
    try {
        const item = await GalleryItem.findById(req.params.id);
        if (!item) return res.status(404).json({ error: 'Media not found.' });

        const userId = req.user._id;
        const index = item.likes.indexOf(userId);
        
        if (index === -1) {
            item.likes.push(userId); // Like
        } else {
            item.likes.splice(index, 1); // Unlike
        }

        await item.save();
        res.json({ message: index === -1 ? 'Liked' : 'Unliked', likesCount: item.likes.length, likes: item.likes });
    } catch (error) {
        next(error);
    }
};

// PUT /api/gallery/:id/approve — admin
export const approveMedia = async (req, res, next) => {
    try {
        const item = await GalleryItem.findByIdAndUpdate(
            req.params.id,
            { status: 'approved', approvedBy: req.user._id },
            { new: true }
        );
        if (!item) return res.status(404).json({ error: 'Media not found.' });
        res.json({ message: 'Media approved.', item });
    } catch (error) {
        next(error);
    }
};

// PUT /api/gallery/:id/reject — admin
export const rejectMedia = async (req, res, next) => {
    try {
        const item = await GalleryItem.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected' },
            { new: true }
        );
        if (!item) return res.status(404).json({ error: 'Media not found.' });
        res.json({ message: 'Media rejected.', item });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/gallery/:id — admin
export const deleteMedia = async (req, res, next) => {
    try {
        const item = await GalleryItem.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ error: 'Media not found.' });
        res.json({ message: 'Media deleted.' });
    } catch (error) {
        next(error);
    }
};
