import Story from '../models/Story.js';
import { uploadToCloudinary, uploadUrlToCloudinary } from '../services/cloudinary.js';
import { notify } from '../services/notify.js';

// Route arrives as a JSON string inside multipart form data; keep only sane, finite numbers
const parseRoute = (raw) => {
    if (!raw) return undefined;
    try {
        const r = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (r === null) return null;
        const points = (Array.isArray(r.points) ? r.points : [])
            .filter(p => Array.isArray(p) && p.length >= 2 && p.slice(0, 3).every(n => n == null || Number.isFinite(n)))
            .slice(0, 800)
            .map(p => [Number(p[0].toFixed(6)), Number(p[1].toFixed(6)), p[2] == null ? null : Math.round(p[2])]);
        if (points.length < 2) return undefined;
        const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : undefined);
        return { points, distanceKm: num(r.distanceKm), gainM: num(r.gainM), maxElevationM: num(r.maxElevationM), name: String(r.name || '').slice(0, 120) };
    } catch {
        return undefined;
    }
};

const STATUS_COPY = {
    approved: ['Your story is live', 'It is now published on Mountaineer Mallu.'],
    rejected: ['Your story was not published', 'An editor reviewed it — feel free to revise and resubmit.'],
};
const announceStatus = (story, status, actor) => {
    const copy = STATUS_COPY[status];
    if (!copy || !story.createdBy) return;
    notify(story.createdBy, {
        type: 'story_status', actor,
        title: `${copy[0]}: “${story.title}”`,
        body: copy[1],
        link: status === 'approved' ? `/stories/${story._id}` : '/portal/submissions'
    });
};

// GET /api/stories (Public: only approved. Admin: all if requested)
export const listStories = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 12, 50);
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
        const stories = await Story.find({ createdBy: req.user._id }).sort({ createdAt: -1 }).limit(200).lean();
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
            route: parseRoute(req.body.route),
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
        const route = parseRoute(req.body.route);
        if (route !== undefined) updates.route = route;

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
        announceStatus(story, status, req.user._id);
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

// PATCH /api/stories/bulk-status — { ids: [], status }
export const bulkStoryStatus = async (req, res, next) => {
    try {
        const { ids, status } = req.body;
        if (!['pending', 'approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status.' });
        if (!Array.isArray(ids) || !ids.length || ids.length > 100) return res.status(400).json({ error: 'Provide 1–100 ids.' });
        const stories = await Story.find({ _id: { $in: ids } });
        await Story.updateMany({ _id: { $in: ids } }, { status });
        stories.forEach(s => announceStatus(s, status, req.user._id));
        res.json({ message: `${stories.length} stor${stories.length === 1 ? 'y' : 'ies'} updated.`, updated: stories.length });
    } catch (error) {
        next(error);
    }
};
