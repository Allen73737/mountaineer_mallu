import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const GROUPS = [
    { id: 1, name: 'Alpine Vanguards', region: 'Chamonix, FR', members: 128, desc: 'Technical ascents and mixed climbing focus. High altitude experience required.' },
    { id: 2, name: 'Bavarian Trekkers', region: 'Munich, DE', members: 450, desc: 'Weekend hiking operations across the Zugspitze region. All levels welcome.' },
    { id: 3, name: 'Dolomites Scramblers', region: 'Cortina, IT', members: 85, desc: 'Via Ferrata, ridge traverses, and light mountaineering.' },
    { id: 4, name: 'Swiss High Route', region: 'Zermatt, CH', members: 210, desc: 'Multi-day hut-to-hut glacier expeditions and logistics planning.' }
];

export const CommunityPreview = () => {
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { once: true, margin: "-100px" });

    return (
        <section ref={containerRef} id="community" className="py-24 px-6 md:px-12 relative z-10 bg-alpine-snow dark:bg-black overflow-hidden border-t border-black/5 dark:border-white/5">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-end justify-between mb-12">
                    <div>
                        <motion.h2
                            initial={{ y: 30, opacity: 0 }}
                            animate={isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
                            transition={{ duration: 0.8, type: "spring", damping: 20 }}
                            className="text-5xl md:text-7xl font-serif mb-4 text-alpine-navy dark:text-alpine-snow"
                        >
                            Community
                        </motion.h2>
                        <motion.p
                            initial={{ x: -30, opacity: 0 }}
                            animate={isInView ? { x: 0, opacity: 1 } : { x: -30, opacity: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-alpine-navy/60 dark:text-alpine-snow/60 max-w-xl font-light text-xl"
                        >
                            Join specialized factions. Coordinate expeditions, share intelligence, and find your ropemates.
                        </motion.p>
                    </div>
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.3 }}
                    >
                        <Link
                            to="/community"
                            className="hidden md:flex items-center gap-2 group text-alpine-forest dark:text-alpine-glacier transition-colors"
                        >
                            <span className="font-medium tracking-wide">Enter Hub</span>
                            <div className="bg-black/5 dark:bg-white/5 p-4 rounded-full group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-colors">
                                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    </motion.div>
                </div>

                {/* Horizontal Group Carousel */}
                <div className="flex overflow-x-auto gap-6 pb-12 pt-4 px-4 -mx-4 hide-scrollbar snap-x snap-mandatory">
                    {GROUPS.map((group, i) => (
                        <motion.div
                            key={group.id}
                            initial={{ y: 50, opacity: 0 }}
                            animate={isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 + (i * 0.1) }}
                            className="min-w-[320px] md:min-w-[400px] snap-center shrink-0 glass dark:glass-dark rounded-3xl p-8 flex flex-col justify-between group cursor-pointer hover:-translate-y-2 transition-transform duration-500 border border-black/5 dark:border-white/5"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="bg-alpine-navy dark:bg-white/10 p-3 rounded-2xl">
                                        <ShieldCheck size={28} className="text-white" />
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/10 px-3 py-1.5 rounded-full">
                                        <Users size={14} className="text-alpine-navy/60 dark:text-alpine-snow/60" />
                                        <span className="text-xs font-bold text-alpine-navy/80 dark:text-alpine-snow/80">{group.members}</span>
                                    </div>
                                </div>
                                <h3 className="font-serif text-2xl font-bold text-alpine-navy dark:text-white mb-2">{group.name}</h3>
                                <div className="flex items-center gap-1.5 text-alpine-forest dark:text-alpine-glacier mb-4">
                                    <MapPin size={16} />
                                    <span className="text-sm font-semibold tracking-wide uppercase">{group.region}</span>
                                </div>
                                <p className="text-alpine-navy/70 dark:text-white/60 text-base leading-relaxed mb-8">
                                    {group.desc}
                                </p>
                            </div>

                            <Link to="/community" className="w-full">
                                <button className="w-full py-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-alpine-navy hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors font-semibold tracking-wide flex items-center justify-center gap-2 group-hover:shadow-lg">
                                    Request to Join <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Mobile View All */}
                <div className="mt-4 flex justify-center md:hidden">
                    <Link
                        to="/community"
                        className="flex items-center gap-2 text-lg group text-alpine-forest dark:text-alpine-glacier font-medium"
                    >
                        Enter Community Hub <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
};
