import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { LogIn, UserPlus, Clock, Globe, AlertCircle, X, ChevronDown } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useSiteSettings } from '../../store/useSiteSettings';
import { DynamicLogo } from '../ui/DynamicLogo';
import { useLenis } from '../ui/SmoothScrollProvider';
import { useSectionNavigator } from '../../lib/useSectionNavigator';

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

    const { toggleSidebar, isSidebarOpen } = useStore();
    const { isLoggedIn, user } = useAuthStore();
    const { settings } = useSiteSettings();
    const navRef = useRef<HTMLDivElement>(null);
    const [isMobileExpanded, setIsMobileExpanded] = useState(false);
    const { lenis } = useLenis();
    const goToSection = useSectionNavigator();
    const [activeSection, setActiveSection] = useState<string | null>(null);

    // Collapse the mobile menu whenever the route changes
    useEffect(() => { setIsMobileExpanded(false); }, [location.pathname]);

    // Filter nav links based on section visibility
    const filteredLinks = navLinks.filter(link => {
        if (!link.sectionKey) return true; // Mission always shows
        const config = settings.sections[link.sectionKey];
        return config && config.status !== 'hidden';
    });

    // Highlight the section currently in view (home page only)
    const sectionIdsKey = filteredLinks.map(l => l.href.slice(1)).join(',');
    useEffect(() => {
        if (location.pathname !== '/') { setActiveSection(null); return; }
        const ids = sectionIdsKey.split(',');
        const watched = new Set<string>();
        const observer = new IntersectionObserver(entries => {
            for (const entry of entries) {
                if (entry.isIntersecting) setActiveSection(entry.target.id);
            }
        }, { rootMargin: '-45% 0px -50% 0px' });
        // Sections mount after the route transition (slower on weak devices) — keep looking until all are watched
        let tries = 0;
        let timer: ReturnType<typeof setTimeout>;
        const attach = () => {
            ids.forEach(id => {
                const el = document.getElementById(id);
                if (el && !watched.has(id)) { observer.observe(el); watched.add(id); }
            });
            if (watched.size < ids.length && ++tries < 20) timer = setTimeout(attach, 300);
        };
        attach();
        return () => { clearTimeout(timer); observer.disconnect(); };
    }, [location.pathname, sectionIdsKey]);

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

    const theme = useStore(s => s.theme);
    const isDarkTheme = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    // Same night palette as the full-screen menu: navy by day, near-black at night
    const tint = isDarkTheme ? '5,7,12' : '6,26,49';
    const pillClass = 'rounded-full border border-white/15 bg-white/[0.04] hover:bg-white/[0.1] hover:border-white/35 text-white transition-colors duration-300';
    const labelClass = 'text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.2em]';
    // `tap-dot` opts the round controls out of the global 44px mobile button height (index.css), which
    // would stretch them into ovals; the bar has no room for 44px circles on a phone

    return (
        // Always on the menu's night palette, so `dark` variants inside (theme toggle, dropdowns) match it
        <header
            className={`dark fixed top-0 left-0 right-0 z-40 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] py-3 md:py-4 ${hidden ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}
        >
            <div className="max-w-[95rem] mx-auto px-3 sm:px-4 md:px-6">
                <div
                    ref={navRef}
                    onMouseMove={handleNavMouseMove}
                    style={{ backgroundColor: `rgba(${tint},${scrolled || isMobileExpanded ? 0.82 : 0.32})` }}
                    className={`relative flex flex-col w-full border border-white/10 backdrop-blur-xl backdrop-saturate-150 text-white transition-[background-color,box-shadow,border-radius] duration-500 overflow-hidden ${
                        isMobileExpanded ? 'rounded-[1.75rem]' : 'rounded-full'
                    } ${scrolled ? 'shadow-[0_18px_50px_-18px_rgba(0,0,0,0.65)]' : ''}`}
                >
                    {/* Soft light that follows the cursor across the bar */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 pointer-events-none opacity-70"
                        style={{ background: 'radial-gradient(260px circle at var(--nav-x, 50%) var(--nav-y, 50%), rgba(255,255,255,0.07), transparent 70%)' }}
                    />

                    {/* Main row */}
                    <div className="w-full flex items-center justify-between relative z-50 gap-2 sm:gap-4 pl-4 md:pl-6 pr-1.5 md:pr-2 py-1.5 md:py-2">
                        {/* Wordmark */}
                        <motion.button
                            type="button"
                            aria-label="Mountaineer Mallu home"
                            whileTap={{ scale: 0.97 }}
                            className="flex items-center shrink-0 relative z-50 cursor-pointer py-1"
                            onClick={() => {
                                if (location.pathname !== '/') {
                                    navigate('/');
                                } else if (lenis) {
                                    lenis.scrollTo(0, { duration: 1.2 });
                                } else {
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }
                            }}
                        >
                            <DynamicLogo className="h-7 md:h-8" showText={true} forceWhiteText={true} />
                        </motion.button>

                        {/* Sections: numbered serif links, like the menu */}
                        <nav aria-label="Sections" className="hidden lg:flex items-center gap-0.5 xl:gap-1">
                            {filteredLinks.map((link, index) => {
                                const config = link.sectionKey ? settings.sections[link.sectionKey] : null;
                                const isComingSoon = config && config.status === 'coming_soon';
                                const translatedName = t(link.nameKey);
                                const targetHref = link.href.startsWith('#') && location.pathname !== '/' ? `/${link.href}` : link.href;
                                const sectionId = link.href.slice(1);
                                // Home: the section in view. Elsewhere: the page that section belongs to (/events, /gallery...)
                                const isActive = location.pathname === '/'
                                    ? activeSection === sectionId
                                    : location.pathname.startsWith(`/${sectionId}`);
                                const dim = hoveredLink !== null && hoveredLink !== link.nameKey;
                                return (
                                    <a
                                        key={link.nameKey}
                                        href={targetHref}
                                        onClick={e => goToSection(sectionId, e)}
                                        aria-current={isActive ? (location.pathname === '/' ? 'location' : 'page') : undefined}
                                        aria-disabled={isComingSoon || undefined}
                                        className={`group/nl relative z-10 block ${isComingSoon ? 'pointer-events-none' : ''}`}
                                    >
                                        <MagneticButton
                                            onMouseEnter={() => setHoveredLink(link.nameKey)}
                                            onMouseLeave={() => setHoveredLink(null)}
                                            className={`relative px-3 xl:px-4 py-2 flex items-baseline gap-1.5 transition-opacity duration-500 ${dim ? 'opacity-45' : 'opacity-100'}`}
                                        >
                                            {hoveredLink === link.nameKey && (
                                                <motion.div
                                                    layoutId="nav-hover"
                                                    className="absolute inset-0 rounded-full bg-white/[0.07] z-[-1]"
                                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                            <span className="font-mono text-[9px] tabular-nums text-alpine-sunrise/75">{String(index + 1).padStart(2, '0')}</span>
                                            <span className={`font-serif text-[17px] xl:text-[19px] leading-none tracking-[-0.01em] transition-colors duration-300 group-hover/nl:italic ${isComingSoon ? 'text-amber-300/70' : isActive ? 'text-alpine-sunrise' : 'text-white'}`}>
                                                {translatedName}
                                            </span>
                                            {isComingSoon && <Clock size={11} className="text-amber-300/80 self-center" />}
                                            {isActive && (
                                                <motion.span
                                                    layoutId="nav-active-underline"
                                                    className="absolute left-1/2 -translate-x-1/2 bottom-0.5 w-1 h-1 rounded-full bg-alpine-sunrise shadow-[0_0_10px_rgba(226,160,113,0.9)]"
                                                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                                                />
                                            )}
                                        </MagneticButton>
                                    </a>
                                );
                            })}
                        </nav>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 sm:gap-2 relative z-50">
                            {/* Day / night */}
                            <ThemeToggle className="tap-dot rounded-full! bg-white/[0.04]! hover:bg-white/[0.1]! border-white/15! shadow-none! w-9! h-9! md:w-10! md:h-10!" />

                            {/* Language */}
                            <div className="relative">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setLangMenuOpen(!langMenuOpen)}
                                    aria-label="Change language"
                                    aria-expanded={langMenuOpen}
                                    className={`tap-dot ${pillClass} h-9 md:h-10 px-3 md:px-3.5 flex items-center gap-1.5 cursor-pointer`}
                                >
                                    <Globe size={14} className="text-white/75" />
                                    <span className="hidden md:inline font-mono text-[11px] uppercase tracking-[0.2em]">{i18n.language.split('-')[0]}</span>
                                </motion.button>

                                <AnimatePresence>
                                    {langMenuOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setLangMenuOpen(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.97 }}
                                                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                                style={{ backgroundColor: `rgba(${tint},0.96)` }}
                                                className="absolute right-0 top-full mt-3 w-44 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.55)] border border-white/10 overflow-hidden z-50 flex flex-col p-1.5"
                                            >
                                                {([['en', 'English'], ['ml', 'മലയാളം'], ['de', 'Deutsch']] as const).map(([code, name], i) => (
                                                    <button
                                                        key={code}
                                                        onClick={() => initiateLanguageChange(code)}
                                                        className={`flex items-baseline gap-3 px-3 py-2 text-left rounded-xl transition-colors cursor-pointer ${i18n.language.startsWith(code) ? 'bg-white/[0.08] text-alpine-sunrise' : 'text-white/75 hover:bg-white/[0.05] hover:text-white'}`}
                                                    >
                                                        <span className="font-mono text-[9px] text-alpine-sunrise/70">{String(i + 1).padStart(2, '0')}</span>
                                                        <span className="font-serif text-lg leading-none">{name}</span>
                                                    </button>
                                                ))}
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Profile / auth */}
                            {isLoggedIn ? (
                                <motion.button
                                    type="button"
                                    aria-label="Open your dashboard"
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => navigate('/portal')}
                                    className={`tap-dot ${pillClass} h-9 md:h-10 pl-1 pr-1 md:pr-4 flex items-center gap-2.5 cursor-pointer`}
                                >
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt="Profile" className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover" />
                                    ) : (
                                        <span className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-tr from-alpine-blue to-alpine-glacier grid place-items-center text-alpine-navy font-bold text-xs">
                                            {user?.name.charAt(0)}
                                        </span>
                                    )}
                                    <span className={`hidden md:inline ${labelClass}`}>{user?.name.split(' ')[0]}</span>
                                </motion.button>
                            ) : (
                                <>
                                    <Link to="/login" className={`hidden md:flex ${pillClass} ${labelClass} h-10 px-4 items-center gap-1.5`}>
                                        <LogIn size={13} />
                                        {t('nav.login')}
                                    </Link>
                                    {/* Join: the menu's primary pill — white, with the navy disc */}
                                    <Link
                                        to="/signup"
                                        className={`group/join hidden md:flex items-center gap-2.5 h-10 pl-4 pr-1 rounded-full bg-white text-alpine-navy hover:bg-alpine-sunrise transition-colors duration-300 ${labelClass}`}
                                    >
                                        {t('nav.join')}
                                        <span className="grid place-items-center w-8 h-8 rounded-full bg-alpine-navy text-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/join:rotate-45">
                                            <UserPlus size={13} />
                                        </span>
                                    </Link>
                                    <Link to="/login" className={`md:hidden ${pillClass} w-9 h-9 grid place-items-center`} aria-label="Login">
                                        <LogIn size={14} />
                                    </Link>
                                </>
                            )}

                            {/* Phones / tablets: section list toggle */}
                            <button
                                onClick={() => requestAnimationFrame(() => setIsMobileExpanded(!isMobileExpanded))}
                                className={`tap-dot lg:hidden ${pillClass} w-9 h-9 grid place-items-center cursor-pointer`}
                                aria-label="Toggle section links"
                                aria-expanded={isMobileExpanded}
                            >
                                <span className={`transition-transform duration-300 ${isMobileExpanded ? 'rotate-180' : 'rotate-0'}`}>
                                    <ChevronDown size={15} />
                                </span>
                            </button>

                            {/* Menu: the twin of the menu's "Close" pill */}
                            <button
                                onClick={() => requestAnimationFrame(toggleSidebar)}
                                className={`tap-dot group/menu ${pillClass} h-9 md:h-10 pl-1 md:pl-5 pr-1 flex items-center gap-3 cursor-pointer`}
                                aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
                                aria-expanded={isSidebarOpen}
                            >
                                <span className={`hidden md:inline ${labelClass}`}>Menu</span>
                                <span className="grid place-items-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-white text-alpine-navy" aria-hidden="true">
                                    <span className="flex flex-col items-end gap-[3px] w-3.5">
                                        <span className={`block h-[1.5px] rounded-full bg-current transition-all duration-300 origin-center ${isSidebarOpen ? 'w-full translate-y-[2.25px] rotate-45' : 'w-full'}`} />
                                        <span className={`block h-[1.5px] rounded-full bg-current transition-all duration-300 origin-center ${isSidebarOpen ? 'w-full -translate-y-[2.25px] -rotate-45' : 'w-2/3 group-hover/menu:w-full'}`} />
                                    </span>
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Phones / tablets: numbered section list */}
                    <AnimatePresence>
                        {isMobileExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className="w-full lg:hidden flex flex-col px-5 pb-4 pt-2 border-t border-white/10 z-50 relative"
                            >
                                {filteredLinks.map((link, index) => {
                                    const config = link.sectionKey ? settings.sections[link.sectionKey] : null;
                                    const isComingSoon = config && config.status === 'coming_soon';
                                    const translatedName = t(link.nameKey);
                                    const targetHref = link.href.startsWith('#') && location.pathname !== '/' ? `/${link.href}` : link.href;
                                    return (
                                        <a
                                            key={link.nameKey}
                                            href={targetHref}
                                            onClick={e => { setIsMobileExpanded(false); goToSection(link.href.slice(1), e); }}
                                            className={`flex items-baseline gap-4 py-2.5 border-b border-white/[0.06] last:border-b-0 active:opacity-70 ${isComingSoon ? 'pointer-events-none opacity-50' : ''}`}
                                        >
                                            <span className="font-mono text-[10px] tabular-nums text-alpine-sunrise/80 w-5">{String(index + 1).padStart(2, '0')}</span>
                                            <span className="font-serif text-3xl leading-none tracking-[-0.01em] text-white">{translatedName}</span>
                                            {isComingSoon && <Clock size={13} className="text-amber-300/80 self-center" />}
                                        </a>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Scroll progress */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-px origin-left z-50"
                style={{
                    scaleX: scrollYProgress,
                    background: 'linear-gradient(90deg, rgba(163,201,226,0.7) 0%, rgba(226,160,113,0.85) 50%, rgba(201,169,110,0.7) 100%)',
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

