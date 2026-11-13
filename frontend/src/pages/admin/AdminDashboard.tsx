import React, { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, BookOpen, Calendar, Image as ImageIcon,
    Users, Settings, Menu, X, Shield, LogOut,
    Layers, UserCircle, Star, ShoppingBag, ArrowUpRight, Sparkles, PanelLeftClose, PanelLeftOpen, Mountain, ScrollText, type LucideIcon
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { DynamicLogo } from '../../components/ui/DynamicLogo';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useAdminAction } from '../../store/useAdminAction';
import { SearchTrigger } from '../../components/site/CommandPalette';
import { NotificationBell } from '../../components/site/NotificationBell';

const GlobalAdminUI = () => {
    const { confirmDialog, closeDialog, undoQueue, triggerUndo, triggerRedo } = useAdminAction();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Leave native undo alone while typing in a field
            const t = e.target as HTMLElement;
            if (t.closest('input, textarea, [contenteditable="true"]')) return;
            // Ctrl+Z for Undo
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
                e.preventDefault();
                triggerUndo();
            }
            // Ctrl+Y or Ctrl+Shift+Z for Redo
            if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
                e.preventDefault();
                triggerRedo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [triggerUndo, triggerRedo]);

    return (
        <>
            <ConfirmDialog
                isOpen={confirmDialog?.isOpen || false}
                title={confirmDialog?.title || ''}
                message={confirmDialog?.message || ''}
                confirmLabel={confirmDialog?.confirmLabel || 'Confirm'}
                variant={confirmDialog?.variant || 'warning'}
                onConfirm={confirmDialog?.onConfirm || (() => {})}
                onCancel={closeDialog}
            />
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {undoQueue.map(item => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                            className="mm-panel !rounded-full pl-5 pr-2 py-2 flex items-center gap-4 pointer-events-auto"
                        >
                            <span className="text-sm text-[var(--mm-ink)]">{item.message}</span>
                            <button onClick={() => triggerUndo(item.id)} className="mm-btn mm-btn--primary !h-8 !px-4 !text-xs">
                                Undo
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </>
    );
};

/** Live clock — only the clock re-renders each second, not the whole shell */
const LiveClock = () => {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const date = now.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' });
    const tz = now.toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop() || '';
    return (
        <div className="hidden md:flex items-baseline gap-3 font-mono text-[11px] tracking-[0.18em] uppercase">
            <span className="mm-faint">{date}</span>
            <span className="text-[var(--mm-ink)] tabular-nums text-xs">{time}</span>
            <span className="text-[var(--mm-glacier)] opacity-70">{tz}</span>
        </div>
    );
};

type NavItem = {
    path: string;
    name: string;
    icon: LucideIcon;
    permission?: string;
    role?: string;
    alwaysVisible?: boolean;
    publicPath?: string;
};

const navGroups: { label: string; items: NavItem[] }[] = [
    { label: 'Command', items: [
        { path: '', name: 'Overview', icon: LayoutDashboard, alwaysVisible: true },
    ]},
    { label: 'Content', items: [
        { path: 'stories', name: 'Stories', icon: BookOpen, permission: 'manageStories', publicPath: '/stories' },
        { path: 'events', name: 'Expeditions', icon: Calendar, permission: 'manageEvents', publicPath: '/events' },
        { path: 'gallery', name: 'Gallery', icon: ImageIcon, permission: 'manageGallery', publicPath: '/gallery' },
        { path: 'reviews', name: 'Reviews', icon: Star, permission: 'manageUsers', publicPath: '/reviews' },
    ]},
    { label: 'People', items: [
        { path: 'community', name: 'Community', icon: Users, permission: 'manageCommunity', publicPath: '/community' },
        { path: 'pillars', name: 'Team', icon: Mountain, permission: 'manageUsers', publicPath: '/team' },
        { path: 'users', name: 'Explorers', icon: UserCircle, permission: 'manageUsers' },
    ]},
    { label: 'Platform', items: [
        { path: 'merchandise', name: 'Merchandise', icon: ShoppingBag, role: 'SuperAdmin', publicPath: '/shop' },
        { path: 'sections', name: 'Section Control', icon: Layers, role: 'SuperAdmin' },
        { path: 'admins', name: 'Administrators', icon: Shield, role: 'SuperAdmin' },
        { path: 'audit', name: 'Audit Log', icon: ScrollText },
        { path: 'campaigns', name: 'Campaign Autopilot', icon: Sparkles, role: 'SuperAdmin' },
    ]},
    { label: 'Account', items: [
        { path: 'profile', name: 'Profile & Security', icon: Settings, alwaysVisible: true },
    ]},
];

const BASE = '/summit-control-panel';

const SectionSkeleton = () => (
    <div className="skeleton-delay space-y-6" aria-busy="true">
        <div className="space-y-3"><div className="skeleton-shimmer h-3 w-40 !rounded-full" /><div className="skeleton-shimmer h-14 w-80 max-w-full" /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <div key={i} className="skeleton-shimmer h-40 !rounded-[1.25rem]" />)}</div>
        <div className="skeleton-shimmer h-80 !rounded-[1.25rem]" />
    </div>
);

// Warm every admin section in the background once the panel is open, so switching is instant
const prefetchAdminSections = () => [
    () => import('./AdminOverview'), () => import('./StoriesManagement'), () => import('./EventsManagement'),
    () => import('./AdminGallery'), () => import('./ReviewsManagement'), () => import('./CommunityManagement'),
    () => import('./PillarsManagement'), () => import('./UsersManagement'), () => import('./AuditLog'), () => import('./AdminProfile'),
].forEach((load, i) => setTimeout(() => { load().catch(() => {}); }, 300 + i * 120));

export const AdminDashboard = () => {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(() => {
        try { return localStorage.getItem('mm-admin-rail') === 'collapsed'; } catch { return false; }
    });
    const { user, logoutAsync } = useAuthStore();
    const location = useLocation();
    // Each section opens at its top: the content pane scrolls on its own, so the browser won't reset it
    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => { scrollRef.current?.scrollTo({ top: 0 }); }, [location.pathname]);
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia('(max-width: 1023px)');
        const sync = () => { setIsMobile(mq.matches); if (!mq.matches) setDrawerOpen(false); };
        sync();
        mq.addEventListener('change', sync);
        return () => mq.removeEventListener('change', sync);
    }, []);

    useEffect(() => { setDrawerOpen(false); }, [location.pathname]);
    useEffect(() => {
        const idle = (window as any).requestIdleCallback || ((cb: () => void) => setTimeout(cb, 600));
        if (!import.meta.env.DEV) idle(prefetchAdminSections);
    }, []);

    // Lock page scroll behind the mobile drawer; Esc closes it
    useEffect(() => {
        if (!drawerOpen) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [drawerOpen]);

    const toggleRail = () => setCollapsed(c => {
        const next = !c;
        try { localStorage.setItem('mm-admin-rail', next ? 'collapsed' : 'open'); } catch { /* storage blocked */ }
        return next;
    });

    if (!user) return null;

    const confirmLogout = async () => {
        await logoutAsync();
        setShowLogoutConfirm(false);
        navigate('/');
    };

    const canSee = (item: NavItem) => {
        if (item.alwaysVisible) return true;
        if (item.role && user.role !== item.role) return false;
        if (item.permission && user.role === 'Admin' && !(user.permissions as any)?.[item.permission]) return false;
        return true;
    };
    const groups = navGroups
        .map(g => ({ ...g, items: g.items.filter(canSee) }))
        .filter(g => g.items.length);

    const isActive = (path: string) => path === ''
        ? location.pathname === BASE || location.pathname === `${BASE}/` || location.pathname === `${BASE}/overview`
        : location.pathname.startsWith(`${BASE}/${path}`);
    const current = groups.flatMap(g => g.items).find(i => isActive(i.path));

    const rail = !isMobile && collapsed;

    const sidebar = (
        <div className="h-full flex flex-col">
            {/* Brand */}
            <div className={`h-20 flex items-center shrink-0 ${rail ? 'justify-center px-0' : 'justify-between px-5'}`}>
                <Link to={BASE} className="flex items-center gap-3 min-w-0">
                    <DynamicLogo className="h-8" showText={false} />
                    {!rail && (
                        <div className="leading-none min-w-0">
                            <p className="mm-title text-xl truncate">Summit <em>Control</em></p>
                            <p className="font-mono text-[9px] tracking-[0.3em] uppercase mm-faint mt-1">Mountaineer Mallu</p>
                        </div>
                    )}
                </Link>
                {isMobile && (
                    <button onClick={() => setDrawerOpen(false)} className="p-2 -mr-2 mm-muted hover:text-[var(--mm-ink)]" aria-label="Close menu">
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto mm-scroll px-3 pb-4" aria-label="Admin">
                {groups.map(group => (
                    <div key={group.label} className="mt-4 first:mt-1">
                        {rail
                            ? <div className="mx-auto my-3 w-5 h-px bg-[var(--mm-line)]" />
                            : <p className="px-3 mb-1.5 font-mono text-[9.5px] tracking-[0.3em] uppercase mm-faint">{group.label}</p>}
                        <div className="space-y-0.5">
                            {group.items.map(item => {
                                const active = isActive(item.path);
                                const Icon = item.icon;
                                return (
                                    <div key={item.path} className="group relative">
                                        <Link
                                            to={item.path ? `${BASE}/${item.path}` : BASE}
                                            aria-current={active ? 'page' : undefined}
                                            title={rail ? item.name : undefined}
                                            className={`mm-nav-item ${rail ? 'justify-center !px-0' : ''}`}
                                        >
                                            {active && <motion.span layoutId="admin-nav-pill" className="mm-nav-pill" transition={{ type: 'spring', stiffness: 520, damping: 42 }} />}
                                            <Icon size={17} strokeWidth={1.75} className="shrink-0" />
                                            {!rail && <span className="truncate flex-1">{item.name}</span>}
                                        </Link>
                                        {!rail && item.publicPath && (
                                            <a
                                                href={item.publicPath}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title={`Open the live ${item.name} page`}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md mm-faint opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-[var(--mm-glacier)] transition-opacity"
                                            >
                                                <ArrowUpRight size={14} />
                                            </a>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Identity */}
            <div className="p-3 shrink-0 border-t border-[var(--mm-line)]">
                <div className={`flex items-center gap-3 rounded-2xl p-2 ${rail ? 'justify-center' : ''}`}>
                    {user.avatar ? (
                        <img loading="lazy" decoding="async" src={user.avatar} alt="" className="w-9 h-9 rounded-full object-cover ring-1 ring-[var(--mm-line-strong)] shrink-0" />
                    ) : (
                        <div className="w-9 h-9 rounded-full grid place-items-center shrink-0 bg-gradient-to-br from-alpine-blue to-alpine-navy ring-1 ring-[var(--mm-line-strong)] font-serif text-lg text-white">
                            {user.name.charAt(0)}
                        </div>
                    )}
                    {!rail && (
                        <>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate text-[var(--mm-ink)]">{user.name}</p>
                                <p className="font-mono text-[9.5px] tracking-[0.25em] uppercase text-[var(--mm-glacier)] opacity-80">{user.role}</p>
                            </div>
                            <button onClick={() => setShowLogoutConfirm(true)} className="p-2 rounded-full mm-faint hover:text-red-300 hover:bg-red-400/10 transition-colors" title="Log out" aria-label="Log out">
                                <LogOut size={16} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="mm-console dark min-h-svh h-[100dvh] flex overflow-hidden text-[var(--mm-ink)] selection:bg-alpine-glacier/30">
            <div className="mm-backdrop" aria-hidden="true" />

            {/* Desktop rail */}
            {!isMobile && (
                <aside
                    className="relative z-20 h-full shrink-0 border-r border-[var(--mm-line)] bg-[#05080D]/60 backdrop-blur-xl transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{ width: collapsed ? 76 : 264 }}
                >
                    {sidebar}
                </aside>
            )}

            {/* Mobile drawer */}
            <AnimatePresence>
                {isMobile && drawerOpen && (
                    <>
                        <motion.div
                            key="scrim"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setDrawerOpen(false)}
                            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.aside
                            key="drawer"
                            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                            transition={{ type: 'spring', stiffness: 420, damping: 40 }}
                            className="fixed inset-y-0 left-0 z-50 w-[min(86vw,300px)] bg-[#070B12]/95 backdrop-blur-xl border-r border-[var(--mm-line)]"
                        >
                            {sidebar}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main */}
            <main className="flex-1 min-w-0 relative z-10 flex flex-col">
                <header className="h-16 md:h-20 shrink-0 flex items-center justify-between gap-4 px-4 md:px-8 border-b border-[var(--mm-line)] bg-[#05080D]/40 backdrop-blur-xl">
                    <div className="flex items-center gap-3 min-w-0">
                        {isMobile ? (
                            <button onClick={() => setDrawerOpen(true)} className="p-2 -ml-2 mm-muted hover:text-[var(--mm-ink)]" aria-label="Open menu">
                                <Menu size={22} />
                            </button>
                        ) : (
                            <button onClick={toggleRail} className="p-2 -ml-2 rounded-lg mm-faint hover:text-[var(--mm-ink)] hover:bg-white/5 transition-colors" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                                {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                            </button>
                        )}
                        <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono text-[10.5px] tracking-[0.24em] uppercase min-w-0">
                            <Link to={BASE} className="mm-faint hover:text-[var(--mm-ink)] transition-colors hidden sm:inline">Summit Control</Link>
                            <span className="mm-faint hidden sm:inline">/</span>
                            <span className="text-[var(--mm-ink)] truncate">{current?.name || 'Overview'}</span>
                        </nav>
                    </div>

                    <div className="flex items-center gap-3 md:gap-5">
                        <LiveClock />
                        <SearchTrigger className="mm-btn mm-btn--ghost !h-9 !px-3" />
                        <NotificationBell className="mm-btn mm-btn--ghost !h-9 !w-9 !px-0" />
                        <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] tracking-[0.24em] uppercase text-emerald-300/80">
                            <span className="mm-live" /> Online
                        </div>
                        <Link to="/" className="mm-btn mm-btn--ghost !h-9">
                            <span className="hidden sm:inline">View site</span>
                            <ArrowUpRight size={15} />
                        </Link>
                    </div>
                </header>

                <div ref={scrollRef} className="flex-1 overflow-y-auto mm-scroll" data-lenis-prevent>
                    {/* Keyed wrapper replays a short rise on each section — no exit wait, so navigation feels instant */}
                    <div key={location.pathname} className="mm-rise max-w-[1600px] w-full mx-auto px-4 py-6 md:px-8 md:py-10">
                        {/* Local boundary: switching sections keeps the shell and only swaps this area */}
                        <Suspense fallback={<SectionSkeleton />}>
                            <Outlet />
                        </Suspense>
                    </div>
                </div>
            </main>

            <GlobalAdminUI />
            <ConfirmDialog
                isOpen={showLogoutConfirm}
                title="Leave Summit Control?"
                description="You'll be signed out of the admin panel on this device."
                confirmText="Log out"
                cancelText="Stay"
                icon="logout"
                onConfirm={confirmLogout}
                onCancel={() => setShowLogoutConfirm(false)}
            />
        </div>
    );
};
