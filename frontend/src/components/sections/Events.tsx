import React, { useRef } from 'react';
import { motion, useAnimationFrame, useMotionValue, useTransform, wrap } from 'framer-motion';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const EVENTS = [
    { id: 1, title: 'Bavarian Alps Winter Meetup', date: 'Dec 15', time: '08:00 AM', location: 'Garmisch-Partenkirchen', type: 'Upcoming', img: 'https://images.unsplash.com/photo-1543326727-cfcc762ec13b?q=80&w=600' },
    { id: 2, title: 'Black Forest Trail Run', date: 'Jan 12', time: '07:30 AM', location: 'Feldberg', type: 'Upcoming', img: 'https://images.unsplash.com/photo-1513227443834-45fb3011fbac?q=80&w=600' },
    { id: 3, title: 'Matterhorn Basecamp', date: 'Feb 05', time: '06:00 AM', location: 'Zermatt', type: 'Planned', img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=600' },
    { id: 4, title: 'Dolomite Ridge Walk', date: 'Mar 20', time: '05:30 AM', location: 'Cortina d\'Ampezzo', type: 'Planned', img: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?q=80&w=600' },
];

export const Events = () => {
    const { t } = useTranslation();
    const baseX = useMotionValue(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const scrollItems = [...EVENTS, ...EVENTS, ...EVENTS];
    const baseVelocity = -0.04;

    useAnimationFrame((t: any, delta: any) => {
        let moveBy = baseVelocity * (delta / 16);
        baseX.set(baseX.get() + moveBy);
    });

    const x = useTransform(baseX, (v: any) => `${wrap(-33.33, 0, v)}%`);

    return (
        <section id="events" className="py-20 md:py-28 px-6 md:px-12 relative bg-alpine-pearl/10 dark:bg-black overflow-hidden">
            {/* Ambient Background Orbs for Glassmorphism */}
            <div className="absolute top-1/3 left-[-10%] w-[50vw] h-[50vw] rounded-full opacity-[0.15] dark:opacity-[0.12] pointer-events-none blur-[100px]" style={{ background: '#A3C9E2' }} />
            <div className="absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full opacity-[0.15] dark:opacity-[0.12] pointer-events-none blur-[100px]" style={{ background: '#E2A071' }} />
            <div className="absolute top-[60%] left-[40%] w-[30vw] h-[30vw] rounded-full opacity-[0.1] dark:opacity-[0.08] pointer-events-none blur-[100px]" style={{ background: '#4A6A8C' }} />

            <div className="max-w-7xl mx-auto flex flex-col gap-12 md:gap-16">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8 relative z-20">
                    <div>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false }}
                            transition={{ duration: 0.6 }}
                            className="text-alpine-blue dark:text-alpine-sunrise text-xs md:text-sm font-semibold tracking-[0.3em] uppercase mb-3"
                        >
                            {t('events.operations_subtitle', 'Upcoming Operations')}
                        </motion.p>
                        <motion.h2
                            initial={{ y: -50, opacity: 0, scale: 0.8 }}
                            whileInView={{ y: 0, opacity: 1, scale: 1 }}
                            viewport={{ once: false, amount: 0.5 }}
                            transition={{ type: "spring", bounce: 0.4, duration: 1 }}
                            className="text-4xl md:text-6xl lg:text-7xl font-serif mb-4 md:mb-6 text-alpine-navy dark:text-alpine-snow"
                        >
                            {t('events.title', 'Upcoming Expeditions')}
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, filter: "blur(10px)" }}
                            whileInView={{ opacity: 1, filter: "blur(0px)" }}
                            viewport={{ once: false, amount: 0.5 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="text-alpine-navy/60 dark:text-alpine-snow/60 font-light text-base md:text-xl max-w-2xl"
                        >
                            {t('events.subtitle', 'Join us on our next adventure. Whether you are a seasoned mountaineer or a beginner looking for a community, there is a path for you.')}
                        </motion.p>
                    </div>
                    <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: false }}
                        transition={{ type: "spring", damping: 12, delay: 0.3 }}
                    >
                        <Link to="/events" className="group flex items-center gap-3 py-3 md:py-4 px-6 md:px-8 rounded-full bg-alpine-blue dark:bg-alpine-sunrise/20 text-white font-medium hover:scale-105 transition-all shadow-xl backdrop-blur-md text-sm md:text-base btn-premium">
                            {t('events.full_calendar', 'Full Calendar')} <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </motion.div>
                </div>

                {/* Continuous Marquee Area */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: false, amount: 0.1 }}
                    transition={{ duration: 1.5, type: "spring", damping: 15 }}
                    className="w-full relative overflow-hidden py-6 md:py-10"
                    ref={containerRef}
                >
                    <motion.div
                        className="flex gap-5 md:gap-8 w-max"
                        style={{ x }}
                        drag="x"
                        dragConstraints={{ left: -1000, right: 1000 }}
                        dragElastic={0.1}
                        onDrag={(e: any, info: any) => {
                            const velocityOverride = info.delta.x * 2;
                            baseX.set(baseX.get() + velocityOverride);
                        }}
                    >
                        {scrollItems.map((evt, i) => (
                            <div
                                key={`${evt.id}-${i}`}
                                className="relative min-w-[280px] md:min-w-[400px] pb-4 flex-shrink-0 group cursor-grab active:cursor-grabbing"
                            >
                                <div className="w-full h-full premium-card-light dark:premium-card rounded-2xl md:rounded-3xl overflow-hidden border border-black/5 dark:border-white/[0.05] transition-all duration-500 shadow-lg group-hover:shadow-2xl">
                                    <div className="h-44 md:h-56 overflow-hidden relative">
                                        <img src={evt.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                                        <div className={`absolute top-3 md:top-4 left-3 md:left-4 px-3 md:px-4 py-1.5 md:py-2 backdrop-blur-md rounded-full text-xs font-bold tracking-wider uppercase border ${evt.type === 'Upcoming' ? 'bg-alpine-glacier/20 text-white border-alpine-glacier/30' : 'bg-alpine-sunrise/20 text-white border-alpine-sunrise/30'}`}>
                                            {evt.type}
                                        </div>
                                    </div>

                                    <div className="p-5 md:p-8">
                                        <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm font-semibold tracking-wider text-alpine-navy/80 dark:text-alpine-sunrise mb-3 md:mb-4 uppercase">
                                            <span className="flex items-center gap-1"><Calendar size={14} className="text-alpine-glacier" /> {evt.date}</span>
                                            <span className="flex items-center gap-1"><Clock size={14} className="text-alpine-glacier" /> {evt.time}</span>
                                        </div>

                                        <h3 className="text-xl md:text-2xl lg:text-3xl font-serif mb-3 md:mb-4 text-alpine-navy dark:text-alpine-snow group-hover:text-alpine-blue dark:group-hover:text-alpine-glacier transition-colors leading-tight">{evt.title}</h3>
                                        <p className="flex items-center gap-2 text-alpine-navy/60 dark:text-alpine-snow/60 font-medium mb-6 md:mb-8 text-sm md:text-base">
                                            <MapPin size={16} className="text-alpine-forest dark:text-alpine-snow flex-shrink-0" /> {evt.location}
                                        </p>

                                        <Link to={`/events/${evt.id}`}>
                                            <div className="flex items-center gap-2 text-xs md:text-sm font-bold border-b-2 border-alpine-blue dark:border-alpine-sunrise pb-2 w-max text-alpine-navy dark:text-white group-hover:text-alpine-blue dark:group-hover:text-alpine-sunrise transition-colors">
                                                {t('events.inspect_route', 'Inspect Route')} <ArrowRight size={16} className="group-hover:translate-x-3 transition-transform" />
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};
