import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, animate, useMotionValue, useTransform } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { peaksData, hashPeakName, defaultPool, snowyPool, nightPool } from '../../data/peaks';

export const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
    const { weatherLoaded, weather, theme } = useStore();
    const [minTimeElapsed, setMinTimeElapsed] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [sparkleActive, setSparkleActive] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);

    // Interactive Mouse 3D Parallax Tilt
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useTransform(mouseY, [-300, 300], [8, -8]);
    const rotateY = useTransform(mouseX, [-300, 300], [-8, 8]);

    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const peak = useMemo(() => {
        const date = new Date();
        const dateSeed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
        return peaksData[dateSeed % peaksData.length];
    }, []);

    const targetElevation = parseInt(peak.elevation.replace(/[^0-9]/g, ''), 10) || 8848;
    const count = useMotionValue(0);
    const rounded = useTransform(count, Math.round);
    const displayElevation = useTransform(rounded, (latest: number) => `${latest.toLocaleString()}`);

    // Timeline Sequence — Optimized for fast initial LCP paint
    useEffect(() => {
        const t1 = setTimeout(() => setSparkleActive(true), 200);
        const t2 = setTimeout(() => setMinTimeElapsed(true), 600);
        // Safety Fallback: Guarantee exit after 1000ms max even if weather API is pending
        const t3 = setTimeout(() => {
            useStore.getState().setWeatherLoaded(true);
        }, 1000);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, []);

    // Animate altitude counter tick-up
    useEffect(() => {
        const controls = animate(count, targetElevation, { 
            duration: 0.5, 
            ease: [0.16, 1, 0.3, 1]
        });
        return controls.stop;
    }, [count, targetElevation]);

    const onCompleteRef = useRef(onComplete);
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    // Handle Exit
    useEffect(() => {
        if (minTimeElapsed && (weatherLoaded || true) && !isExiting) {
            setIsExiting(true);
            setTimeout(() => onCompleteRef.current(), 300);
        }
    }, [minTimeElapsed, weatherLoaded, isExiting]);

    // Mouse movement tracker for 3D tilt
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        mouseX.set(e.clientX - centerX);
        mouseY.set(e.clientY - centerY);
    };

    // Preload Logic
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

    const logoSrc = isDark ? '/logos/logo-dark.png' : '/logos/logo-light.png';

    // Theme Tokens for Maximum Visibility & Premium Aesthetic
    const themeBg = isDark ? '#030406' : '#FFFFFF';
    const shutterBg = isDark ? 'bg-[#030406]' : 'bg-[#FFFFFF]';
    const textColor = isDark ? 'text-white' : 'text-zinc-900';
    const textMaskBg = isDark ? 'bg-white drop-shadow-[0_10px_35px_rgba(255,215,0,0.5)]' : 'bg-[#18181B] drop-shadow-[0_10px_25px_rgba(0,0,0,0.12)]';
    const ringBorderColor = isDark ? 'border-amber-500/15' : 'border-amber-700/20';
    const scannerGradient = isDark 
        ? 'from-transparent via-amber-400/60 to-transparent shadow-[0_0_12px_#FFD700]' 
        : 'from-transparent via-amber-600/50 to-transparent shadow-[0_0_10px_#D97706]';
    const hudBorderColor = isDark ? 'border-amber-500/40' : 'border-amber-700/30';
    const hudLabelColor = isDark ? 'text-amber-200/80' : 'text-amber-900/80';
    const hudUnitColor = isDark ? 'text-amber-400/90' : 'text-amber-700';

    // ─── Ambient Stardust Particle Field (Canvas) ───
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        let cw = window.innerWidth;
        let ch = window.innerHeight;
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
        canvas.style.width = `${cw}px`;
        canvas.style.height = `${ch}px`;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.scale(dpr, dpr);

        const particleCount = isDark ? 65 : 40;
        const particles = Array.from({ length: particleCount }, () => ({
            x: Math.random() * cw,
            y: Math.random() * ch,
            radius: 0.6 + Math.random() * 2.0,
            vy: -0.12 - Math.random() * 0.4,
            vx: (Math.random() - 0.5) * 0.18,
            alpha: 0,
            targetAlpha: isDark ? 0.12 + Math.random() * 0.45 : 0.08 + Math.random() * 0.25,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: 0.02 + Math.random() * 0.04,
            color: isDark ? '#FFD700' : '#D97706',
        }));

        let alive = true;

        function renderFrame() {
            if (!alive) return;
            ctx!.clearRect(0, 0, cw, ch);

            if (isDark) ctx!.globalCompositeOperation = 'lighter';

            for (const p of particles) {
                p.pulse += p.pulseSpeed;
                p.x += p.vx + Math.sin(p.pulse) * 0.12;
                p.y += p.vy;

                p.alpha += (p.targetAlpha * (0.6 + 0.4 * Math.sin(p.pulse)) - p.alpha) * 0.04;

                if (p.y < -15) { p.y = ch + 15; p.x = Math.random() * cw; }
                if (p.x < -15) p.x = cw + 15;
                if (p.x > cw + 15) p.x = -15;

                ctx!.beginPath();
                ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx!.fillStyle = p.color;
                ctx!.globalAlpha = p.alpha;
                if (isDark) {
                    ctx!.shadowColor = p.color;
                    ctx!.shadowBlur = 8;
                }
                ctx!.fill();
                ctx!.shadowBlur = 0;
            }

            ctx!.globalCompositeOperation = 'source-over';
            ctx!.globalAlpha = 1;

            animRef.current = requestAnimationFrame(renderFrame);
        }

        renderFrame();

        const handleResize = () => {
            cw = window.innerWidth;
            ch = window.innerHeight;
            canvas.width = cw * dpr;
            canvas.height = ch * dpr;
            canvas.style.width = `${cw}px`;
            canvas.style.height = `${ch}px`;
            const newCtx = canvas.getContext('2d');
            if (newCtx) newCtx.scale(dpr, dpr);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            alive = false;
            cancelAnimationFrame(animRef.current);
            window.removeEventListener('resize', handleResize);
        };
    }, [isDark]);

    return (
        <motion.div
            key="awwwards-loader-v8"
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="fixed inset-0 z-[9999] pointer-events-auto select-none overflow-hidden"
            style={{ backgroundColor: themeBg }}
            initial={{ opacity: 1 }}
            animate={isExiting ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.1, delay: 1.4 }}
        >
            {weatherLoaded && <link rel="preload" as="image" href={preloadUrl} />}

            {/* ═══ THE AWWWARDS STAGGERED SHUTTER BLINDS (THEME ADAPTIVE) ═══ */}
            <div className="absolute inset-0 z-0 flex pointer-events-none">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className={`h-full ${shutterBg}`}
                        style={{ width: '20.2%' }}
                        initial={{ y: '0%' }}
                        animate={isExiting ? { y: '-105%' } : { y: '0%' }}
                        transition={{ 
                            duration: 1.2, 
                            delay: i * 0.08,
                            ease: [0.76, 0, 0.24, 1]
                        }}
                    />
                ))}
            </div>

            {/* Ambient Canvas Stardust */}
            <canvas ref={canvasRef} className="absolute inset-0 z-10 pointer-events-none" />

            {/* ═══ MAIN CONTENT WRAPPER ═══ */}
            <motion.div 
                className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden z-20 pointer-events-none"
                animate={isExiting ? { opacity: 0, scale: 1.15, filter: 'blur(20px)' } : { opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
            >
                {/* Layer 0: Volumetric Ambient Backlight */}
                <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
                    <motion.div 
                        className={`absolute top-[-20%] left-[-10%] w-[120vw] h-[120vh] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${isDark ? 'from-amber-500/18 via-amber-900/8' : 'from-amber-400/20 via-amber-200/10'} to-transparent blur-[130px] mix-blend-screen`}
                        animate={{ scale: [1, 1.15, 1], rotate: [0, 5, 0] }}
                        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div 
                        className={`absolute bottom-[-20%] right-[-10%] w-[120vw] h-[120vh] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${isDark ? 'from-yellow-500/12' : 'from-amber-500/15'} via-transparent to-transparent blur-[130px] mix-blend-screen`}
                        animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>

                {/* Layer 1: Astrolabe Rings & Scanner Line */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                    <motion.div 
                        className="relative flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <motion.div 
                            className={`absolute w-[340px] h-[340px] md:w-[520px] md:h-[520px] border ${ringBorderColor} rounded-full`}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.div 
                            className={`absolute w-[370px] h-[370px] md:w-[560px] md:h-[560px] border-t border-b ${ringBorderColor} rounded-full`}
                            animate={{ rotate: -360 }}
                            transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                        />
                        
                        {/* Laser Scanner Line */}
                        <motion.div 
                            className={`absolute w-[420px] md:w-[640px] h-[1.5px] bg-gradient-to-r ${scannerGradient}`}
                            initial={{ y: -230, opacity: 0 }}
                            animate={{ y: [ -230, 230, -230 ], opacity: [0, 0.8, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </motion.div>
                </div>

                {/* ═══ LAYER 2: INTERACTIVE 3D PARALLAX BRAND LOGO DISPLAY ═══ */}
                <div className="relative z-20 flex flex-col items-center justify-center">

                    {/* Interactive 3D Tilt Container */}
                    <motion.div 
                        className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[440px] md:h-[440px] flex items-center justify-center mb-4 perspective-1000"
                        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
                    >
                        {/* Deep Radial Glow Backing */}
                        <motion.div 
                            className={`absolute inset-0 ${isDark ? 'bg-amber-500/25' : 'bg-amber-500/18'} rounded-full blur-[90px]`}
                            animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.7, 0.4] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        />

                        {/* Circular Mask Scale-in Reveal */}
                        <motion.div
                            className="relative w-full h-full flex items-center justify-center overflow-visible"
                            initial={{ clipPath: 'circle(0% at 50% 50%)', scale: 0.85 }}
                            animate={isExiting
                                ? { clipPath: 'circle(0% at 50% 50%)', scale: 1.15, opacity: 0 }
                                : { clipPath: 'circle(120% at 50% 50%)', scale: 1, opacity: 1 }
                            }
                            transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {/* Gentle Levitation Breathing */}
                            <motion.div
                                className="relative w-full h-full flex items-center justify-center"
                                animate={{ y: [-4, 4, -4] }}
                                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                {/* THE MODE-ADAPTIVE OFFICIAL BRAND LOGO IMAGE */}
                                <motion.img
                                    src={logoSrc}
                                    alt="Mountaineer Mallu Brand Logo"
                                    className="w-full h-full object-contain select-none"
                                    style={{
                                        filter: isDark
                                            ? 'drop-shadow(0 0 40px rgba(255,215,0,0.55)) drop-shadow(0 18px 45px rgba(0,0,0,0.85))'
                                            : 'drop-shadow(0 0 25px rgba(217,119,6,0.35)) drop-shadow(0 12px 30px rgba(0,0,0,0.12))',
                                    }}
                                    initial={{ filter: 'brightness(0.2) blur(12px)', opacity: 0 }}
                                    animate={{ filter: 'brightness(1) blur(0px)', opacity: 1 }}
                                    transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
                                />

                                {/* Diamond Peak Sparkle Flash at Summit */}
                                {sparkleActive && (
                                    <motion.div
                                        className={`absolute top-[22%] left-[30%] w-4 h-4 rounded-full ${isDark ? 'bg-white shadow-[0_0_20px_#FFFFFF,0_0_35px_#FFD700]' : 'bg-amber-500 shadow-[0_0_18px_#D97706]'} pointer-events-none z-30`}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: [0, 1.8, 0], opacity: [0, 1, 0] }}
                                        transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
                                    />
                                )}
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* Text Logo Mask Reveal (Mode Adaptive Typography) */}
                    <div className="relative overflow-hidden pt-2 pb-4 px-4">
                        <motion.div
                            initial={{ y: '100%', opacity: 0 }}
                            animate={isExiting ? { y: '-100%', opacity: 0 } : { y: '0%', opacity: 1 }}
                            transition={{ duration: 1.3, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div 
                                className={`h-14 sm:h-18 md:h-22 w-[320px] sm:w-[450px] md:w-[580px] ${textMaskBg}`}
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
                <div className={`absolute bottom-10 sm:bottom-14 md:bottom-20 right-6 sm:right-10 md:right-16 z-20 flex flex-col items-end border-r-2 ${hudBorderColor} pr-5 sm:pr-6`}>
                    <div className="overflow-hidden mb-1 sm:mb-2">
                        <motion.div 
                            className="flex items-center gap-2 sm:gap-3"
                            initial={{ y: '100%' }}
                            animate={isExiting ? { y: '-100%' } : { y: 0 }}
                            transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <span className={`w-2.5 h-2.5 rounded-full ${isDark ? 'bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,1)]' : 'bg-amber-600 shadow-[0_0_10px_rgba(217,119,6,0.8)]'} animate-pulse`} />
                            <p className={`text-[10px] sm:text-xs md:text-sm font-mono tracking-[0.48em] ${hudLabelColor} uppercase font-semibold`}>
                                {peak.name} TARGET
                            </p>
                        </motion.div>
                    </div>

                    <div className="overflow-hidden">
                        <motion.div 
                            className={`flex items-baseline tracking-tighter ${textColor} relative`}
                            initial={{ y: '100%' }}
                            animate={isExiting ? { y: '-100%' } : { y: 0 }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.9 }}
                        >
                            <motion.h1 
                                className="text-[52px] sm:text-[80px] md:text-[115px] font-thin leading-[0.85] font-mono drop-shadow-[0_0_30px_rgba(217,119,6,0.2)]" 
                                style={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                                {displayElevation}
                            </motion.h1>
                            <span className={`text-xl sm:text-3xl md:text-4xl font-light ml-2 ${hudUnitColor} font-mono`}>M</span>
                        </motion.div>
                    </div>
                    
                    {/* Minimalist Progress Line */}
                    <motion.div 
                        className="absolute -right-[2px] top-0 w-[2px] bg-amber-500 shadow-[0_0_10px_#D97706]"
                        initial={{ height: '0%' }}
                        animate={isExiting ? { height: '0%', opacity: 0 } : { height: '100%', opacity: 1 }}
                        transition={{ duration: 4, ease: [0.16, 1, 0.3, 1] }}
                        style={{ scaleY: useTransform(count, (v) => Math.min(v / targetElevation, 1)), transformOrigin: 'bottom' }}
                    />
                </div>
            </motion.div>
        </motion.div>
    );
};
