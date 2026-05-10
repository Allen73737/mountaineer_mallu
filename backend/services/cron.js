import cron from 'node-cron';
import User from '../models/User.js';
import Event from '../models/Event.js';
import { sendEventReminderEmail } from './email.js';

export const startCronJobs = () => {
    // Run every day at 10:00 AM server time
    cron.schedule('0 10 * * *', async () => {
        console.log('⏳ Running daily cron job: Checking for expedition reminders...');
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];

            const upcomingEvents = await Event.find({ date: tomorrowStr });

            if (upcomingEvents.length === 0) {
                console.log('✅ No events scheduled for tomorrow. Reminders skipped.');
                return;
            }

            for (const event of upcomingEvents) {
                const usersToRemind = await User.find({
                    'expeditionReminders': {
                        $elemMatch: { eventId: event._id, enabled: true }
                    }
                });

                if (usersToRemind.length > 0) {
                    console.log(`📧 Sending reminders for event: ${event.title} to ${usersToRemind.length} participants.`);
                    for (const user of usersToRemind) {
                        try {
                            await sendEventReminderEmail(
                                user.email,
                                user.name,
                                event.title,
                                event.date,
                                event.location
                            );
                        } catch (err) {
                            console.error(`Failed to send reminder to ${user.email}:`, err);
                        }
                    }
                }
            }
            console.log('✅ Daily reminder cron job completed.');
        } catch (error) {
            console.error('❌ Error in daily cron job:', error);
        }
    });
};
