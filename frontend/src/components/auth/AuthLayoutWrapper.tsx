import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { BackButton } from '../ui/BackButton';
import { useStore } from '../../store/useStore';
import { peaksData } from '../../data/peaks';
import { Mountain, Compass, Wind, ShieldCheck, Sparkles, CloudSnow, Sun, Users, Award } from 'lucide-react';

interface AuthLayoutWrapperProps {
    children: React.ReactNode;
}

export const AuthLayoutWrapper: React.FC<AuthLayoutWrapperProps> = ({ children }) => {
    const { weather } = useStore();
    const [featuredPeakIndex, setFeaturedPeakIndex] = useState(0);

    // Dynamic featured peak rotation every 8 seconds for visual dynamism
    useEffect(() => {
        const interval = setInterval(() => {
            setFeaturedPeakIndex(prev => (prev + 1) % peaksData.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    const peak = peaksData[featuredPeakIndex] || peaksData[0];

    // Mouse positions for 3D Perspective Glass Tilt & Reactive Spotlight
    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);

    const smoothMouseX = useSpring(mouseX, { stiffness: 120, damping: 20 });
    const smoothMouseY = useSpring(mouseY, { stiffness: 120, damping: 20 });

    const rotateX = useTransform(smoothMouseY, [0, 1], [6, -6]);
    const rotateY = useTransform(smoothMouseX, [0, 1], [-6, 6]);
    const spotlightX = useTransform(smoothMouseX, [0, 1], ['0%', '100%']);
    const spotlightY = useTransform(smoothMouseY, [0, 1], ['0%', '100%']);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        mouseX.set(x);
        mouseY.set(y);
    };

    const handleMouseLeave = () => {
        mouseX.set(0.5);
        mouseY.set(0.5);
    };

    return (
        <div 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#070D18] text-white selection:bg-alpine-glacier/30 selection:text-white py-10 px-4 md:px-8"
        >
            {/* Ambient Aurora Gradient Rifts */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <motion.div 
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 45, 0],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-[#38BDF8]/20 via-[#818CF8]/15 to-transparent blur-[120px] transform-gpu"
                />
                <motion.div 
                    animate={{
                        scale: [1.1, 0.9, 1.1],
                        rotate: [0, -35, 0],
                        opacity: [0.25, 0.45, 0.25]
                    }}
                    transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -bottom-[20%] -right-[10%] w-[65vw] h-[65vw] rounded-full bg-gradient-to-bl from-[#E2A071]/20 via-[#C9A96E]/15 to-transparent blur-[130px] transform-gpu"
                />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#070D18_85%)]" />
            </div>

            {/* Top Navigation */}
            <div className="absolute top-6 left-6 md:top-8 md:left-8 z-50">
                <BackButton />
            </div>

            {/* Split Screen Container (Showcase + Auth Card) */}
            <div className="w-full max-w-6xl z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Left Showcase Pane (Desktop & Tablet) */}
                <motion.div 
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-8 pr-4"
                >
                    {/* Live Alpine Weather Badge */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg">
                            {weather.isSnowing ? (
                                <CloudSnow size={16} className="text-alpine-glacier animate-pulse" />
                            ) : (
                                <Sun size={16} className="text-amber-400 animate-spin-slow" />
                            )}
                            <span className="text-xs font-mono tracking-wide text-white/80">
                                {weather.temp !== null ? `${weather.temp.toFixed(1)}°C` : 'Alpine Status'} • {weather.condition}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xl text-emerald-300 text-xs font-medium">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            Live Summit Node
                        </div>
                    </div>

                    {/* Headline */}
                    <div className="space-y-4">
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-4xl xl:text-5xl font-black font-serif tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-alpine-glacier leading-[1.15]"
                        >
                            Conquer High Peaks & Uncharted Trails
                        </motion.h2>
                        <p className="text-base text-white/60 leading-relaxed font-sans max-w-lg">
                            Access real-time summit analytics, high-altitude weather intelligence, exclusive expedition logs, and Kerala's premier mountaineering community.
                        </p>
                    </div>

                    {/* Interactive Featured Mountain Peak Card */}
                    <motion.div 
                        key={peak.name}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="relative rounded-2xl p-6 bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/15 backdrop-blur-2xl shadow-2xl overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Mountain size={120} />
                        </div>
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <span className="text-[10px] font-mono tracking-widest text-alpine-glacier uppercase">Featured Expedition Peak</span>
                                <h3 className="text-xl font-bold font-serif text-white">{peak.name}</h3>
                                <p className="text-xs text-white/50">{peak.location}</p>
                            </div>
                            <span className="px-3 py-1 rounded-lg bg-alpine-glacier/20 border border-alpine-glacier/30 text-alpine-glacier text-xs font-mono font-bold">
                                {peak.elevation}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-xs">
                            <div className="flex items-center gap-1.5 text-white/70">
                                <Compass size={14} className="text-alpine-glacier" />
                                <span>High Alpine</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-white/70">
                                <Wind size={14} className="text-alpine-glacier" />
                                <span>{peak.lat.toFixed(2)}°N, {peak.lon.toFixed(2)}°E</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-white/70">
                                <ShieldCheck size={14} className="text-alpine-glacier" />
                                <span>GPS Synced</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Social Proof Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-alpine-glacier">
                                <Users size={18} />
                            </div>
                            <div>
                                <div className="text-lg font-bold text-white font-mono">12.5k+</div>
                                <div className="text-[11px] text-white/40">Explorers</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-amber-400">
                                <Award size={18} />
                            </div>
                            <div>
                                <div className="text-lg font-bold text-white font-mono">148</div>
                                <div className="text-[11px] text-white/40">Summits Logged</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-emerald-400">
                                <Sparkles size={18} />
                            </div>
                            <div>
                                <div className="text-lg font-bold text-white font-mono">99.9%</div>
                                <div className="text-[11px] text-white/40">Telemetry Uptime</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Pane: 3D Tilt Glass Auth Card */}
                <div className="col-span-1 lg:col-span-6 flex justify-center">
                    <motion.div
                        style={{
                            rotateX,
                            rotateY,
                            transformStyle: 'preserve-3d',
                            perspective: 1000,
                        }}
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full max-w-md relative rounded-3xl bg-gradient-to-b from-white/12 via-white/6 to-white/2 border border-white/20 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-3xl overflow-hidden group"
                    >
                        {/* Mouse Reactive Spotlight Glow Layer */}
                        <motion.div 
                            className="absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                            style={{
                                background: `radial-gradient(600px circle at ${spotlightX} ${spotlightY}, rgba(163,201,226,0.18), transparent 40%)`
                            }}
                        />

                        {/* Liquid Shimmer Sweep */}
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_4s_infinite] bg-gradient-to-r from-transparent via-white/8 to-transparent skew-x-[-20deg] pointer-events-none" />

                        {/* Card Content */}
                        <div className="relative z-10">
                            {children}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
