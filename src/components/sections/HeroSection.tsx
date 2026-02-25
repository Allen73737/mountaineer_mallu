import React, { useRef, useMemo, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { peaksData, hashPeakName, defaultPool, snowyPool, nightPool } from '../../data/peaks';

export const HeroSection = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"]
    });

    const { theme, weather, setWeather, setWeatherLoaded } = useStore();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Parallax values
    const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
    const textY = useTransform(scrollYProgress, [0, 1], ['0%', '150%']); // Text moves down relative to scroll
    const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const personY = useTransform(scrollYProgress, [0, 1], ['0%', '-50%']); // Person moves up (unused now)
    const personScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
    const mountainForegroundY = useTransform(scrollYProgress, [0, 1], ['30%', '0%']);

    // Daily Selection
    const peak = useMemo(() => {
        const date = new Date();
        const dateSeed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
        return peaksData[dateSeed % peaksData.length];
    }, []);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                // Fetch real-time weather from Open-Meteo
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${peak.lat}&longitude=${peak.lon}&current=temperature_2m,weather_code`;
                const response = await fetch(url);
                const data = await response.json();

                const temp = data.current.temperature_2m;
                const code = data.current.weather_code;

                // WMO Weather interpretation codes
                // Snow codes: 71, 73, 75 (Snow fall), 77 (Snow grains), 85, 86 (Snow showers)
                const isSnowing = [71, 73, 75, 77, 85, 86].includes(code);

                let conditionText = 'Clear conditions';
                if (code >= 1 && code <= 3) conditionText = 'Partly cloudy';
                else if (code >= 45 && code <= 48) conditionText = 'Foggy/low visibility';
                else if (code >= 51 && code <= 67) conditionText = 'Raining/Freezing Rain';
                else if (isSnowing) conditionText = 'Snowing';
                else if (code >= 95) conditionText = 'Thunderstorm';

                setWeather({
                    temp: temp,
                    condition: conditionText,
                    isSnowing
                });
                setWeatherLoaded(true);
            } catch (error) {
                console.error("Failed to fetch alpine weather:", error);
                setWeather({
                    temp: null,
                    condition: 'Offline (Last known: Clear)',
                    isSnowing: false
                });
                setWeatherLoaded(true);
            }
        };

        fetchWeather();
    }, [peak]);

    // Determine which image to show dynamically
    const getActiveImage = () => {
        const isFreezing = weather.isSnowing || (weather.temp !== null && weather.temp <= 0);
        if (peak.images) {
            // Peak has custom hardcoded images
            return isDark ? peak.images.night : (isFreezing ? peak.images.snowy : peak.images.default);
        } else {
            // Peak doesn't have custom images, pick deterministically from the curated pools
            const hash = hashPeakName(peak.name);
            if (isDark) return nightPool[hash % nightPool.length];
            if (isFreezing) return snowyPool[hash % snowyPool.length];
            return defaultPool[hash % defaultPool.length];
        }
    };

    const activeImage = getActiveImage();

    return (
        <section ref={sectionRef} className="relative h-[150vh] w-full bg-alpine-snow dark:bg-[#0B0C10]">
            <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">

                {/* Layer 1: Background Mountain & Sky Image */}
                <motion.div
                    style={{ y: bgY }}
                    className="absolute inset-0 w-full h-[120%] -top-[10%] z-0 bg-gradient-to-b from-blue-100 to-blue-50 dark:from-[#0B0C10] dark:to-[#040911]"
                >
                    <motion.img
                        key={activeImage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.5 }}
                        src={activeImage}
                        alt={`Majestic ${peak.name}`}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Atmospheric overlay to blend text and background better */}
                    <div className="absolute inset-0 bg-white/10 dark:bg-[#0B0C10]/20 pointer-events-none" />
                </motion.div>

                {/* Layer 2: Massive Typography (Ascend) */}
                <motion.div
                    style={{ y: textY, opacity: textOpacity }}
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none mt-[-10vh]"
                >
                    <h1 className="text-[12vw] md:text-[15vw] font-serif leading-none tracking-tighter text-white drop-shadow-2xl">
                        Ascend
                    </h1>
                </motion.div>

                {/* Layer 3: Mountain Foreground Overlay (Replaces Cave and Person) */}
                <motion.div
                    style={{ y: mountainForegroundY }}
                    className="absolute inset-x-0 bottom-0 top-auto h-[40vh] z-30 origin-bottom pointer-events-none"
                >
                    {/* A realistic, jagged mountain range cutout covering the bottom, transitioning perfectly into MissionVision */}
                    <svg className="w-full h-full text-alpine-snow dark:text-[#0B0C10] fill-current drop-shadow-[0_-20px_50px_rgba(0,0,0,0.6)]" preserveAspectRatio="none" viewBox="0 0 1440 200">
                        <path fillRule="evenodd" clipRule="evenodd" d="M0,200 L1440,200 L1440,120 L1300,60 L1200,90 L1050,40 L900,100 L750,20 L550,110 L400,50 L250,130 L100,70 L0,150 Z" />
                    </svg>
                </motion.div>

                {/* Layer 4: Weather & Peak Info UI (Premium Glassmorphic Panel) */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1, duration: 1, type: "spring" }}
                    style={{ opacity: textOpacity }}
                    className="absolute bottom-32 left-8 md:left-16 z-40 bg-white/10 dark:bg-[#0B0C10]/40 backdrop-blur-md border border-white/20 dark:border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm"
                >
                    <p className="text-white/70 text-sm tracking-[0.2em] font-medium uppercase mb-2">Featured Peak</p>
                    <h3 className="text-white font-serif text-3xl font-bold mb-1">{peak.name}</h3>
                    <p className="text-white/90 text-sm mb-4">{peak.location} | {peak.elevation}</p>

                    <div className="h-[1px] w-full bg-white/20 mb-4" />

                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-alpine-blue dark:bg-alpine-sunrise animate-pulse" />
                        <div>
                            <p className="text-white/70 text-[10px] tracking-widest uppercase mb-0.5">Live Conditions</p>
                            <p className="text-white font-medium text-sm">
                                {isDark ? `Nighttime, ` : `${weather.condition}, `}
                                {weather.temp !== null ? `${weather.temp}°C` : '--'}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Layer 5: Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 pointer-events-none"
                >
                    <div className="w-[1px] h-12 bg-alpine-navy/20 dark:bg-white/20 relative overflow-hidden">
                        <motion.div
                            animate={{ y: [0, 48] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            className="w-full h-1/2 bg-alpine-navy dark:bg-white absolute top-0"
                        />
                    </div>
                    <span className="text-[10px] tracking-[0.3em] uppercase text-alpine-navy/50 dark:text-white/50 font-medium">Scroll</span>
                </motion.div>

            </div>
        </section>
    );
};
