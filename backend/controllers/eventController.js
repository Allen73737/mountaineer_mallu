import Event from '../models/Event.js';
import User from '../models/User.js';
import { uploadToCloudinary } from '../services/cloudinary.js';
import { sendEventRegistrationEmail } from '../services/email.js';

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
        const { title, date, time, location, difficulty, totalSlots, type, description, whatsappGroupUrl, ticketUrl } = req.body;

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
