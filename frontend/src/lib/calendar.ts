/**
 * Calendar export for expeditions. Event dates are stored as free text ("Nov 15, 2026") with a
 * separate time ("05:00 AM"); this mirrors backend/utils/eventDate.js so both sides agree.
 */
export interface CalendarEvent {
    _id?: string;
    id?: string;
    title: string;
    date: string;
    time?: string;
    location?: string;
    description?: string;
}

// Alpine day trips: assume a full day on the mountain unless we know better
const DEFAULT_HOURS = 9;
// Trip times are Alpine wall-clock time, whatever timezone the visitor is in (matches the backend's EVENT_TIMEZONE)
export const EVENT_TIMEZONE = 'Europe/Berlin';

const zoneOffset = (instant: number, timeZone: string) => {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
        timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(new Date(instant)).filter(p => p.type !== 'literal').map(p => [p.type, Number(p.value)])) as Record<string, number>;
    return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second) - instant;
};

const zonedTime = (y: number, m: number, d: number, h: number, min: number, timeZone = EVENT_TIMEZONE) => {
    const guess = Date.UTC(y, m, d, h, min);
    let utc = guess - zoneOffset(guess, timeZone);
    utc = guess - zoneOffset(utc, timeZone);
    return new Date(utc);
};

export const parseEventStart = (date?: string, time?: string): { start: Date; allDay: boolean } | null => {
    if (!date) return null;
    const day = new Date(date);
    if (Number.isNaN(day.getTime())) return null;
    const iso = /^\d{4}-\d{2}-\d{2}$/.test(date.trim());
    const y = iso ? day.getUTCFullYear() : day.getFullYear();
    const mo = iso ? day.getUTCMonth() : day.getMonth();
    const d = iso ? day.getUTCDate() : day.getDate();
    const m = /^\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*$/i.exec(time || '');
    if (!m) return { start: new Date(y, mo, d), allDay: true };
    let h = parseInt(m[1], 10) % 24;
    const mer = m[3]?.toLowerCase();
    if (mer === 'pm' && h < 12) h += 12;
    if (mer === 'am' && h === 12) h = 0;
    return { start: zonedTime(y, mo, d, h, parseInt(m[2] || '0', 10)), allDay: false };
};

const pad = (n: number) => String(n).padStart(2, '0');
const utcStamp = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
const dayStamp = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;

const eventUrl = (e: CalendarEvent) => `${window.location.origin}/events/${e._id || e.id || ''}`;
const details = (e: CalendarEvent) => [e.description?.slice(0, 1200), `Trip page: ${eventUrl(e)}`, 'Mountaineer Mallu'].filter(Boolean).join('\n\n');

const range = (e: CalendarEvent) => {
    const parsed = parseEventStart(e.date, e.time);
    if (!parsed) return null;
    if (parsed.allDay) {
        const end = new Date(parsed.start); end.setDate(end.getDate() + 1);
        return { start: dayStamp(parsed.start), end: dayStamp(end), allDay: true };
    }
    const end = new Date(parsed.start.getTime() + DEFAULT_HOURS * 3600 * 1000);
    return { start: utcStamp(parsed.start), end: utcStamp(end), allDay: false };
};

export const canAddToCalendar = (e: CalendarEvent) => !!range(e);

export const googleCalendarUrl = (e: CalendarEvent) => {
    const r = range(e);
    if (!r) return null;
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: `${e.title} · Mountaineer Mallu`,
        dates: `${r.start}/${r.end}`,
        details: details(e),
        location: e.location || '',
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

const icsEscape = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

export const downloadIcs = (e: CalendarEvent) => {
    const r = range(e);
    if (!r) return;
    const uid = `${e._id || e.id || Date.now()}@mountaineermallu.com`;
    const lines = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Mountaineer Mallu//Expeditions//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${utcStamp(new Date())}`,
        r.allDay ? `DTSTART;VALUE=DATE:${r.start}` : `DTSTART:${r.start}`,
        r.allDay ? `DTEND;VALUE=DATE:${r.end}` : `DTEND:${r.end}`,
        `SUMMARY:${icsEscape(`${e.title} · Mountaineer Mallu`)}`,
        `DESCRIPTION:${icsEscape(details(e))}`,
        `LOCATION:${icsEscape(e.location || '')}`,
        `URL:${eventUrl(e)}`,
        // Reminder the evening before (pack the bag) and two hours before the start
        'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Pack your bag — expedition tomorrow', 'TRIGGER:-PT14H', 'END:VALARM',
        'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Expedition starts soon', 'TRIGGER:-PT2H', 'END:VALARM',
        'END:VEVENT', 'END:VCALENDAR',
    ];
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: `${e.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.ics` });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
};
