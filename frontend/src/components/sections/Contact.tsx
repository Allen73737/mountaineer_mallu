import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Mail, MapPin, Phone, Instagram, Facebook, Youtube, ArrowRight, Send, ChevronUp, Check, ShieldCheck, Compass, MountainSnow, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store/useStore';
import { toast } from 'sonner';
import SoftAurora from '../ui/SoftAurora';
import { useLenis } from '../ui/SmoothScrollProvider';

export const Contact = () => {
    const { t } = useTranslation();
    const { lenis } = useLenis();
    const { theme, weather, weatherLoaded } = useStore();
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState<string | null>(null);
    const [mousePos, setMousePos] = useState({ x: 200, y: 100 });

    const sectionRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });

    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const watermarkY1 = useTransform(scrollYProgress, [0, 1], [-40, 40]);
    const watermarkY2 = useTransform(scrollYProgress, [0, 1], [40, -40]);

    const handleMouseMoveCard = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        e.currentTarget.style.setProperty('--x', `${x}px`);
        e.currentTarget.style.setProperty('--y', `${y}px`);
    };

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newsletterEmail || !newsletterEmail.includes('@')) {
            toast.error(t('contact.invalid_email', 'Please enter a valid email address'));
            return;
        }
        setSubscribed(true);
        toast.success(t('contact.newsletter_subscribed', 'Expedition dispatch frequency synced!'));
        setNewsletterEmail('');
        setTimeout(() => setSubscribed(false), 5000);
    };

    const scrollToTop = () => {
        requestAnimationFrame(() => {
            if (lenis) {
                lenis.scrollTo(0);
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.12,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 35, scale: 0.96 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: "spring" as const, stiffness: 280, damping: 24 }
        }
    };

    return (
        <section ref={sectionRef} id="contact" className={`pt-24 pb-16 md:pt-32 md:pb-20 px-6 md:px-12 relative mt-24 z-10 border-t transition-colors duration-700 overflow-hidden ${
            isDark 
                ? 'bg-black/35 bg-gradient-to-b from-black/40 via-black/20 to-black/50 backdrop-blur-md text-white border-zinc-800/80 shadow-[0_-20px_80px_rgba(0,0,0,0.8)]' 
                : 'bg-alpine-navy/85 bg-gradient-to-b from-alpine-navy/90 via-[#0b2d54]/85 to-alpine-navy/90 backdrop-blur-md text-white border-blue-900/50 shadow-[0_-20px_80px_rgba(11,45,84,0.4)]'
        }`}>

            {/* Ultra-Premium Glowing Divider & Section Badge */}
            <div className="absolute top-0 left-0 w-full flex items-center justify-center transform -translate-y-1/2 z-30">
                <div className={`absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent ${
                    isDark ? 'via-amber-500/40' : 'via-alpine-glacier/40'
                } to-transparent`} />
                <div className={`absolute inset-x-0 h-[1px] blur-[8px] bg-gradient-to-r from-transparent ${
                    isDark ? 'via-amber-500/60' : 'via-alpine-glacier/60'
                } to-transparent`} />
                
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`relative px-6 py-2.5 rounded-full border flex items-center gap-3 transition-colors ${
                        isDark 
                            ? 'bg-[#0B0C10] border-amber-500/40 text-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.3)]' 
                            : 'bg-[#081a30] border-alpine-glacier/40 text-alpine-glacier shadow-[0_0_35px_rgba(163,201,226,0.3)]'
                    }`}
                >
                    <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                        isDark ? 'bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'bg-alpine-glacier shadow-[0_0_10px_rgba(163,201,226,0.8)]'
                    }`} />
                    <span className="text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase">
                        {t('contact.hq', 'Base Camp & Global HQ')}
                    </span>
                </motion.div>
            </div>

            {/* ══ GIANT 2-LINE DISPLAY WATERMARK BACKGROUND (SHININGS OVER GLOBAL SOFT AURORA) ══ */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {/* Topographic Pattern Grid */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(163,201,226,0.3) 40px, rgba(163,201,226,0.3) 41px),
                    repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(163,201,226,0.2) 40px, rgba(163,201,226,0.2) 41px)`
                }} />

                {/* ══ ULTRA-PREMIUM AWARD-WINNING WATERMARK SYSTEM ══ */}
                <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden select-none pointer-events-none z-0">
                    
                    {/* Breathing ambient glow orb — LEFT */}
                    <div 
                        className={`absolute left-[5%] top-[30%] w-[35vw] h-[35vh] rounded-full pointer-events-none ${
                            isDark ? 'bg-amber-500/80' : 'bg-sky-400/80'
                        }`}
                        style={{ animation: 'watermark-glow-pulse 6s ease-in-out infinite' }}
                    />
                    
                    {/* Breathing ambient glow orb — RIGHT */}
                    <div 
                        className={`absolute right-[5%] bottom-[25%] w-[30vw] h-[30vh] rounded-full pointer-events-none ${
                            isDark ? 'bg-orange-400/70' : 'bg-indigo-400/60'
                        }`}
                        style={{ animation: 'watermark-glow-pulse 6s ease-in-out 3s infinite' }}
                    />

                    {/* Line 1: MOUNTAINEER — massive, parallax up, animated gradient sweep */}
                    <motion.div
                        style={{ y: watermarkY1 }}
                        className="transform-gpu"
                    >
                        <h1 
                            style={{
                                WebkitTextStroke: isDark ? '1.5px rgba(255,255,255,0.10)' : '1.5px rgba(255,255,255,0.15)',
                                lineHeight: '0.80',
                                animation: 'watermark-breathe 7s ease-in-out infinite',
                            }}
                            className={`text-[18vw] sm:text-[16vw] lg:text-[14vw] xl:text-[13vw] font-serif font-black tracking-[0.02em] uppercase text-transparent whitespace-nowrap text-center transform-gpu ${
                                isDark ? 'watermark-text-dark' : 'watermark-text-light'
                            }`}
                        >
                            MOUNTAINEER
                        </h1>
                    </motion.div>

                    {/* Line 2: MALLU — same size, parallax down (opposite), delayed gradient sweep */}
                    <motion.div
                        style={{ y: watermarkY2 }}
                        className="transform-gpu"
                    >
                        <h1 
                            style={{
                                WebkitTextStroke: isDark ? '1.5px rgba(255,255,255,0.10)' : '1.5px rgba(255,255,255,0.15)',
                                lineHeight: '0.80',
                                animation: 'watermark-breathe 7s ease-in-out 3.5s infinite',
                            }}
                            className={`text-[18vw] sm:text-[16vw] lg:text-[14vw] xl:text-[13vw] font-serif font-black tracking-[0.02em] uppercase text-transparent whitespace-nowrap text-center transform-gpu ${
                                isDark ? 'watermark-text-dark' : 'watermark-text-light'
                            }`}
                        >
                            MALLU
                        </h1>
                    </motion.div>

                    {/* Central radial halo — depth illusion behind text */}
                    <div className={`absolute w-[50vw] h-[40vh] rounded-full blur-[150px] pointer-events-none ${
                        isDark 
                            ? 'bg-gradient-radial from-amber-500/10 to-transparent opacity-[0.08]'
                            : 'bg-gradient-radial from-sky-400/12 to-transparent opacity-[0.10]'
                    }`} />
                </div>
            </div>

            {/* MAIN CONTENT WRAPPER */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="w-full max-w-[1600px] mx-auto flex flex-col gap-20 relative z-10"
            >

                {/* ══ SECTION 1: BASE CAMP HQ TOP BANNER & CTA ══ */}
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start lg:items-center justify-between pb-16 border-b border-white/10">

                    {/* Left: Headline */}
                    <motion.div variants={itemVariants} className="lg:w-1/2 flex flex-col">
                        <p className="text-alpine-sunrise text-xs md:text-sm font-semibold tracking-[0.3em] uppercase mb-3 md:mb-4 flex items-center gap-3">
                            <span className="w-8 h-[1px] bg-alpine-sunrise" />
                            {t('contact.get_in_touch', 'ESTABLISH COMMUNICATIONS')}
                        </p>
                        <h2 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold leading-[0.95] text-white drop-shadow-lg mb-6">
                            {t('contact.title_main', 'Base Camp Operations')}
                        </h2>
                        <p className="text-white/75 font-light text-base md:text-xl max-w-xl leading-relaxed mb-8">
                            {t('contact.description', 'Whether planning a technical ascent, joining high-altitude operations, or connecting with regional factions — base camp is operational 24/7.')}
                        </p>

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full max-w-md">
                            <Link
                                to="/contact"
                                className="group flex items-center justify-between px-8 py-5 premium-card rounded-2xl border border-white/15 hover:border-alpine-glacier/60 transition-all duration-500 shadow-2xl cursor-pointer transform-gpu"
                            >
                                <div className="text-base md:text-lg font-serif text-white group-hover:text-alpine-sunrise transition-colors font-medium">
                                    {t('contact.open_communications', 'Launch Direct Transmission')}
                                </div>
                                <ArrowRight size={22} className="text-alpine-glacier group-hover:translate-x-3 transition-transform duration-300" />
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Right: HQ Quick Info Cards */}
                    <motion.div variants={itemVariants} className="lg:w-1/2 w-full flex flex-col sm:flex-row gap-6">
                        <motion.div
                            onMouseMove={handleMouseMoveCard}
                            whileHover={{ y: -6, scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 300, damping: 22 }}
                            style={{
                                background: `radial-gradient(350px circle at var(--x, 50%) var(--y, 50%), rgba(163,201,226,0.14), transparent 80%)`
                            }}
                            className="flex-1 premium-card p-8 rounded-2xl md:rounded-3xl border border-white/10 hover:border-alpine-glacier/40 group flex flex-col justify-between min-h-[220px] transform-gpu transition-all duration-300 relative overflow-hidden"
                        >
                            <div>
                                <MapPin size={32} className="text-alpine-glacier mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />
                                <h3 className="font-serif text-2xl font-medium mb-3 text-white">{t('contact.hq', 'Base Camp HQ')}</h3>
                                <p className="text-white/65 font-light text-sm md:text-base leading-relaxed">
                                    Alpenstrasse 42<br />
                                    82467 Garmisch-Partenkirchen<br />
                                    Bavarian Alps, Germany
                                </p>
                            </div>
                            <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-alpine-glacier/80 mt-6 block">47.4917° N, 11.0954° E</span>
                        </motion.div>

                        <motion.div
                            onMouseMove={handleMouseMoveCard}
                            whileHover={{ y: -6, scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 300, damping: 22 }}
                            style={{
                                background: `radial-gradient(350px circle at var(--x, 50%) var(--y, 50%), rgba(226,160,113,0.14), transparent 80%)`
                            }}
                            className="flex-1 premium-card p-8 rounded-2xl md:rounded-3xl border border-white/10 hover:border-alpine-sunrise/40 group flex flex-col justify-between min-h-[220px] transform-gpu transition-all duration-300 relative overflow-hidden"
                        >
                            <div>
                                <Phone size={32} className="text-alpine-glacier mb-6 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300" />
                                <h3 className="font-serif text-2xl font-medium mb-3 text-white">{t('contact.dispatch', 'Direct Frequency')}</h3>
                                <p className="text-white/65 font-light text-sm md:text-base leading-relaxed mb-4">
                                    +49 (0) 1520 1234567<br />
                                    Mon-Fri, 09:00 - 18:00 CET
                                </p>
                            </div>
                            <p className="text-alpine-sunrise font-medium underline underline-offset-4 cursor-pointer text-xs md:text-sm">{t('contact.emergency_direct', 'Emergency Altitude Hotline →')}</p>
                        </motion.div>
                    </motion.div>

                </div>

                {/* ══ SECTION 2: 4-COLUMN MAIN FOOTER STRUCTURE ══ */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10 pb-16 border-b border-white/10">

                    {/* Column 1: Operations & Expeditions */}
                    <div className="flex flex-col gap-5">
                        <h4 className="text-xs font-semibold tracking-[0.3em] uppercase text-alpine-sunrise flex items-center gap-2 mb-2">
                            <Compass size={14} className="text-alpine-sunrise" />
                            {t('footer.col1_title', 'Expeditions & Routes')}
                        </h4>
                        <ul className="flex flex-col gap-3 text-sm text-white/70">
                            <li>
                                <a href="#mission" className="group hover:text-white hover:translate-x-2 transition-all duration-300 inline-flex items-center gap-2 transform-gpu">
                                    <span className="w-1.5 h-1.5 rounded-full bg-alpine-glacier/40 group-hover:bg-alpine-sunrise group-hover:scale-125 transition-all" />
                                    {t('nav.mission', 'Alpine Mission')}
                                </a>
                            </li>
                            <li>
                                <Link to="/stories" className="group hover:text-white hover:translate-x-2 transition-all duration-300 inline-flex items-center gap-2 transform-gpu">
                                    <span className="w-1.5 h-1.5 rounded-full bg-alpine-glacier/40 group-hover:bg-alpine-sunrise group-hover:scale-125 transition-all" />
                                    {t('nav.stories', 'Expedition Logs')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/events" className="group hover:text-white hover:translate-x-2 transition-all duration-300 inline-flex items-center gap-2 transform-gpu">
                                    <span className="w-1.5 h-1.5 rounded-full bg-alpine-glacier/40 group-hover:bg-alpine-sunrise group-hover:scale-125 transition-all" />
                                    {t('nav.events', 'Upcoming Operations')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/gallery" className="group hover:text-white hover:translate-x-2 transition-all duration-300 inline-flex items-center gap-2 transform-gpu">
                                    <span className="w-1.5 h-1.5 rounded-full bg-alpine-glacier/40 group-hover:bg-alpine-sunrise group-hover:scale-125 transition-all" />
                                    {t('nav.gallery', 'Visual Archive')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/community" className="group hover:text-white hover:translate-x-2 transition-all duration-300 inline-flex items-center gap-2 transform-gpu">
                                    <span className="w-1.5 h-1.5 rounded-full bg-alpine-glacier/40 group-hover:bg-alpine-sunrise group-hover:scale-125 transition-all" />
                                    {t('nav.community', 'Global Factions')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 2: Resources & Portal Access */}
                    <div className="flex flex-col gap-5">
                        <h4 className="text-xs font-semibold tracking-[0.3em] uppercase text-alpine-sunrise flex items-center gap-2 mb-2">
                            <ShieldCheck size={14} className="text-alpine-sunrise" />
                            {t('footer.col2_title', 'Resources & Access')}
                        </h4>
                        <ul className="flex flex-col gap-3 text-sm text-white/70">
                            <li>
                                <Link to="/team" className="group hover:text-white hover:translate-x-2 transition-all duration-300 inline-flex items-center gap-2 transform-gpu">
                                    <span className="w-1.5 h-1.5 rounded-full bg-alpine-glacier/40 group-hover:bg-alpine-sunrise group-hover:scale-125 transition-all" />
                                    {t('nav.team', 'Core Summit Team')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/reviews" className="group hover:text-white hover:translate-x-2 transition-all duration-300 inline-flex items-center gap-2 transform-gpu">
                                    <span className="w-1.5 h-1.5 rounded-full bg-alpine-glacier/40 group-hover:bg-alpine-sunrise group-hover:scale-125 transition-all" />
                                    {t('nav.reviews', 'Member Debriefs')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/shop" className="group hover:text-white hover:translate-x-2 transition-all duration-300 inline-flex items-center gap-2 transform-gpu">
                                    <span className="w-1.5 h-1.5 rounded-full bg-alpine-glacier/40 group-hover:bg-alpine-sunrise group-hover:scale-125 transition-all" />
                                    {t('nav.shop', 'Technical Gear Shop')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="group hover:text-white hover:translate-x-2 transition-all duration-300 inline-flex items-center gap-2 transform-gpu">
                                    <span className="w-1.5 h-1.5 rounded-full bg-alpine-glacier/40 group-hover:bg-alpine-sunrise group-hover:scale-125 transition-all" />
                                    {t('contact.hq', 'Base Camp HQ')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/login" className="group hover:text-white hover:translate-x-2 transition-all duration-300 inline-flex items-center gap-2 transform-gpu">
                                    <span className="w-1.5 h-1.5 rounded-full bg-alpine-glacier/40 group-hover:bg-alpine-sunrise group-hover:scale-125 transition-all" />
                                    {t('footer.access_portal', 'Climber Portal Login')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Live Peak Telemetry Status */}
                    <div className="flex flex-col gap-5">
                        <h4 className="text-xs font-semibold tracking-[0.3em] uppercase text-alpine-sunrise flex items-center gap-2 mb-2">
                            <MountainSnow size={14} className="text-alpine-sunrise" />
                            {t('footer.col3_title', 'Live Telemetry')}
                        </h4>
                        <motion.div 
                            whileHover={{ y: -4, scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="flex flex-col gap-4 p-5 glass rounded-2xl border border-white/10 text-xs text-white/80 transform-gpu shadow-xl"
                        >
                            <div className="flex justify-between items-center pb-3 border-b border-white/10">
                                <span className="text-white/50">{t('footer.telemetry_weather', 'Current Climate')}:</span>
                                <span className="font-semibold text-alpine-glacier flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    {weatherLoaded ? (weather.temp !== null ? `${weather.temp}°C, ${weather.condition}` : 'Clear conditions') : 'Connecting...'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-white/10">
                                <span className="text-white/50">{t('footer.telemetry_peak', 'Featured Peak')}:</span>
                                <span className="font-semibold text-white">Zugspitze (2,962 m)</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/50">{t('footer.telemetry_system', 'Interface Mode')}:</span>
                                <span className="px-2.5 py-1 rounded-full bg-white/10 text-[10px] uppercase font-bold text-alpine-sunrise border border-white/10">
                                    {theme === 'system' ? 'System Sync' : `${theme} Mode`}
                                </span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Column 4: Expedition Dispatch Newsletter & Social */}
                    <div className="flex flex-col gap-5">
                        <h4 className="text-xs font-semibold tracking-[0.3em] uppercase text-alpine-sunrise flex items-center gap-2 mb-2">
                            <Mail size={14} className="text-alpine-sunrise" />
                            {t('footer.col4_title', 'Expedition Intelligence')}
                        </h4>
                        <p className="text-xs text-white/60 leading-relaxed">
                            {t('footer.newsletter_desc', 'Subscribe to receive confidential route dispatches, emergency bulletins, and gear drops.')}
                        </p>

                        <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-3">
                            <div className="relative flex items-center">
                                <input
                                    type="email"
                                    value={newsletterEmail}
                                    onChange={(e) => setNewsletterEmail(e.target.value)}
                                    placeholder={t('footer.email_placeholder', 'Enter climber email...')}
                                    className="w-full bg-white/5 border border-white/15 focus:border-alpine-glacier rounded-xl px-4 py-3 text-xs text-white placeholder-white/40 focus:outline-none transition-all shadow-inner"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    type="submit"
                                    className="absolute right-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                                    aria-label="Subscribe"
                                >
                                    {subscribed ? <Check size={14} className="text-emerald-400" /> : <Send size={14} />}
                                </motion.button>
                            </div>
                            {subscribed && (
                                <span className="text-[11px] text-emerald-400 font-medium animate-pulse">✓ Frequency synced successfully</span>
                            )}
                        </form>

                        {/* Social Links */}
                        <div className="flex items-center gap-3 mt-2">
                            <motion.a whileHover={{ y: -4, scale: 1.1 }} href="https://www.instagram.com/mountaineermallu/" target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white transition-all transform-gpu shadow-lg" aria-label="Instagram">
                                <Instagram size={18} />
                            </motion.a>
                            <motion.a whileHover={{ y: -4, scale: 1.1 }} href="#" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white transition-all transform-gpu shadow-lg" aria-label="Facebook">
                                <Facebook size={18} />
                            </motion.a>
                            <motion.a whileHover={{ y: -4, scale: 1.1 }} href="#" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white transition-all transform-gpu shadow-lg" aria-label="YouTube">
                                <Youtube size={18} />
                            </motion.a>
                            <motion.a whileHover={{ y: -4, scale: 1.1 }} href="mailto:info@mountaineermallu.com" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white transition-all transform-gpu shadow-lg" aria-label="Email">
                                <Mail size={18} />
                            </motion.a>
                        </div>
                    </div>

                </motion.div>

                {/* ══ SECTION 3: BOTTOM FOOTER BAR & MAGNETIC BACK-TO-TOP ══ */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-center gap-6 pt-4">

                    {/* Copyright Notice */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 text-center md:text-left">
                        <p className="text-white/40 text-xs tracking-[0.2em] uppercase font-semibold">
                            © {new Date().getFullYear()} MOUNTAINEER MALLU. {t('contact.rights', 'ALL RIGHTS RESERVED.')}
                        </p>
                    </div>

                    {/* Legal Modal Links & Crafted Credit */}
                    <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-white/50">
                        <button 
                            onClick={() => setShowTermsModal('privacy')} 
                            className="hover:text-white hover:underline underline-offset-4 transition-colors cursor-pointer"
                        >
                            Privacy Protocol
                        </button>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <button 
                            onClick={() => setShowTermsModal('terms')} 
                            className="hover:text-white hover:underline underline-offset-4 transition-colors cursor-pointer"
                        >
                            Terms of Operations
                        </button>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="font-serif italic text-alpine-glacier/90 flex items-center gap-1.5">
                            <Sparkles size={12} className="text-alpine-glacier" />
                            {t('contact.crafted_with_love', 'Crafted with Alpine Spirit')}
                        </span>
                    </div>

                    {/* Magnetic Back To Top Control */}
                    <motion.button
                        onClick={scrollToTop}
                        whileHover={{ scale: 1.08, y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="group flex items-center gap-3 px-5 py-3 rounded-full bg-white/5 hover:bg-white/15 border border-white/15 hover:border-alpine-glacier/60 text-white text-xs font-semibold tracking-widest uppercase transition-all shadow-[0_0_25px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(163,201,226,0.3)] cursor-pointer transform-gpu"
                        aria-label="Back to Top"
                    >
                        <span>Back to Summit</span>
                        <ChevronUp size={16} className="text-alpine-glacier group-hover:-translate-y-1 transition-transform duration-300" />
                    </motion.button>

                </motion.div>

            </motion.div>

            {/* Legal Protocol Modal Overlay */}
            <AnimatePresence>
                {showTermsModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowTermsModal(null)}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0B0C10] border border-white/15 rounded-3xl p-8 max-w-xl w-full text-white shadow-2xl relative"
                        >
                            <h3 className="text-2xl font-serif mb-4 text-alpine-glacier">
                                {showTermsModal === 'privacy' ? 'Privacy & Data Telemetry Protocol' : 'Standard Terms of Alpine Operations'}
                            </h3>
                            <p className="text-sm text-white/70 leading-relaxed mb-6">
                                {showTermsModal === 'privacy' 
                                    ? 'Mountaineer Mallu respects climber data privacy. All telemetry, member location coordinates, and dispatch logs are stored under strict encrypted protocols and never transmitted to unauthorized third parties.'
                                    : 'Participation in high-altitude expeditions, technical ascents, and regional faction activities requires strict compliance with safety guidelines, proper equipment verification, and environmental stewardship.'}
                            </p>
                            <button
                                onClick={() => setShowTermsModal(null)}
                                className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs uppercase font-bold tracking-wider cursor-pointer"
                            >
                                Acknowledge Protocol
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};
