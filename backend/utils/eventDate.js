// Event dates are stored as free text ("Nov 15, 2026", "2026-11-15") with a separate time ("05:00 AM").
// Parse them into a real instant once, here, so calendars, sorting and "upcoming" filters agree.
//
// The text is Alpine wall-clock time, so it is read in EVENT_TIMEZONE (default Europe/Berlin),
// never in the server's own zone — a server in UTC or IST would otherwise shift every trip.
export const EVENT_TIMEZONE = process.env.EVENT_TIMEZONE || 'Europe/Berlin';

// Offset (ms) of `timeZone` from UTC at the given instant, DST-aware
const zoneOffset = (instant, timeZone) => {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
        timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).formatToParts(new Date(instant)).filter(p => p.type !== 'literal').map(p => [p.type, Number(p.value)]));
    const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    return asUtc - instant;
};

/** Wall-clock time in `timeZone` → Date (the matching instant). */
export const zonedTime = (y, m, d, h = 0, min = 0, timeZone = EVENT_TIMEZONE) => {
    const guess = Date.UTC(y, m, d, h, min);
    let utc = guess - zoneOffset(guess, timeZone);
    utc = guess - zoneOffset(utc, timeZone); // second pass settles DST transition days
    return new Date(utc);
};

export const parseEventStart = (date, time) => {
    if (!date) return null;
    const day = new Date(date);
    if (Number.isNaN(day.getTime())) return null;
    // ISO "2026-11-15" parses as UTC midnight; "Nov 15, 2026" as local midnight — read the matching fields
    const iso = /^\d{4}-\d{2}-\d{2}$/.test(String(date).trim());
    const y = iso ? day.getUTCFullYear() : day.getFullYear();
    const mo = iso ? day.getUTCMonth() : day.getMonth();
    const d = iso ? day.getUTCDate() : day.getDate();

    let h = 0, min = 0;
    const m = /^\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*$/i.exec(time || '');
    if (m) {
        h = parseInt(m[1], 10) % 24;
        min = parseInt(m[2] || '0', 10);
        const mer = m[3]?.toLowerCase();
        if (mer === 'pm' && h < 12) h += 12;
        if (mer === 'am' && h === 12) h = 0;
    }
    return zonedTime(y, mo, d, h, min);
};

export const isUpcoming = (event, now = new Date()) => {
    const start = parseEventStart(event.date, event.time);
    // Keep an event "upcoming" for the whole day it happens on
    return !!start && start.getTime() >= now.getTime() - 12 * 60 * 60 * 1000;
};
