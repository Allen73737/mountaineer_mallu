import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView, useAnimation, Variants, MotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LineReveal } from '../ui/LineReveal';
import { MorphLink } from '../ui/MorphLink';
import { isPageScrolling } from '../../lib/isScrolling';
// Unsplash photos sized to this screen (viewport × DPR) instead of a fixed 1920 px
import { getHeroImageUrl } from '../../data/peaks';
import { useLiveContent } from '../../lib/useLiveContent';
import { eventsApi } from '../../lib/api';

interface HomeEvent { id: string | number; title: string; date: string; time: string; location: string; type: string; img: string; desc: string }

// Shown until the API answers, and kept if nothing is published yet
const EVENTS: HomeEvent[] = [
    { 
        id: 1, 
        title: 'Bavarian Alps Winter Meetup', 
        date: 'Dec 15', 
        time: '08:00 AM', 
        location: 'Garmisch-Partenkirchen', 
        type: 'Upcoming', 
        img: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?q=80&w=1920&auto=format&fit=crop',
        desc: 'A demanding winter ascent through the Bavarian Alps. Focus will be on ice climbing techniques and deep snow navigation.'
    },
    { 
        id: 2, 
        title: 'Black Forest Trail Run', 
        date: 'Jan 12', 
        time: '07:30 AM', 
        location: 'Feldberg', 
        type: 'Upcoming', 
        img: 'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?q=80&w=1920&auto=format&fit=crop',
        desc: 'High-endurance trail running operation. Expect brutal ascents and rapid descents through dense winter forest cover.'
    },
    { 
        id: 3, 
        title: 'Matterhorn Basecamp', 
        date: 'Feb 05', 
        time: '06:00 AM', 
        location: 'Zermatt', 
        type: 'Planned', 
        img: 'https://images.unsplash.com/photo-1491555103944-7c647fd857e6?q=80&w=1920&auto=format&fit=crop',
        desc: 'Acclimatization and logistics planning at the base of the iconic Matterhorn. Mandatory for summit hopefuls.'
    },
    { 
        id: 4, 
        title: 'Dolomite Ridge Walk', 
        date: 'Mar 20', 
        time: '05:30 AM', 
        location: 'Cortina d\'Ampezzo', 
        type: 'Planned', 
        img: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1920&auto=format&fit=crop',
        desc: 'Exposed ridge traverses and advanced Via Ferrata. Unforgiving drop-offs require absolute focus and proper tethering.'
    },
];

// Winding trail through the roster; it crosses the centre line (x = 12) at each waypoint's height
const TRAIL_PATH = 'M12 0 L12 12.5 C 23 20, 23 30, 12 37.5 C 1 45, 1 55, 12 62.5 C 23 70, 23 80, 12 87.5 L12 100';

/** A waypoint pin that drops onto the trail once the drawn line reaches it. */
const TrailPin = ({ progress, at, active }: { progress: MotionValue<number>; at: number; active: boolean }) => {
    const y = useTransform(progress, [at - 0.06, at], [-14, 0]);
    const opacity = useTransform(progress, [at - 0.06, at], [0, 1]);
    return (
        <motion.span style={{ y, opacity }} className={`absolute -left-6 md:-left-12 w-6 md:w-12 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none transition-[translate] duration-500 ${active ? '-translate-x-2' : ''}`} aria-hidden="true">
            <span className={`relative block w-3 h-3 rounded-full border-2 transition-all duration-500 ${
                active
                    ? 'bg-alpine-sunrise border-white dark:border-black scale-125 shadow-[0_0_14px_rgba(226,160,113,0.9)]'
                    : 'bg-white dark:bg-black border-alpine-blue dark:border-alpine-glacier'
            }`}>
                {active && <span className="absolute -inset-1.5 rounded-full border border-alpine-sunrise/60 animate-ping" />}
            </span>
        </motion.span>
    );
};

export const Events = () => {
    const { t } = useTranslation();
    const [activeIndex, setActiveIndex] = useState(0);
    // Published expeditions from the API (the four shown on the trail); the samples above until they arrive
    const events = useLiveContent<HomeEvent>(EVENTS, async () => (await eventsApi.list(1, 4)).events.slice(0, 4).map((e: any) => ({
        id: e._id, title: e.title, date: e.date, time: e.time, location: e.location, type: e.type, img: e.image, desc: e.description,
    })));
    const [isHovered, setIsHovered] = useState(false);

    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { margin: "-10%" });
    const controls = useAnimation();
    const trailRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress: trailScroll } = useScroll({ target: trailRef, offset: ['start 0.85', 'end 0.55'] });
    const trail = useSpring(trailScroll, { stiffness: 120, damping: 28, restDelta: 0.001 });

    useEffect(() => {
        if (isInView) {
            controls.start('visible');
        } else {
            controls.start('hidden');
        }
    }, [isInView, controls]);

    // Auto-cycle logic
    useEffect(() => {
        if (isHovered || !isInView) return; // Pause cycle if hovered or not visible
        
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % events.length);
        }, 5000); // Crossfade every 5 seconds

        return () => clearInterval(timer);
    }, [isHovered, isInView, events.length]);

    const activeEvent = events[activeIndex % events.length];

    // Animation Variants
    const fadeUp: Variants = {
        hidden: { opacity: 0, y: 30, transition: { duration: 0.5 } },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    const fadeLeft: Variants = {
        hidden: { opacity: 0, x: 50, transition: { duration: 0.5 } },
        visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.2 } }
    };

    const scaleIn: Variants = {
        hidden: { opacity: 0, scale: 1.1, transition: { duration: 0.8 } },
        visible: { opacity: 1, scale: 1, transition: { duration: 1.2, ease: "easeInOut" } }
    };

    return (
        <section 
            id="events" 
            ref={sectionRef}
            className="relative w-full min-h-screen bg-transparent dark:bg-transparent flex items-center overflow-hidden py-24 md:py-32 transition-colors duration-500"
            data-morph-card
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setIsHovered(false)}
        >
            {/* Massive Cinematic Background Crossfade */}
            <motion.div 
                variants={{
                    hidden: { opacity: 0, transition: { duration: 0.8 } },
                    visible: { opacity: 1, transition: { duration: 1.2 } }
                }}
                initial="hidden"
                animate={controls}
                className="absolute inset-0 z-0"
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeEvent.id}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                        className="absolute inset-0"
                    >
                        <img 
                            data-morph-img
                            src={getHeroImageUrl(activeEvent.img)} 
                            alt={activeEvent.title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover object-center"
                        />
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {/* Gradients for Readability */}
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-white via-white/90 md:via-white/70 to-transparent dark:from-black dark:via-black/80 md:dark:via-black/60 opacity-100 transition-colors duration-500" />
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-white via-transparent to-white dark:from-black dark:via-transparent dark:to-black opacity-90 transition-colors duration-500" />
            
            {/* Main Content Container */}
            <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-16 lg:gap-8 h-full">
                
                {/* Left Side: Active Event Details */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center min-h-[50vh]">
                    
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate={controls}
                        className="mb-12"
                    >
                        <p className="text-[#9A5E43] dark:text-alpine-sunrise text-xs md:text-sm font-semibold tracking-[0.3em] uppercase mb-4 flex items-center gap-4">
                            <span className="w-8 h-[1px] bg-[#9A5E43]/60 dark:bg-alpine-glacier" />
                            {t('events.operations_subtitle', 'Upcoming Operations')}
                        </p>
                        <h2 className="cine-title has-lines text-4xl md:text-6xl lg:text-7xl font-serif font-normal tracking-tight text-alpine-navy dark:text-white transition-colors duration-500">
                            <LineReveal>{t('events.title', 'Upcoming Expeditions')}</LineReveal>
                        </h2>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeEvent.id}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="flex flex-col"
                        >
                            {/* Metadata Badges */}
                            <div className="flex flex-wrap items-center gap-4 mb-6">
                                <div className="flex items-center gap-2 bg-black/5 dark:bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-black/10 dark:border-white/10">
                                    <MapPin size={14} className="text-alpine-glacier" />
                                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-black dark:text-white transition-colors duration-500">{activeEvent.location}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-black/5 dark:bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-black/10 dark:border-white/10">
                                    <Calendar size={14} className="text-alpine-glacier" />
                                    <span className="text-xs font-bold tracking-wider text-black dark:text-white transition-colors duration-500">{activeEvent.date}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-black/5 dark:bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-black/10 dark:border-white/10">
                                    <Clock size={14} className="text-alpine-glacier" />
                                    <span className="text-xs font-bold tracking-wider text-black dark:text-white transition-colors duration-500">{activeEvent.time}</span>
                                </div>
                            </div>

                            {/* Massive Typography */}
                            <h2 className="text-5xl md:text-7xl lg:text-[6rem] font-serif font-normal tracking-tight text-alpine-navy dark:text-white leading-[1.1] mb-6 drop-shadow-xl transition-colors duration-500">
                                {activeEvent.title}
                            </h2>

                            <p className="text-black/70 dark:text-white/70 text-lg md:text-2xl font-light max-w-xl leading-relaxed mb-10 drop-shadow-md transition-colors duration-500">
                                {activeEvent.desc}
                            </p>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                {/* Real expeditions open their briefing; sample entries (no API data yet) go to the listing */}
                                {(() => { const EventLink = activeEvent.live ? MorphLink : Link; return (
                                <EventLink to={activeEvent.live ? `/events/${activeEvent.id}` : '/events'}>
                                    <button className="group relative px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-[0.2em] text-sm hover:bg-alpine-glacier transition-colors duration-300 flex items-center gap-3 overflow-hidden active:scale-95">
                                        <span className="relative z-10">Inspect Route</span>
                                        <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </EventLink>
                                ); })()}
                                
                                <div className="flex items-center gap-3 text-black/50 dark:text-white/50 transition-colors duration-500">
                                    <div className={`w-2 h-2 rounded-full ${activeEvent.type === 'Upcoming' ? 'bg-alpine-glacier' : 'bg-alpine-sunrise'} animate-pulse`} />
                                    <span className="text-xs tracking-widest uppercase">{activeEvent.type} Operation</span>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Right Side: Minimalist Events Index */}
                <motion.div 
                    variants={fadeLeft}
                    initial="hidden"
                    animate={controls}
                    className="w-full lg:w-1/3 flex flex-col justify-center pl-6 md:pl-12 z-20 relative transition-colors duration-500"
                >
                    <p className="text-black/40 dark:text-white/40 text-xs font-semibold tracking-[0.3em] uppercase mb-8 transition-colors duration-500">
                        Expedition Roster
                    </p>
                    
                    <div ref={trailRef} className="relative flex flex-col gap-6">
                        {/* Trail map: a dotted route that draws itself with scroll, pins dropping at each stop */}
                        <svg viewBox="0 0 24 100" preserveAspectRatio="none" className="absolute top-0 bottom-0 -left-6 md:-left-12 w-6 md:w-12 h-full overflow-visible pointer-events-none" aria-hidden="true">
                            <path d={TRAIL_PATH} fill="none" strokeWidth="1.5" strokeDasharray="1 5" strokeLinecap="round" vectorEffect="non-scaling-stroke" className="stroke-black/25 dark:stroke-white/25" />
                            <motion.path d={TRAIL_PATH} fill="none" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" style={{ pathLength: trail }} className="stroke-alpine-sunrise" />
                        </svg>
                        {events.map((evt, index) => {
                            const isActive = index === activeIndex;
                            return (
                                <button
                                    key={evt.id}
                                    type="button"
                                    onMouseEnter={() => !isPageScrolling() && setActiveIndex(index)}
                                    onMouseMove={() => activeIndex !== index && !isPageScrolling() && setActiveIndex(index)}
                                    onFocus={() => setActiveIndex(index)}
                                    onClick={() => setActiveIndex(index)}
                                    aria-pressed={isActive}
                                    className={`relative group w-full text-left flex items-center gap-6 cursor-pointer transition-[opacity,transform] duration-500 ${
                                        isActive ? 'opacity-100 translate-x-2' : 'opacity-60 dark:opacity-40 hover:opacity-90'
                                    }`}
                                >
                                    <TrailPin progress={trail} at={(index + 0.5) / events.length} active={isActive} />
                                    <span className={`text-sm md:text-base font-bold font-serif w-14 shrink-0 whitespace-nowrap transition-colors duration-500 ${
                                        isActive ? 'text-alpine-blue dark:text-alpine-glacier' : 'text-black/50 dark:text-white/50'
                                    }`}>
                                        {evt.date}
                                    </span>
                                    
                                    <h3 className={`text-lg md:text-xl font-serif tracking-wide transition-colors duration-500 ${
                                        isActive ? 'text-black dark:text-white' : 'text-black dark:text-white'
                                    }`}>
                                        {evt.title}
                                    </h3>

                                    {/* Active Indicator Line */}
                                    {isActive && (
                                        <motion.div 
                                            layoutId="activeEventIndicator"
                                            className="h-[2px] w-8 md:w-12 bg-alpine-blue dark:bg-alpine-glacier ml-auto hidden md:block"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    
                    <Link
                        to="/events"
                        className="mt-12 flex items-center gap-2 group text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors duration-500"
                    >
                        <span className="font-medium tracking-wide uppercase text-xs tracking-[0.2em]">{t('events.full_calendar', 'View Full Calendar')}</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
                
            </div>
        </section>
    );
};
