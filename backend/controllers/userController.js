import User from '../models/User.js';
import { uploadToCloudinary } from '../services/cloudinary.js';

// PUT /api/users/profile — Complete/update profile
export const updateProfile = async (req, res, next) => {
    try {
        if (req.user.email === 'demo@mountaineermallu.com') {
            return res.status(403).json({ error: 'Action not permitted for demo accounts.' });
        }
        const { place, city, state, zip, phone, whatsapp } = req.body;

        const updates = {
            address: { place, city, state, zip },
            phone,
            whatsapp,
            isProfileComplete: true
        };

        const user = await User.findByIdAndUpdate(req.user._id, updates, {
            new: true,
            runValidators: true
        });

        res.json({ message: 'Profile updated successfully.', user: user.toProfileJSON() });
    } catch (error) {
        next(error);
    }
};

// PUT /api/users/password — Change password
export const changePassword = async (req, res, next) => {
    try {
        if (req.user.email === 'demo@mountaineermallu.com') {
            return res.status(403).json({ error: 'Action not permitted for demo accounts.' });
        }
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new passwords are required.' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'New password must be at least 8 characters.' });
        }

        // Need to explicitly select password
        const user = await User.findById(req.user._id).select('+password');
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        if (!user.password) {
            return res.status(400).json({ error: 'Account has no password (e.g. registered via Google). Please use forgot password or contact support.' });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ error: 'Incorrect current password.' });
        }

        user.password = newPassword;
        await user.save(); // pre-save hook will hash the new password

        res.json({ message: 'Password changed successfully.' });
    } catch (error) {
        next(error);
    }
};

// PUT /api/users/avatar — Upload avatar
export const uploadAvatar = async (req, res, next) => {
    try {
        if (req.user.email === 'demo@mountaineermallu.com') {
            return res.status(403).json({ error: 'Action not permitted for demo accounts.' });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided.' });
        }

        const result = await uploadToCloudinary(req.file.buffer, {
            folder: 'mountaineer-mallu/avatars',
            transformation: [
                { width: 400, height: 400, crop: 'fill', gravity: 'face' },
                { quality: 'auto', fetch_format: 'auto' }
            ]
        });

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { avatar: result.secure_url },
            { new: true }
        );

        res.json({ message: 'Avatar uploaded.', avatar: result.secure_url, user: user.toProfileJSON() });
    } catch (error) {
        next(error);
    }
};

// GET /api/users — List all users (admin)
export const listUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

        const filter = search
            ? { $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] }
            : {};

        const [users, total] = await Promise.all([
            User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
            User.countDocuments(filter)
        ]);

        res.json({
            users: users.map(u => u.toProfileJSON()),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/users/:id — Delete user
export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        if (user.email === 'demo@mountaineermallu.com') {
            return res.status(403).json({ error: 'Cannot delete the demo account.' });
        }

        // Prevent deleting superadmin
        if (user.role === 'superadmin') {
            return res.status(403).json({ error: 'Cannot delete a Super Admin account.' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully.' });
    } catch (error) {
        next(error);
    }
};

// PUT /api/users/:id/role — Change user role
export const changeRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        if (!['user', 'admin', 'superadmin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role.' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // When promoting to admin, give default permissions
        const updates = { role };
        if (role === 'admin') {
            updates.permissions = {
                manageStories: true,
                manageEvents: true,
                manageGallery: false,
                manageCommunity: false,
                manageUsers: false
            };
        } else if (role === 'superadmin') {
            updates.permissions = {
                manageStories: true,
                manageEvents: true,
                manageGallery: true,
                manageCommunity: true,
                manageUsers: true
            };
        } else {
            updates.permissions = {
                manageStories: false,
                manageEvents: false,
                manageGallery: false,
                manageCommunity: false,
                manageUsers: false
            };
        }

        const updated = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
        res.json({ message: 'Role updated.', user: updated.toProfileJSON() });
    } catch (error) {
        next(error);
    }
};

// GET /api/users/me
export const getMyProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('collections.items')
            .populate('downloads');
        if (!user) return res.status(404).json({ error: 'User not found.' });
        res.json({ user: user.toProfileJSON() });
    } catch (error) {
        next(error);
    }
};

// POST /api/users/collections
export const createCollection = async (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Collection name is required.' });

        const user = await User.findById(req.user._id);
        user.collections.push({ name, items: [] });
        await user.save();
        res.status(201).json({ message: 'Collection created.', collections: user.collections });
    } catch (error) {
        next(error);
    }
};

// POST /api/users/collections/:collectionId/items
export const addToCollection = async (req, res, next) => {
    try {
        const { itemId } = req.body;
        if (!itemId) return res.status(400).json({ error: 'Item ID is required.' });

        const user = await User.findById(req.user._id);
        const collection = user.collections.id(req.params.collectionId);
        if (!collection) return res.status(404).json({ error: 'Collection not found.' });

        if (!collection.items.includes(itemId)) {
            collection.items.push(itemId);
            await user.save();
        }
        res.json({ message: 'Added to collection.', collections: user.collections });
    } catch (error) {
        next(error);
    }
};

// POST /api/users/downloads
export const trackDownload = async (req, res, next) => {
    try {
        const { itemId } = req.body;
        if (!itemId) return res.status(400).json({ error: 'Item ID is required.' });

        const user = await User.findById(req.user._id);
        if (!user.downloads.includes(itemId)) {
            user.downloads.push(itemId);
            await user.save();
        }
        res.json({ message: 'Download tracked.', downloads: user.downloads });
    } catch (error) {
        next(error);
    }
};

// GET /api/users/me/expeditions
export const getMyExpeditions = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('expeditionReminders.eventId');
        if (!user) return res.status(404).json({ error: 'User not found.' });
        
        // Filter out any where eventId is null (in case event was deleted)
        const expeditions = user.expeditionReminders.filter(er => er.eventId);
        
        res.json({ expeditions });
    } catch (error) {
        next(error);
    }
};

// PATCH /api/users/me/expeditions/:eventId/reminder
export const toggleExpeditionReminder = async (req, res, next) => {
    try {
        const { eventId } = req.params;
        const { enabled } = req.body;
        
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ error: 'User not found.' });

        const reminder = user.expeditionReminders.find(r => r.eventId.toString() === eventId);
        if (!reminder) {
            return res.status(404).json({ error: 'Expedition registration not found.' });
        }

        reminder.enabled = enabled;
        await user.save();

        res.json({ message: 'Reminder updated successfully.', enabled: reminder.enabled });
    } catch (error) {
        next(error);
    }
};

// GET /api/users/me/wishlist
export const getWishlist = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist');
        if (!user) return res.status(404).json({ error: 'User not found.' });
        res.json({ wishlist: user.wishlist });
    } catch (error) {
        next(error);
    }
};

// PATCH /api/users/me/wishlist/:itemId
export const toggleWishlist = async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const user = await User.findById(req.user._id);
        
        if (!user) return res.status(404).json({ error: 'User not found.' });

        const index = user.wishlist.indexOf(itemId);
        let added = false;

        if (index > -1) {
            user.wishlist.splice(index, 1);
        } else {
            user.wishlist.push(itemId);
            added = true;
        }

        await user.save();
        res.json({ message: added ? 'Added to wishlist' : 'Removed from wishlist', wishlist: user.wishlist });
    } catch (error) {
        next(error);
    }
};
