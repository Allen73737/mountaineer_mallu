import jwt from 'jsonwebtoken';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

let ioRef = null;

const readCookie = (header = '', name) => {
    for (const part of header.split(';')) {
        const [k, ...v] = part.trim().split('=');
        if (k === name) return decodeURIComponent(v.join('='));
    }
    return null;
};

/**
 * Wire Socket.IO so each signed-in browser joins a private `user:<id>` room (for notifications)
 * and can follow community groups (`group:<id>`) for live posts. Anonymous sockets still get the
 * public broadcasts (site settings) they always did.
 */
export const attachRealtime = (io) => {
    ioRef = io;

    io.use(async (socket, next) => {
        try {
            const token = readCookie(socket.handshake.headers.cookie, 'jwt');
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.userId).select('_id tokenVersion');
                if (user && user.tokenVersion === decoded.tokenVersion) socket.data.userId = user._id.toString();
            }
        } catch {
            // Invalid or expired cookie: stay anonymous
        }
        next();
    });

    io.on('connection', (socket) => {
        if (socket.data.userId) socket.join(`user:${socket.data.userId}`);

        socket.on('group:follow', (groupId) => {
            if (socket.data.userId && /^[a-f0-9]{24}$/i.test(String(groupId))) socket.join(`group:${groupId}`);
        });
        socket.on('group:unfollow', (groupId) => socket.leave(`group:${groupId}`));
    });
};

export const emitToGroup = (groupId, event, payload) => {
    ioRef?.to(`group:${groupId}`).emit(event, payload);
};

/**
 * Create notifications for one or more users and push them live.
 * Never throws — a failed notification must not fail the action that caused it.
 */
export const notify = async (recipients, { type, title, body = '', link = '', actor = null }) => {
    try {
        const ids = [...new Set((Array.isArray(recipients) ? recipients : [recipients])
            .filter(Boolean)
            .map(String))]
            .filter(id => !actor || id !== String(actor));
        if (!ids.length) return;

        const docs = await Notification.insertMany(ids.map(recipient => ({ recipient, actor, type, title, body: body.slice(0, 500), link })));
        if (ioRef) {
            const actorDoc = actor ? await User.findById(actor).select('name avatar').lean() : null;
            for (const doc of docs) {
                ioRef.to(`user:${doc.recipient}`).emit('notification', { ...doc.toObject(), actor: actorDoc });
            }
        }
    } catch (err) {
        logger.error(`notify failed: ${err.message}`);
    }
};
