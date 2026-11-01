import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Home, BookOpen, Calendar, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { BackButton } from '../components/ui/BackButton';

export const NotFoundPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-alpine-snow dark:bg-[#030712] text-alpine-navy dark:text-alpine-snow relative flex flex-col justify-center items-center px-6 py-24 overflow-hidden film-grain">
            {/* Ambient Aurora Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-[#A3C9E2]/20 via-[#A3C9E2]/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-gradient-to-tl from-[#E2A071]/15 to-transparent rounded-full blur-2xl pointer-events-none -z-10" />

            <div className="max-w-2xl w-full mx-auto text-center relative z-10">
                {/* Elevation & Status Badges */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md text-xs font-mono tracking-widest text-[#4A6A8C] dark:text-[#A3C9E2] uppercase mb-8 shadow-sm"
                >
                    <Compass size={14} className="animate-spin text-[#E2A071]" style={{ animationDuration: '8s' }} />
                    <span>STATUS: 404 // TRAILHEAD UNCHARTED</span>
                </motion.div>

                {/* Big 404 Headline */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                >
                    <h1 className="text-8xl md:text-9xl font-serif font-normal tracking-tight text-gradient-glacier drop-shadow-sm mb-4">
                        404
                    </h1>
                </motion.div>

                {/* Description */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <h2 className="text-2xl md:text-4xl font-serif font-normal mb-4 text-alpine-navy dark:text-alpine-snow">
                        Off the Beaten Trail
                    </h2>
                    <p className="text-base md:text-lg font-light text-alpine-navy/60 dark:text-alpine-snow/60 max-w-lg mx-auto mb-10 leading-relaxed">
                        The ridgeline or altitude marker you are searching for does not exist in the European alpine archives. Let's guide you back to marked routes.
                    </p>
                </motion.div>

                {/* Primary Action */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="flex flex-wrap justify-center gap-4 mb-14"
                >
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-alpine-navy dark:bg-white text-white dark:text-alpine-navy font-medium text-sm transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/10 dark:shadow-white/10"
                    >
                        <Home size={18} />
                        <span>Return to Basecamp</span>
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-black/10 dark:border-white/15 bg-white/40 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-alpine-navy dark:text-alpine-snow font-medium text-sm transition-all hover:scale-105 active:scale-95"
                    >
                        <ArrowLeft size={16} />
                        <span>Step Back</span>
                    </button>
                </motion.div>

                {/* Expedition Quick Navigation Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="pt-8 border-t border-black/10 dark:border-white/10"
                >
                    <p className="text-xs uppercase font-mono tracking-widest text-alpine-navy/40 dark:text-white/40 mb-6">
                        Explore Verified Alpine Routes
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Link
                            to="/stories"
                            className="group p-4 rounded-2xl border border-black/5 dark:border-white/10 bg-white/30 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10 transition-all text-left flex items-center gap-3"
                        >
                            <div className="w-10 h-10 rounded-xl bg-alpine-glacier/20 flex items-center justify-center text-alpine-glacier group-hover:scale-110 transition-transform">
                                <BookOpen size={18} />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold group-hover:text-alpine-glacier transition-colors">Chronicles</h4>
                                <p className="text-xs text-alpine-navy/50 dark:text-white/40">Summit stories</p>
                            </div>
                        </Link>

                        <Link
                            to="/events"
                            className="group p-4 rounded-2xl border border-black/5 dark:border-white/10 bg-white/30 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10 transition-all text-left flex items-center gap-3"
                        >
                            <div className="w-10 h-10 rounded-xl bg-alpine-sunrise/20 flex items-center justify-center text-alpine-sunrise group-hover:scale-110 transition-transform">
                                <Calendar size={18} />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold group-hover:text-alpine-sunrise transition-colors">Expeditions</h4>
                                <p className="text-xs text-alpine-navy/50 dark:text-white/40">Upcoming hikes</p>
                            </div>
                        </Link>

                        <Link
                            to="/gallery"
                            className="group p-4 rounded-2xl border border-black/5 dark:border-white/10 bg-white/30 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10 transition-all text-left flex items-center gap-3"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#A3C9E2]/20 flex items-center justify-center text-[#A3C9E2] group-hover:scale-110 transition-transform">
                                <ImageIcon size={18} />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold group-hover:text-[#A3C9E2] transition-colors">Gallery</h4>
                                <p className="text-xs text-alpine-navy/50 dark:text-white/40">Alpine captures</p>
                            </div>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
export default NotFoundPage;
