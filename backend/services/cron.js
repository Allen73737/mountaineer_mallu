import cron from 'node-cron';
import cluster from 'cluster';
import User from '../models/User.js';
import Event from '../models/Event.js';
import { sendEventReminderEmail } from './email.js';
import { notify } from './notify.js';
import { parseEventStart, zonedTime, EVENT_TIMEZONE } from '../utils/eventDate.js';

// Calendar day [start, end) in the events' time zone, `offset` days from today
const zonedDay = (offset, now = new Date()) => {
    const [y, m, d] = new Intl.DateTimeFormat('en-CA', { timeZone: EVENT_TIMEZONE }).format(now).split('-').map(Number);
    return [zonedTime(y, m - 1, d + offset), zonedTime(y, m - 1, d + offset + 1)];
};

/**
 * Remind everyone going on an expedition that starts tomorrow: an in-app notification for every
 * participant, and an email unless they switched that trip's reminder off. Visitors who asked for a
 * reminder without registering get the email too.
 */
export const sendExpeditionReminders = async (now = new Date()) => {
    const [from, to] = zonedDay(1, now);
    // Event dates are free text ("Nov 15, 2026"), so they are parsed here rather than queried
    const events = (await Event.find().select('title date time location participants').lean())
        .filter(e => {
            const start = parseEventStart(e.date, e.time);
            return start && start >= from && start < to;
        });

    let sent = 0;
    for (const event of events) {
        const participantIds = (event.participants || []).map(String);
        await notify(participantIds, {
            type: 'system',
            title: `Tomorrow: ${event.title}`,
            body: `${event.date}${event.time ? ` · ${event.time}` : ''} · ${event.location}. Check your gear list and the weather tonight.`,
            link: `/events/${event._id}`,
        });

        const users = await User.find({
            $or: [{ _id: { $in: participantIds } }, { expeditionReminders: { $elemMatch: { eventId: event._id, enabled: true } } }],
        }).select('name email expeditionReminders').lean();

        for (const user of users) {
            const pref = (user.expeditionReminders || []).find(r => String(r.eventId) === String(event._id));
            if (pref && pref.enabled === false) continue;
            try {
                await sendEventReminderEmail(user.email, user.name, event.title, event.date, event.location);
                sent++;
            } catch (err) {
                console.error(`Failed to send reminder for ${event.title}:`, err.message);
            }
        }
    }
    return { events: events.length, emails: sent };
};

export const startCronJobs = () => {
    // With several cluster workers, only the first one schedules jobs — otherwise everyone gets N emails
    if (cluster.isWorker && cluster.worker?.id !== 1) return;

    // Every day at 10:00 in the events' time zone
    cron.schedule('0 10 * * *', async () => {
        try {
            const { events, emails } = await sendExpeditionReminders();
            console.log(`✅ Expedition reminders: ${events} event(s) tomorrow, ${emails} email(s) sent.`);
        } catch (error) {
            console.error('❌ Expedition reminder job failed:', error);
        }
    }, { timezone: EVENT_TIMEZONE });
};
