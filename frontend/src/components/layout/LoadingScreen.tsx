import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';

/* ═══════════════════════════════════════════════════════════════
   ULTRA PREMIUM CINEMATIC LOADING SCREEN
   Features:
   - Dual Logo Morph (Summer to Winter transition)
   - Typewriter Text Reveal with Glowing Cursor
   - Enhanced Visibility & Contrast
   - 3D Astrolabe Light Rings
   - Parallax Cinematic Mountains
   ═══════════════════════════════════════════════════════════════ */

const PARTICLE_COUNT = 30;

const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2.5 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 15 + 10,
    opacity: Math.random() * 0.5 + 0.2,
}));

export const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
    const { weatherLoaded } = useStore();
    const [minTimeElapsed, setMinTimeElapsed] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [phase, setPhase] = useState<'summer' | 'winter'>('summer');

    // Timeline for the loading screen phases
    useEffect(() => {
        // Phase 1: Summer Logo (0s - 1.8s)
        // Phase 2: Morph to Winter Logo (1.8s - ...)
        const t1 = setTimeout(() => setPhase('winter'), 1800);
        
        // Minimum screen time before allowing exit
        const t2 = setTimeout(() => setMinTimeElapsed(true), 6500);
        
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);

    // Handle Exit
    useEffect(() => {
        if (minTimeElapsed && weatherLoaded) {
            setIsExiting(true);
            setTimeout(() => onComplete(), 1200);
        }
    }, [minTimeElapsed, weatherLoaded, onComplete]);

    return (
        <motion.div
            key="ultra-premium-loader"
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[#030508]"
            initial={{ opacity: 1 }}
            animate={{ opacity: isExiting ? 0 : 1 }}
            transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
        >
            {/* ═══ LAYER 1: Deep Cinematic Glows ═══ */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    className="absolute w-[80vw] h-[80vw] md:w-[60vw] md:h-[60vw] opacity-30 transform-gpu will-change-transform"
                    style={{
                        background: 'radial-gradient(circle, rgba(163,201,226,0.15) 0%, rgba(74,106,140,0.05) 50%, transparent 70%)',
                        left: '10%', top: '10%',
                    }}
                    animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 10, ease: "easeInOut", repeat: Infinity }}
                />
                <motion.div
                    className="absolute w-[70vw] h-[70vw] md:w-[50vw] md:h-[50vw] opacity-20 transform-gpu will-change-transform"
                    style={{
                        background: 'radial-gradient(circle, rgba(226,160,113,0.15) 0%, transparent 60%)',
                        right: '5%', bottom: '10%',
                    }}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 12, ease: "easeInOut", repeat: Infinity, delay: 2 }}
                />
            </div>

            {/* ═══ LAYER 2: Ethereal Particle Field ═══ */}
            <div className="absolute inset-0 pointer-events-none">
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        className="absolute rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] transform-gpu will-change-transform"
                        style={{
                            left: `${p.x}%`,
                            top: `${p.y}%`,
                            width: p.size,
                            height: p.size,
                        }}
                        initial={{ opacity: 0, y: 0, scale: 0 }}
                        animate={isExiting ? { opacity: 0, scale: 0 } : {
                            opacity: [0, p.opacity, 0],
                            y: [0, -150, -300],
                            scale: [0, 1, 0.5],
                        }}
                        transition={{
                            duration: p.duration,
                            delay: p.delay,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    />
                ))}
            </div>

            {/* ═══ LAYER 3: Intricate Astrolabe Rings (Ultra Premium UI) ═══ */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                    className="absolute w-[300px] h-[300px] md:w-[450px] md:h-[450px] rounded-full border border-white/5 transform-gpu will-change-transform"
                    style={{ borderTopColor: 'rgba(255,255,255,0.2)', borderRightColor: 'rgba(255,255,255,0.1)' }}
                    animate={isExiting ? { scale: 2, opacity: 0 } : { rotate: 360 }}
                    transition={isExiting ? { duration: 1 } : { duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className="absolute w-[350px] h-[350px] md:w-[520px] md:h-[520px] rounded-full border border-white/5 border-dashed transform-gpu will-change-transform"
                    animate={isExiting ? { scale: 2.2, opacity: 0 } : { rotate: -360 }}
                    transition={isExiting ? { duration: 1 } : { duration: 35, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className="absolute w-[450px] h-[450px] md:w-[650px] md:h-[650px] rounded-full border border-white/[0.03] transform-gpu will-change-transform"
                    style={{ borderBottomColor: 'rgba(163,201,226,0.2)' }}
                    animate={isExiting ? { scale: 2.5, opacity: 0 } : { rotate: 360 }}
                    transition={isExiting ? { duration: 1 } : { duration: 50, repeat: Infinity, ease: "linear" }}
                />
            </div>

            {/* ═══ LAYER 4: Parallax Mountains ═══ */}
            <div className="absolute inset-x-0 bottom-0 h-[45vh] pointer-events-none overflow-hidden opacity-80">
                <motion.svg viewBox="0 0 1440 400" className="absolute bottom-0 w-[130%] -ml-[15%] h-auto drop-shadow-[0_-10px_20px_rgba(0,0,0,0.5)] transform-gpu will-change-transform" preserveAspectRatio="none"
                    initial={{ y: 200, opacity: 0 }} animate={isExiting ? { y: 300, opacity: 0 } : { y: 0, opacity: 0.1 }} transition={{ duration: 4, delay: 0.5 }}>
                    <path fill="#4A6A8C" d="M0,300 L120,180 L240,260 L400,120 L520,220 L680,80 L800,200 L960,100 L1080,180 L1200,60 L1320,160 L1440,90 L1440,400 L0,400 Z"/>
                </motion.svg>
                <motion.svg viewBox="0 0 1440 350" className="absolute bottom-0 w-[115%] -ml-[7%] h-auto drop-shadow-[0_-10px_20px_rgba(0,0,0,0.8)] transform-gpu will-change-transform" preserveAspectRatio="none"
                    initial={{ y: 250, opacity: 0 }} animate={isExiting ? { y: 350, opacity: 0 } : { y: 0, opacity: 0.2 }} transition={{ duration: 5, delay: 1 }}>
                    <path fill="#1a2d42" d="M0,250 L100,200 L250,280 L380,140 L500,230 L650,100 L780,220 L900,150 L1050,250 L1180,120 L1300,200 L1440,170 L1440,350 L0,350 Z"/>
                </motion.svg>
                <motion.svg viewBox="0 0 1440 300" className="absolute bottom-0 w-full h-auto drop-shadow-[0_-20px_30px_rgba(0,0,0,1)] transform-gpu will-change-transform" preserveAspectRatio="none"
                    initial={{ y: 300, opacity: 0 }} animate={isExiting ? { y: 400, opacity: 0 } : { y: 0, opacity: 0.4 }} transition={{ duration: 6, delay: 1.5 }}>
                    <path fill="#0d1b2a" d="M0,220 L80,180 L200,250 L320,160 L440,210 L580,130 L720,200 L840,140 L980,220 L1100,160 L1200,240 L1360,180 L1440,210 L1440,300 L0,300 Z"/>
                </motion.svg>
            </div>

            {/* ═══ LAYER 5: The Masterpiece (Dual Logos & Text) ═══ */}
            <div className="relative z-20 flex flex-col items-center mt-[-10vh]">
                
                {/* Image Logos — Summer to Winter Morph */}
                <div className="relative w-56 h-56 md:w-72 md:h-72 flex items-center justify-center ml-4">
                    
                    {/* Deep Backing Glow for Maximum Visibility */}
                    <motion.div 
                        className="absolute inset-0 rounded-full bg-black/60 blur-2xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isExiting ? 0 : 1 }}
                        transition={{ duration: 2 }}
                    />
                    
                    <motion.div
                        className="relative w-full h-full flex items-center justify-center"
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={isExiting
                            ? { scale: 1.2, opacity: 0, y: -40 }
                            : { scale: 1, opacity: 1, y: 0 }
                        }
                        transition={isExiting ? { duration: 0.8 } : { duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {/* 1. Summer Logo (Base) */}
                        <motion.img
                            src="/logos/summer-logo.png"
                            alt="Summer Logo"
                            className="absolute w-full h-full object-contain drop-shadow-[0_15px_30px_rgba(226,160,113,0.3)] transform-gpu will-change-[filter,transform,opacity]"
                            initial={{ filter: 'brightness(1) blur(0px)', opacity: 1 }}
                            animate={{ 
                                filter: phase === 'winter' ? 'brightness(0.5) blur(12px)' : 'brightness(1.1) drop-shadow(0 0 20px rgba(255,255,255,0.2))',
                                opacity: phase === 'winter' ? 0 : 1,
                                scale: phase === 'winter' ? 1.05 : 1
                            }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                        />

                        {/* 2. Winter Logo (Seamless Freezing Reveal) */}
                        <motion.img
                            src="/logos/winter-logo.png"
                            alt="Winter Logo"
                            className="absolute w-full h-full object-contain drop-shadow-[0_0_40px_rgba(163,201,226,0.6)] transform-gpu will-change-[filter,transform,opacity]"
                            initial={{ filter: 'brightness(3) blur(10px)', opacity: 0, scale: 0.95 }}
                            animate={phase === 'winter' 
                                ? { filter: 'brightness(1) blur(0px)', opacity: 1, scale: 1 } 
                                : { filter: 'brightness(3) blur(10px)', opacity: 0, scale: 0.95 }
                            }
                            transition={{ duration: 2.5, ease: "easeOut" }}
                        />

                        {/* Ambient Breathing effect post-reveal */}
                        <motion.div
                            className="absolute inset-0 rounded-full pointer-events-none"
                            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)' }}
                            animate={phase === 'winter' ? { scale: [1, 1.1, 1], opacity: [0, 1, 0] } : { opacity: 0 }}
                            transition={{ duration: 3, repeat: Infinity, delay: 2 }}
                        />
                    </motion.div>
                </div>

                {/* Text Logo — Typewriter Effect */}
                <div className="relative -mt-4 md:-mt-6 flex justify-center">
                    <div className="relative inline-block px-4">
                        {/* Text Reveal Container */}
                        <motion.div
                            initial={{ clipPath: 'inset(0 100% 0 0)' }}
                            animate={isExiting
                                ? { opacity: 0, y: -20, filter: 'blur(8px)' }
                                : { clipPath: 'inset(0 0% 0 0)' }
                            }
                            transition={isExiting
                                ? { duration: 0.5 }
                                : { duration: 2, delay: 3.5, ease: "linear" }
                            }
                        >
                            {/* Filter forces the dark text image to pure white with a premium glow */}
                            <img
                                src="/logos/text-logo.png"
                                alt="Mountaineer Mallu"
                                className="h-14 md:h-20 w-auto object-contain"
                                style={{ filter: 'brightness(0) invert(1) drop-shadow(0 4px 15px rgba(255,255,255,0.4))' }}
                            />
                        </motion.div>

                        {/* Blinking Typewriter Cursor */}
                        <motion.div 
                            className="absolute top-1 bottom-1 w-[3px] bg-white rounded-full z-20 shadow-[0_0_12px_#fff,0_0_20px_rgba(163,201,226,0.8)]"
                            initial={{ left: '0%', opacity: 0 }}
                            animate={isExiting ? { opacity: 0 } : { 
                                left: ['0%', '100%'],
                                opacity: [0, 1, 0, 1, 0, 1, 1, 0] 
                            }}
                            transition={isExiting ? { duration: 0.3 } : {
                                left: { duration: 2, delay: 3.5, ease: "linear" },
                                opacity: { duration: 2.8, delay: 3.5, times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.8, 1] }
                            }}
                        />
                    </div>
                </div>

                {/* Tagline */}
                <motion.p
                    className="mt-6 text-white/40 text-[10px] md:text-xs tracking-[0.5em] uppercase font-light"
                    initial={{ opacity: 0, y: 15 }}
                    animate={isExiting ? { opacity: 0, y: -15 } : { opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, delay: 5.5, ease: "easeOut" }}
                >
                    Conquer • Share • Belong
                </motion.p>
            </div>

            {/* ═══ LAYER 6: Premium Progress Bar ═══ */}
            <motion.div
                className="absolute bottom-12 md:bottom-20 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-4 w-full max-w-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: isExiting ? 0 : 1 }}
                transition={{ delay: 2.5, duration: 1.5 }}
            >
                <div className="w-full h-[2px] bg-white/10 rounded-full relative overflow-hidden">
                    <motion.div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-alpine-navy via-white to-alpine-glacier rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                        initial={{ width: '0%' }}
                        animate={{ width: isExiting ? '100%' : '95%' }}
                        transition={{ duration: 6, ease: "circOut" }}
                    />
                </div>

                <motion.span
                    className="text-white/30 text-[9px] md:text-[10px] tracking-[0.4em] uppercase font-medium"
                    animate={isExiting ? { opacity: 0 } : { opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    Initializing Experience
                </motion.span>
            </motion.div>

            {/* ═══ LAYER 7: Exit Flash ═══ */}
            <motion.div
                className="absolute inset-0 bg-white pointer-events-none z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: isExiting ? [0, 1, 1] : 0 }}
                transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
            />
        </motion.div>
    );
};
