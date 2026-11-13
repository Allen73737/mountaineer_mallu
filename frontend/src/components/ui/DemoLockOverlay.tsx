import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, UserPlus, X, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

/**
 * Read-only demo. Visitors can browse every screen — navigate, open tabs, scroll, read —
 * and only actions that would change data (typing, saving, uploading, joining…) are
 * intercepted with an invitation to create a real account. The API also rejects demo
 * writes, so this layer is about a graceful experience, not security.
 */
const WRITE_VERBS = /\b(save|submit|publish|delete|remove|upload|join|leave|register|rsvp|create|add|update|edit|change|post|send|apply|follow|like|buy|checkout|cart|wishlist|approve|reject|reset|confirm|request|book)\b/i;

const isWriteAction = (el: HTMLElement): boolean => {
    if (el.closest('[data-demo-allow], .driver-popover, [data-demo-ui]')) return false;
    if (el.closest('[data-demo-block]')) return true;
    if (el.closest('input:not([type=search]), textarea, select, [contenteditable="true"], label[for]')) return true;
    const control = el.closest('button, [role="button"], input[type=submit]') as HTMLElement | null;
    if (!control) return false;
    if ((control as HTMLButtonElement).type === 'submit') return true;
    const label = `${control.getAttribute('aria-label') || ''} ${control.getAttribute('title') || ''} ${control.textContent || ''}`;
    return WRITE_VERBS.test(label);
};

export const DemoLockOverlay = () => {
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const { logoutAsync } = useAuthStore();

    const exitDemo = useCallback(async (to: string = '/') => {
        setShowModal(false);
        await logoutAsync();
        navigate(to);
    }, [logoutAsync, navigate]);

    useEffect(() => {
        const intercept = (e: Event) => {
            const target = e.target as HTMLElement | null;
            if (!target || !(target instanceof HTMLElement)) return;
            if (!isWriteAction(target)) return;
            e.preventDefault();
            e.stopPropagation();
            if (target instanceof HTMLElement && typeof target.blur === 'function') target.blur();
            setShowModal(true);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { setShowModal(false); return; }
            if (e.key !== 'Enter' && e.key !== ' ') return;
            intercept(e);
        };
        const onSubmit = (e: Event) => {
            const t = e.target as HTMLElement;
            if (t.closest('[data-demo-allow]')) return;
            e.preventDefault();
            e.stopPropagation();
            setShowModal(true);
        };
        // Capture phase: runs before any React handler underneath
        document.addEventListener('click', intercept, true);
        document.addEventListener('focusin', intercept, true);
        document.addEventListener('keydown', onKey, true);
        document.addEventListener('submit', onSubmit, true);
        document.addEventListener('change', intercept, true);
        return () => {
            document.removeEventListener('click', intercept, true);
            document.removeEventListener('focusin', intercept, true);
            document.removeEventListener('keydown', onKey, true);
            document.removeEventListener('submit', onSubmit, true);
            document.removeEventListener('change', intercept, true);
        };
    }, []);

    return (
        <>
            {/* Persistent ribbon */}
            <motion.div
                data-demo-ui
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.4 }}
                className="fixed bottom-4 left-1/2 -translate-x-1/2 lg:bottom-6 z-[90] max-w-[calc(100vw-1.5rem)] max-lg:bottom-[5.75rem]"
            >
                <div className="mm-demo-ribbon !border rounded-full pl-4 pr-1.5 py-1.5 flex items-center gap-3 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)]">
                    <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.24em] uppercase text-alpine-glacier whitespace-nowrap">
                        <Eye size={13} /> <span className="hidden sm:inline">Demo · </span>Read-only
                    </span>
                    <button onClick={() => exitDemo('/signup')} className="h-8 px-3.5 rounded-full bg-alpine-snow text-alpine-navy text-xs font-semibold whitespace-nowrap hover:bg-white transition-colors">
                        Create account
                    </button>
                    <button onClick={() => exitDemo('/')} className="h-8 w-8 grid place-items-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors" aria-label="Exit demo" title="Exit demo">
                        <LogOut size={14} />
                    </button>
                </div>
            </motion.div>

            <AnimatePresence>
                {showModal && (
                    <div data-demo-ui className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#03060B]/75 backdrop-blur-md"
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="demo-title"
                            initial={{ opacity: 0, y: 24, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 12, scale: 0.98 }}
                            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                            className="relative w-full max-w-md rounded-[1.75rem] border border-alpine-glacier/15 bg-gradient-to-b from-[#0F1A2A] to-[#070B12] p-8 text-center shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)] overflow-hidden"
                        >
                            <div className="absolute inset-x-10 -top-px h-px bg-gradient-to-r from-transparent via-alpine-glacier/60 to-transparent" />
                            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-alpine-blue/25 blur-[90px] pointer-events-none" />

                            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 rounded-full text-white/40 hover:text-white hover:bg-white/5 transition-colors" aria-label="Close">
                                <X size={18} />
                            </button>

                            <div className="relative">
                                <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-alpine-glacier/70 mb-4">Demo · read-only</p>
                                <h3 id="demo-title" className="font-serif text-4xl text-white leading-tight mb-3">
                                    This trail needs <em className="text-alpine-glacier">your</em> boots
                                </h3>
                                <p className="text-white/55 text-sm leading-relaxed mb-8">
                                    You're exploring a live preview. Create a free explorer account to write stories, upload media, join factions and register for expeditions.
                                </p>

                                <div className="flex flex-col-reverse sm:flex-row gap-3">
                                    <button onClick={() => setShowModal(false)} className="flex-1 h-12 rounded-full border border-white/15 text-white/70 hover:text-white hover:border-white/30 text-sm font-semibold transition-colors">
                                        Keep exploring
                                    </button>
                                    <button onClick={() => exitDemo('/signup')} className="flex-1 h-12 rounded-full bg-alpine-snow text-alpine-navy hover:bg-white text-sm font-semibold flex items-center justify-center gap-2 shadow-[0_14px_40px_-12px_rgba(163,201,226,0.6)] transition-colors">
                                        <UserPlus size={16} /> Create account
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
