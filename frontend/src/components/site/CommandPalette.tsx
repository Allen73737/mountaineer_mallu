import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { create } from 'zustand';
import {
    Search, BookOpen, Calendar, Compass, Image as ImageIcon, Users, ShoppingBag, CornerDownLeft,
    Home, Mail, Star, LayoutDashboard, Shield, Clock, ArrowUpRight, Award, PenTool, type LucideIcon
} from 'lucide-react';
import { searchApi, type SearchResult } from '../../lib/api';
import { useAuthStore } from '../../store/useAuthStore';

export const useCommandPalette = create<{ open: boolean; setOpen: (v: boolean) => void; toggle: () => void }>(set => ({
    open: false,
    setOpen: (open) => set({ open }),
    toggle: () => set(s => ({ open: !s.open })),
}));

const KIND_ICON: Record<string, LucideIcon> = {
    story: BookOpen, event: Calendar, group: Compass, media: ImageIcon, team: Users, shop: ShoppingBag, page: ArrowUpRight,
};

type Item = { key: string; kind: string; title: string; subtitle?: string; image?: string; href: string; icon?: LucideIcon };

const RECENT_KEY = 'mm-recent-searches';
const readRecent = (): string[] => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]').slice(0, 5); } catch { return []; }
};
const saveRecent = (q: string) => {
    try {
        const next = [q, ...readRecent().filter(r => r.toLowerCase() !== q.toLowerCase())].slice(0, 5);
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch { /* storage blocked */ }
};

/** ⌘K / Ctrl+K / "/" — jump to any page or search everything published on the site. */
export const CommandPalette = () => {
    const { open, setOpen, toggle } = useCommandPalette();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, isLoggedIn } = useAuthStore();
    const [q, setQ] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [active, setActive] = useState(0);
    const [recent, setRecent] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Global shortcuts
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const typing = (e.target as HTMLElement)?.closest?.('input, textarea, [contenteditable="true"]');
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); toggle(); }
            else if (e.key === '/' && !typing && !open) { e.preventDefault(); setOpen(true); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, toggle, setOpen]);

    useEffect(() => {
        if (!open) return;
        setQ(''); setResults([]); setActive(0); setRecent(readRecent());
        const id = requestAnimationFrame(() => inputRef.current?.focus());
        const prevOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = 'hidden';
        return () => { cancelAnimationFrame(id); document.documentElement.style.overflow = prevOverflow; };
    }, [open]);

    // Debounced live search; abort stale requests so results never arrive out of order
    useEffect(() => {
        const term = q.trim();
        if (term.length < 2) { setResults([]); setLoading(false); return; }
        setLoading(true);
        const ctrl = new AbortController();
        const timer = setTimeout(() => {
            searchApi.query(term, ctrl.signal)
                .then(r => { setResults(r.results); setActive(0); })
                .catch(() => { /* aborted or offline */ })
                .finally(() => setLoading(false));
        }, 180);
        return () => { clearTimeout(timer); ctrl.abort(); };
    }, [q]);

    const pages: Item[] = useMemo(() => {
        const list: Item[] = [
            { key: 'p-home', kind: 'page', title: t('app.pages.home'), href: '/', icon: Home },
            { key: 'p-events', kind: 'page', title: t('app.pages.events'), href: '/events', icon: Calendar },
            { key: 'p-stories', kind: 'page', title: t('app.pages.stories'), href: '/stories', icon: BookOpen },
            { key: 'p-community', kind: 'page', title: t('app.pages.community'), href: '/community', icon: Compass },
            { key: 'p-gallery', kind: 'page', title: t('app.pages.gallery'), href: '/gallery', icon: ImageIcon },
            { key: 'p-team', kind: 'page', title: t('app.pages.team'), href: '/team', icon: Users },
            { key: 'p-reviews', kind: 'page', title: t('app.pages.reviews'), href: '/reviews', icon: Star },
            { key: 'p-shop', kind: 'page', title: t('app.pages.shop'), href: '/shop', icon: ShoppingBag },
            { key: 'p-contact', kind: 'page', title: t('app.pages.contact'), href: '/contact', icon: Mail },
        ];
        if (isLoggedIn) {
            list.push(
                { key: 'p-portal', kind: 'page', title: t('app.pages.dashboard'), href: '/portal', icon: LayoutDashboard },
                { key: 'p-passport', kind: 'page', title: t('app.portal.passport'), href: '/portal/passport', icon: Award },
                { key: 'p-write', kind: 'page', title: t('app.portal.write'), href: '/portal/write', icon: PenTool },
            );
        }
        if (user?.role === 'Admin' || user?.role === 'SuperAdmin') {
            list.push({ key: 'p-admin', kind: 'page', title: t('app.pages.admin'), href: '/summit-control-panel', icon: Shield });
        }
        return list;
    }, [t, isLoggedIn, user?.role]);

    const term = q.trim().toLowerCase();
    const pageHits = term ? pages.filter(p => p.title.toLowerCase().includes(term)) : pages;
    const resultItems: Item[] = results.map(r => ({ key: `${r.kind}-${r.id}`, kind: r.kind, title: r.title, subtitle: r.subtitle, image: r.kind === 'media' && /\.(mp4|webm|mov)/i.test(r.image || '') ? undefined : r.image, href: r.href }));
    const items = [...resultItems, ...pageHits];

    const go = (item: Item) => {
        if (q.trim().length >= 2) saveRecent(q.trim());
        setOpen(false);
        if (/^https?:/.test(item.href)) window.location.assign(item.href);
        else navigate(item.href);
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') { e.preventDefault(); setOpen(false); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(items.length - 1, a + 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(0, a - 1)); }
        else if (e.key === 'Enter' && items[active]) { e.preventDefault(); go(items[active]); }
    };

    useEffect(() => {
        listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
    }, [active]);

    const renderRow = (item: Item, index: number) => {
        const Icon = item.icon || KIND_ICON[item.kind] || ArrowUpRight;
        const isActive = index === active;
        return (
            <button
                key={item.key}
                data-index={index}
                role="option"
                aria-selected={isActive}
                onMouseMove={() => setActive(index)}
                onClick={() => go(item)}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-left transition-colors ${isActive ? 'bg-white/[0.07]' : ''}`}
            >
                {item.image ? (
                    <img decoding="async" src={item.image} alt="" loading="lazy" className="w-10 h-10 rounded-lg object-cover shrink-0 ring-1 ring-white/10" />
                ) : (
                    <span className={`w-10 h-10 rounded-lg grid place-items-center shrink-0 border ${isActive ? 'border-alpine-glacier/40 text-alpine-glacier' : 'border-white/10 text-white/50'}`}>
                        <Icon size={16} strokeWidth={1.75} />
                    </span>
                )}
                <span className="flex-1 min-w-0">
                    <span className="block text-sm text-white truncate">{item.title}</span>
                    {item.subtitle && <span className="block text-xs text-white/45 truncate">{item.subtitle}</span>}
                </span>
                <span className="font-mono text-[9.5px] tracking-[0.2em] uppercase text-white/35 shrink-0">{t(`app.search.kinds.${item.kind}`)}</span>
                {isActive && <CornerDownLeft size={14} className="text-white/40 shrink-0" />}
            </button>
        );
    };

    return createPortal(
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[10000] flex items-start justify-center px-3 pt-[12vh] sm:pt-[14vh]" data-demo-allow role="dialog" aria-modal="true" aria-label={t('app.search.open')}>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                        onClick={() => setOpen(false)}
                        className="absolute inset-0 bg-[#03060B]/70 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, y: -12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 520, damping: 40 }}
                        className="relative w-full max-w-2xl rounded-[1.4rem] border border-alpine-glacier/15 bg-gradient-to-b from-[#0E1826]/95 to-[#070B12]/95 backdrop-blur-2xl shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] overflow-hidden text-white"
                    >
                        <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-alpine-glacier/50 to-transparent" />
                        <div className="flex items-center gap-3 px-5 h-16 border-b border-white/[0.07]">
                            <Search size={18} className={`shrink-0 ${loading ? 'text-alpine-glacier animate-pulse' : 'text-white/45'}`} />
                            <input
                                ref={inputRef}
                                value={q}
                                onChange={e => setQ(e.target.value)}
                                onKeyDown={onKeyDown}
                                placeholder={t('app.search.placeholder')}
                                aria-label={t('app.search.placeholder')}
                                aria-controls="mm-search-list"
                                aria-activedescendant={items[active] ? items[active].key : undefined}
                                className="flex-1 bg-transparent outline-none text-base sm:text-lg placeholder:text-white/30 min-w-0"
                                autoComplete="off"
                                spellCheck={false}
                            />
                            <kbd className="hidden sm:inline font-mono text-[10px] px-2 py-1 rounded-md border border-white/10 text-white/40">esc</kbd>
                        </div>

                        <div ref={listRef} id="mm-search-list" role="listbox" className="max-h-[56vh] overflow-y-auto mm-scroll p-2" data-lenis-prevent>
                            {!term && recent.length > 0 && (
                                <div className="px-3 pt-2 pb-3 flex flex-wrap items-center gap-2">
                                    <span className="font-mono text-[9.5px] tracking-[0.24em] uppercase text-white/35 mr-1">{t('app.search.recent')}</span>
                                    {recent.map(r => (
                                        <button key={r} onClick={() => setQ(r)} className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full border border-white/10 text-xs text-white/65 hover:text-white hover:border-white/25 transition-colors">
                                            <Clock size={11} /> {r}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {resultItems.length > 0 && (
                                <>
                                    <p className="px-3 pt-2 pb-1.5 font-mono text-[9.5px] tracking-[0.24em] uppercase text-white/35">{t('app.search.results')}</p>
                                    {resultItems.map((it, i) => renderRow(it, i))}
                                </>
                            )}

                            {term.length >= 2 && !loading && resultItems.length === 0 && (
                                <p className="px-3 py-6 text-sm text-white/45 text-center">{t('app.search.empty', { q: q.trim() })}</p>
                            )}
                            {term.length === 1 && <p className="px-3 py-3 text-xs text-white/35">{t('app.search.hint')}</p>}

                            {pageHits.length > 0 && (
                                <>
                                    <p className="px-3 pt-3 pb-1.5 font-mono text-[9.5px] tracking-[0.24em] uppercase text-white/35">{t('app.search.jump')}</p>
                                    {pageHits.map((it, i) => renderRow(it, resultItems.length + i))}
                                </>
                            )}
                        </div>

                        <div className="hidden sm:flex items-center justify-between px-5 h-10 border-t border-white/[0.07] font-mono text-[10px] tracking-[0.12em] text-white/35">
                            <span>{t('app.search.navHint')}</span>
                            <span>⌘K</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

/** Small trigger for headers: shows the shortcut on desktop, an icon on phones. */
export const SearchTrigger: React.FC<{ className?: string; compact?: boolean }> = ({ className = '', compact }) => {
    const setOpen = useCommandPalette(s => s.setOpen);
    const { t } = useTranslation();
    const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
    return (
        <button type="button" onClick={() => setOpen(true)} aria-label={t('app.search.open')} data-demo-allow className={className}>
            <Search size={15} />
            {!compact && (
                <>
                    <span className="hidden lg:inline text-[12px] opacity-70">{t('app.search.open')}</span>
                    <kbd className="hidden lg:inline font-mono text-[10px] opacity-50 ml-1">{isMac ? '⌘' : 'Ctrl'} K</kbd>
                </>
            )}
        </button>
    );
};
