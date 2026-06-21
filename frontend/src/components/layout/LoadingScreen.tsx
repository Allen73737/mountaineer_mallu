import React, { useEffect, useState, useMemo } from 'react';
import { motion, animate, useMotionValue, useTransform } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { peaksData, hashPeakName, defaultPool, snowyPool, nightPool } from '../../data/peaks';

export const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
    const { weatherLoaded, weather, theme } = useStore();
    const [minTimeElapsed, setMinTimeElapsed] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [phase, setPhase] = useState<'summer' | 'winter'>('summer');

    const peak = useMemo(() => {
        const date = new Date();
        const dateSeed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
        return peaksData[dateSeed % peaksData.length];
    }, []);

    const targetElevation = parseInt(peak.elevation.replace(/[^0-9]/g, ''), 10) || 4000;
    const count = useMotionValue(0);
    const rounded = useTransform(count, Math.round);
    const displayElevation = useTransform(rounded, (latest: number) => `${latest.toLocaleString()}`);

    // Timeline
    useEffect(() => {
        const t1 = setTimeout(() => setPhase('winter'), 2500);
        const t2 = setTimeout(() => setMinTimeElapsed(true), 6500); 
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);

    // Animate altitude counter
    useEffect(() => {
        const controls = animate(count, targetElevation, { 
            duration: 5.5, 
            ease: [0.16, 1, 0.3, 1] // Custom ultra-smooth spring-like ease
        });
        return controls.stop;
    }, [count, targetElevation]);

    // Handle Exit
    useEffect(() => {
        if (minTimeElapsed && weatherLoaded) {
            setIsExiting(true);
            setTimeout(() => onComplete(), 2500); // Wait for the new awwwards shutter to finish
        }
    }, [minTimeElapsed, weatherLoaded, onComplete]);

    // Preload Logic
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const getActiveImage = () => {
        const isFreezing = weather.isSnowing || (weather.temp !== null && weather.temp <= 0);
        if (peak.images) {
            return isDark ? peak.images.night : (isFreezing ? peak.images.snowy : peak.images.default);
        } else {
            const hash = hashPeakName(peak.name);
            if (isDark) return nightPool[hash % nightPool.length];
            if (isFreezing) return snowyPool[hash % snowyPool.length];
            return defaultPool[hash % defaultPool.length];
        }
    };
    const activeImage = getActiveImage();
    const preloadUrl = activeImage.includes('unsplash') ? `${activeImage}&w=1920&q=80` : activeImage;

    return (
        <motion.div
            key="awwwards-loader-v4"
            className="fixed inset-0 z-[9999] pointer-events-none"
            initial={{ opacity: 1 }}
            animate={isExiting ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.1, delay: 2.0 }} // Drop container only after shutter fully opens
        >
            {weatherLoaded && <link rel="preload" as="image" href={preloadUrl} />}

            {/* ═══ THE AWWWARDS SHUTTER (STAGGERED BLINDS) ═══ */}
            <div className="absolute inset-0 z-0 flex">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="h-full bg-[#020202]"
                        style={{ width: '20.2%' }} // Slightly over 20% to prevent 1px hairline gaps
                        initial={{ y: '0%' }}
                        animate={isExiting ? { y: '-100%' } : { y: '0%' }}
                        transition={{ 
                            duration: 1.4, 
                            delay: i * 0.1, // Staggered wipe
                            ease: [0.76, 0, 0.24, 1] // Classic Awwwards premium ease
                        }}
                    />
                ))}
            </div>

            {/* ═══ CONTENT WRAPPER ═══ */}
            <motion.div 
                className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden z-10"
                animate={isExiting ? { opacity: 0, scale: 1.2, filter: 'blur(20px)' } : { opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }} // Zoom and blur out as the blinds go up
            >
                {/* Layer 0: Deep Ambient Aurora & Noise */}
                <div className="absolute inset-0 z-0 opacity-40">
                    <motion.div 
                        className="absolute top-[-20%] left-[-10%] w-[120vw] h-[120vh] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent blur-[120px] mix-blend-screen"
                        animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div 
                        className="absolute bottom-[-20%] right-[-10%] w-[120vw] h-[120vh] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent blur-[120px] mix-blend-screen"
                        animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.15, 1] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
                </div>

                {/* Layer 1: The Masterpiece Logo Reveal */}
                <div className="relative z-10 flex flex-col items-center">
                    
                    {/* Orbital HUD Rings */}
                    <motion.div 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[800px] md:h-[800px] flex items-center justify-center opacity-60 z-[-1] pointer-events-none"
                        initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                        animate={isExiting ? { scale: 1.5, opacity: 0, rotate: 90 } : { scale: 1, opacity: 1, rotate: 0 }}
                        transition={{ duration: 4, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <motion.div 
                            className="absolute w-[300px] h-[300px] md:w-[450px] md:h-[450px] border border-white/5 rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.div 
                            className="absolute w-[320px] h-[320px] md:w-[480px] md:h-[480px] border-t border-b border-white/10 rounded-full"
                            animate={{ rotate: -360 }}
                            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                        />
                        
                        {/* Laser Scanner Line */}
                        <motion.div 
                            className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"
                            initial={{ y: -250, opacity: 0 }}
                            animate={{ y: [ -250, 250, -250 ], opacity: [0, 1, 0] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        />
                    </motion.div>

                    {/* 3D Image Logo Mask Reveal */}
                    <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center mb-8">
                        <motion.div 
                            className="absolute inset-0 bg-blue-500/10 rounded-full blur-[80px]"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        />

                        <motion.div
                            className="relative w-full h-full"
                            initial={{ clipPath: 'circle(0% at 50% 50%)', scale: 0.8 }}
                            animate={isExiting
                                ? { clipPath: 'circle(0% at 50% 50%)', scale: 1.2, opacity: 0 }
                                : { clipPath: 'circle(100% at 50% 50%)', scale: 1, opacity: 1 }
                            }
                            transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {/* Summer Logo */}
                            <motion.img
                                src="/logos/summer-logo.png"
                                alt="Summer Logo"
                                className="absolute w-full h-full object-contain"
                                initial={{ filter: 'grayscale(100%) contrast(1.5)', opacity: 0 }}
                                animate={{ 
                                    filter: phase === 'winter' ? 'grayscale(100%) contrast(1.5) blur(10px)' : 'grayscale(0%) contrast(1) drop-shadow(0 20px 40px rgba(255,255,255,0.1)) blur(0px)',
                                    opacity: phase === 'winter' ? 0 : 1,
                                }}
                                transition={{ duration: 2 }}
                            />

                            {/* Winter Logo */}
                            <motion.img
                                src="/logos/winter-logo.png"
                                alt="Winter Logo"
                                className="absolute w-full h-full object-contain drop-shadow-[0_0_60px_rgba(163,201,226,0.6)]"
                                initial={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                                animate={phase === 'winter' 
                                    ? { opacity: 1, scale: 1, filter: 'blur(0px)' } 
                                    : { opacity: 0, scale: 1.1, filter: 'blur(10px)' }
                                }
                                transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                            />
                        </motion.div>
                    </div>

                    {/* Text Logo with Premium Slide-up Clip */}
                    <div className="relative overflow-hidden pt-2 pb-6 px-4">
                        <motion.div
                            initial={{ y: '100%', opacity: 0 }}
                            animate={isExiting ? { y: '-100%', opacity: 0 } : { y: '0%', opacity: 1 }}
                            transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div 
                                className="h-16 md:h-24 w-[400px] md:w-[600px] bg-white drop-shadow-[0_10px_30px_rgba(255,255,255,0.2)]"
                                style={{
                                    WebkitMaskImage: 'url(/logos/text-logo.png)',
                                    WebkitMaskSize: 'contain',
                                    WebkitMaskRepeat: 'no-repeat',
                                    WebkitMaskPosition: 'center',
                                    maskImage: 'url(/logos/text-logo.png)',
                                    maskSize: 'contain',
                                    maskRepeat: 'no-repeat',
                                    maskPosition: 'center'
                                }}
                            />
                        </motion.div>
                    </div>
                </div>

                {/* Layer 3: Cinematic Typography Altitude Counter */}
                <div className="absolute bottom-12 md:bottom-20 right-8 md:right-16 z-20 flex flex-col items-end border-r-2 border-white/20 pr-6">
                    <div className="overflow-hidden mb-2">
                        <motion.div 
                            className="flex items-center gap-3"
                            initial={{ y: '100%' }}
                            animate={isExiting ? { y: '-100%' } : { y: 0 }}
                            transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                            <p className="text-xs md:text-sm font-mono tracking-[0.5em] text-white/60 uppercase">
                                {peak.name} TARGET
                            </p>
                        </motion.div>
                    </div>

                    <div className="overflow-hidden">
                        <motion.div 
                            className="flex items-baseline tracking-tighter text-white relative"
                            initial={{ y: '100%' }}
                            animate={isExiting ? { y: '-100%' } : { y: 0 }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 1.2 }}
                        >
                            <motion.h1 
                                className="text-[60px] sm:text-[90px] md:text-[120px] font-thin leading-[0.8] drop-shadow-[0_0_40px_rgba(255,255,255,0.2)]" 
                                style={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                                {displayElevation}
                            </motion.h1>
                            <span className="text-2xl sm:text-3xl md:text-5xl font-light ml-2 text-white/40">M</span>
                        </motion.div>
                    </div>
                    
                    {/* Minimalist Progress Line */}
                    <motion.div 
                        className="absolute -right-[2px] top-0 w-[2px] bg-white"
                        initial={{ height: '0%' }}
                        animate={isExiting ? { height: '0%', opacity: 0 } : { height: '100%', opacity: 1 }}
                        transition={{ duration: 5.5, ease: [0.16, 1, 0.3, 1] }}
                        style={{ scaleY: useTransform(count, (v) => v / targetElevation), transformOrigin: 'bottom' }}
                    />
                </div>
            </motion.div>
        </motion.div>
    );
};
