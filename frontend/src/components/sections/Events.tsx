import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView, useAnimation, Variants } from 'framer-motion';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const EVENTS = [
    { 
        id: 1, 
        title: 'Bavarian Alps Winter Meetup', 
        date: 'Dec 15', 
        time: '08:00 AM', 
        location: 'Garmisch-Partenkirchen', 
        type: 'Upcoming', 
        img: 'https://images.unsplash.com/photo-1543326727-cfcc762ec13b?q=80&w=1920&auto=format&fit=crop',
        desc: 'A demanding winter ascent through the Bavarian Alps. Focus will be on ice climbing techniques and deep snow navigation.'
    },
    { 
        id: 2, 
        title: 'Black Forest Trail Run', 
        date: 'Jan 12', 
        time: '07:30 AM', 
        location: 'Feldberg', 
        type: 'Upcoming', 
        img: 'https://images.unsplash.com/photo-1483728083836-33002303b60d?q=80&w=1920&auto=format&fit=crop',
        desc: 'High-endurance trail running operation. Expect brutal ascents and rapid descents through dense winter forest cover.'
    },
    { 
        id: 3, 
        title: 'Matterhorn Basecamp', 
        date: 'Feb 05', 
        time: '06:00 AM', 
        location: 'Zermatt', 
        type: 'Planned', 
        img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1920&auto=format&fit=crop',
        desc: 'Acclimatization and logistics planning at the base of the iconic Matterhorn. Mandatory for summit hopefuls.'
    },
    { 
        id: 4, 
        title: 'Dolomite Ridge Walk', 
        date: 'Mar 20', 
        time: '05:30 AM', 
        location: 'Cortina d\'Ampezzo', 
        type: 'Planned', 
        img: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?q=80&w=1920&auto=format&fit=crop',
        desc: 'Exposed ridge traverses and advanced Via Ferrata. Unforgiving drop-offs require absolute focus and proper tethering.'
    },
];

export const Events = () => {
    const { t } = useTranslation();
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { margin: "-10%" });
    const controls = useAnimation();

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
            setActiveIndex((prev) => (prev + 1) % EVENTS.length);
        }, 5000); // Crossfade every 5 seconds

        return () => clearInterval(timer);
    }, [isHovered, isInView]);

    const activeEvent = EVENTS[activeIndex];

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
                            src={activeEvent.img} 
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
                        <p className="text-alpine-glacier dark:text-alpine-sunrise text-xs md:text-sm font-semibold tracking-[0.3em] uppercase mb-4 flex items-center gap-4">
                            <span className="w-8 h-[1px] bg-alpine-glacier" />
                            {t('events.operations_subtitle', 'Upcoming Operations')}
                        </p>
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-black dark:text-white transition-colors duration-500">
                            {t('events.title', 'Upcoming Expeditions')}
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
                            <h2 className="text-5xl md:text-7xl lg:text-[6rem] font-serif font-black tracking-tight text-black dark:text-white leading-[1.1] mb-6 drop-shadow-xl transition-colors duration-500">
                                {activeEvent.title}
                            </h2>

                            <p className="text-black/70 dark:text-white/70 text-lg md:text-2xl font-light max-w-xl leading-relaxed mb-10 drop-shadow-md transition-colors duration-500">
                                {activeEvent.desc}
                            </p>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                <Link to={`/events/${activeEvent.id}`}>
                                    <button className="group relative px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-[0.2em] text-sm hover:bg-alpine-glacier transition-colors duration-300 flex items-center gap-3 overflow-hidden active:scale-95">
                                        <span className="relative z-10">Inspect Route</span>
                                        <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </Link>
                                
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
                    className="w-full lg:w-1/3 flex flex-col justify-center border-l border-black/10 dark:border-white/10 pl-6 md:pl-12 z-20 relative transition-colors duration-500"
                >
                    <p className="text-black/40 dark:text-white/40 text-xs font-semibold tracking-[0.3em] uppercase mb-8 transition-colors duration-500">
                        Expedition Roster
                    </p>
                    
                    <div className="flex flex-col gap-6">
                        {EVENTS.map((evt, index) => {
                            const isActive = index === activeIndex;
                            return (
                                <div 
                                    key={evt.id}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    onClick={() => setActiveIndex(index)}
                                    className={`group flex items-center gap-6 cursor-pointer transition-all duration-500 ${
                                        isActive ? 'opacity-100 translate-x-2' : 'opacity-40 hover:opacity-80'
                                    }`}
                                >
                                    <span className={`text-sm md:text-base font-bold font-serif w-12 transition-colors duration-500 ${
                                        isActive ? 'text-alpine-glacier' : 'text-black/50 dark:text-white/50'
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
                                            className="h-[2px] w-8 md:w-12 bg-alpine-glacier ml-auto hidden md:block"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </div>
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
