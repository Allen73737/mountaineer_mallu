import Group from '../models/Group.js';
import Post from '../models/Post.js';
import { uploadToCloudinary } from '../services/cloudinary.js';

// GET /api/community/groups
export const listGroups = async (req, res, next) => {
    try {
        const groups = await Group.find()
            .populate('moderators', 'name avatar')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        const groupsWithCounts = groups.map(g => ({
            ...g.toJSON(),
            memberCount: g.members.length,
            pendingCount: g.pendingRequests.length
        }));

        res.json({ groups: groupsWithCounts });
    } catch (error) {
        next(error);
    }
};

// GET /api/community/groups/me
export const getMyGroups = async (req, res, next) => {
    try {
        const groups = await Group.find({ members: req.user._id })
            .populate('moderators', 'name avatar')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        const groupsWithCounts = groups.map(g => ({
            ...g.toJSON(),
            memberCount: g.members.length,
            pendingCount: g.pendingRequests.length
        }));

        res.json({ groups: groupsWithCounts });
    } catch (error) {
        next(error);
    }
};

// GET /api/community/groups/:id
export const getGroup = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('members', 'name avatar email')
            .populate('moderators', 'name avatar email')
            .populate('pendingRequests', 'name avatar email')
            .populate('createdBy', 'name');

        if (!group) return res.status(404).json({ error: 'Group not found.' });

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [posts, totalPosts] = await Promise.all([
            Post.find({ group: group._id })
                .sort({ createdAt: -1 })
                .skip(skip).limit(limit)
                .populate('author', 'name avatar')
                .populate('comments.author', 'name avatar'),
            Post.countDocuments({ group: group._id })
        ]);

        res.json({
            group,
            posts,
            pagination: { page, limit, total: totalPosts, pages: Math.ceil(totalPosts / limit) }
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/community/groups — admin only
export const createGroup = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const group = await Group.create({
            name,
            description,
            moderators: [req.user._id],
            members: [req.user._id],
            createdBy: req.user._id
        });

        res.status(201).json({ message: 'Group created.', group });
    } catch (error) {
        next(error);
    }
};

// POST /api/community/groups/:id/join — request to join
export const requestJoin = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found.' });

        if (group.members.includes(req.user._id)) {
            return res.status(400).json({ error: 'Already a member.' });
        }
        if (group.pendingRequests.includes(req.user._id)) {
            return res.status(400).json({ error: 'Join request already pending.' });
        }

        group.pendingRequests.push(req.user._id);
        await group.save();

        res.json({ message: 'Join request submitted.' });
    } catch (error) {
        next(error);
    }
};

// PUT /api/community/groups/:id/approve/:userId — moderator
export const approveJoin = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found.' });

        // Check if requester is moderator or admin
        const isMod = group.moderators.some(m => m.toString() === req.user._id.toString());
        const isAdmin = ['admin', 'superadmin'].includes(req.user.role);
        if (!isMod && !isAdmin) {
            return res.status(403).json({ error: 'Only moderators can approve requests.' });
        }

        const userId = req.params.userId;
        const idx = group.pendingRequests.indexOf(userId);
        if (idx === -1) {
            return res.status(404).json({ error: 'No pending request from this user.' });
        }

        group.pendingRequests.splice(idx, 1);
        if (!group.members.includes(userId)) {
            group.members.push(userId);
        }
        await group.save();

        res.json({ message: 'User approved.' });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/community/groups/:id/members/:userId — remove member
export const removeMember = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found.' });

        const isMod = group.moderators.some(m => m.toString() === req.user._id.toString());
        const isAdmin = ['admin', 'superadmin'].includes(req.user.role);
        if (!isMod && !isAdmin) {
            return res.status(403).json({ error: 'Only moderators can remove members.' });
        }

        group.members = group.members.filter(m => m.toString() !== req.params.userId);
        group.moderators = group.moderators.filter(m => m.toString() !== req.params.userId);
        await group.save();

        res.json({ message: 'Member removed.' });
    } catch (error) {
        next(error);
    }
};

// POST /api/community/groups/:id/posts — create post
export const createPost = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found.' });

        if (!group.members.includes(req.user._id)) {
            return res.status(403).json({ error: 'You must be a member to post.' });
        }

        let imageUrl = '';
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, {
                folder: 'mountaineer-mallu/community',
                transformation: [{ width: 1200, crop: 'limit' }, { quality: 'auto', fetch_format: 'auto' }]
            });
            imageUrl = result.secure_url;
        }

        const post = await Post.create({
            content: req.body.content,
            image: imageUrl,
            group: group._id,
            author: req.user._id
        });

        await post.populate('author', 'name avatar');
        res.status(201).json({ message: 'Post created.', post });
    } catch (error) {
        next(error);
    }
};

// POST /api/community/groups/:id/posts/:postId/comments — comment
export const addComment = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found.' });

        if (!group.members.includes(req.user._id)) {
            return res.status(403).json({ error: 'You must be a member to comment.' });
        }

        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ error: 'Post not found.' });

        post.comments.push({
            author: req.user._id,
            content: req.body.content
        });
        await post.save();
        await post.populate('comments.author', 'name avatar');

        res.json({ message: 'Comment added.', post });
    } catch (error) {
        next(error);
    }
};

// PUT /api/community/groups/:id/pin — pin message
export const pinMessage = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found.' });

        const isMod = group.moderators.some(m => m.toString() === req.user._id.toString());
        const isAdmin = ['admin', 'superadmin'].includes(req.user.role);
        if (!isMod && !isAdmin) {
            return res.status(403).json({ error: 'Only moderators can pin messages.' });
        }

        group.pinnedMessage = req.body.message || '';
        await group.save();

        res.json({ message: 'Pinned message updated.', group });
    } catch (error) {
        next(error);
    }
};

// PUT /api/community/groups/:id/moderators/:userId — assign moderator
export const assignModerator = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found.' });

        const userId = req.params.userId;
        if (!group.members.includes(userId)) {
            return res.status(400).json({ error: 'User must be a member to become moderator.' });
        }

        if (!group.moderators.includes(userId)) {
            group.moderators.push(userId);
            await group.save();
        }

        res.json({ message: 'Moderator assigned.', group });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/community/groups/:id — delete group
export const deleteGroup = async (req, res, next) => {
    try {
        const group = await Group.findByIdAndDelete(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found.' });

        // Also delete all posts in the group
        await Post.deleteMany({ group: req.params.id });

        res.json({ message: 'Group deleted.' });
    } catch (error) {
        next(error);
    }
};
