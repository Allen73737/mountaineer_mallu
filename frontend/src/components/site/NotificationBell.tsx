import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, BellOff, CheckCheck, MessageCircle, Heart, AtSign, UserPlus, BookOpen, Image as ImageIcon, Star, Calendar, Megaphone, type LucideIcon } from 'lucide-react';
import { useNotifications } from '../../store/useNotifications';
import { useAuthStore } from '../../store/useAuthStore';

const TYPE_ICON: Record<string, LucideIcon> = {
    comment: MessageCircle, reaction: Heart, mention: AtSign, join_request: UserPlus, join_approved: UserPlus,
    story_status: BookOpen, media_status: ImageIcon, review_status: Star, event_registered: Calendar, event_message: Megaphone,
};

const timeAgo = (iso: string, locale: string) => {
    const diff = (Date.parse(iso) - Date.now()) / 1000;
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    const units: [Intl.RelativeTimeFormatUnit, number][] = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
    for (const [unit, secs] of units) if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit);
    return rtf.format(Math.round(diff), 'second');
};

/** Bell + dropdown inbox. Renders nothing for signed-out visitors. */
export const NotificationBell: React.FC<{ className?: string; align?: 'left' | 'right' }> = ({ className = '', align = 'right' }) => {
    const { isLoggedIn } = useAuthStore();
    const { items, unread, loaded, markRead, markAllRead, clear } = useNotifications();
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const rootRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState<{ top: number; left?: number; right?: number }>({ top: 72, right: 16 });

    useEffect(() => {
        if (!open) return;
        // The panel is portalled to <body> (headers clip overflow), so anchor it to the button by hand
        const place = () => {
            const r = rootRef.current?.getBoundingClientRect();
            if (!r) return;
            setPos(align === 'right'
                ? { top: r.bottom + 12, right: Math.max(8, window.innerWidth - r.right) }
                : { top: r.bottom + 12, left: Math.max(8, r.left) });
        };
        place();
        const onDown = (e: MouseEvent) => {
            const t = e.target as Node;
            if (!rootRef.current?.contains(t) && !panelRef.current?.contains(t)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        window.addEventListener('resize', place);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('keydown', onKey);
            window.removeEventListener('resize', place);
        };
    }, [open, align]);

    if (!isLoggedIn) return null;

    return (
        <div ref={rootRef} className="relative" data-demo-allow>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                aria-label={`${t('app.notifications.open')}${unread ? ` (${unread})` : ''}`}
                aria-expanded={open}
                className={`relative ${className}`}
            >
                <Bell size={16} />
                {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-alpine-sunrise text-[#1B0F08] text-[10px] font-bold grid place-items-center ring-2 ring-[#05080D] tabular-nums">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {createPortal(<AnimatePresence>
                {open && (
                    <motion.div
                        ref={panelRef}
                        data-demo-allow
                        style={pos}
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className={`fixed w-[min(92vw,380px)] z-[95] rounded-2xl border border-alpine-glacier/15 bg-[#0A111C]/95 backdrop-blur-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85)] overflow-hidden text-white`}
                    >
                        <div className="flex items-center justify-between px-4 h-12 border-b border-white/[0.07]">
                            <p className="font-serif text-xl">{t('app.notifications.title')}</p>
                            <div className="flex items-center gap-1">
                                {unread > 0 && (
                                    <button onClick={markAllRead} className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors">
                                        <CheckCheck size={14} /> <span className="hidden sm:inline">{t('app.notifications.markAll')}</span>
                                    </button>
                                )}
                                {items.length > 0 && (
                                    <button onClick={clear} className="h-8 px-2.5 rounded-lg text-xs text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors">
                                        {t('app.notifications.clear')}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto mm-scroll" data-lenis-prevent>
                            {!loaded ? (
                                <div className="p-4 space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-12 rounded-xl bg-white/[0.04] animate-pulse" />)}</div>
                            ) : items.length === 0 ? (
                                <div className="px-6 py-12 text-center">
                                    <span className="mx-auto mb-4 grid place-items-center w-12 h-12 rounded-full border border-white/10 text-white/40"><BellOff size={18} /></span>
                                    <p className="text-sm text-white/80">{t('app.notifications.empty')}</p>
                                    <p className="text-xs text-white/40 mt-1">{t('app.notifications.emptyHint')}</p>
                                </div>
                            ) : (
                                <ul className="py-1.5">
                                    {items.map(n => {
                                        const Icon = TYPE_ICON[n.type] || Bell;
                                        return (
                                            <li key={n._id}>
                                                <button
                                                    onClick={() => { markRead(n._id); setOpen(false); if (n.link) navigate(n.link); }}
                                                    className="w-full flex gap-3 px-4 py-3 text-left hover:bg-white/[0.04] transition-colors"
                                                >
                                                    <span className="relative shrink-0">
                                                        {n.actor?.avatar
                                                            ? <img loading="lazy" decoding="async" src={n.actor.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                                                            : <span className="w-9 h-9 rounded-full grid place-items-center bg-alpine-glacier/10 text-alpine-glacier"><Icon size={15} /></span>}
                                                        {n.actor?.avatar && <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full grid place-items-center bg-[#0A111C] text-alpine-glacier"><Icon size={11} /></span>}
                                                    </span>
                                                    <span className="flex-1 min-w-0">
                                                        <span className={`block text-sm leading-snug ${n.read ? 'text-white/60' : 'text-white'}`}>{n.title}</span>
                                                        {n.body && <span className="block text-xs text-white/40 mt-0.5 line-clamp-2">{n.body}</span>}
                                                        <span className="block font-mono text-[10px] tracking-[0.1em] text-white/30 mt-1">{timeAgo(n.createdAt, i18n.language)}</span>
                                                    </span>
                                                    {!n.read && <span className="w-2 h-2 rounded-full bg-alpine-glacier mt-1.5 shrink-0 shadow-[0_0_8px_rgba(163,201,226,0.8)]" />}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>, document.body)}
        </div>
    );
};
