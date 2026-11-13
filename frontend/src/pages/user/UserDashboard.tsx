import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { LogOut, User, PenTool, Layers, Archive, Upload, Calendar, Compass, Heart, Backpack, ArrowUpRight, Award, Home, MoreHorizontal, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SearchTrigger } from '../../components/site/CommandPalette';
import { NotificationBell } from '../../components/site/NotificationBell';
import { UserPassportTab } from './UserPassportTab';
import { UserBasecampTab } from './UserBasecampTab';
import { DynamicLogo } from '../../components/ui/DynamicLogo';
import { useSiteSettings } from '../../store/useSiteSettings';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { timeGreeting } from '../../components/console/ConsoleKit';

import { UserProfileTab } from './UserProfileTab';
import { UserStoryEditorTab } from './UserStoryEditorTab';
import { UserSubmissionsTab } from './UserSubmissionsTab';
import { UserCollectionsTab } from './UserCollectionsTab';
import { UserMediaUploadTab } from './UserMediaUploadTab';
import { UserExpeditionsTab } from './UserExpeditionsTab';
import { UserCommunitiesTab } from './UserCommunitiesTab';
import { UserWishlistTab } from './UserWishlistTab';
import { UserGearVaultTab } from './UserGearVaultTab';

/**
 * Each nav item can optionally declare a `sectionKey`.
 * If the admin sets that section to 'hidden' or 'coming_soon',
 * the tab is automatically removed from the user portal.
 */
// Labels come from app.portal.<id> / app.portal.short.<id> in the locale files
const allNavItems = [
    { id: 'home', path: '/portal', icon: Home, group: 'Basecamp' },
    { id: 'profile', path: '/portal/profile', icon: User, group: 'Basecamp' },
    { id: 'passport', path: '/portal/passport', icon: Award, group: 'Basecamp' },
    { id: 'expeditions', path: '/portal/expeditions', icon: Calendar, sectionKey: 'events', group: 'Basecamp' },
    { id: 'communities', path: '/portal/communities', icon: Compass, sectionKey: 'community', group: 'Basecamp' },
    { id: 'gear', path: '/portal/gear', icon: Backpack, group: 'Basecamp' },
    { id: 'wishlist', path: '/portal/wishlist', icon: Heart, sectionKey: 'shop', group: 'Basecamp' },
    { id: 'write', path: '/portal/write', icon: PenTool, sectionKey: 'stories', group: 'Create' },
    { id: 'upload', path: '/portal/upload', icon: Upload, group: 'Create' },
    { id: 'submissions', path: '/portal/submissions', icon: Layers, group: 'Create' },
    { id: 'collections', path: '/portal/collections', icon: Archive, group: 'Create' },
];

// The phone dock keeps four destinations; everything else lives in the "More" sheet
const DOCK_IDS = ['home', 'expeditions', 'write', 'passport'];

/** Welcome card — once per browser session, short, and dismissible with a click */
const WelcomeIntro = ({ name, onDone }: { name: string; onDone: () => void }) => {
    useEffect(() => {
        const t = setTimeout(onDone, 1200);
        return () => clearTimeout(t);
    }, [onDone]);
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
            onClick={onDone}
            className="fixed inset-0 z-[70] grid place-items-center bg-alpine-snow dark:bg-[#05080D] cursor-pointer"
        >
            <div className="text-center px-6">
                <motion.p
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                    className="font-mono text-[10.5px] tracking-[0.35em] uppercase text-alpine-navy/50 dark:text-white/40 mb-5"
                >
                    {timeGreeting()}
                </motion.p>
                <motion.h1
                    initial={{ opacity: 0, y: 24, clipPath: 'inset(0 0 100% 0)' }}
                    animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                    className="font-serif text-5xl sm:text-7xl md:text-8xl text-alpine-navy dark:text-alpine-snow leading-none"
                >
                    Welcome back, <em className="text-alpine-blue dark:text-alpine-glacier">{name}</em>
                </motion.h1>
                <motion.div
                    initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                    className="mx-auto mt-8 h-px w-40 origin-left bg-gradient-to-r from-transparent via-alpine-glacier to-transparent"
                />
            </div>
        </motion.div>
    );
};

export const UserDashboard = () => {
    const { user, logoutAsync } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [showIntro, setShowIntro] = useState(() => {
        try { return !sessionStorage.getItem('mm-portal-welcomed'); } catch { return false; }
    });
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const { settings } = useSiteSettings();
    const { t } = useTranslation();
    const label = (id: string) => t(`app.portal.${id}`);
    const short = (id: string) => t(`app.portal.short.${id}`);

    const finishIntro = React.useCallback(() => {
        try { sessionStorage.setItem('mm-portal-welcomed', '1'); } catch { /* storage blocked */ }
        setShowIntro(false);
    }, []);

    // Filter nav items based on admin section visibility
    const navItems = useMemo(() => allNavItems.filter(item => {
        if (!item.sectionKey) return true;
        const config = settings.sections[item.sectionKey];
        return config && config.status === 'visible';
    }), [settings]);

    const path = location.pathname.replace(/\/$/, '') || '/portal';
    const current = navItems.find(i => i.path === path) || navItems[0];
    const dockItems = navItems.filter(i => DOCK_IDS.includes(i.id)).slice(0, 4);
    const inMore = !!current && !dockItems.includes(current);
    // Each tab opens at its top: the content pane scrolls on its own, so the browser won't reset it
    const scrollRef = useRef<HTMLElement>(null);
    useEffect(() => { setMoreOpen(false); scrollRef.current?.scrollTo({ top: 0 }); }, [location.pathname]);
    const groups = ['Basecamp', 'Create'].map(g => ({ label: g, items: navItems.filter(i => i.group === g) })).filter(g => g.items.length);

    const confirmLogout = async () => {
        await logoutAsync();
        setShowLogoutConfirm(false);
        navigate('/');
    };

    const firstName = user?.name?.split(' ')[0] || 'Explorer';

    return (
        <>
            <AnimatePresence>
                {showIntro && <WelcomeIntro key="intro" name={firstName} onDone={finishIntro} />}
            </AnimatePresence>

            <div className="mm-console relative min-h-svh h-[100dvh] flex overflow-hidden text-[var(--mm-ink)] selection:bg-alpine-glacier/30">
                <div className="mm-backdrop" aria-hidden="true" />

                {/* Mobile top bar */}
                <header className="lg:hidden fixed top-0 inset-x-0 z-30 h-14 flex items-center justify-between px-4 border-b border-[var(--mm-line)] bg-alpine-snow/80 dark:bg-[#05080D]/80 backdrop-blur-xl">
                    <Link to="/" aria-label="Back to the main site"><DynamicLogo className="h-7" showText={true} /></Link>
                    <span className="font-mono text-[10px] tracking-[0.25em] uppercase mm-faint truncate">{current && label(current.id)}</span>
                    <div className="flex items-center gap-1 -mr-2">
                        <SearchTrigger compact className="p-2 mm-faint hover:text-[var(--mm-ink)] transition-colors" />
                        <NotificationBell className="p-2 mm-faint hover:text-[var(--mm-ink)] transition-colors" />
                        <button onClick={() => setShowLogoutConfirm(true)} className="p-2 mm-faint hover:text-red-400 transition-colors" aria-label={t('app.portal.logout')}>
                            <LogOut size={18} />
                        </button>
                    </div>
                </header>

                {/* Desktop rail */}
                <aside
                    id="tour-sidebar"
                    className="hidden lg:flex relative z-20 m-4 mr-0 w-[272px] shrink-0 flex-col mm-panel !rounded-[1.75rem] overflow-hidden"
                >
                    <div id="tour-user-info" className="px-6 pt-6 pb-5 border-b border-[var(--mm-line)]">
                        <Link to="/" className="inline-block mb-6" aria-label="Back to the main site"><DynamicLogo className="h-8" showText={true} /></Link>
                        <div className="flex items-center gap-3.5">
                            {user?.avatar ? (
                                <img loading="lazy" decoding="async" src={user.avatar} alt="" className="w-12 h-12 rounded-full object-cover ring-1 ring-[var(--mm-line-strong)]" />
                            ) : (
                                <div className="w-12 h-12 rounded-full grid place-items-center bg-gradient-to-br from-alpine-blue to-alpine-navy text-white font-serif text-xl ring-1 ring-[var(--mm-line-strong)]">
                                    {user?.name?.charAt(0)}
                                </div>
                            )}
                            <div className="min-w-0">
                                <p className="mm-title text-xl truncate">{user?.name}</p>
                                <p className="font-mono text-[9.5px] tracking-[0.28em] uppercase text-[var(--mm-glacier)] mt-1">{t('app.portal.explorer')}</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 overflow-y-auto mm-scroll px-3 py-4" aria-label="Portal">
                        {groups.map(group => (
                            <div key={group.label} className="mb-4 last:mb-0">
                                <p className="px-3 mb-1.5 font-mono text-[9.5px] tracking-[0.3em] uppercase mm-faint">{t(`app.portal.group${group.label}`)}</p>
                                <div className="space-y-0.5">
                                    {group.items.map(item => {
                                        const active = current?.id === item.id;
                                        return (
                                            <Link key={item.id} to={item.path} aria-current={active ? 'page' : undefined} className="mm-nav-item">
                                                {active && <motion.span layoutId="portal-nav-pill" className="mm-nav-pill" transition={{ type: 'spring', stiffness: 520, damping: 42 }} />}
                                                <item.icon size={17} strokeWidth={1.75} className="shrink-0" />
                                                <span className="truncate">{label(item.id)}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>

                    <div className="p-3 border-t border-[var(--mm-line)] space-y-0.5">
                        <Link to="/" className="mm-nav-item">
                            <ArrowUpRight size={17} strokeWidth={1.75} />
                            <span>{t('app.portal.mainSite')}</span>
                        </Link>
                        <button onClick={() => setShowLogoutConfirm(true)} className="mm-nav-item w-full hover:!text-red-400 hover:!bg-red-400/[0.07]">
                            <LogOut size={17} strokeWidth={1.75} />
                            <span>{t('app.portal.logout')}</span>
                        </button>
                    </div>
                </aside>

                {/* Content */}
                <main ref={scrollRef} id="tour-main-content" className="flex-1 min-w-0 relative z-10 h-full overflow-y-auto mm-scroll pt-14 pb-28 lg:pt-0 lg:pb-0" data-lenis-prevent>
                    {/* Desktop utilities: search and inbox, top-right of the content */}
                    <div className="hidden lg:flex sticky top-0 z-20 justify-end gap-2 px-12 pt-6 -mb-14 pointer-events-none">
                        <SearchTrigger className="pointer-events-auto mm-btn mm-btn--ghost !h-10 backdrop-blur-xl" />
                        <NotificationBell className="pointer-events-auto mm-btn mm-btn--ghost !h-10 !w-10 !px-0 backdrop-blur-xl" />
                    </div>
                    <div key={location.pathname} className="mm-rise relative max-w-[1400px] mx-auto px-4 py-6 sm:px-6 md:px-10 lg:px-12 lg:py-12 min-h-full">
                        <Routes location={location}>
                            <Route index element={<UserBasecampTab />} />
                            <Route path="profile" element={<UserProfileTab />} />
                            <Route path="passport" element={<UserPassportTab />} />
                            <Route path="expeditions" element={<UserExpeditionsTab />} />
                            <Route path="gear" element={<UserGearVaultTab />} />
                            <Route path="communities" element={<UserCommunitiesTab />} />
                            <Route path="wishlist" element={<UserWishlistTab />} />
                            <Route path="write" element={<UserStoryEditorTab />} />
                            <Route path="upload" element={<UserMediaUploadTab />} />
                            <Route path="submissions" element={<UserSubmissionsTab />} />
                            <Route path="collections" element={<UserCollectionsTab />} />
                        </Routes>
                    </div>
                </main>

                {/* Mobile dock: four destinations and a sheet for the rest */}
                <nav
                    aria-label="Portal"
                    className="lg:hidden fixed bottom-3 inset-x-3 z-40 mm-panel !rounded-[1.4rem] !bg-alpine-snow/95 dark:!bg-[#070B12]/95 grid grid-cols-5 px-1.5 py-1.5"
                    style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
                >
                    {dockItems.map(item => {
                        const active = current?.id === item.id;
                        return (
                            <Link
                                key={item.id}
                                to={item.path}
                                aria-current={active ? 'page' : undefined}
                                className={`relative flex flex-col items-center justify-center gap-1 py-2 rounded-2xl transition-colors ${active ? 'text-[var(--mm-ink)]' : 'mm-faint'}`}
                            >
                                {active && <motion.span layoutId="portal-dock-pill" className="absolute inset-0 rounded-2xl bg-alpine-glacier/15 border border-alpine-glacier/25" transition={{ type: 'spring', stiffness: 520, damping: 42 }} />}
                                <item.icon size={19} strokeWidth={1.75} className={`relative ${active ? 'text-[var(--mm-glacier)]' : ''}`} />
                                <span className="relative text-[9.5px] font-semibold tracking-[0.12em] uppercase">{short(item.id)}</span>
                            </Link>
                        );
                    })}
                    <button
                        onClick={() => setMoreOpen(true)}
                        aria-expanded={moreOpen}
                        className={`relative flex flex-col items-center justify-center gap-1 py-2 rounded-2xl transition-colors ${inMore ? 'text-[var(--mm-ink)]' : 'mm-faint'}`}
                    >
                        {inMore && <motion.span layoutId="portal-dock-pill" className="absolute inset-0 rounded-2xl bg-alpine-glacier/15 border border-alpine-glacier/25" transition={{ type: 'spring', stiffness: 520, damping: 42 }} />}
                        <MoreHorizontal size={19} strokeWidth={1.75} className={`relative ${inMore ? 'text-[var(--mm-glacier)]' : ''}`} />
                        <span className="relative text-[9.5px] font-semibold tracking-[0.12em] uppercase">{t('app.portal.more')}</span>
                    </button>
                </nav>

                <AnimatePresence>
                    {moreOpen && (
                        <React.Fragment key="more">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMoreOpen(false)} className="lg:hidden fixed inset-0 z-[45] bg-black/50" />
                            <motion.div
                                role="dialog"
                                aria-label={t('app.portal.more')}
                                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                                transition={{ type: 'spring', stiffness: 380, damping: 38 }}
                                className="lg:hidden fixed bottom-0 inset-x-0 z-[46] rounded-t-[1.75rem] border-t border-[var(--mm-line-strong)] bg-alpine-snow dark:bg-[#0A0F18] px-4 pt-3"
                                style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
                            >
                                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--mm-line-strong)]" />
                                <div className="flex items-center justify-between mb-3 px-1">
                                    <p className="mm-title text-2xl">{t('app.portal.more')}</p>
                                    <button onClick={() => setMoreOpen(false)} aria-label="Close" className="grid place-items-center w-9 h-9 rounded-full border border-[var(--mm-line)] mm-muted"><X size={16} /></button>
                                </div>
                                {groups.map(group => {
                                    const items = group.items.filter(i => !dockItems.includes(i));
                                    if (!items.length) return null;
                                    return (
                                        <div key={group.label} className="mb-4">
                                            <p className="px-1 mb-2 font-mono text-[9.5px] tracking-[0.3em] uppercase mm-faint">{t(`app.portal.group${group.label}`)}</p>
                                            <div className="grid grid-cols-3 gap-2">
                                                {items.map(item => {
                                                    const active = current?.id === item.id;
                                                    return (
                                                        <Link key={item.id} to={item.path} aria-current={active ? 'page' : undefined}
                                                            className={`flex flex-col items-center gap-2 py-4 rounded-2xl border text-center transition-colors ${active ? 'border-alpine-glacier/40 bg-alpine-glacier/10 text-[var(--mm-ink)]' : 'border-[var(--mm-line)] mm-muted'}`}>
                                                            <item.icon size={20} strokeWidth={1.75} className={active ? 'text-[var(--mm-glacier)]' : ''} />
                                                            <span className="text-[11px] font-semibold leading-tight px-1">{label(item.id)}</span>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[var(--mm-line)]">
                                    <Link to="/" className="mm-btn mm-btn--ghost justify-center"><ArrowUpRight size={15} /> {t('app.portal.mainSite')}</Link>
                                    <button onClick={() => { setMoreOpen(false); setShowLogoutConfirm(true); }} className="mm-btn mm-btn--ghost justify-center hover:!text-red-400"><LogOut size={15} /> {t('app.portal.logout')}</button>
                                </div>
                            </motion.div>
                        </React.Fragment>
                    )}
                </AnimatePresence>
            </div>

            <ConfirmDialog
                isOpen={showLogoutConfirm}
                title="Leave basecamp?"
                description="You'll be signed out on this device. Your drafts and progress are saved."
                confirmText="Log out"
                cancelText="Stay"
                icon="logout"
                onConfirm={confirmLogout}
                onCancel={() => setShowLogoutConfirm(false)}
            />
        </>
    );
};
