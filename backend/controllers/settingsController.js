import SiteSettings from '../models/SiteSettings.js';

// GET /api/settings — public
export const getSettings = async (req, res, next) => {
    try {
        const settings = await SiteSettings.getInstance();
        res.json({ settings: { sections: settings.sections, maintenance: settings.maintenance } });
    } catch (error) {
        next(error);
    }
};

// PUT /api/settings — admin only, emits Socket.io event
export const updateSettings = async (req, res, next) => {
    try {
        const { sections, maintenance } = req.body;
        const settings = await SiteSettings.getInstance();

        if (sections) {
            Object.entries(sections).forEach(([key, value]) => {
                if (settings.sections[key] !== undefined) {
                    settings.sections[key] = value;
                }
            });
        }

        if (maintenance !== undefined) {
            if (maintenance.enabled !== undefined) settings.maintenance.enabled = maintenance.enabled;
            if (maintenance.message !== undefined) settings.maintenance.message = maintenance.message;
            if (maintenance.allowAdminAccess !== undefined) settings.maintenance.allowAdminAccess = maintenance.allowAdminAccess;
        }

        await settings.save();

        // Emit real-time update to all connected clients
        const io = req.app.get('io');
        if (io) {
            io.emit('settings:updated', {
                sections: settings.sections,
                maintenance: settings.maintenance
            });
        }

        res.json({
            message: 'Settings updated successfully.',
            settings: { sections: settings.sections, maintenance: settings.maintenance }
        });
    } catch (error) {
        next(error);
    }
};
