import User from '../models/User.js';
import Story from '../models/Story.js';
import Event from '../models/Event.js';
import GalleryItem from '../models/GalleryItem.js';
import Group from '../models/Group.js';
import SecurityLog from '../models/SecurityLog.js';
import Review from '../models/Review.js';
import { parseEventStart, isUpcoming } from '../utils/eventDate.js';
import { analyzeSecurityLogs } from '../services/aiInsightsService.js';

// GET /api/admin/overview
export const getOverview = async (req, res, next) => {
    try {
        const DAY = 24 * 60 * 60 * 1000;
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const trendStart = new Date(today.getTime() - 13 * DAY);
        const weekAgo = new Date(Date.now() - 7 * DAY);
        const twoWeeksAgo = new Date(Date.now() - 14 * DAY);

        const [
            totalUsers, totalEvents, pendingMedia, activeGroups, recentUsers,
            publishedStories, pendingStories, pendingReviews,
            usersThisWeek, usersLastWeek, signupBuckets, allEvents
        ] = await Promise.all([
            User.countDocuments(),
            Event.countDocuments(),
            GalleryItem.countDocuments({ status: 'pending' }),
            Group.countDocuments(),
            User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt role avatar'),
            Story.countDocuments({ status: 'approved' }),
            Story.countDocuments({ status: 'pending' }),
            Review.countDocuments({ status: 'pending' }),
            User.countDocuments({ createdAt: { $gte: weekAgo } }),
            User.countDocuments({ createdAt: { $gte: twoWeeksAgo, $lt: weekAgo } }),
            User.aggregate([
                { $match: { createdAt: { $gte: trendStart } } },
                { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } }
            ]),
            Event.find().select('title date time location totalSlots participants category').lean()
        ]);

        // Dates are free text, so filter and sort after parsing them
        const upcomingEvents = allEvents
            .map(e => ({ ...e, start: parseEventStart(e.date, e.time) }))
            .filter(e => e.start && isUpcoming(e))
            .sort((a, b) => a.start - b.start)
            .slice(0, 4);

        // Fill every day of the 14-day window so the sparkline has no gaps
        const bucketMap = new Map(signupBuckets.map(b => [b._id, b.count]));
        const signupTrend = Array.from({ length: 14 }, (_, i) => {
            const day = new Date(trendStart.getTime() + i * DAY).toISOString().slice(0, 10);
            return { date: day, count: bucketMap.get(day) || 0 };
        });

        res.json({
            stats: {
                totalUsers,
                totalEvents,
                pendingMedia,
                activeGroups,
                publishedStories,
                usersThisWeek,
                usersLastWeek
            },
            moderation: {
                stories: pendingStories,
                media: pendingMedia,
                reviews: pendingReviews
            },
            signupTrend,
            upcomingEvents: upcomingEvents.map(e => ({
                id: e._id,
                title: e.title,
                date: e.start.toISOString(),
                location: e.location,
                category: e.category,
                totalSlots: e.totalSlots,
                filled: e.participants?.length || 0
            })),
            recentUsers: recentUsers.map(u => ({
                id: u._id,
                name: u.name,
                email: u.email,
                avatar: u.avatar,
                role: u.role,
                joinedAt: u.createdAt
            }))
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/admin/admins — list all admins
export const listAdmins = async (req, res, next) => {
    try {
        const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } })
            .select('-password')
            .sort({ role: -1, createdAt: 1 });

        res.json({ admins: admins.map(a => a.toProfileJSON()) });
    } catch (error) {
        next(error);
    }
};

// POST /api/admin/admins — create admin
export const createAdmin = async (req, res, next) => {
    try {
        const { name, email, password, permissions } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required.' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }

        const admin = await User.create({
            name,
            email,
            password,
            role: 'admin',
            isProfileComplete: true,
            permissions: permissions || {
                manageStories: true,
                manageEvents: true,
                manageGallery: false,
                manageCommunity: false,
                manageUsers: false
            }
        });

        res.status(201).json({ message: 'Admin created.', admin: admin.toProfileJSON() });
    } catch (error) {
        next(error);
    }
};

// PUT /api/admin/admins/:id/permissions — update permissions
export const updatePermissions = async (req, res, next) => {
    try {
        const { permissions } = req.body;
        if (!permissions) {
            return res.status(400).json({ error: 'Permissions object is required.' });
        }

        const admin = await User.findById(req.params.id);
        if (!admin) return res.status(404).json({ error: 'Admin not found.' });

        if (admin.role === 'superadmin') {
            return res.status(403).json({ error: 'Cannot modify Super Admin permissions.' });
        }

        admin.permissions = { ...admin.permissions, ...permissions };
        await admin.save();

        res.json({ message: 'Permissions updated.', admin: admin.toProfileJSON() });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/admin/admins/:id — revoke admin
export const revokeAdmin = async (req, res, next) => {
    try {
        const admin = await User.findById(req.params.id);
        if (!admin) return res.status(404).json({ error: 'Admin not found.' });

        if (admin.role === 'superadmin') {
            return res.status(403).json({ error: 'Cannot revoke Super Admin.' });
        }

        admin.role = 'user';
        admin.permissions = {
            manageStories: false,
            manageEvents: false,
            manageGallery: false,
            manageCommunity: false,
            manageUsers: false
        };
        await admin.save();

        res.json({ message: 'Admin access revoked.', user: admin.toProfileJSON() });
    } catch (error) {
        next(error);
    }
};

// GET /api/admin/security-digest — AI-analyzed security logs
export const getSecurityDigest = async (req, res, next) => {
    try {
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const [failedLogins, successfulLogins, recentAdminActions] = await Promise.all([
            SecurityLog.countDocuments({ type: 'login_failure', createdAt: { $gte: last24h } }),
            SecurityLog.countDocuments({ type: 'login_success', createdAt: { $gte: last24h } }),
            SecurityLog.countDocuments({ type: 'admin_action', createdAt: { $gte: last24h } })
        ]);

        // Aggregate top failed users/IPs
        const topFailedUsers = await SecurityLog.aggregate([
            { $match: { type: 'login_failure', createdAt: { $gte: last24h } } },
            { $group: { _id: "$email", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 3 }
        ]);

        const securityData = {
            failedLogins,
            successfulLogins,
            recentAdminActions,
            topFailedUsers: topFailedUsers.map(u => ({ email: u._id, count: u.count })),
            pageViewSpikes: [] // Phase 2 stub
        };

        const aiDigest = await analyzeSecurityLogs(securityData);

        res.json({
            rawMetrics: securityData,
            aiDigest
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/admin/audit?type=admin_action&page=1 — paged security & admin activity (last 30 days)
export const getAuditLog = async (req, res, next) => {
    try {
        const TYPES = ['admin_action', 'login_success', 'login_failure'];
        const type = TYPES.includes(req.query.type) ? req.query.type : null;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = 40;
        const filter = type ? { type } : { type: { $in: TYPES } };

        const [logs, total] = await Promise.all([
            SecurityLog.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('userId', 'name avatar role')
                .lean(),
            SecurityLog.countDocuments(filter)
        ]);

        res.json({
            logs: logs.map(l => ({
                id: l._id,
                type: l.type,
                user: l.userId ? { id: l.userId._id, name: l.userId.name, avatar: l.userId.avatar, role: l.userId.role } : null,
                email: l.email,
                ip: l.ip,
                details: l.details,
                at: l.createdAt
            })),
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        next(error);
    }
};
