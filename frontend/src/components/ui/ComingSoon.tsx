import React from 'react';
import { motion } from 'framer-motion';
import { Mountain, Sparkles, Compass } from 'lucide-react';

interface ComingSoonProps {
    sectionName: string;
    sectionId?: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ sectionName, sectionId }) => {
    return (
        <section id={sectionId} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-alpine-snow dark:bg-[#030508] transition-colors duration-500">
            {/* Background gradient - theme aware */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-alpine-glacier/10 dark:from-alpine-navy/40 via-alpine-snow dark:via-[#030508] to-alpine-snow dark:to-[#030508] opacity-90" />

            {/* Aurora / Northern Lights Effects behind the card */}
            <motion.div
                animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 25, ease: "linear", repeat: Infinity }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[50vw] bg-gradient-to-r from-alpine-glacier/10 via-transparent to-amber-500/5 blur-[120px] pointer-events-none"
                style={{ backgroundSize: '200% 200%' }}
            />

            {/* Subtle Snow/Star Particles */}
            {[...Array(30)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-alpine-navy/40 dark:bg-white shadow-[0_0_8px_rgba(0,0,0,0.2)] dark:shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        width: Math.random() * 2 + 1 + 'px',
                        height: Math.random() * 2 + 1 + 'px',
                    }}
                    animate={{
                        y: [-20, -100 - Math.random() * 50],
                        opacity: [0, 0.6, 0],
                        scale: [0, 1, 0]
                    }}
                    transition={{
                        duration: 5 + Math.random() * 5,
                        repeat: Infinity,
                        delay: Math.random() * 5,
                        ease: "linear"
                    }}
                />
            ))}

            <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative rounded-2xl sm:rounded-[2rem] p-6 sm:p-10 md:p-16 overflow-hidden bg-white/60 dark:bg-[#0A0D14] backdrop-blur-md border border-black/5 dark:border-white/5 shadow-xl dark:shadow-[0_20px_80px_rgba(0,0,0,0.8)]"
                >
                    {/* Inner subtle glow for depth */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/[0.01] dark:from-white/[0.02] to-transparent pointer-events-none" />

                    <div className="relative z-10 flex flex-col items-center">
                        {/* Elegant Mountain Emblem */}
                        <motion.div
                            initial={{ scale: 0, rotate: -10 }}
                            whileInView={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', damping: 15, delay: 0.2 }}
                            className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl bg-alpine-navy/5 dark:bg-black/60 border border-black/5 dark:border-white/5 shadow-inner mb-6 sm:mb-10 relative group"
                        >
                            {/* Emblem ambient glow */}
                            <motion.div 
                                className="absolute inset-0 bg-alpine-glacier/20 rounded-2xl blur-xl"
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            />
                            <Mountain size={40} className="text-alpine-navy dark:text-white drop-shadow-[0_0_15px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] relative z-10" strokeWidth={1.5} />
                        </motion.div>

                        {/* Highly Prominent "Coming Soon" Text */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6"
                        >
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }}>
                                <Compass size={20} className="sm:w-6 sm:h-6 text-amber-500 dark:text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                            </motion.div>
                            
                            <span className="text-xl sm:text-2xl md:text-4xl font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 dark:from-amber-200 dark:via-amber-400 dark:to-amber-200 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]">
                                Coming Soon
                            </span>
                            
                            <Sparkles size={20} className="sm:w-6 sm:h-6 text-amber-500 dark:text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                        </motion.div>

                        {/* Section Name */}
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="text-3xl sm:text-5xl md:text-7xl font-serif font-bold text-alpine-navy dark:text-white mb-4 sm:mb-8 tracking-tight drop-shadow-[0_10px_30px_rgba(0,0,0,0.05)] dark:drop-shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
                        >
                            {sectionName}
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="text-alpine-navy/60 dark:text-white/50 text-base sm:text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto px-2"
                        >
                            We're crafting something extraordinary. This section is currently charting a new course and will be available to explore soon.
                        </motion.p>

                        {/* Creative Expedition Divider */}
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            whileInView={{ width: '150px', opacity: 1 }}
                            transition={{ delay: 0.7, duration: 1.5, ease: "easeOut" }}
                            className="mt-10 sm:mt-16 relative h-[1px]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/20 dark:via-white/20 to-transparent" />
                            <motion.div 
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-alpine-glacier shadow-[0_0_10px_rgba(67,176,241,0.8)]"
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            />
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
