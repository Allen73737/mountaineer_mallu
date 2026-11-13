import Event from '../models/Event.js';
import User from '../models/User.js';
import { uploadToCloudinary, uploadUrlToCloudinary } from '../services/cloudinary.js';
import { sendEventRegistrationEmail, sendEmail } from '../services/email.js';
import { notify } from '../services/notify.js';

// GET /api/events
export const listEvents = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [events, total] = await Promise.all([
            Event.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            Event.countDocuments()
        ]);

        res.json({
            events,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/events/:id
export const getEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id).populate('participants', 'name avatar email');
        if (!event) return res.status(404).json({ error: 'Event not found.' });
        res.json({ event });
    } catch (error) {
        next(error);
    }
};

// POST /api/events
export const createEvent = async (req, res, next) => {
    try {
        const { title, date, time, location, difficulty, totalSlots, type, description, whatsappGroupUrl, ticketUrl, category } = req.body;

        let imageUrl = req.body.image || '';
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, {
                folder: 'mountaineer-mallu/events',
                transformation: [
                    { width: 1600, crop: 'limit' },
                    { quality: 'auto', fetch_format: 'auto' }
                ]
            });
            imageUrl = result.secure_url;
        } else if (req.body.unsplashUrl) {
            const result = await uploadUrlToCloudinary(req.body.unsplashUrl, {
                folder: 'mountaineer-mallu/events',
                transformation: [
                    { width: 1600, crop: 'limit' },
                    { quality: 'auto', fetch_format: 'auto' }
                ]
            });
            imageUrl = result.secure_url;
        }

        const event = await Event.create({
            title, date, time, location, difficulty,
            totalSlots: parseInt(totalSlots),
            type, description, image: imageUrl,
            whatsappGroupUrl, ticketUrl,
            createdBy: req.user._id
        });

        res.status(201).json({ message: 'Event created.', event });
    } catch (error) {
        next(error);
    }
};

// PUT /api/events/:id
export const updateEvent = async (req, res, next) => {
    try {
        const updates = { ...req.body };
        if (updates.totalSlots) updates.totalSlots = parseInt(updates.totalSlots);

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, {
                folder: 'mountaineer-mallu/events',
                transformation: [{ width: 1600, crop: 'limit' }, { quality: 'auto', fetch_format: 'auto' }]
            });
            updates.image = result.secure_url;
        } else if (req.body.unsplashUrl) {
            const result = await uploadUrlToCloudinary(req.body.unsplashUrl, {
                folder: 'mountaineer-mallu/events',
                transformation: [{ width: 1600, crop: 'limit' }, { quality: 'auto', fetch_format: 'auto' }]
            });
            updates.image = result.secure_url;
        }

        // Don't allow overwriting participants through this route
        delete updates.participants;
        Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

        const event = await Event.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
        if (!event) return res.status(404).json({ error: 'Event not found.' });

        res.json({ message: 'Event updated.', event });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/events/:id
export const deleteEvent = async (req, res, next) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found.' });
        res.json({ message: 'Event deleted.' });
    } catch (error) {
        next(error);
    }
};

// POST /api/events/:id/register
export const registerForEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found.' });

        if (event.participants.includes(req.user._id)) {
            return res.status(400).json({ error: 'Already registered for this event.' });
        }

        if (event.participants.length >= event.totalSlots) {
            return res.status(400).json({ error: 'Event is full. No slots available.' });
        }

        event.participants.push(req.user._id);
        await event.save();

        // Add to user's expedition reminders
        await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { 
                expeditionReminders: { eventId: event._id, enabled: true } 
            }
        });

        notify(req.user._id, {
            type: 'event_registered',
            title: `You're roped in: ${event.title}`,
            body: `${event.date} · ${event.location}. Add it to your calendar from the trip page.`,
            link: `/events/${event._id}`
        });

        // Send confirmation email (non-blocking)
        sendEventRegistrationEmail(req.user.email, req.user.name, event.title, event.date, event.location)
            .catch(err => console.error('Email send failed:', err));

        res.json({ message: 'Registered successfully.', event });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/events/:id/unregister
export const unregisterFromEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found.' });

        const idx = event.participants.indexOf(req.user._id);
        if (idx === -1) {
            return res.status(400).json({ error: 'Not registered for this event.' });
        }

        event.participants.splice(idx, 1);
        await event.save();

        // Remove from user's expedition reminders
        await User.findByIdAndUpdate(req.user._id, {
            $pull: { expeditionReminders: { eventId: event._id } }
        });

        res.json({ message: 'Unregistered successfully.', event });
    } catch (error) {
        next(error);
    }
};

const csvCell = (v) => {
    const s = v == null ? '' : String(v);
    // Neutralise spreadsheet formulas and quote everything
    const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
    return `"${safe.replace(/"/g, '""')}"`;
};

// GET /api/events/:id/participants.csv — admin
export const exportParticipants = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id).populate('participants', 'name email phone createdAt');
        if (!event) return res.status(404).json({ error: 'Event not found.' });
        const rows = [['Name', 'Email', 'Phone', 'Member since']].concat(
            event.participants.map(p => [p.name, p.email, p.phone || '', p.createdAt ? new Date(p.createdAt).toISOString().slice(0, 10) : ''])
        );
        const csv = '\ufeff' + rows.map(r => r.map(csvCell).join(',')).join('\r\n');
        const fileName = `${event.title.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'expedition'}-participants.csv`;
        res.set('Content-Type', 'text/csv; charset=utf-8');
        res.set('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(csv);
    } catch (error) {
        next(error);
    }
};

// POST /api/events/:id/message — admin: { subject, message, channels: { email, notification } }
export const messageParticipants = async (req, res, next) => {
    try {
        const { subject, message, channels = { email: true, notification: true } } = req.body;
        if (!subject?.trim() || !message?.trim()) return res.status(400).json({ error: 'Subject and message are required.' });
        if (subject.length > 150 || message.length > 5000) return res.status(400).json({ error: 'Message is too long.' });

        const event = await Event.findById(req.params.id).populate('participants', 'name email');
        if (!event) return res.status(404).json({ error: 'Event not found.' });
        if (!event.participants.length) return res.status(400).json({ error: 'Nobody is registered yet.' });

        if (channels.notification !== false) {
            notify(event.participants.map(p => p._id), {
                type: 'event_message', actor: req.user._id,
                title: `${event.title}: ${subject.trim()}`,
                body: message.trim(),
                link: `/events/${event._id}`
            });
        }

        let emailed = 0;
        if (channels.email !== false) {
            const escapeHtml = (t) => t.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
            const results = await Promise.allSettled(event.participants.map(p => sendEmail(
                p.email,
                `${event.title} — ${subject.trim()}`,
                `Hi ${p.name},\n\n${message.trim()}\n\n— Mountaineer Mallu`,
                `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto;color:#08284C"><p>Hi ${escapeHtml(p.name)},</p><p style="white-space:pre-wrap;line-height:1.6">${escapeHtml(message.trim())}</p><p style="color:#4A6A8C">— Mountaineer Mallu · ${escapeHtml(event.title)}</p></div>`
            )));
            emailed = results.filter(r => r.status === 'fulfilled').length;
        }

        res.json({ message: `Sent to ${event.participants.length} participant${event.participants.length === 1 ? '' : 's'}.`, recipients: event.participants.length, emailed });
    } catch (error) {
        next(error);
    }
};
