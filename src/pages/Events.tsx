import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Calendar, MapPin, Clock, ArrowRight, Mountain, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const CALENDAR = [
    { id: 1, title: 'Bavarian Alps Winter Meetup', date: 'Dec 15, 2025', time: '08:00 AM', location: 'Garmisch-Partenkirchen', difficulty: 'Beginner', slots: 12, type: 'Community Meetup', img: 'https://images.unsplash.com/photo-1543326727-cfcc762ec13b?q=80&w=1200' },
    { id: 2, title: 'Black Forest Trail Run', date: 'Jan 12, 2026', time: '07:30 AM', location: 'Feldberg', difficulty: 'Intermediate', slots: 8, type: 'Endurance Event', img: 'https://images.unsplash.com/photo-1513227443834-45fb3011fbac?q=80&w=1200' },
    { id: 3, title: 'Matterhorn Basecamp', date: 'Feb 05, 2026', time: '06:00 AM', location: 'Zermatt', difficulty: 'Advanced', slots: 4, type: 'Technical Expedition', img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200' },
    { id: 4, title: 'Dolomite Ridge Walk', date: 'Mar 20, 2026', time: '05:30 AM', location: 'Cortina d\'Ampezzo', difficulty: 'Advanced', slots: 6, type: 'Expedition', img: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?q=80&w=1200' },
    { id: 5, title: 'Tyrol Ice Climbing Workshop', date: 'Apr 02, 2026', time: '09:00 AM', location: 'Innsbruck', difficulty: 'Expert', slots: 5, type: 'Training', img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200' },
];

export const EventsPage = () => {
    return (
        <div className="min-h-screen bg-alpine-snow dark:bg-black text-alpine-navy dark:text-alpine-snow pt-32 pb-24 px-6 md:px-12 relative overflow-hidden">

            {/* Absolute massive geometric line art background */}
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                    <path d="M0,100 L50,0 L100,100 Z" stroke="currentColor" strokeWidth="0.5" fill="none" />
                    <path d="M25,100 L50,50 L75,100 Z" stroke="currentColor" strokeWidth="0.5" fill="none" />
                </svg>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, type: "spring", damping: 15 }}
                    className="mb-24 text-center max-w-4xl mx-auto"
                >
                    <h1 className="text-6xl md:text-8xl font-serif font-black mb-8 text-alpine-navy dark:text-alpine-snow leading-none">
                        Expedition<br />Roster
                    </h1>
                    <p className="text-xl md:text-2xl font-light text-alpine-navy/60 dark:text-alpine-snow/60">
                        Secure your place on the rope. Filter by difficulty, region, and technical requirements.
                    </p>
                </motion.div>

                {/* Timeline Layout */}
                <div className="relative border-l border-alpine-navy/10 dark:border-alpine-snow/10 pl-8 md:pl-16 space-y-24">

                    {CALENDAR.map((evt, i) => (
                        <motion.div
                            key={evt.id}
                            initial={{ opacity: 0, x: 100 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, type: "spring", damping: 15 }}
                            className="relative group"
                        >
                            {/* Timeline marker node */}
                            <div className="absolute -left-[37px] md:-left-[69px] w-6 h-6 rounded-full bg-alpine-blue dark:bg-alpine-sunrise border-4 border-alpine-snow dark:border-alpine-navy z-10 group-hover:scale-150 transition-transform duration-500 shadow-xl" />

                            <div className="flex flex-col xl:flex-row gap-12 bg-white/50 dark:bg-black/30 glass-dark rounded-3xl p-6 md:p-10 border border-black/5 dark:border-white/10 hover:bg-white/80 dark:hover:bg-black/50 transition-colors shadow-2xl">

                                {/* Image */}
                                <div className="w-full xl:w-2/5 aspect-video md:aspect-[4/3] rounded-2xl overflow-hidden relative">
                                    <img src={evt.img} className="w-full h-full object-cover filter brightness-75 group-hover:brightness-100 group-hover:scale-110 transition-transform duration-[2000ms]" />
                                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-widest border border-white/20">
                                        {evt.type}
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="w-full xl:w-3/5 flex flex-col justify-center">
                                    <div className="flex flex-wrap items-center gap-6 mb-6 text-sm font-semibold tracking-wider text-alpine-navy/80 dark:text-alpine-snow/80 uppercase">
                                        <span className="flex items-center gap-2"><Calendar size={18} className="text-alpine-blue dark:text-alpine-sunrise" /> {evt.date}</span>
                                        <span className="flex items-center gap-2"><Clock size={18} className="text-alpine-blue dark:text-alpine-sunrise" /> {evt.time}</span>
                                        <span className="flex items-center gap-2"><MapPin size={18} className="text-alpine-forest dark:text-alpine-glacier" /> {evt.location}</span>
                                    </div>

                                    <h2 className="text-4xl md:text-5xl font-serif text-alpine-navy dark:text-alpine-snow mb-6 drop-shadow-sm">{evt.title}</h2>

                                    <div className="flex items-center gap-8 mb-10">
                                        <div className="flex items-center gap-2 text-alpine-navy/60 dark:text-alpine-snow/60">
                                            <Mountain size={20} className={evt.difficulty === 'Expert' ? 'text-red-500' : 'text-alpine-navy/40 dark:text-alpine-snow/40'} />
                                            <span className="font-medium text-lg border-b border-dashed border-black/20 dark:border-white/20 pb-1">{evt.difficulty} Route</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-alpine-navy/60 dark:text-alpine-snow/60">
                                            <AlertTriangle size={20} className="text-alpine-sunrise" />
                                            <span className="font-medium text-lg border-b border-dashed border-black/20 dark:border-white/20 pb-1">{evt.slots} Slots Left</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                                        <Link to={`/events/${evt.id}/register`} className="px-8 py-4 bg-alpine-blue dark:bg-alpine-sunrise text-white font-medium rounded-full text-center hover:scale-105 transition-transform shadow-lg">
                                            Apply for Roster
                                        </Link>
                                        <Link to={`/events/${evt.id}`} className="px-8 py-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-alpine-navy dark:text-alpine-snow font-medium rounded-full text-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex justify-center items-center gap-2 group/btn">
                                            View Briefing <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
                                        </Link>
                                    </div>
                                </div>

                            </div>
                        </motion.div>
                    ))}

                </div>

            </div>
        </div>
    );
};
