import React, { useRef } from 'react';
import { motion, useAnimationFrame, useMotionValue, useTransform, wrap, PanInfo } from 'framer-motion';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const EVENTS = [
    { id: 1, title: 'Bavarian Alps Winter Meetup', date: 'Dec 15', time: '08:00 AM', location: 'Garmisch-Partenkirchen', type: 'Upcoming', img: 'https://images.unsplash.com/photo-1543326727-cfcc762ec13b?q=80&w=600' },
    { id: 2, title: 'Black Forest Trail Run', date: 'Jan 12', time: '07:30 AM', location: 'Feldberg', type: 'Upcoming', img: 'https://images.unsplash.com/photo-1513227443834-45fb3011fbac?q=80&w=600' },
    { id: 3, title: 'Matterhorn Basecamp', date: 'Feb 05', time: '06:00 AM', location: 'Zermatt', type: 'Planned', img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=600' },
    { id: 4, title: 'Dolomite Ridge Walk', date: 'Mar 20', time: '05:30 AM', location: 'Cortina d\'Ampezzo', type: 'Planned', img: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?q=80&w=600' },
];

export const Events = () => {
    const baseX = useMotionValue(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Duplicated array to create the infinite scroll effect seamlessly
    const scrollItems = [...EVENTS, ...EVENTS, ...EVENTS];

    // Very slow marquee speed
    const baseVelocity = -0.05;

    useAnimationFrame((t: any, delta: any) => {
        let moveBy = baseVelocity * (delta / 16);
        baseX.set(baseX.get() + moveBy);
    });

    // Calculate the wrapping bounds based on the number of items and their width
    // Since we have three sets of items and each card is ~400px plus gap
    // Wrap when it shifts by exactly one full original loop length
    const x = useTransform(baseX, (v: any) => `${wrap(-33.33, 0, v)}%`);

    return (
        <section id="events" className="py-24 px-6 md:px-12 relative bg-black/5 dark:bg-black/20 overflow-hidden">
            <div className="max-w-7xl mx-auto flex flex-col gap-16">

                {/* Header Header */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-8 relative z-20">
                    <div>
                        <motion.h2
                            initial={{ y: -50, opacity: 0, scale: 0.8 }}
                            whileInView={{ y: 0, opacity: 1, scale: 1 }}
                            viewport={{ once: false, amount: 0.5 }}
                            transition={{ type: "spring", bounce: 0.5, duration: 1 }}
                            className="text-5xl md:text-7xl font-serif mb-6 text-alpine-navy dark:text-alpine-snow"
                        >
                            Upcoming Expeditions
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, filter: "blur(10px)" }}
                            whileInView={{ opacity: 1, filter: "blur(0px)" }}
                            viewport={{ once: false, amount: 0.5 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="text-alpine-navy/60 dark:text-alpine-snow/60 font-light text-xl max-w-2xl"
                        >
                            Join us on our next adventure. Whether you are a seasoned mountaineer or a beginner looking for a community, there is a path for you.
                        </motion.p>
                    </div>
                    <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: false }}
                        transition={{ type: "spring", damping: 12, delay: 0.3 }}
                    >
                        <Link to="/events" className="group flex items-center gap-4 py-4 px-8 rounded-full bg-alpine-blue dark:bg-alpine-sunrise/20 text-white font-medium hover:scale-105 transition-all shadow-xl backdrop-blur-md">
                            Full Calendar <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </motion.div>
                </div>

                {/* Continuous Marquee Area */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
                    whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
                    viewport={{ once: false, amount: 0.1 }}
                    transition={{ duration: 1.5, type: "spring", damping: 15 }}
                    className="w-full relative overflow-hidden py-10"
                    ref={containerRef}
                >
                    {/* Framer motion X transform container representing length of all items */}
                    <motion.div
                        className="flex gap-8 w-max"
                        style={{ x }}
                        // Enables manual drag to slide
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
                                className="relative min-w-[320px] md:min-w-[420px] pb-4 flex-shrink-0 group cursor-grab active:cursor-grabbing"
                            >
                                {/* Event Card */}
                                <div className="w-full h-full glass-dark bg-white/50 dark:bg-black/30 rounded-3xl overflow-hidden border border-black/10 dark:border-white/5 hover:bg-white/80 dark:hover:bg-black/50 transition-colors duration-500 shadow-xl group-hover:shadow-2xl">

                                    <div className="h-56 overflow-hidden relative">
                                        <img src={evt.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]" />
                                        <div className="absolute inset-0 bg-black/20" />
                                        <div className="absolute top-4 left-4 px-4 py-2 backdrop-blur-md bg-black/40 rounded-full text-alpine-snow text-xs font-bold tracking-wider uppercase border border-white/20">
                                            {evt.type}
                                        </div>
                                    </div>

                                    <div className="p-8">
                                        <div className="flex flex-wrap items-center gap-4 text-sm font-semibold tracking-wider text-alpine-navy/80 dark:text-alpine-sunrise mb-4 uppercase">
                                            <span className="flex items-center gap-1"><Calendar size={18} className="text-alpine-glacier" /> {evt.date}</span>
                                            <span className="flex items-center gap-1"><Clock size={18} className="text-alpine-glacier" /> {evt.time}</span>
                                        </div>

                                        <h3 className="text-3xl font-serif mb-4 text-alpine-navy dark:text-alpine-snow group-hover:text-alpine-blue dark:group-hover:text-alpine-glacier transition-colors">{evt.title}</h3>
                                        <p className="flex items-center gap-2 text-alpine-navy/60 dark:text-alpine-snow/60 font-medium mb-8 text-lg">
                                            <MapPin size={20} className="text-alpine-forest dark:text-alpine-snow" /> {evt.location}
                                        </p>

                                        <Link to={`/events/${evt.id}`}>
                                            <div className="flex items-center gap-2 text-sm font-bold border-b-2 border-alpine-blue dark:border-alpine-sunrise pb-2 w-max text-alpine-navy dark:text-white group-hover:text-alpine-blue dark:group-hover:text-alpine-sunrise transition-colors">
                                                Inspect Route <ArrowRight size={18} className="group-hover:translate-x-3 transition-transform" />
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
