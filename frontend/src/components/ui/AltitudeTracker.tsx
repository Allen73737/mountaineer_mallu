import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { peaksData, hashPeakName } from '../../data/peaks';

export const AltitudeTracker = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Track scroll progress as the element enters and leaves the viewport
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"] // Triggers while the middle of the screen passes over it
    });

    // Smooth out the scroll physics
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    // Get daily peak
    const todayStr = new Date().toISOString().split('T')[0];
    const seed = hashPeakName(todayStr);
    const peak = peaksData[seed % peaksData.length];
    const peakElevation = parseInt(peak.elevation.replace(/,/g, '').replace('m', ''));

    // Math: Featured Peak Summit down to Basecamp (0m)
    const altitude = useTransform(smoothProgress, [0, 1], [peakElevation, 0]);
    const altitudeFormatted = useTransform(altitude, (val: number) => `${Math.floor(val).toLocaleString()} M`);

    // Position of the indicator dot on the vertical track
    const dotPosition = useTransform(smoothProgress, [0, 1], ['0%', '100%']);

    return (
        <div className="relative w-full h-0 z-50 pointer-events-none">
            <section 
                ref={containerRef} 
                className="absolute -top-[40vh] md:-top-[45vh] w-full h-[60vh] md:h-[70vh] min-h-[400px] text-[#0B0C10] dark:text-white flex flex-col items-center justify-center pointer-events-none"
            >
            {/* Ambient Background Gradient */}
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-alpine-glacier/40 via-transparent to-transparent pointer-events-none" />

            {/* The Vertical Track */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-[#0B0C10]/20 dark:bg-white/20">
                <motion.div 
                    style={{ scaleY: smoothProgress, transformOrigin: 'top' }}
                    className="w-full h-full bg-alpine-glacier shadow-[0_0_30px_rgba(67,176,241,1),_0_0_60px_rgba(67,176,241,0.8)]"
                />
                
                {/* Descending Dot */}
                <motion.div
                    style={{ top: dotPosition }}
                    className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-[#0B0C10] rounded-full border-2 border-alpine-glacier shadow-[0_0_30px_rgba(67,176,241,1)] z-10"
                />
            </div>

            {/* Left Side: Status */}
            <div className="absolute left-1/2 -translate-x-full pr-8 md:pr-16 h-full flex flex-col justify-center items-end text-right w-1/2">
                <div className="flex items-center gap-2 md:gap-3 mb-2">
                    <p className="text-[10px] md:text-xs font-bold tracking-[0.3em] text-[#0B0C10] dark:text-white uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">Descent</p>
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,1)]" />
                </div>
                <p className="text-[9px] md:text-[10px] font-medium tracking-[0.2em] md:tracking-widest text-[#0B0C10]/80 dark:text-white/80 uppercase">Approaching Basecamp</p>
            </div>

            {/* Right Side: Altitude */}
            <div className="absolute left-1/2 translate-x-0 pl-8 md:pl-16 h-full flex flex-col justify-center items-start w-1/2">
                <p className="text-[9px] md:text-[10px] font-medium tracking-[0.3em] md:tracking-[0.4em] uppercase text-[#0B0C10]/80 dark:text-white/80 mb-1 md:mb-2">Live Elevation</p>
                <div className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-black tracking-tighter text-[#0B0C10] dark:text-white tabular-nums drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_0_20px_rgba(67,176,241,0.5)]">
                    <motion.span>{altitudeFormatted}</motion.span>
                </div>
            </div>

            {/* Fading text top and bottom connecting the sections */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[9px] md:text-[10px] font-bold tracking-[0.4em] md:tracking-widest text-[#0B0C10]/30 dark:text-white/20 uppercase whitespace-nowrap">
                {peak.name} {peak.elevation.toUpperCase()}
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] md:text-[10px] font-bold tracking-[0.4em] md:tracking-widest text-[#0B0C10]/30 dark:text-white/20 uppercase whitespace-nowrap">
                Basecamp 0M
            </div>
        </section>
        </div>
    );
};
