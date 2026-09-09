import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { User, LogIn, UserPlus, Menu, Clock, Globe, AlertCircle, X, ChevronDown } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useSiteSettings } from '../../store/useSiteSettings';
import { DynamicLogo } from '../ui/DynamicLogo';

// Reusable Magnetic Button wrapper for nav links (Performance optimized - zero layout thrashing)
const MagneticButton = ({ children, className, onMouseEnter, onMouseLeave }: any) => {
    const ref = useRef<HTMLDivElement>(null);
    const boundsRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null);

    const handleMouseEnter = (e: React.MouseEvent) => {
        if (ref.current) {
            boundsRef.current = ref.current.getBoundingClientRect();
        }
        if (onMouseEnter) onMouseEnter(e);
    };

    const handleMouse = (e: React.MouseEvent) => {
        if (!boundsRef.current && ref.current) {
            boundsRef.current = ref.current.getBoundingClientRect();
        }
        if (!boundsRef.current || !ref.current) return;
        const { clientX, clientY } = e;
        const { height, width, left, top } = boundsRef.current;
        const middleX = (clientX - (left + width / 2)) * 0.25;
        const middleY = (clientY - (top + height / 2)) * 0.25;
        ref.current.style.transform = `translate3d(${middleX}px, ${middleY}px, 0)`;
    };

    const reset = () => {
        boundsRef.current = null;
        if (ref.current) {
            ref.current.style.transform = 'translate3d(0px, 0px, 0)';
        }
        if (onMouseLeave) onMouseLeave();
    };

    return (
        <div
            ref={ref}
            onMouseMove={handleMouse}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={reset}
            style={{ transition: 'transform 0.2s ease-out', willChange: 'transform' }}
            className={`transform-gpu ${className || ''}`}
        >
            {children}
        </div>
    );
};

const navLinks = [
    { nameKey: 'nav.mission', href: '#mission' },
    { nameKey: 'nav.stories', href: '#stories', sectionKey: 'stories' },
    { nameKey: 'nav.events', href: '#events', sectionKey: 'events' },
    { nameKey: 'nav.gallery', href: '#gallery', sectionKey: 'gallery' },
    { nameKey: 'nav.community', href: '#community', sectionKey: 'community' },
];

export const Navbar: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const [scrolled, setScrolled] = useState(false);
    const [hoveredLink, setHoveredLink] = useState<string | null>(null);
    const [langMenuOpen, setLangMenuOpen] = useState(false);
    const [pendingLang, setPendingLang] = useState<string | null>(null);

    const { toggleSidebar } = useStore();
    const { isLoggedIn, user } = useAuthStore();
    const { settings } = useSiteSettings();
    const navRef = useRef<HTMLDivElement>(null);
    const [isMobileExpanded, setIsMobileExpanded] = useState(false);

    // Filter nav links based on section visibility
    const filteredLinks = navLinks.filter(link => {
        if (!link.sectionKey) return true; // Mission always shows
        const config = settings.sections[link.sectionKey];
        return config && config.status !== 'hidden';
    });

    const { scrollY, scrollYProgress } = useScroll();
    const [hidden, setHidden] = useState(false);
    const hiddenRef = useRef(false);

    const scrolledRef = useRef(false);

    useMotionValueEvent(scrollY, "change", (latest: number) => {
        const previous = scrollY.getPrevious() || 0;
        const shouldHide = latest > previous && latest > 150;
        if (shouldHide !== hiddenRef.current) {
            hiddenRef.current = shouldHide;
            setHidden(shouldHide);
        }

        const isScrolled = latest > 50;
        if (isScrolled !== scrolledRef.current) {
            scrolledRef.current = isScrolled;
            setScrolled(isScrolled);
        }
    });

    const cachedNavRectRef = useRef<DOMRect | null>(null);
    const handleNavMouseMove = (e: React.MouseEvent) => {
        if (!navRef.current) return;
        if (!cachedNavRectRef.current || cachedNavRectRef.current.width === 0) {
            cachedNavRectRef.current = navRef.current.getBoundingClientRect();
        }
        const x = e.clientX - cachedNavRectRef.current.left;
        const y = e.clientY - cachedNavRectRef.current.top;
        navRef.current.style.setProperty('--nav-x', `${x}px`);
        navRef.current.style.setProperty('--nav-y', `${y}px`);
    };

    const initiateLanguageChange = (lng: string) => {
        if (i18n.language.startsWith(lng)) {
            setLangMenuOpen(false);
            return;
        }
        setPendingLang(lng);
        setLangMenuOpen(false);
    };

    const cancelLanguageChange = () => {
        setPendingLang(null);
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 py-3 md:py-5 ${hidden ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}
        >
            <div className="max-w-[95rem] mx-auto px-4 md:px-8">
                <div
                    ref={navRef}
                    onMouseMove={handleNavMouseMove}
                    className={`relative flex flex-col w-full rounded-[2rem] px-4 md:px-8 py-3 md:py-4 transition-[background-color,border-color,box-shadow] duration-500 border overflow-hidden ${
                        scrolled || isMobileExpanded
                            ? 'bg-white/40 dark:bg-white/[0.08] backdrop-blur-[45px] backdrop-saturate-[250%] shadow-[0_20px_50px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(255,255,255,0.8),inset_0_-1px_1px_rgba(255,255,255,0.3)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_1px_rgba(255,255,255,0.1)] border-white/60 dark:border-white/20'
                            : 'bg-transparent border-transparent'
                    }`}
                >
                    {/* Prismatic Caustic Spotlight that follows cursor */}
                    {(scrolled || isMobileExpanded) && (
                        <div
                            className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none opacity-60 dark:opacity-40 transition-opacity duration-300 z-0"
                            style={{
                                background: `radial-gradient(350px circle at var(--nav-x, 50%) var(--nav-y, 50%), rgba(255,255,255,0.4), rgba(163,201,226,0.2) 40%, transparent 70%)`,
                            }}
                        />
                    )}

                    {/* Ultra Liquid Glass Top Specular Arc Reflection */}
                    {(scrolled || isMobileExpanded) && (
                        <div className="absolute top-0 inset-x-0 h-14 bg-gradient-to-b from-white/30 dark:from-white/10 to-transparent rounded-t-[2rem] pointer-events-none z-0" />
                    )}

                    {/* Main Navbar Header Row */}
                    <div className="w-full flex items-center justify-between relative z-50 gap-4">
                        {/* Logo Area (Left Bubble) */}
                        <motion.div
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex items-center gap-2 relative z-50 cursor-pointer px-4 py-2 md:px-5 md:py-2.5 rounded-2xl backdrop-blur-2xl transition-all hover:scale-105 bg-white/40 dark:bg-white/10 border-white/60 dark:border-white/20 shadow-[0_4px_15px_rgba(0,0,0,0.05)] border"
                            onClick={() => {
                                if (location.pathname !== '/') {
                                    navigate('/');
                                } else {
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }
                            }}
                        >
                            <DynamicLogo className="h-8 md:h-10" showText={true} forceWhiteText={false} />
                        </motion.div>

                        {/* Center Links (Liquid Glass Capsule Bubble - Desktop Only) */}
                        <nav className="hidden lg:flex items-center gap-1 bg-white/40 dark:bg-white/10 p-1 rounded-2xl backdrop-blur-2xl border border-white/60 dark:border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.7)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,0.2)]">
                            {filteredLinks.map((link) => {
                                const config = link.sectionKey ? settings.sections[link.sectionKey] : null;
                                const isComingSoon = config && config.status === 'coming_soon';
                                const translatedName = t(link.nameKey);
                                const targetHref = link.href.startsWith('#') && location.pathname !== '/' ? `/${link.href}` : link.href;
                                return (
                                    <a
                                        key={link.nameKey}
                                        href={targetHref}
                                        className={`relative z-10 block ${isComingSoon ? 'pointer-events-none' : ''}`}
                                    >
                                        <MagneticButton 
                                            onMouseEnter={() => setHoveredLink(link.nameKey)}
                                            onMouseLeave={() => setHoveredLink(null)}
                                            className={`relative px-4 xl:px-5 py-2.5 text-xs xl:text-sm font-bold tracking-[0.05em] hover:text-alpine-navy dark:hover:text-white transition-colors duration-300 uppercase flex items-center gap-2 ${isComingSoon ? 'text-amber-500/80 dark:text-amber-400/70' : 'text-alpine-navy/70 dark:text-white/70'}`}
                                        >
                                            {hoveredLink === link.nameKey && (
                                                <motion.div
                                                    layoutId="nav-hover"
                                                    className="absolute inset-0 bg-white/70 dark:bg-white/20 backdrop-blur-md rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.8)] z-[-1] border border-white/80 dark:border-white/30"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                            {translatedName}
                                            {isComingSoon && <Clock size={11} className="text-amber-500/80" />}
                                        </MagneticButton>
                                    </a>
                                );
                            })}
                        </nav>

                        {/* Right Actions Bubble */}
                        <div className="flex items-center gap-2 md:gap-3.5 relative z-50">
                            {/* Language Switcher */}
                            <div className="relative">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setLangMenuOpen(!langMenuOpen)}
                                    className="px-2.5 py-2 md:px-3.5 md:py-2.5 rounded-xl md:rounded-2xl bg-white/40 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/20 transition-all duration-300 flex items-center gap-1.5 border border-white/60 dark:border-white/20 shadow-sm text-alpine-navy dark:text-white"
                                >
                                    <Globe size={15} className="text-alpine-navy/80 dark:text-white/80" />
                                    <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">{i18n.language.split('-')[0]}</span>
                                </motion.button>
                                
                                <AnimatePresence>
                                    {langMenuOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setLangMenuOpen(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                                className="absolute right-0 top-full mt-3 w-40 bg-white/90 dark:bg-[#15171E]/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-black/10 dark:border-white/10 overflow-hidden z-50 flex flex-col p-1.5"
                                            >
                                                <button onClick={() => initiateLanguageChange('en')} className={`px-3 py-2 text-sm text-left rounded-lg transition-colors ${i18n.language.startsWith('en') ? 'bg-alpine-glacier/20 text-alpine-blue dark:text-alpine-glacier font-bold' : 'text-[#0B0C10]/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5'}`}>English</button>
                                                <button onClick={() => initiateLanguageChange('ml')} className={`px-3 py-2 text-sm text-left rounded-lg transition-colors ${i18n.language.startsWith('ml') ? 'bg-alpine-glacier/20 text-alpine-blue dark:text-alpine-glacier font-bold' : 'text-[#0B0C10]/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5'}`}>മലയാളം</button>
                                                <button onClick={() => initiateLanguageChange('de')} className={`px-3 py-2 text-sm text-left rounded-lg transition-colors ${i18n.language.startsWith('de') ? 'bg-alpine-glacier/20 text-alpine-blue dark:text-alpine-glacier font-bold' : 'text-[#0B0C10]/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5'}`}>Deutsch</button>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Profile / Auth Buttons */}
                            {isLoggedIn ? (
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => navigate('/portal')}
                                    className="px-2 py-2 md:px-3 md:py-2 rounded-xl md:rounded-2xl bg-white/40 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/20 transition-all duration-300 group flex items-center gap-2 border border-white/60 dark:border-white/20 shadow-sm cursor-pointer"
                                >
                                    <span className="hidden md:inline font-bold text-xs text-alpine-navy dark:text-white tracking-wide">
                                        {user?.name.split(' ')[0]}
                                    </span>
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt="Profile" className="w-6 h-6 md:w-8 md:h-8 rounded-lg object-cover" />
                                    ) : (
                                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-alpine-navy dark:bg-alpine-glacier/20 flex items-center justify-center text-white dark:text-alpine-glacier font-bold text-xs">
                                            {user?.name.charAt(0)}
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <>
                                    {/* Desktop Mode text buttons */}
                                    <Link
                                        to="/login"
                                        className="hidden md:flex items-center gap-1.5 px-3 py-2.5 rounded-xl md:rounded-2xl font-bold text-xs text-alpine-navy/80 dark:text-white/80 hover:text-alpine-navy dark:hover:text-white bg-white/30 dark:bg-white/10 hover:bg-white/50 dark:hover:bg-white/20 border border-white/50 dark:border-white/20 shadow-sm transition-all duration-300 tracking-wider uppercase"
                                    >
                                        <LogIn size={13} />
                                        {t('nav.login')}
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="hidden md:flex relative group overflow-hidden px-4 py-2.5 rounded-xl md:rounded-2xl bg-gradient-to-r from-alpine-navy via-blue-600 to-blue-500 dark:from-white dark:via-white/90 dark:to-white/70 text-white dark:text-alpine-navy font-black text-xs hover:scale-[1.03] transition-all duration-300 shadow-sm flex items-center gap-1.5 tracking-wider uppercase border border-white/30 dark:border-white"
                                    >
                                        {t('nav.join')}
                                    </Link>
                                    {/* Mobile Mode compact icon button */}
                                    <Link
                                        to="/login"
                                        className="md:hidden flex items-center justify-center p-2 rounded-xl bg-white/40 dark:bg-white/10 text-alpine-navy dark:text-white border border-white/60 dark:border-white/20 shadow-sm"
                                        aria-label="Login"
                                    >
                                        <LogIn size={15} />
                                    </Link>
                                </>
                            )}

                            {/* Mobile expansion caret trigger */}
                            <button
                                onClick={() => requestAnimationFrame(() => setIsMobileExpanded(!isMobileExpanded))}
                                className="lg:hidden p-2 rounded-xl bg-white/40 dark:bg-white/10 text-alpine-navy dark:text-white border border-white/60 dark:border-white/20 shadow-sm flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer"
                                aria-label="Toggle Navigation"
                            >
                                <div
                                    className={`transition-transform duration-300 ${isMobileExpanded ? 'rotate-180' : 'rotate-0'}`}
                                >
                                    <ChevronDown size={15} />
                                </div>
                            </button>

                            {/* Universal menu trigger to open side panel settings */}
                            <button
                                onClick={() => requestAnimationFrame(toggleSidebar)}
                                className="relative group overflow-hidden p-2 rounded-xl md:rounded-2xl bg-white/40 dark:bg-white/10 border border-white/60 dark:border-white/25 text-alpine-navy dark:text-white shadow-sm hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer"
                                aria-label="Open menu"
                            >
                                <Menu size={16} className="relative z-10" />
                            </button>
                        </div>
                    </div>

                    {/* Expandable Mobile Navigation Menu Container */}
                    <AnimatePresence>
                        {isMobileExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className="w-full lg:hidden flex flex-col gap-2 mt-3 pt-3 border-t border-white/20 dark:border-white/10 z-50 relative"
                            >
                                {filteredLinks.map((link) => {
                                    const config = link.sectionKey ? settings.sections[link.sectionKey] : null;
                                    const isComingSoon = config && config.status === 'coming_soon';
                                    const translatedName = t(link.nameKey);
                                    const targetHref = link.href.startsWith('#') && location.pathname !== '/' ? `/${link.href}` : link.href;
                                    return (
                                        <a
                                            key={link.nameKey}
                                            href={targetHref}
                                            onClick={() => setIsMobileExpanded(false)}
                                            className={`w-full py-3 px-5 rounded-2xl bg-white/30 dark:bg-white/5 hover:bg-white/50 dark:hover:bg-white/15 border border-white/40 dark:border-white/10 text-center font-bold tracking-wider text-alpine-navy dark:text-white uppercase flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${isComingSoon ? 'pointer-events-none text-amber-500/60 dark:text-amber-400/50' : ''}`}
                                        >
                                            {translatedName}
                                            {isComingSoon && <Clock size={13} className="text-amber-500/80" />}
                                        </a>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Scroll Progress Bar */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-[2px] origin-left z-50"
                style={{
                    scaleX: scrollYProgress,
                    background: 'linear-gradient(90deg, rgba(163,201,226,0.6) 0%, rgba(226,160,113,0.6) 50%, rgba(163,201,226,0.6) 100%)',
                    opacity: scrolled ? 1 : 0,
                }}
            />

            {/* Language Change Confirmation Dialogue */}
            <AnimatePresence>
                {pendingLang && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={cancelLanguageChange}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-white dark:bg-[#1A1D24] rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden"
                        >
                            <div className="p-6 md:p-8">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-full bg-alpine-blue/10 dark:bg-alpine-glacier/10 flex items-center justify-center flex-shrink-0">
                                        <AlertCircle className="w-6 h-6 text-alpine-blue dark:text-alpine-glacier" />
                                    </div>
                                    <button 
                                        onClick={cancelLanguageChange}
                                        className="p-2 -mr-2 -mt-2 text-gray-500 hover:text-black dark:text-white/50 dark:hover:text-white transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Select Translation Scope</h3>
                                <p className="text-gray-600 dark:text-white/70 text-sm leading-relaxed mb-6">
                                    Would you like to translate the entire website, including dynamic community content (stories, logs, comments), or just the main interface and headings?
                                </p>
                                <div className="flex flex-col gap-3">
                                    <button 
                                        onClick={() => {
                                            if (pendingLang) i18n.changeLanguage(pendingLang);
                                            useStore.getState().setTranslationScope('everything');
                                            setPendingLang(null);
                                        }}
                                        className="w-full py-3.5 rounded-xl font-bold text-sm bg-alpine-navy dark:bg-white text-white dark:text-alpine-navy shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
                                    >
                                        Translate Everything
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (pendingLang) i18n.changeLanguage(pendingLang);
                                            useStore.getState().setTranslationScope('interface');
                                            setPendingLang(null);
                                        }}
                                        className="w-full py-3.5 rounded-xl font-bold text-sm border border-black/10 dark:border-white/20 text-[#0B0C10] dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                                    >
                                        Interface Only
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </header>
    );
};

