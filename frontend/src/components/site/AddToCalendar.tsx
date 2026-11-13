import React from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarPlus, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { googleCalendarUrl, downloadIcs, canAddToCalendar, type CalendarEvent } from '../../lib/calendar';
import { API_URL } from '../../lib/constants';

/** Share links go through the backend so WhatsApp/Facebook/X previews show this trip, not the generic site card */
export const shareUrlFor = (kind: 'events' | 'stories', id: string) => `${API_URL || window.location.origin}/share/${kind}/${id}`;

export const shareLink = async (title: string, url: string, copiedLabel: string) => {
    if (navigator.share) {
        try { await navigator.share({ title, url }); return; } catch { /* dismissed */ return; }
    }
    try {
        await navigator.clipboard.writeText(url);
        toast.success(copiedLabel);
    } catch {
        window.prompt('Copy this link', url);
    }
};

const GoogleMark = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <path fill="#4285F4" d="M21.6 12.23c0-.68-.06-1.36-.18-2.02H12v3.83h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.9-1.75 2.99-4.32 2.99-7.33z" />
        <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.43l-3.23-2.5c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.08v2.58A10 10 0 0 0 12 22z" />
        <path fill="#FBBC05" d="M6.41 13.91a6 6 0 0 1 0-3.82V7.51H3.08a10 10 0 0 0 0 8.98l3.33-2.58z" />
        <path fill="#EA4335" d="M12 5.97c1.47 0 2.79.5 3.83 1.5l2.86-2.86A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.92 5.51l3.33 2.58C7.2 7.73 9.4 5.97 12 5.97z" />
    </svg>
);

export const AddToCalendar: React.FC<{ event: CalendarEvent; variant?: 'full' | 'compact'; className?: string }> = ({ event, variant = 'full', className = '' }) => {
    const { t } = useTranslation();
    const id = event._id || event.id || '';
    if (!canAddToCalendar(event)) return null;
    const gcal = googleCalendarUrl(event)!;
    const onShare = () => shareLink(event.title, shareUrlFor('events', id), t('app.calendar.copied'));

    if (variant === 'compact') {
        return (
            <div className={`flex items-center gap-1.5 ${className}`} data-demo-allow>
                <a href={gcal} target="_blank" rel="noopener noreferrer" title={t('app.calendar.google')} aria-label={t('app.calendar.google')}
                    className="inline-flex items-center gap-2 h-9 pl-2.5 pr-3.5 rounded-full border border-current/15 bg-white/[0.04] hover:bg-white/[0.1] text-xs font-semibold transition-colors"
                    onClick={e => e.stopPropagation()}>
                    <GoogleMark /> <CalendarPlus size={14} className="opacity-70" />
                </a>
                <button type="button" onClick={e => { e.preventDefault(); e.stopPropagation(); downloadIcs(event); }} title={t('app.calendar.ics')} aria-label={t('app.calendar.ics')}
                    className="grid place-items-center h-9 w-9 rounded-full border border-current/15 bg-white/[0.04] hover:bg-white/[0.1] transition-colors">
                    <Download size={14} />
                </button>
                <button type="button" onClick={e => { e.preventDefault(); e.stopPropagation(); onShare(); }} title={t('app.calendar.share')} aria-label={t('app.calendar.share')}
                    className="grid place-items-center h-9 w-9 rounded-full border border-current/15 bg-white/[0.04] hover:bg-white/[0.1] transition-colors">
                    <Share2 size={14} />
                </button>
            </div>
        );
    }

    return (
        <div className={`space-y-2.5 ${className}`} data-demo-allow>
            <a
                href={gcal}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 rounded-full bg-white text-[#1f1f1f] font-semibold text-sm flex items-center justify-center gap-2.5 shadow-[0_12px_30px_-12px_rgba(255,255,255,0.4)] hover:shadow-[0_16px_36px_-12px_rgba(255,255,255,0.55)] transition-shadow"
            >
                <GoogleMark /> {t('app.calendar.google')}
            </a>
            <div className="grid grid-cols-2 gap-2.5">
                <button type="button" onClick={() => downloadIcs(event)} className="h-11 rounded-full border border-white/15 text-white/75 hover:text-white hover:border-white/35 text-xs font-semibold flex items-center justify-center gap-2 transition-colors">
                    <Download size={14} /> .ics
                </button>
                <button type="button" onClick={onShare} className="h-11 rounded-full border border-white/15 text-white/75 hover:text-white hover:border-white/35 text-xs font-semibold flex items-center justify-center gap-2 transition-colors">
                    <Share2 size={14} /> {t('app.calendar.share')}
                </button>
            </div>
            <p className="text-[11px] text-white/35 text-center">{t('app.calendar.ics')}</p>
        </div>
    );
};
