import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Send, Mail, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { eventAdminApi } from '../../lib/api';
import { Loader2 } from '../ui/BrandLoader';

const TEMPLATES = [
    { label: 'Meeting point', subject: 'Meeting point & time', message: 'Hi all — we meet at [place] at [time]. Please arrive 15 minutes early so we can do a quick gear check.' },
    { label: 'Weather update', subject: 'Weather update', message: 'Quick update on conditions: [forecast]. The plan stays [on / changed to …]. Pack an extra warm layer and waterproofs.' },
    { label: 'Gear reminder', subject: 'Gear checklist', message: 'Reminder of the essentials: helmet, harness, crampons (if listed), 2L water, headlamp, first-aid kit and a warm layer.' },
];

/** Email + in-app notification to everyone registered on an expedition. */
export const MessageParticipants: React.FC<{ event: any | null; onClose: () => void }> = ({ event, onClose }) => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState(true);
    const [notification, setNotification] = useState(true);
    const [sending, setSending] = useState(false);
    const count = event?.participants?.length || 0;

    useEffect(() => { if (event) { setSubject(''); setMessage(''); setEmail(true); setNotification(true); } }, [event]);

    const send = async () => {
        if (!event || !subject.trim() || !message.trim() || (!email && !notification)) return;
        setSending(true);
        try {
            const res = await eventAdminApi.message(event._id, { subject, message, channels: { email, notification } });
            toast.success(res.message, { description: email ? `${res.emailed} of ${res.recipients} emails delivered to the mail server.` : undefined });
            onClose();
        } catch (e: any) {
            toast.error(e.message || 'Could not send the message.');
        } finally {
            setSending(false);
        }
    };

    return createPortal(
        <AnimatePresence>
            {event && (
                <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="msg-title">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    <motion.div
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 38 }}
                        className="mm-console dark relative w-full sm:max-w-xl mm-panel !rounded-t-[1.75rem] sm:!rounded-[1.75rem] !bg-[#0A111C] p-6 sm:p-8 text-[var(--mm-ink)] max-h-[92dvh] overflow-y-auto"
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full mm-faint hover:text-[var(--mm-ink)]" aria-label="Close"><X size={18} /></button>
                        <p className="mm-eyebrow mb-2">Message participants</p>
                        <h2 id="msg-title" className="mm-title text-3xl pr-8">{event.title}</h2>
                        <p className="mm-muted text-sm mt-2">{count} registered explorer{count === 1 ? '' : 's'} will receive this.</p>

                        <div className="flex flex-wrap gap-2 mt-6">
                            {TEMPLATES.map(t => (
                                <button key={t.label} type="button" onClick={() => { setSubject(t.subject); setMessage(t.message); }} className="h-8 px-3 rounded-full border border-[var(--mm-line-strong)] text-xs mm-muted hover:text-[var(--mm-ink)] transition-colors">
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        <label className="block mt-5">
                            <span className="font-mono text-[10px] tracking-[0.24em] uppercase mm-faint">Subject</span>
                            <input value={subject} onChange={e => setSubject(e.target.value)} maxLength={150} className="mt-2 w-full bg-white/[0.04] border border-[var(--mm-line)] rounded-xl px-4 py-3 text-sm outline-none" placeholder="e.g. Meeting point & time" />
                        </label>
                        <label className="block mt-4">
                            <span className="font-mono text-[10px] tracking-[0.24em] uppercase mm-faint">Message</span>
                            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={6} maxLength={5000} className="mt-2 w-full bg-white/[0.04] border border-[var(--mm-line)] rounded-xl px-4 py-3 text-sm outline-none resize-none leading-relaxed" placeholder="Write to everyone on the rope…" />
                            <span className="block text-right text-[10px] mm-faint tabular-nums">{message.length}/5000</span>
                        </label>

                        <div className="flex flex-wrap gap-2 mt-2">
                            {[
                                { on: email, set: setEmail, icon: Mail, label: 'Email' },
                                { on: notification, set: setNotification, icon: Bell, label: 'In-app notification' },
                            ].map(c => (
                                <button key={c.label} type="button" onClick={() => c.set(!c.on)} aria-pressed={c.on}
                                    className={`h-10 px-4 rounded-full border text-xs font-medium flex items-center gap-2 transition-colors ${c.on ? 'border-alpine-glacier/40 bg-alpine-glacier/10 text-[var(--mm-ink)]' : 'border-[var(--mm-line)] mm-faint'}`}>
                                    <c.icon size={14} /> {c.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row gap-3 mt-7">
                            <button onClick={onClose} className="flex-1 mm-btn mm-btn--ghost !h-12">Cancel</button>
                            <button onClick={send} disabled={sending || !count || !subject.trim() || !message.trim() || (!email && !notification)} className="flex-1 mm-btn mm-btn--primary !h-12 disabled:opacity-40">
                                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />} Send to {count}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};
