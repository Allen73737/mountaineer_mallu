import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const GlobalRouteMap = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Track the entire window scroll natively
    const { scrollYProgress } = useScroll();

    // Raw scroll progress for immediate 1:1 responsive drawing (no spring lag)
    const fastProgress = useTransform(scrollYProgress, [0, 0.95], [0, 1]);

    return (
        <div className="absolute top-[100vh] left-0 w-full h-[calc(100%-100vh)] pointer-events-none z-[40] overflow-hidden opacity-60 mix-blend-screen">
            <svg 
                className="absolute top-0 left-0 w-full h-full" 
                preserveAspectRatio="none"
                viewBox="0 0 100 1000"
            >
                <defs>
                    <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                    
                    {/* Light Mode Gradient: Alpine Blue */}
                    <linearGradient id="route-gradient-light" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#253D5C" />
                        <stop offset="50%" stopColor="#43B0F1" />
                        <stop offset="100%" stopColor="#1E2A3A" />
                    </linearGradient>

                    {/* Dark Mode Gradient: Neon Cyan/White Glow */}
                    <linearGradient id="route-gradient-dark" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="50%" stopColor="#64BEFF" />
                        <stop offset="100%" stopColor="#ffffff" />
                    </linearGradient>
                </defs>

                {/* The Path: Zig-Zags down the screen imitating a topographic mountain trail */}
                <motion.path
                    d="M 50 0 
                       C 80 50, 20 100, 50 150 
                       C 90 200, 10 250, 40 300 
                       C 80 350, 20 400, 60 450 
                       C 90 500, 10 550, 50 600 
                       C 80 650, 20 700, 40 750 
                       C 90 800, 10 850, 50 900 
                       C 70 950, 30 980, 50 1000"
                    fill="none"
                    strokeWidth="1"
                    stroke="url(#route-gradient-light)"
                    className="dark:hidden opacity-90 drop-shadow-[0_0_10px_rgba(67,176,241,0.8)]"
                    style={{ pathLength: fastProgress }}
                />
                
                <motion.path
                    d="M 50 0 
                       C 80 50, 20 100, 50 150 
                       C 90 200, 10 250, 40 300 
                       C 80 350, 20 400, 60 450 
                       C 90 500, 10 550, 50 600 
                       C 80 650, 20 700, 40 750 
                       C 90 800, 10 850, 50 900 
                       C 70 950, 30 980, 50 1000"
                    fill="none"
                    strokeWidth="1"
                    stroke="url(#route-gradient-dark)"
                    className="hidden dark:block opacity-90 drop-shadow-[0_0_15px_rgba(100,190,255,1)]"
                    style={{ pathLength: fastProgress }}
                />

                {/* Tracking Dot / Climber */}
                <motion.circle
                    r="3"
                    fill="#FFFFFF"
                    className="hidden dark:block shadow-[0_0_25px_#fff]"
                    filter="url(#neon-glow)"
                    style={{
                        offsetPath: `path("M 50 0 C 80 50, 20 100, 50 150 C 90 200, 10 250, 40 300 C 80 350, 20 400, 60 450 C 90 500, 10 550, 50 600 C 80 650, 20 700, 40 750 C 90 800, 10 850, 50 900 C 70 950, 30 980, 50 1000")`,
                        offsetDistance: useTransform(fastProgress, [0, 1], ["0%", "100%"]),
                    }}
                />
                
                <motion.circle
                    r="3"
                    fill="#43B0F1"
                    className="dark:hidden shadow-[0_0_25px_#43B0F1]"
                    filter="url(#neon-glow)"
                    style={{
                        offsetPath: `path("M 50 0 C 80 50, 20 100, 50 150 C 90 200, 10 250, 40 300 C 80 350, 20 400, 60 450 C 90 500, 10 550, 50 600 C 80 650, 20 700, 40 750 C 90 800, 10 850, 50 900 C 70 950, 30 980, 50 1000")`,
                        offsetDistance: useTransform(fastProgress, [0, 1], ["0%", "100%"]),
                    }}
                />
            </svg>
        </div>
    );
};
