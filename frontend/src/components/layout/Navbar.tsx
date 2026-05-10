import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { User, LogIn, UserPlus, Menu, Clock, Globe, AlertCircle, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useSiteSettings } from '../../store/useSiteSettings';
import { DynamicLogo } from '../ui/DynamicLogo';

const navLinks = [
    { nameKey: 'nav.mission', href: '#mission' },
    { nameKey: 'nav.stories', href: '#stories', sectionKey: 'stories' },
    { nameKey: 'nav.events', href: '#events', sectionKey: 'events' },
    { nameKey: 'nav.gallery', href: '#gallery', sectionKey: 'gallery' },
    { nameKey: 'nav.community', href: '#community', sectionKey: 'community' },
];

export const Navbar = () => {
    const { t, i18n } = useTranslation();
    const [scrolled, setScrolled] = useState(false);
    const [hoveredLink, setHoveredLink] = useState<string | null>(null);
    const [langMenuOpen, setLangMenuOpen] = useState(false);
    const [pendingLang, setPendingLang] = useState<string | null>(null);
    const { toggleSidebar } = useStore();
    const { isLoggedIn, user } = useAuthStore();
    const navigate = useNavigate();
    const { settings } = useSiteSettings();
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const navRef = useRef<HTMLDivElement>(null);

    // Filter nav links based on section visibility
    const filteredLinks = navLinks.filter(link => {
        if (!link.sectionKey) return true; // Mission always shows
        return settings.sections[link.sectionKey] !== 'hidden';
    });

    const { scrollYProgress } = useScroll();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavMouseMove = (e: React.MouseEvent) => {
        if (!navRef.current) return;
        const rect = navRef.current.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    const initiateLanguageChange = (lng: string) => {
        if (i18n.language.startsWith(lng)) {
            setLangMenuOpen(false);
            return;
        }
        setPendingLang(lng);
        setLangMenuOpen(false);
    };

    const confirmLanguageChange = () => {
        if (pendingLang) {
            i18n.changeLanguage(pendingLang);
            setPendingLang(null);
        }
    };

    const cancelLanguageChange = () => {
        setPendingLang(null);
    };

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className={`fixed top-0 left-0 right-0 z-40 transition-all duration-700 ${scrolled ? 'py-3 md:py-5' : 'py-6 md:py-10'}`}
        >
            <div className="max-w-[90rem] mx-auto px-4 md:px-8">
                <div
                    ref={navRef}
                    onMouseMove={handleNavMouseMove}
                    className={`relative flex items-center justify-between rounded-[2rem] px-4 md:px-8 py-3 md:py-4 transition-all duration-700 border border-transparent ${
                        scrolled
                            ? 'bg-white/5 dark:bg-[#0A0D14]/80 backdrop-blur-2xl shadow-[0_30px_80px_rgba(0,0,0,0.5)] border-white/10 dark:border-white/10'
                            : 'bg-transparent'
                    }`}
                >
                    {/* Spotlight gradient that follows cursor */}
                    {scrolled && (
                        <div
                            className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none opacity-40"
                            style={{
                                background: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, rgba(163,201,226,0.12), transparent 60%)`,
                            }}
                        />
                    )}

                    {/* Subtle bottom glow line when scrolled */}
                    {scrolled && (
                        <div className="absolute bottom-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-alpine-glacier/20 to-transparent pointer-events-none" />
                    )}

                    {/* Logo Area */}
                    <motion.div
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2 relative z-50 cursor-pointer bg-white/95 dark:bg-white/5 px-4 py-2.5 md:px-5 md:py-2.5 rounded-2xl shadow-sm backdrop-blur-md border border-black/5 dark:border-white/10 transition-all hover:shadow-lg hover:border-white/20"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        <DynamicLogo className="h-10 md:h-11" showText={true} />
                    </motion.div>

                    {/* Center Links */}
                    <nav className="hidden lg:flex items-center gap-1 bg-black/[0.03] dark:bg-white/[0.03] p-1.5 rounded-2xl backdrop-blur-xl border border-black/[0.04] dark:border-white/[0.08] shadow-inner">
                        {filteredLinks.map((link) => {
                            const isComingSoon = link.sectionKey && settings.sections[link.sectionKey] === 'coming_soon';
                            const translatedName = t(link.nameKey);
                            return (
                                <a
                                    key={link.nameKey}
                                    href={link.href}
                                    onMouseEnter={() => setHoveredLink(link.nameKey)}
                                    onMouseLeave={() => setHoveredLink(null)}
                                    className={`relative px-5 xl:px-6 py-3 text-sm xl:text-[15px] font-bold tracking-[0.05em] hover:text-[#0B0C10] dark:hover:text-white transition-all duration-300 z-10 uppercase flex items-center gap-2 ${isComingSoon ? 'text-amber-500/70 dark:text-amber-400/60' : 'text-[#0B0C10]/70 dark:text-white/60'}`}
                                >
                                    {hoveredLink === link.nameKey && (
                                        <motion.div
                                            layoutId="nav-hover"
                                            className="absolute inset-0 bg-white dark:bg-white/10 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.1)] z-[-1] border border-black/5 dark:border-white/5"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    {translatedName}
                                    {isComingSoon && <Clock size={12} className="text-amber-500/70" />}
                                </a>
                            );
                        })}
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 md:gap-4 relative z-50">
                        {/* Language Switcher */}
                        <div className="relative">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setLangMenuOpen(!langMenuOpen)}
                                className="px-2 py-2 md:px-4 md:py-3 rounded-xl md:rounded-2xl hover:bg-[#0B0C10]/[0.06] dark:hover:bg-white/10 transition-all duration-300 flex items-center gap-1.5 md:gap-2.5 border border-transparent hover:border-black/5 dark:hover:border-white/10 shadow-sm"
                            >
                                <Globe size={16} className="md:w-5 md:h-5 text-[#0B0C10]/70 dark:text-white/70" />
                                <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-[#0B0C10]/80 dark:text-white/80">{i18n.language.split('-')[0]}</span>
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

                        {isLoggedIn ? (
                            <>
                                {/* Profile indicator */}
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => navigate('/portal')}
                                    className="px-3 py-2 md:px-4 md:py-2.5 rounded-2xl hover:bg-[#0B0C10]/[0.06] dark:hover:bg-white/10 transition-all duration-300 group flex items-center gap-3 border border-transparent hover:border-black/5 dark:hover:border-white/10 cursor-pointer shadow-sm"
                                >
                                    <span className="hidden md:inline-block font-bold text-sm text-[#0B0C10]/80 dark:text-white/80 group-hover:text-[#0B0C10] dark:group-hover:text-white tracking-wide">
                                        {user?.name.split(' ')[0]}
                                    </span>
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt="Profile" className="w-9 h-9 md:w-10 md:h-10 rounded-xl object-cover border-2 border-transparent group-hover:border-alpine-glacier/50 transition-all shadow-sm" />
                                    ) : (
                                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-alpine-navy dark:bg-alpine-glacier/20 flex items-center justify-center text-white dark:text-alpine-glacier font-bold text-sm shadow-inner">
                                            {user?.name.charAt(0)}
                                        </div>
                                    )}
                                </motion.div>

                                {/* Universal menu trigger */}
                                <motion.button
                                    whileHover={{ scale: 1.08 }}
                                    whileTap={{ scale: 0.92 }}
                                    onClick={toggleSidebar}
                                    className="p-3 md:p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-[#0B0C10]/10 dark:hover:bg-white/10 transition-all duration-300 text-[#0B0C10]/80 dark:text-white/80 hover:text-[#0B0C10] dark:hover:text-white border border-transparent hover:border-black/10 dark:hover:border-white/20 shadow-sm"
                                    aria-label="Open menu"
                                >
                                    <Menu size={24} />
                                </motion.button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="flex items-center gap-1.5 px-3 py-2 md:px-5 md:py-3 rounded-xl font-bold text-xs md:text-sm text-[#0B0C10]/70 dark:text-white/70 hover:text-[#0B0C10] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/10 transition-all duration-300 tracking-wider uppercase"
                                >
                                    <LogIn size={14} className="md:w-4 md:h-4" />
                                    {t('nav.login')}
                                </Link>
                                <Link
                                    to="/signup"
                                    className="px-4 md:px-8 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl bg-alpine-navy dark:bg-white text-white dark:text-alpine-navy font-bold text-xs md:text-[15px] hover:scale-[1.03] transition-all shadow-lg hover:shadow-[0_10px_30px_rgba(255,255,255,0.2)] flex items-center gap-1.5 tracking-wider uppercase"
                                >
                                    {t('nav.join')}
                                </Link>
                                {/* Universal menu trigger — always visible */}
                                <motion.button
                                    whileHover={{ scale: 1.08 }}
                                    whileTap={{ scale: 0.92 }}
                                    onClick={toggleSidebar}
                                    className="p-3 md:p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-[#0B0C10]/10 dark:hover:bg-white/10 transition-all duration-300 text-[#0B0C10]/80 dark:text-white/80 hover:text-[#0B0C10] dark:hover:text-white border border-transparent hover:border-black/10 dark:hover:border-white/20 shadow-sm"
                                    aria-label="Open menu"
                                >
                                    <Menu size={24} />
                                </motion.button>
                            </>
                        )}
                    </div>
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
        </motion.header>
    );
};

