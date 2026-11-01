import React, { useEffect, useState } from 'react';
import { switchTheme } from '../../lib/themeSwitch';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { X, LogIn, UserPlus, Settings, LogOut, Moon, Sun, Monitor, ShieldAlert, CloudSnow, ArrowUpRight, Instagram, Mail } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/useAuthStore';
import { DynamicLogo } from '../ui/DynamicLogo';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useLenis } from '../ui/SmoothScrollProvider';
import { daySlides, nightSlides, sceneImages } from '../../data/peaks';

// Menu previews only need to fill half the screen
const preview = (src: string) => src.replace('w=2560', 'w=1400');

const sideNavLinks = [
    { name: 'Mission', href: '/#mission', note: 'Why we climb', image: preview(sceneImages.missionDay.src) },
    { name: 'Stories', href: '/stories', note: 'Field notes', image: preview(daySlides[1].src) },
    { name: 'Events', href: '/events', note: 'Expeditions', image: preview(daySlides[2].src) },
    { name: 'Gallery', href: '/gallery', note: 'The reel', image: preview(daySlides[3].src) },
    { name: 'Community', href: '/community', note: 'Ropemates', image: preview(nightSlides[3].src) },
    { name: 'Provisions', href: '/shop', note: 'Gear', image: preview(daySlides[4].src) },
    { name: 'Core Team', href: '/team', note: 'The crew', image: preview(sceneImages.finaleDay.src) },
    { name: 'Legacy Reviews', href: '/reviews', note: 'Debriefs', image: preview(sceneImages.posterDay.src) },
    { name: 'Mission Control', href: '/contact', note: 'Base camp', image: preview(sceneImages.posterNight.src) },
];

const EASE_CURTAIN = [0.76, 0, 0.24, 1] as const;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/**
 * Full-screen menu. A curtain wipes down over the page; the destinations rise line by line in large
 * serif type, and hovering one brings up its photograph on the right. Account and appearance
 * controls sit in the side column (below the links on phones). Closes with Escape, the close button
 * or any navigation; page scroll is paused while it is open.
 */
export const SidePanel = () => {
    const { isSidebarOpen, setSidebarOpen, theme, setTheme, isSnowEffectEnabled, toggleSnowEffect } = useStore();
    const { isLoggedIn, user, logoutAsync } = useAuthStore();
    const { lenis } = useLenis();
    const navigate = useNavigate();
    const location = useLocation();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [hovered, setHovered] = useState<number | null>(null);
    const close = () => requestAnimationFrame(() => setSidebarOpen(false));

    // Close on Escape
    useEffect(() => {
        if (!isSidebarOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSidebarOpen(false); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isSidebarOpen, setSidebarOpen]);

    // Freeze the page underneath while the curtain is down
    useEffect(() => {
        if (!isSidebarOpen) return;
        lenis?.stop();
        const prevOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = 'hidden';
        return () => {
            lenis?.start();
            document.documentElement.style.overflow = prevOverflow;
        };
    }, [isSidebarOpen, lenis]);

    useEffect(() => { if (!isSidebarOpen) setHovered(null); }, [isSidebarOpen]);

    const listVars: Variants = { show: { transition: { staggerChildren: 0.055, delayChildren: 0.38 } } };
    const lineVars: Variants = {
        hidden: { y: '115%' },
        show: { y: '0%', transition: { duration: 0.9, ease: EASE_OUT } },
    };
    const fadeVars: Variants = {
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT, delay: 0.75 } },
    };

    const ThemeButton = ({ active, onClick, icon, label }: { active: boolean; onClick: (e: React.MouseEvent<HTMLButtonElement>) => void; icon: React.ReactNode; label: string }) => (
        <button
            onClick={onClick}
            className={`relative flex items-center justify-center gap-1.5 p-2.5 rounded-xl transition-colors duration-300 cursor-pointer ${active ? 'text-alpine-navy' : 'text-white/50 hover:text-white/85'}`}
            title={label}
            aria-label={label}
            aria-pressed={active}
        >
            {active && <motion.span layoutId="theme-pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} className="absolute inset-0 rounded-xl bg-white shadow-md" />}
            <span className="relative">{icon}</span>
        </button>
    );

    const currentIndex = sideNavLinks.findIndex(l => l.href === location.pathname);
    const shown = hovered ?? (currentIndex >= 0 ? currentIndex : 0);

    const sideColumn = (
        <motion.div variants={fadeVars} className="flex flex-col gap-4 w-full">
            {isLoggedIn && user ? (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        {user.avatar ? (
                            <img src={user.avatar} alt="" className="w-11 h-11 rounded-full border border-white/25 object-cover" />
                        ) : (
                            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-alpine-blue to-alpine-glacier grid place-items-center font-bold text-alpine-navy">{user.name.charAt(0)}</div>
                        )}
                        <div className="min-w-0">
                            <p className="font-semibold text-white truncate">{user.name}</p>
                            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-alpine-sunrise">{user.role}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Link to="/portal" onClick={close} className={`${(user.role === 'Admin' || user.role === 'SuperAdmin') ? '' : 'col-span-2'} flex items-center justify-center gap-2 py-2.5 rounded-full border border-white/20 hover:bg-white hover:text-alpine-navy text-white text-sm font-semibold transition-colors`}>
                            <Settings size={14} /> Portal
                        </Link>
                        {(user.role === 'Admin' || user.role === 'SuperAdmin') && (
                            <Link to="/summit-control-panel" onClick={close} className="flex items-center justify-center gap-2 py-2.5 rounded-full border border-red-400/40 text-red-300 hover:bg-red-500/20 text-sm font-semibold transition-colors">
                                <ShieldAlert size={14} /> Admin
                            </Link>
                        )}
                    </div>
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="self-start inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/50 hover:text-red-300 transition-colors cursor-pointer"
                    >
                        <LogOut size={13} /> Sign out
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-2">
                    <Link to="/login" onClick={close} className="flex items-center justify-center gap-2 py-3 rounded-full bg-white text-alpine-navy text-sm font-semibold hover:bg-alpine-sunrise transition-colors">
                        <LogIn size={15} /> Log in
                    </Link>
                    <Link to="/signup" onClick={close} className="flex items-center justify-center gap-2 py-3 rounded-full border border-white/25 text-white text-sm font-semibold hover:bg-white/10 transition-colors">
                        <UserPlus size={15} /> Join
                    </Link>
                </div>
            )}

            <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">Appearance</span>
                <div className="grid grid-cols-4 gap-1 bg-white/[0.06] border border-white/10 p-1 rounded-2xl">
                    <ThemeButton active={theme === 'light'} onClick={e => switchTheme('light', setTheme, { x: e.clientX, y: e.clientY })} icon={<Sun size={15} />} label="Light" />
                    <ThemeButton active={theme === 'dark'} onClick={e => switchTheme('dark', setTheme, { x: e.clientX, y: e.clientY })} icon={<Moon size={15} />} label="Dark" />
                    <ThemeButton active={theme === 'system'} onClick={e => switchTheme('system', setTheme, { x: e.clientX, y: e.clientY })} icon={<Monitor size={15} />} label="System" />
                    <ThemeButton active={isSnowEffectEnabled} onClick={() => toggleSnowEffect()} icon={<CloudSnow size={15} />} label="Snow" />
                </div>
            </div>
        </motion.div>
    );

    return (
        <>
        <AnimatePresence>
            {isSidebarOpen && (
                <motion.div
                    key="menu"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Main menu"
                    data-lenis-prevent
                    initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
                    animate={{ clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 0.85, ease: EASE_CURTAIN } }}
                    exit={{ clipPath: 'inset(100% 0% 0% 0%)', transition: { duration: 0.7, ease: EASE_CURTAIN } }}
                    className="fixed inset-0 z-50 bg-[#061A31] dark:bg-[#05070C] text-white overflow-y-auto overscroll-contain"
                >
                    {/* Preview photographs (desktop): the hovered destination fills the right half */}
                    <div aria-hidden="true" className="hidden lg:block absolute inset-y-0 right-0 w-[42%] overflow-hidden">
                        <motion.div
                            className="absolute inset-0"
                            initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
                            animate={{ clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 1.1, ease: EASE_CURTAIN, delay: 0.25 } }}
                        >
                            {sideNavLinks.map((link, i) => (
                                <motion.img
                                    key={link.name}
                                    src={link.image}
                                    alt=""
                                    decoding="async"
                                    initial={false}
                                    animate={{ opacity: i === shown ? 1 : 0, scale: i === shown ? 1 : 1.12 }}
                                    transition={{ opacity: { duration: 0.6 }, scale: { duration: 1.4, ease: EASE_OUT } }}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ))}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#061A31] dark:from-[#05070C] via-[#061A31]/30 dark:via-[#05070C]/30 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={shown}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -12 }}
                                    transition={{ duration: 0.45, ease: EASE_OUT }}
                                    className="absolute right-10 bottom-10 font-mono text-[11px] uppercase tracking-[0.35em] text-white/80"
                                >
                                    {String(shown + 1).padStart(2, '0')} · {sideNavLinks[shown].note}
                                </motion.p>
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    <motion.div initial="hidden" animate="show" className="relative min-h-full flex flex-col px-5 sm:px-8 md:px-12 pt-5 md:pt-7 pb-8">
                        {/* Header */}
                        <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: 0.45, duration: 0.6 } } }} className="flex items-center justify-between shrink-0">
                            <Link to="/" onClick={close} aria-label="Home" className="inline-flex">
                                <DynamicLogo className="h-7 md:h-8" showText={true} forceWhiteText={true} />
                            </Link>
                            <button
                                onClick={close}
                                aria-label="Close menu"
                                className="group inline-flex items-center gap-3 pl-5 pr-1.5 py-1.5 rounded-full border border-white/20 hover:border-white/50 text-xs font-bold uppercase tracking-[0.2em] bg-[#061A31]/40 dark:bg-black/40 backdrop-blur-md transition-colors cursor-pointer"
                            >
                                Close
                                <span className="grid place-items-center w-9 h-9 rounded-full bg-white text-alpine-navy transition-transform duration-500 group-hover:rotate-90"><X size={16} /></span>
                            </button>
                        </motion.div>

                        <div className="flex-1 flex flex-col lg:flex-row lg:items-end gap-10 lg:gap-16 mt-8 md:mt-10 lg:w-[58%]">
                            {/* Destinations */}
                            <motion.nav variants={listVars} aria-label="Main" className="flex-1 flex flex-col justify-center" onMouseLeave={() => setHovered(null)}>
                                {sideNavLinks.map((link, i) => {
                                    const isRoute = !link.href.includes('#');
                                    const dim = hovered !== null && hovered !== i;
                                    const content = (
                                        <span className="flex items-baseline gap-3 md:gap-5 py-[0.12em]">
                                            <span className="font-mono text-[10px] md:text-xs text-alpine-sunrise/80 tabular-nums w-6 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                                            <span className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
                                                <motion.span variants={lineVars} className="block font-serif leading-[1.02] tracking-[-0.02em] text-[clamp(2rem,min(6.4vh,7vw),5rem)] transition-[transform,font-style] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/link:translate-x-3 group-hover/link:italic">
                                                    {link.name}
                                                </motion.span>
                                            </span>
                                            <ArrowUpRight className="w-5 h-5 md:w-7 md:h-7 self-center opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-500 text-alpine-sunrise" />
                                        </span>
                                    );
                                    const cls = `group/link block w-fit transition-opacity duration-500 ${dim ? 'opacity-30' : 'opacity-100'} ${i === currentIndex ? 'text-alpine-sunrise' : ''}`;
                                    const hover = { onMouseEnter: () => setHovered(i), onFocus: () => setHovered(i) };
                                    return isRoute ? (
                                        <Link key={link.name} to={link.href} onClick={close} className={cls} {...hover}>{content}</Link>
                                    ) : (
                                        <a key={link.name} href={link.href} onClick={close} className={cls} {...hover}>{content}</a>
                                    );
                                })}
                            </motion.nav>

                            {/* Account + appearance: under the links on phones, beside them on desktop */}
                            <div className="w-full lg:w-[300px] shrink-0">{sideColumn}</div>
                        </div>

                        {/* Footer strip */}
                        <motion.div variants={fadeVars} className="mt-10 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 lg:w-[58%] font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
                            <span>47.42°N 10.98°E · Garmisch base camp</span>
                            <span className="flex items-center gap-4">
                                <a href="https://www.instagram.com/mountaineermallu/" target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-white transition-colors"><Instagram size={16} /></a>
                                <a href="mailto:info@mountaineermallu.com" aria-label="Email" className="hover:text-white transition-colors"><Mail size={16} /></a>
                            </span>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
        <ConfirmDialog
            isOpen={showLogoutConfirm}
            title="Secure Sign Out"
            description="Are you sure you want to end your current session?"
            confirmText="Sign Out"
            cancelText="Cancel"
            icon="logout"
            onConfirm={async () => {
                await logoutAsync();
                setShowLogoutConfirm(false);
                setSidebarOpen(false);
                navigate('/');
            }}
            onCancel={() => setShowLogoutConfirm(false)}
        />
        </>
    );
};
