import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';

export const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
    const { weather, weatherLoaded } = useStore();
    const [minTimeElapsed, setMinTimeElapsed] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    const isWinter = weather.isSnowing || (weather.temp !== null && weather.temp <= 0);
    // User can place their logos in the public directory
    const activeLogoSrc = isWinter ? '/logos/winter-logo.png' : '/logos/summer-logo.png';

    useEffect(() => {
        // Enforce a minimum 6.0s cinematic presence for extreme premium pacing
        const timer = setTimeout(() => {
            setMinTimeElapsed(true);
        }, 6000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Trigger the exit animation sequence
        if (minTimeElapsed && weatherLoaded) {
            setIsExiting(true);
            setTimeout(() => {
                onComplete();
            }, 1000); // Wait 1 second for the scale-out explosion effect before unmounting
        }
    }, [minTimeElapsed, weatherLoaded, onComplete]);

    return (
        <motion.div
            key="cinematic-loader"
            initial={{ opacity: 1 }}
            animate={{ opacity: isExiting ? 0 : 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white overflow-hidden"
        >
            {/* Premium Alpine Navy Base Background */}
            <div className="absolute inset-0 bg-alpine-navy dark:bg-[#0B0C10]" />

            {/* Ethereal Glow Transition Out Overlay */}
            <motion.div
                className="absolute inset-0 bg-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: isExiting ? 1 : 0 }}
                transition={{ duration: 1 }}
                style={{ zIndex: isExiting ? 50 : -1 }}
            />

            {/* Animated Sky & Glowing Auroras */}
            <motion.div
                className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen"
                animate={{ x: [0, -50, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
                <div className="absolute top-[10%] left-[20%] w-96 h-96 bg-alpine-glacier/40 rounded-full blur-[100px]" />
                <div className="absolute top-[30%] right-[10%] w-[40vw] h-[30vw] bg-alpine-blue/30 rounded-full blur-[120px]" />
            </motion.div>

            {/* Parallax Mountain Silhouettes at Bottom */}
            <div className="absolute inset-x-0 bottom-0 h-[40vh] pointer-events-none overflow-hidden">
                <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={isExiting ? { y: "100%", opacity: 0 } : { y: "0%", opacity: 0.15 }}
                    transition={{ duration: 4, ease: "easeOut", delay: 0.5 }}
                    className="absolute bottom-0 w-full"
                >
                    <svg viewBox="0 0 1440 320" className="w-full h-auto drop-shadow-2xl" preserveAspectRatio="none">
                        <path fill="#4A6A8C" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </motion.div>
                <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={isExiting ? { y: "100%", opacity: 0 } : { y: "0%", opacity: 0.25 }}
                    transition={{ duration: 5, ease: "easeOut", delay: 1 }}
                    className="absolute -bottom-10 w-full"
                >
                    <svg viewBox="0 0 1440 320" className="w-[120%] h-auto -ml-[10%] drop-shadow-2xl" preserveAspectRatio="none">
                        <path fill="#2E4259" d="M0,224L60,213.3C120,203,240,181,360,186.7C480,192,600,224,720,213.3C840,203,960,149,1080,138.7C1200,128,1320,160,1380,176L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
                    </svg>
                </motion.div>
            </div>

            {/* Impact Screen Flashes for the 5 slider pieces */}
            {[0.2, 0.6, 1.0, 1.4, 1.8].map((delay, i) => (
                <motion.div
                    key={`flash-${i}`}
                    className="absolute inset-0 bg-white pointer-events-none mix-blend-overlay z-[100]"
                    initial={{ opacity: 0 }}
                    animate={isExiting ? { opacity: 0 } : { opacity: [0, 0.4, 0] }}
                    transition={{ duration: 0.5, delay: delay, ease: "easeOut" }}
                />
            ))}

            <div className="relative flex flex-col items-center justify-center z-10 w-full max-w-lg min-h-[500px] px-8">

                {/* Expanding Pure White Aura Behind Logos (Ensures perfect visibility as requested) */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={isExiting ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160vw] md:w-[150%] aspect-square bg-white rounded-full blur-[60px] md:blur-[100px] z-0 pointer-events-none"
                />

                {/* 
                  Unified Heartbeat Wrapper
                  Waits for slide-in to finish (1.5s delay), then pulses both identically.
                */}
                <motion.div
                    className="absolute inset-0 w-full h-full flex flex-col items-center justify-center px-8 z-10"
                    animate={
                        isExiting
                            ? { scale: 1.2, opacity: 0, filter: 'blur(20px)' }
                            : { scale: [1, 1.04, 1, 1.04, 1, 1.04, 1], filter: 'blur(0px)' }
                    }
                    transition={{
                        duration: isExiting ? 1 : 4.5,
                        ease: "easeInOut",
                        delay: isExiting ? 0 : 3.5
                    }}
                >
                    {/* Text Typewriter Reveal */}
                    <div className="absolute inset-0 z-20 pointer-events-none">
                        <motion.div
                            initial={{ clipPath: 'inset(0% 100% 0% 0%)', opacity: 0 }}
                            animate={{ clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 }}
                            transition={{
                                duration: 3.2,
                                ease: "linear",
                                delay: 0.2
                            }}
                            className="absolute w-[160%] md:w-[190%]"
                            style={{ top: '-5%', left: '50%', x: '-52%' }}
                        >
                            <img
                                src="/logos/text-logo.png"
                                alt="Mountaineer Mallu Text"
                                className={`w-full h-auto object-contain transition-all duration-1000 ${isWinter ? 'brightness-90 contrast-150 drop-shadow-[0_20px_25px_rgba(0,0,0,0.5)]' : 'brightness-50 contrast-200 drop-shadow-[0_10px_20px_rgba(255,255,255,1)]'}`}
                            />
                        </motion.div>
                    </div>

                    {/* Image 5-Slice Horizontal Assembly */}
                    <div className="relative w-full aspect-square flex items-center justify-center group z-10 mt-10">
                        {/* Ethereal Breathing Aura Behind Logo */}
                        <motion.div
                            className="absolute inset-0 m-auto w-[70%] h-[70%] bg-alpine-blue/20 dark:bg-alpine-glacier/20 rounded-full blur-[30px] z-0"
                            animate={isExiting ? { opacity: 0 } : { scale: [1, 1.4, 1], opacity: [0.4, 0.8, 0.4] }}
                            transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, delay: 2.4 }}
                        />

                        {/* Assembled 5 Horizontal Slices with subtle overall levitation */}
                        <motion.div
                            className="absolute inset-0 w-full h-full z-10"
                            animate={isExiting ? {} : { y: [0, -10, 0] }}
                            transition={{ duration: 6, ease: "easeInOut", repeat: Infinity, delay: 3.1 }}
                        >
                            {/* Slice 1 (0% - 20%) FROM LEFT */}
                            <motion.img
                                src={activeLogoSrc}
                                className="absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
                                style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 20%, 0% 20%)' }}
                                initial={{ x: '-60vw', opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 1.0, type: "spring", bounce: 0.25, delay: 0.2 }}
                            />
                            {/* Slice 2 (20% - 40%) FROM RIGHT */}
                            <motion.img
                                src={activeLogoSrc}
                                className="absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
                                style={{ clipPath: 'polygon(0% 20%, 100% 20%, 100% 40%, 0% 40%)' }}
                                initial={{ x: '60vw', opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 1.0, type: "spring", bounce: 0.25, delay: 0.6 }}
                            />
                            {/* Slice 3 (40% - 60%) FROM LEFT */}
                            <motion.img
                                src={activeLogoSrc}
                                className="absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
                                style={{ clipPath: 'polygon(0% 40%, 100% 40%, 100% 60%, 0% 60%)' }}
                                initial={{ x: '-60vw', opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 1.0, type: "spring", bounce: 0.25, delay: 1.0 }}
                            />
                            {/* Slice 4 (60% - 80%) FROM RIGHT */}
                            <motion.img
                                src={activeLogoSrc}
                                className="absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
                                style={{ clipPath: 'polygon(0% 60%, 100% 60%, 100% 80%, 0% 80%)' }}
                                initial={{ x: '60vw', opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 1.0, type: "spring", bounce: 0.25, delay: 1.4 }}
                            />
                            {/* Slice 5 (80% - 100%) FROM LEFT */}
                            <motion.img
                                src={activeLogoSrc}
                                className="absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
                                style={{ clipPath: 'polygon(0% 80%, 100% 80%, 100% 100%, 0% 100%)' }}
                                initial={{ x: '-60vw', opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 1.0, type: "spring", bounce: 0.25, delay: 1.8 }}
                            />

                            {/* Final Magic Twinkle Effect (Triggers exactly when slice 5 hits at 1.8s + small padding) */}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <motion.div
                                    className="absolute w-48 h-[2px] bg-white rounded-full z-50 mix-blend-screen"
                                    initial={{ scaleX: 0, opacity: 0 }}
                                    animate={isExiting ? { opacity: 0 } : { scaleX: [0, 1.5, 0], opacity: [0, 1, 0] }}
                                    transition={{ duration: 0.8, delay: 2.1, ease: "easeOut" }}
                                />
                                <motion.div
                                    className="absolute h-48 w-[2px] bg-white rounded-full z-50 mix-blend-screen"
                                    initial={{ scaleY: 0, opacity: 0 }}
                                    animate={isExiting ? { opacity: 0 } : { scaleY: [0, 1.5, 0], opacity: [0, 1, 0] }}
                                    transition={{ duration: 0.8, delay: 2.1, ease: "easeOut" }}
                                />
                                <motion.div
                                    className="absolute w-16 h-16 bg-white rounded-full blur-[8px] z-50 mix-blend-screen"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={isExiting ? { opacity: 0 } : { scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
                                    transition={{ duration: 0.6, delay: 2.1, ease: "easeOut" }}
                                />
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Cinematic Loader Line */}
                <motion.div
                    className="absolute bottom-5 md:bottom-10 w-64 h-[2px] bg-slate-900/10 overflow-hidden rounded-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isExiting ? 0 : 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                >
                    <motion.div
                        className="absolute inset-y-0 left-0 bg-slate-800 shadow-[0_0_10px_rgba(15,23,42,0.8)]"
                        initial={{ x: '-100%' }}
                        animate={{ x: isExiting ? '100%' : '0%' }}
                        transition={{ duration: 5.0, ease: "linear" }}
                    />
                </motion.div>
            </div>

            {/* Weather Specific Particle Drifts - Adjusted for light theme */}
            <AnimatePresence>
                {!isExiting && isWinter && (
                    <motion.div
                        key="snow-particles"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dust.png')] opacity-30 animate-pulse invert"
                        style={{ backgroundSize: '150px' }}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};
