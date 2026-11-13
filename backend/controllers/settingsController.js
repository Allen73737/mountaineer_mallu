import SiteSettings from '../models/SiteSettings.js';

// Every page load asks for settings; keep the last answer in memory so it never waits on the database.
// Refreshed after 60 s, and replaced immediately when an admin saves.
let cached = null;
let cachedAt = 0;
const SETTINGS_TTL_MS = 60_000;

// GET /api/settings — public
export const getSettings = async (req, res, next) => {
    try {
        if (!cached || Date.now() - cachedAt > SETTINGS_TTL_MS) {
            const settings = await SiteSettings.getInstance();
            cached = { sections: settings.sections, maintenance: settings.maintenance };
            cachedAt = Date.now();
        }
        res.json({ settings: cached });
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
        cached = { sections: settings.sections, maintenance: settings.maintenance };
        cachedAt = Date.now();

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
