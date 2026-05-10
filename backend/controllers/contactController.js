import ContactMessage from '../models/ContactMessage.js';

// POST /api/contact
export const submitContact = async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        await ContactMessage.create({ name, email, subject, message });
        res.status(201).json({ message: 'Message received. We will get back to you soon.' });
    } catch (error) {
        next(error);
    }
};
