import Group from '../models/Group.js';
import Post from '../models/Post.js';
import { uploadToCloudinary, uploadUrlToCloudinary } from '../services/cloudinary.js';
import { notify, emitToGroup } from '../services/notify.js';

const REACTIONS = ['summit', 'heart', 'fire', 'clap', 'strong'];
const isModOrAdmin = (group, user) =>
    group.moderators.some(m => m.toString() === user._id.toString()) || ['admin', 'superadmin'].includes(user.role);

// Only people who are actually in the group can be mentioned
const cleanMentions = (raw, group) => {
    let ids = raw;
    if (typeof raw === 'string') {
        try { ids = JSON.parse(raw); } catch { ids = raw.split(','); }
    }
    if (!Array.isArray(ids)) return [];
    const members = new Set(group.members.map(String));
    return [...new Set(ids.map(String))].filter(id => members.has(id)).slice(0, 20);
};
const snippet = (text = '', n = 120) => (text.length > n ? `${text.slice(0, n - 1)}…` : text);

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
        const limit = Math.min(parseInt(req.query.limit) || 10, 50);
        const skip = (page - 1) * limit;

        const [posts, totalPosts] = await Promise.all([
            Post.find({ group: group._id })
                .sort({ createdAt: -1 })
                .skip(skip).limit(limit)
                .populate('author', 'name avatar')
                .populate('comments.author', 'name avatar')
                .populate('mentions', 'name'),
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

        notify(group.moderators, {
            type: 'join_request', actor: req.user._id,
            title: `${req.user.name} asked to join ${group.name}`,
            body: 'Review the request in the group settings.',
            link: '/community'
        });

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

        notify(userId, {
            type: 'join_approved', actor: req.user._id,
            title: `You're in — welcome to ${group.name}`,
            body: 'Say hello to the rope team.',
            link: '/portal/communities'
        });

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
        } else if (req.body.unsplashUrl) {
            const result = await uploadUrlToCloudinary(req.body.unsplashUrl, {
                folder: 'mountaineer-mallu/community',
                transformation: [{ width: 1200, crop: 'limit' }, { quality: 'auto', fetch_format: 'auto' }]
            });
            imageUrl = result.secure_url;
        }

        const mentions = cleanMentions(req.body.mentions, group);
        const post = await Post.create({
            content: req.body.content,
            image: imageUrl,
            group: group._id,
            author: req.user._id,
            mentions
        });

        await post.populate('author', 'name avatar');
        await post.populate('mentions', 'name');
        emitToGroup(group._id, 'community:post', { groupId: String(group._id), post });
        notify(mentions, {
            type: 'mention', actor: req.user._id,
            title: `${req.user.name} mentioned you in ${group.name}`,
            body: snippet(post.content),
            link: '/portal/communities'
        });
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

        const mentions = cleanMentions(req.body.mentions, group);
        post.comments.push({
            author: req.user._id,
            content: req.body.content,
            mentions
        });
        await post.save();
        await post.populate('comments.author', 'name avatar');
        await post.populate('author', 'name avatar');
        await post.populate('mentions', 'name');

        emitToGroup(group._id, 'community:post-updated', { groupId: String(group._id), post });
        notify(post.author._id, {
            type: 'comment', actor: req.user._id,
            title: `${req.user.name} replied to your post`,
            body: snippet(req.body.content),
            link: '/portal/communities'
        });
        notify(mentions.filter(id => id !== String(post.author._id)), {
            type: 'mention', actor: req.user._id,
            title: `${req.user.name} mentioned you in a reply`,
            body: snippet(req.body.content),
            link: '/portal/communities'
        });

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

// POST /api/community/groups/:id/posts/:postId/react — toggle one reaction per person
export const reactToPost = async (req, res, next) => {
    try {
        const { emoji } = req.body;
        if (!REACTIONS.includes(emoji)) return res.status(400).json({ error: 'Unknown reaction.' });

        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found.' });
        if (!group.members.some(m => m.toString() === req.user._id.toString())) {
            return res.status(403).json({ error: 'You must be a member to react.' });
        }

        const post = await Post.findOne({ _id: req.params.postId, group: group._id });
        if (!post) return res.status(404).json({ error: 'Post not found.' });

        const mine = post.reactions.find(r => r.user.toString() === req.user._id.toString());
        let added = false;
        if (mine && mine.emoji === emoji) {
            post.reactions = post.reactions.filter(r => r.user.toString() !== req.user._id.toString());
        } else if (mine) {
            mine.emoji = emoji;
        } else {
            post.reactions.push({ user: req.user._id, emoji });
            added = true;
        }
        await post.save();

        emitToGroup(group._id, 'community:reactions', { groupId: String(group._id), postId: String(post._id), reactions: post.reactions });
        if (added) {
            notify(post.author, {
                type: 'reaction', actor: req.user._id,
                title: `${req.user.name} reacted to your post`,
                body: snippet(post.content),
                link: '/portal/communities'
            });
        }
        res.json({ reactions: post.reactions });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/community/groups/:id/posts/:postId — author, moderator or admin
export const deletePost = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found.' });
        const post = await Post.findOne({ _id: req.params.postId, group: group._id });
        if (!post) return res.status(404).json({ error: 'Post not found.' });

        if (post.author.toString() !== req.user._id.toString() && !isModOrAdmin(group, req.user)) {
            return res.status(403).json({ error: 'You can only delete your own posts.' });
        }
        await post.deleteOne();
        emitToGroup(group._id, 'community:post-deleted', { groupId: String(group._id), postId: String(post._id) });
        res.json({ message: 'Post deleted.' });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/community/groups/:id/posts/:postId/comments/:commentId
export const deleteComment = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found.' });
        const post = await Post.findOne({ _id: req.params.postId, group: group._id });
        if (!post) return res.status(404).json({ error: 'Post not found.' });
        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ error: 'Comment not found.' });

        if (comment.author.toString() !== req.user._id.toString() && !isModOrAdmin(group, req.user)) {
            return res.status(403).json({ error: 'You can only delete your own comments.' });
        }
        comment.deleteOne();
        await post.save();
        await post.populate('author', 'name avatar');
        await post.populate('comments.author', 'name avatar');
        await post.populate('mentions', 'name');
        emitToGroup(group._id, 'community:post-updated', { groupId: String(group._id), post });
        res.json({ message: 'Comment deleted.', post });
    } catch (error) {
        next(error);
    }
};

// POST /api/community/groups/:id/leave
export const leaveGroup = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found.' });
        const me = req.user._id.toString();
        group.members = group.members.filter(m => m.toString() !== me);
        group.moderators = group.moderators.filter(m => m.toString() !== me);
        group.pendingRequests = group.pendingRequests.filter(m => m.toString() !== me);
        await group.save();
        res.json({ message: 'You left the group.' });
    } catch (error) {
        next(error);
    }
};
