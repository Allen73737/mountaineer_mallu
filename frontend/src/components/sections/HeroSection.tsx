import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2 } from 'lucide-react';
import { peaksData, hashPeakName, defaultPool, snowyPool, nightPool } from '../../data/peaks';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../../lib/constants';

// ─── Live Wallpaper: Starfield Canvas (Ultra Premium) ──────────────────
const StarfieldCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let w = 0, h = 0;
        const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
        resize();
        window.addEventListener('resize', resize);

        // Generate layered stars — small background, medium mid, large foreground
        const stars = [
            ...Array.from({ length: 180 }, () => ({
                x: Math.random() * w, y: Math.random() * h,
                r: Math.random() * 0.8 + 0.3,
                twinkleSpeed: Math.random() * 0.02 + 0.008,
                twinkleOffset: Math.random() * Math.PI * 2,
                driftX: (Math.random() - 0.5) * 0.03,
                driftY: (Math.random() - 0.5) * 0.015,
                color: [255, 255, 255] as number[],
            })),
            ...Array.from({ length: 60 }, () => ({
                x: Math.random() * w, y: Math.random() * h,
                r: Math.random() * 1.5 + 0.8,
                twinkleSpeed: Math.random() * 0.025 + 0.01,
                twinkleOffset: Math.random() * Math.PI * 2,
                driftX: (Math.random() - 0.5) * 0.06,
                driftY: (Math.random() - 0.5) * 0.03,
                color: Math.random() > 0.5 ? [200, 220, 255] : [255, 240, 220] as number[],
            })),
            ...Array.from({ length: 25 }, () => ({
                x: Math.random() * w, y: Math.random() * h,
                r: Math.random() * 2 + 1.5,
                twinkleSpeed: Math.random() * 0.03 + 0.015,
                twinkleOffset: Math.random() * Math.PI * 2,
                driftX: (Math.random() - 0.5) * 0.08,
                driftY: (Math.random() - 0.5) * 0.04,
                color: Math.random() > 0.7 ? [180, 200, 255] : Math.random() > 0.4 ? [255, 220, 180] : [220, 200, 255] as number[],
            })),
        ];

        // Shooting stars system
        interface ShootingStar {
            x: number; y: number; len: number; speed: number;
            angle: number; opacity: number; active: boolean; life: number; maxLife: number;
            width: number; sparkles: { x: number; y: number; alpha: number; r: number }[];
        }
        const shootingStars: ShootingStar[] = [];

        const spawnShootingStar = () => {
            const startSide = Math.random();
            let sx: number, sy: number, angle: number;
            if (startSide < 0.6) {
                sx = Math.random() * w * 0.7 + w * 0.1;
                sy = Math.random() * h * 0.3;
                angle = Math.PI / 4 + (Math.random() - 0.5) * 0.4;
            } else {
                sx = Math.random() * w * 0.3;
                sy = Math.random() * h * 0.5;
                angle = Math.PI / 5 + (Math.random() - 0.5) * 0.3;
            }
            shootingStars.push({
                x: sx, y: sy,
                len: Math.random() * 140 + 80,
                speed: Math.random() * 8 + 6,
                angle,
                opacity: 1,
                active: true,
                life: 0,
                maxLife: Math.random() * 50 + 35,
                width: Math.random() * 1.5 + 1.5,
                sparkles: [],
            });
        };

        let tick = 0;
        const draw = () => {
            ctx.clearRect(0, 0, w, h);
            tick++;

            // Draw twinkling stars
            stars.forEach(s => {
                const twinkle = Math.sin(tick * s.twinkleSpeed + s.twinkleOffset) * 0.5 + 0.5;
                const alpha = 0.3 + twinkle * 0.7;
                const [cr, cg, cb] = s.color;

                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
                ctx.fill();

                // Glow halo for medium & large stars
                if (s.r > 0.8) {
                    ctx.beginPath();
                    ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha * 0.2})`;
                    ctx.fill();
                }
                if (s.r > 1.5) {
                    // Cross-shaped twinkle for big stars
                    ctx.save();
                    ctx.globalAlpha = alpha * 0.3;
                    ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, 1)`;
                    ctx.lineWidth = 0.5;
                    const spike = s.r * 6;
                    ctx.beginPath(); ctx.moveTo(s.x - spike, s.y); ctx.lineTo(s.x + spike, s.y); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(s.x, s.y - spike); ctx.lineTo(s.x, s.y + spike); ctx.stroke();
                    ctx.restore();
                }

                // Drift
                s.x += s.driftX;
                s.y += s.driftY;
                if (s.x < -5) s.x = w + 5;
                if (s.x > w + 5) s.x = -5;
                if (s.y < -5) s.y = h + 5;
                if (s.y > h + 5) s.y = -5;
            });

            // Spawn shooting stars more frequently
            if (tick % 90 === 0) spawnShootingStar();
            if (tick % 60 === 30 && Math.random() > 0.4) spawnShootingStar();
            // Initial burst
            if (tick === 30) { spawnShootingStar(); spawnShootingStar(); }

            // Draw shooting stars
            shootingStars.forEach(ss => {
                if (!ss.active) return;
                ss.life++;
                const dx = Math.cos(ss.angle) * ss.speed;
                const dy = Math.sin(ss.angle) * ss.speed;
                ss.x += dx;
                ss.y += dy;

                const progress = ss.life / ss.maxLife;
                ss.opacity = progress < 0.15 ? progress / 0.15 : Math.max(0, 1 - ((progress - 0.15) / 0.85));

                if (ss.life >= ss.maxLife || ss.x > w + 200 || ss.y > h + 200) {
                    ss.active = false;
                    return;
                }

                // Drop sparkle trail particles
                if (ss.life % 2 === 0 && ss.opacity > 0.3) {
                    ss.sparkles.push({
                        x: ss.x + (Math.random() - 0.5) * 4,
                        y: ss.y + (Math.random() - 0.5) * 4,
                        alpha: ss.opacity * 0.7,
                        r: Math.random() * 1.2 + 0.3,
                    });
                }

                // Draw sparkle trail
                ss.sparkles.forEach(sp => {
                    sp.alpha *= 0.92;
                    if (sp.alpha > 0.02) {
                        ctx.beginPath();
                        ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(200, 220, 255, ${sp.alpha})`;
                        ctx.fill();
                    }
                });
                ss.sparkles = ss.sparkles.filter(sp => sp.alpha > 0.02);

                // Main trail
                const tailX = ss.x - Math.cos(ss.angle) * ss.len;
                const tailY = ss.y - Math.sin(ss.angle) * ss.len;
                const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
                grad.addColorStop(0, `rgba(255, 255, 255, 0)`);
                grad.addColorStop(0.5, `rgba(200, 220, 255, ${ss.opacity * 0.5})`);
                grad.addColorStop(0.85, `rgba(220, 240, 255, ${ss.opacity * 0.8})`);
                grad.addColorStop(1, `rgba(255, 255, 255, ${ss.opacity})`);

                ctx.beginPath();
                ctx.moveTo(tailX, tailY);
                ctx.lineTo(ss.x, ss.y);
                ctx.strokeStyle = grad;
                ctx.lineWidth = ss.width;
                ctx.lineCap = 'round';
                ctx.stroke();

                // Bright head
                ctx.beginPath();
                ctx.arc(ss.x, ss.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${ss.opacity})`;
                ctx.fill();
                // Head bloom
                ctx.beginPath();
                ctx.arc(ss.x, ss.y, 10, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(180, 210, 255, ${ss.opacity * 0.25})`;
                ctx.fill();
            });

            // Cleanup
            for (let i = shootingStars.length - 1; i >= 0; i--) {
                if (!shootingStars[i].active && shootingStars[i].sparkles.length === 0) shootingStars.splice(i, 1);
            }

            animRef.current = requestAnimationFrame(draw);
        };

        animRef.current = requestAnimationFrame(draw);
        return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />;
};

// ─── Live Wallpaper: Light Mode Atmosphere (Birds, Clouds, Leaves) ────
const LightModeAtmosphere: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let w = 0, h = 0;
        const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
        resize();
        window.addEventListener('resize', resize);

        // ── Birds (V-shaped silhouettes flying across) ──
        interface Bird {
            x: number; y: number; speedX: number; speedY: number;
            size: number; flapPhase: number; flapSpeed: number; opacity: number;
        }
        const birds: Bird[] = Array.from({ length: 8 }, () => ({
            x: -50 - Math.random() * 200,
            y: Math.random() * h * 0.35 + h * 0.05,
            speedX: Math.random() * 1.2 + 0.5,
            speedY: Math.sin(Math.random() * Math.PI) * 0.2 - 0.1,
            size: Math.random() * 6 + 4,
            flapPhase: Math.random() * Math.PI * 2,
            flapSpeed: Math.random() * 0.08 + 0.04,
            opacity: Math.random() * 0.3 + 0.15,
        }));

        const drawBird = (b: Bird, tick: number) => {
            const flap = Math.sin(tick * b.flapSpeed + b.flapPhase);
            const wingAngle = flap * 0.5;
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.globalAlpha = b.opacity;
            ctx.strokeStyle = 'rgba(30, 30, 50, 0.7)';
            ctx.lineWidth = 1.2;
            ctx.lineCap = 'round';
            // Left wing
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(-b.size * 0.5, -b.size * wingAngle, -b.size, -b.size * wingAngle * 0.7);
            ctx.stroke();
            // Right wing
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(b.size * 0.5, -b.size * wingAngle, b.size, -b.size * wingAngle * 0.7);
            ctx.stroke();
            ctx.restore();
        };

        // ── Leaves (tumbling in the wind) ──
        interface Leaf {
            x: number; y: number; speedX: number; speedY: number;
            rotation: number; rotSpeed: number; size: number;
            color: string; opacity: number; wobble: number;
        }
        const leaves: Leaf[] = Array.from({ length: 18 }, () => {
            const colors = [
                'rgba(34, 120, 50, 0.6)',   // green
                'rgba(60, 140, 40, 0.5)',    // light green
                'rgba(180, 140, 40, 0.5)',   // golden
                'rgba(160, 80, 30, 0.4)',    // brown/autumn
            ];
            return {
                x: Math.random() * w,
                y: -20 - Math.random() * 100,
                speedX: Math.random() * 0.8 + 0.3,
                speedY: Math.random() * 0.5 + 0.2,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.04,
                size: Math.random() * 5 + 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                opacity: Math.random() * 0.5 + 0.2,
                wobble: Math.random() * Math.PI * 2,
            };
        });

        const drawLeaf = (l: Leaf) => {
            ctx.save();
            ctx.translate(l.x, l.y);
            ctx.rotate(l.rotation);
            ctx.globalAlpha = l.opacity;
            ctx.fillStyle = l.color;
            ctx.beginPath();
            // Leaf shape using bezier curves
            ctx.moveTo(0, -l.size);
            ctx.quadraticCurveTo(l.size * 0.8, -l.size * 0.3, 0, l.size);
            ctx.quadraticCurveTo(-l.size * 0.8, -l.size * 0.3, 0, -l.size);
            ctx.fill();
            // Center vein
            ctx.strokeStyle = l.color;
            ctx.lineWidth = 0.3;
            ctx.globalAlpha = l.opacity * 0.5;
            ctx.beginPath();
            ctx.moveTo(0, -l.size * 0.8);
            ctx.lineTo(0, l.size * 0.8);
            ctx.stroke();
            ctx.restore();
        };

        // ── Floating dust/pollen motes ──
        const motes = Array.from({ length: 40 }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 2 + 0.5,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: -(Math.random() * 0.15 + 0.03),
            opacity: Math.random() * 0.35 + 0.1,
            pulse: Math.random() * Math.PI * 2,
        }));

        let tick = 0;
        const draw = () => {
            ctx.clearRect(0, 0, w, h);
            tick++;

            // Draw birds
            birds.forEach(b => {
                b.x += b.speedX;
                b.y += b.speedY + Math.sin(tick * 0.01 + b.flapPhase) * 0.15;
                if (b.x > w + 60) {
                    b.x = -50 - Math.random() * 100;
                    b.y = Math.random() * h * 0.35 + h * 0.05;
                }
                drawBird(b, tick);
            });

            // Draw leaves
            leaves.forEach(l => {
                l.wobble += 0.02;
                l.x += l.speedX + Math.sin(l.wobble) * 0.6;
                l.y += l.speedY + Math.cos(l.wobble * 0.7) * 0.15;
                l.rotation += l.rotSpeed;
                if (l.y > h + 30 || l.x > w + 30) {
                    l.x = -20 + Math.random() * w * 0.3;
                    l.y = -20 - Math.random() * 60;
                }
                drawLeaf(l);
            });

            // Draw floating motes (pollen/dust in sunlight)
            motes.forEach(m => {
                m.x += m.speedX + Math.sin(m.pulse) * 0.15;
                m.y += m.speedY;
                m.pulse += 0.012;
                if (m.y < -10) { m.y = h + 10; m.x = Math.random() * w; }
                if (m.x < -10) m.x = w + 10;
                if (m.x > w + 10) m.x = -10;
                const flicker = Math.sin(m.pulse * 2) * 0.2 + 0.8;
                const a = m.opacity * flicker;
                ctx.beginPath();
                ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
                ctx.fill();
                ctx.beginPath();
                ctx.arc(m.x, m.y, m.r * 4, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.08})`;
                ctx.fill();
            });

            animRef.current = requestAnimationFrame(draw);
        };

        animRef.current = requestAnimationFrame(draw);
        return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />;
};

export const HeroSection = () => {
    const [isHovered, setIsHovered] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"]
    });

    const { theme, weather, setWeather, setWeatherLoaded } = useStore();
    const { demoLoginAsync } = useAuthStore();
    const navigate = useNavigate();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const { t } = useTranslation();

    const [isDemoLoading, setIsDemoLoading] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ 
                x: (e.clientX / window.innerWidth - 0.5) * 30, 
                y: (e.clientY / window.innerHeight - 0.5) * 30 
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleDemoLogin = async () => {
        setIsDemoLoading(true);
        try {
            const user = await demoLoginAsync();
            if (['Admin', 'SuperAdmin'].includes(user.role)) {
                navigate('/summit-control-panel');
            } else {
                navigate('/portal');
            }
        } catch (err) {
            console.error('Demo login failed:', err);
            setIsDemoLoading(false);
        }
    };

    // Parallax values — cinematic 3-layer depth
    const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
    const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 0.85]);
    const bgBorderRadius = useTransform(scrollYProgress, [0, 0.6], ['0px', '60px']);
    const textY = useTransform(scrollYProgress, [0, 1], ['0%', '180%']);
    const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
    const textScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.85]);
    const mountainForegroundY = useTransform(scrollYProgress, [0, 1], ['30%', '0%']);
    const vignetteOpacity = useTransform(scrollYProgress, [0, 0.5], [0.5, 0.8]);

    // Daily peak selection
    const peak = useMemo(() => {
        const date = new Date();
        const dateSeed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
        return peaksData[dateSeed % peaksData.length];
    }, []);

    // ─── Peak Expansion & AI Fetching ───────────────────────────────────────
    const [isPeakExpanded, setIsPeakExpanded] = useState(false);
    const [peakInfo, setPeakInfo] = useState('');
    const [isPeakLoading, setIsPeakLoading] = useState(false);
    const [displayedPeakInfo, setDisplayedPeakInfo] = useState('');
    const typewriterIndex = useRef(0);

    const handlePeakClick = async () => {
        if (!isPeakExpanded) {
            setIsPeakExpanded(true);
            if (!peakInfo && !isPeakLoading) {
                setIsPeakLoading(true);
                try {
                    const res = await fetch(`${API_URL}/api/ai/peak-info`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ name: peak.name, elevation: peak.elevation, location: peak.location, lat: peak.lat, lon: peak.lon }),
                    });
                    const data = await res.json();
                    setPeakInfo(data.info || 'Peak information unavailable at the moment.');
                } catch {
                    setPeakInfo('Unable to reach the summit guide. Please try again.');
                } finally {
                    setIsPeakLoading(false);
                }
            }
        } else {
            setIsPeakExpanded(false);
        }
    };

    useEffect(() => {
        if (!peakInfo) { setDisplayedPeakInfo(''); return; }
        typewriterIndex.current = 0;
        setDisplayedPeakInfo('');
        
        const chunkSize = 4;
        const interval = setInterval(() => {
            typewriterIndex.current = Math.min(typewriterIndex.current + chunkSize, peakInfo.length);
            setDisplayedPeakInfo(peakInfo.slice(0, typewriterIndex.current));
            if (typewriterIndex.current >= peakInfo.length) {
                clearInterval(interval);
            }
        }, 5);
        return () => clearInterval(interval);
    }, [peakInfo]);

    const formatMarkdown = (text: string): string => {
        if (!text) return '';
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#64BEFF] font-semibold">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
            .replace(/\n/g, '<br/>');
    };
    // ────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${peak.lat}&longitude=${peak.lon}&current=temperature_2m,weather_code`;
                const response = await fetch(url);
                const data = await response.json();
                const temp = data.current.temperature_2m;
                const code = data.current.weather_code;
                const isSnowing = [71, 73, 75, 77, 85, 86].includes(code);

                let conditionText = 'Clear conditions';
                if (code >= 1 && code <= 3) conditionText = 'Partly cloudy';
                else if (code >= 45 && code <= 48) conditionText = 'Foggy/low visibility';
                else if (code >= 51 && code <= 67) conditionText = 'Raining/Freezing Rain';
                else if (isSnowing) conditionText = 'Snowing';
                else if (code >= 95) conditionText = 'Thunderstorm';

                setWeather({ temp, condition: conditionText, isSnowing });
                setWeatherLoaded(true);
            } catch (error) {
                console.error("Failed to fetch alpine weather:", error);
                setWeather({ temp: null, condition: 'Offline (Last known: Clear)', isSnowing: false });
                setWeatherLoaded(true);
            }
        };
        fetchWeather();
    }, [peak]);

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

    return (
        <section ref={sectionRef} className="relative h-[150vh] w-full bg-alpine-snow dark:bg-black hero-section-cursor">
            <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">

                {/* Layer 1: Background with Ken Burns slow pan (Stable Cinematic) */}
                <motion.div
                    className="absolute inset-0 w-[110%] h-[130%] -left-[5%] -top-[15%] z-0 bg-gradient-to-b from-blue-100 to-blue-50 dark:from-[#0B0C10] dark:to-[#040911] overflow-hidden transform-gpu"
                >
                    <motion.div 
                        className="absolute inset-0 w-[110%] h-[110%] -left-[5%] -top-[5%] transform-gpu"
                        style={{
                            rotateX: mousePos.y * 0.3,
                            rotateY: -mousePos.x * 0.3,
                            transformStyle: 'preserve-3d'
                        }}
                    >
                        <motion.img
                            key={activeImage}
                            initial={{ opacity: 0, scale: 1.12 }}
                            animate={{ 
                                opacity: 1, 
                                scale: [1.05, 1.08, 1.05],
                                x: [0, 15, -10, 5, 0],
                                y: [0, -8, 5, -3, 0],
                            }}
                            transition={{ 
                                opacity: { duration: 2, ease: [0.16, 1, 0.3, 1] },
                                scale: { duration: 30, repeat: Infinity, ease: 'easeInOut' },
                                x: { duration: 25, repeat: Infinity, ease: 'easeInOut' },
                                y: { duration: 20, repeat: Infinity, ease: 'easeInOut' },
                            }}
                            src={activeImage.includes('unsplash') ? `${activeImage}&w=1920&q=80` : activeImage}
                            alt={`Majestic ${peak.name}`}
                            className="absolute inset-0 w-full h-full object-cover bg-alpine-snow/50 dark:bg-black/50"
                            loading="eager"
                            fetchPriority="high"
                        />
                    </motion.div>
                    {/* Atmospheric color wash */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30 dark:from-[#0B0C10]/30 dark:via-transparent dark:to-[#0B0C10]/50 pointer-events-none" />
                </motion.div>

                {/* Layer 1.5: Film Grain + Vignette + LIVE WALLPAPER FX */}
                <motion.div
                    style={{ opacity: vignetteOpacity }}
                    className="absolute inset-0 z-[5] pointer-events-none overflow-hidden"
                >
                    {/* Live Wallpaper Canvas Effects */}
                    <AnimatePresence>
                        {isDark ? (
                            <motion.div
                                key="dark-live"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
                                className="absolute inset-0"
                            >
                                {/* Canvas-rendered twinkling stars + shooting stars */}
                                <StarfieldCanvas />

                                {/* Breathing Aurora Nebula 1 — Purple/Violet */}
                                <motion.div
                                    animate={{ 
                                        opacity: [0.08, 0.25, 0.12, 0.3, 0.08], 
                                        scale: [1, 1.15, 1.05, 1.2, 1],
                                        x: [0, 20, -10, 15, 0],
                                        y: [0, -15, 10, -5, 0]
                                    }}
                                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute top-[-15%] right-[-10%] w-[65%] h-[65%] bg-purple-500/25 blur-[140px] rounded-full"
                                />
                                {/* Breathing Aurora Nebula 2 — Teal/Cyan  */}
                                <motion.div
                                    animate={{ 
                                        opacity: [0.05, 0.2, 0.08, 0.22, 0.05], 
                                        scale: [1, 1.2, 1.1, 1.25, 1],
                                        x: [0, -20, 10, -15, 0],
                                        y: [0, 10, -15, 5, 0]
                                    }}
                                    transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                                    className="absolute bottom-[10%] left-[-15%] w-[55%] h-[55%] bg-cyan-400/15 blur-[130px] rounded-full"
                                />
                                {/* Breathing Aurora Nebula 3 — Sunrise/Gold */}
                                <motion.div
                                    animate={{ 
                                        opacity: [0.03, 0.12, 0.05, 0.15, 0.03], 
                                        scale: [1, 1.1, 1, 1.15, 1],
                                    }}
                                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 6 }}
                                    className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-amber-500/10 blur-[120px] rounded-full"
                                />

                                {/* ★ Hero Shooting Star — positioned over the photo's static streak */}
                                {/* This sits near the upper-right area where "Ascend" 'd' is */}
                                <div className="absolute inset-0">
                                    {/* The streak itself — a thin bright line that animates across */}
                                    <motion.div
                                        className="absolute"
                                        style={{
                                            top: '22%',
                                            right: '18%',
                                            width: '220px',
                                            height: '2px',
                                            transformOrigin: 'right center',
                                            transform: 'rotate(28deg)',
                                        }}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: [0, 0, 1, 1, 0.8, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
                                    >
                                        {/* Trail gradient */}
                                        <div className="absolute inset-0 rounded-full"
                                            style={{
                                                background: 'linear-gradient(to right, transparent 0%, rgba(180,210,255,0.1) 20%, rgba(200,220,255,0.4) 60%, rgba(230,240,255,0.8) 85%, rgba(255,255,255,1) 100%)',
                                            }}
                                        />
                                        {/* Bright head glow */}
                                        <motion.div
                                            className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white"
                                            style={{ boxShadow: '0 0 12px 4px rgba(200,220,255,0.8), 0 0 30px 8px rgba(180,200,255,0.4), 0 0 60px 15px rgba(150,180,255,0.15)' }}
                                            animate={{ scale: [0.8, 1.2, 0.8] }}
                                            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                                        />
                                    </motion.div>

                                    {/* Second hero streak — slightly offset, staggered timing */}
                                    <motion.div
                                        className="absolute"
                                        style={{
                                            top: '18%',
                                            right: '28%',
                                            width: '160px',
                                            height: '1.5px',
                                            transformOrigin: 'right center',
                                            transform: 'rotate(32deg)',
                                        }}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: [0, 0, 0, 0.8, 1, 0.6, 0] }}
                                        transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 8, ease: 'easeInOut', delay: 6 }}
                                    >
                                        <div className="absolute inset-0 rounded-full"
                                            style={{
                                                background: 'linear-gradient(to right, transparent 0%, rgba(200,180,255,0.1) 30%, rgba(220,210,255,0.5) 70%, rgba(255,255,255,0.9) 100%)',
                                            }}
                                        />
                                        <motion.div
                                            className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white"
                                            style={{ boxShadow: '0 0 10px 3px rgba(220,200,255,0.7), 0 0 25px 6px rgba(200,180,255,0.3)' }}
                                            animate={{ scale: [0.7, 1.1, 0.7] }}
                                            transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
                                        />
                                    </motion.div>

                                    {/* Sparkle particles left behind by hero streak */}
                                    {[...Array(6)].map((_, i) => (
                                        <motion.div
                                            key={`hero-sparkle-${i}`}
                                            className="absolute w-1 h-1 rounded-full bg-white"
                                            style={{
                                                top: `${23 + i * 1.5}%`,
                                                right: `${20 + i * 3}%`,
                                                boxShadow: '0 0 4px 1px rgba(200,220,255,0.6)',
                                            }}
                                            animate={{ 
                                                opacity: [0, 0, 0.8, 0.4, 0],
                                                scale: [0, 1.2, 0.8, 0.3, 0],
                                            }}
                                            transition={{ 
                                                duration: 3, 
                                                repeat: Infinity, 
                                                repeatDelay: 5,
                                                delay: 0.5 + i * 0.15, 
                                                ease: 'easeOut' 
                                            }}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        ) : weather.isSnowing || (weather.temp !== null && weather.temp <= 0) ? (
                            <motion.div
                                key="snow-live"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
                                className="absolute inset-0"
                            >
                                {/* Floating snow atmosphere */}
                                <LightModeAtmosphere />
                                {/* Misty cloud drift */}
                                <motion.div
                                    animate={{ x: [-100, 100, -100], opacity: [0.1, 0.3, 0.1] }}
                                    transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute top-[10%] left-[-10%] w-[80%] h-[40%] bg-white/10 blur-[100px] rounded-full"
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="day-live"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
                                className="absolute inset-0"
                            >
                                {/* Birds, leaves, pollen — full living atmosphere */}
                                <LightModeAtmosphere />
                                {/* Slow drifting cloud wisps */}
                                <motion.div
                                    animate={{ x: [-80, 120, -80], opacity: [0.05, 0.15, 0.05] }}
                                    transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute top-[5%] left-[-20%] w-[70%] h-[30%] bg-white/20 blur-[80px] rounded-full"
                                />
                                <motion.div
                                    animate={{ x: [50, -100, 50], opacity: [0.03, 0.1, 0.03] }}
                                    transition={{ duration: 35, repeat: Infinity, ease: "easeInOut", delay: 5 }}
                                    className="absolute top-[15%] right-[-10%] w-[50%] h-[25%] bg-white/15 blur-[90px] rounded-full"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Vignette */}
                    <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)' }} />
                    
                    {/* Cinematic God Rays */}
                    <motion.div 
                        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30"
                        animate={{ opacity: [0.1, 0.4, 0.1], rotate: [25, 30, 25] }}
                        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                        style={{
                            background: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,1) 45%, transparent 50%, rgba(255,255,255,0.6) 55%, transparent 60%)',
                            transformOrigin: 'top left',
                            scale: 1.5
                        }}
                    />

                    {/* Subtle noise grain */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                        animation: 'grain 8s steps(10) infinite',
                    }} />
                </motion.div>

                {/* Interactive Dynamic Light Flare tracking cursor */}
                <motion.div 
                    className="absolute inset-0 pointer-events-none z-15 mix-blend-overlay opacity-80"
                    animate={{
                        background: `radial-gradient(circle 800px at ${(mousePos.x + 1) * 50}% ${(mousePos.y + 1) * 50}%, rgba(255,255,255,0.6), transparent 70%)`
                    }}
                    transition={{ type: 'tween', ease: 'easeOut', duration: 0.1 }}
                />

                {/* Layer 2: Massive Typography with matching Iris Transition */}
                <motion.div
                    style={{ 
                        y: textY, 
                        opacity: textOpacity, 
                        scale: textScale,
                        marginTop: '-8vh',
                        z: 50
                    }}
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none transform-gpu"
                >
                    {/* SVG Filter for Wind Distortion */}
                    <svg className="hidden">
                        <filter id="wind-distortion">
                            <feTurbulence
                                type="fractalNoise"
                                baseFrequency="0.015"
                                numOctaves="3"
                                result="noise"
                            />
                            <motion.feDisplacementMap
                                in="SourceGraphic"
                                in2="noise"
                                scale={isHovered ? 20 : 0}
                                xChannelSelector="R"
                                yChannelSelector="G"
                            />
                        </filter>
                    </svg>

                    {/* Subtitle above */}
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="text-white/40 text-[10px] md:text-xs tracking-[0.5em] uppercase font-light mb-6"
                    >
                        {t('hero.presents', 'Mountaineer Mallu Presents')}
                    </motion.p>

                    {/* Main title with refined, ultra-premium kinetic typography */}
                    <motion.div className="relative group">
                        <motion.h1
                            className="text-[14vw] sm:text-[13vw] md:text-[12vw] lg:text-[10rem] xl:text-[12rem] font-serif leading-[0.85] tracking-tight font-light pointer-events-auto cursor-default relative text-white uppercase transform-gpu"
                            style={{
                                filter: 'drop-shadow(0 4px 15px rgba(0,0,0,0.4)) drop-shadow(0 0 10px rgba(255,255,255,0.1))'
                            }}
                            initial={{ scale: 0.8, opacity: 0, filter: 'blur(30px)' }}
                            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                            transition={{ duration: 1.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {/* Dynamic shimmering mask overlay inside text */}
                            <motion.div 
                                className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent mix-blend-overlay -ml-[100%] pointer-events-none rounded-full"
                                animate={{ x: ['0%', '100%'] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                            />
                            
                            <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-b from-white via-white/80 to-white/30 font-light">
                                {t('hero.ascend', 'Ascend')}
                            </span>
                        </motion.h1>
                    </motion.div>

                    {/* Thin decorative line */}
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 1.5, delay: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="w-24 h-[1px] bg-gradient-to-r from-transparent via-white/60 to-transparent mt-8"
                    />

                    {/* Sub-subtitle */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.5, delay: 1.2 }}
                        className="text-white/30 text-[10px] md:text-xs tracking-[0.3em] uppercase font-light mt-6"
                    >
                        {t('hero.awaits', 'The European Alps Await')}
                    </motion.p>

                    {/* Explore Demo Dashboard Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.5, delay: 1.4 }}
                        className="mt-8 pointer-events-auto"
                    >
                        <button
                            onClick={handleDemoLogin}
                            disabled={isDemoLoading}
                            className="group relative px-8 py-3 rounded-full bg-white/5 border border-white/20 backdrop-blur-md overflow-hidden transition-all hover:bg-white/10 hover:border-alpine-glacier/50 flex items-center gap-3"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-alpine-glacier/0 via-alpine-glacier/20 to-alpine-glacier/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                            {isDemoLoading ? (
                                <Loader2 size={16} className="text-white animate-spin" />
                            ) : (
                                <Sparkles size={16} className="text-alpine-glacier group-hover:animate-pulse" />
                            )}
                            <span className="text-white text-sm font-medium tracking-wide uppercase">
                                Explore Demo Dashboard
                            </span>
                        </button>
                    </motion.div>
                </motion.div>

                {/* Layer 2.5: Massive Dynamic Aurora Behind Mountains */}
                <motion.div 
                    className="absolute inset-0 z-15 pointer-events-none mix-blend-screen opacity-60"
                    animate={{ 
                        background: [
                            'radial-gradient(circle at 20% 50%, rgba(67,176,241,0.15) 0%, transparent 60%)',
                            'radial-gradient(circle at 80% 50%, rgba(226,160,113,0.15) 0%, transparent 60%)',
                            'radial-gradient(circle at 50% 50%, rgba(67,176,241,0.15) 0%, transparent 60%)'
                        ]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Layer 3: Mountain Foreground (Deep Parallax Translation instead of Tilt) */}
                
                {/* Back Mountain Layer */}
                <motion.div
                    style={{ 
                        y: useTransform(scrollYProgress, [0, 1], ['50%', '-20%'])
                    }}
                    className="absolute inset-x-0 bottom-0 top-auto h-[50vh] z-20 origin-bottom pointer-events-none opacity-60 mix-blend-multiply dark:mix-blend-screen transform-gpu"
                >
                    <svg className="w-[120%] -ml-[10%] h-full text-alpine-blue/40 dark:text-black/60 fill-current" preserveAspectRatio="none" viewBox="0 0 1440 300" style={{ filter: 'blur(8px)' }}>
                        <path d="M0,300 L0,150 C300,50 500,200 800,100 C1100,0 1300,150 1440,50 L1440,300 Z" />
                    </svg>
                </motion.div>
                
                {/* Mid Mountain Layer */}
                <motion.div
                    style={{ 
                        y: useTransform(scrollYProgress, [0, 1], ['40%', '-10%'])
                    }}
                    className="absolute inset-x-0 bottom-0 top-auto h-[45vh] z-25 origin-bottom pointer-events-none opacity-80 transform-gpu"
                >
                    <svg className="w-[110%] -ml-[5%] h-full text-alpine-navy/40 dark:text-black/80 fill-current" preserveAspectRatio="none" viewBox="0 0 1440 250" style={{ filter: 'drop-shadow(0 -10px 20px rgba(0,0,0,0.4)) backdrop-blur-sm' }}>
                        <path d="M0,250 L0,120 C250,190 450,60 750,160 C1050,260 1250,80 1440,140 L1440,250 Z" />
                    </svg>
                </motion.div>

                {/* Cinematic Drifting Fog */}
                <motion.div 
                    className="absolute inset-x-0 bottom-0 h-[40vh] z-25 pointer-events-none opacity-40 overflow-visible"
                    animate={{ x: ['-5%', '5%', '-5%'] }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <div className="absolute bottom-0 w-[120%] -left-[10%] h-full bg-gradient-to-t from-white/40 via-white/10 to-transparent blur-3xl rounded-[100%]" />
                </motion.div>

                {/* Glowing Mist */}
                <motion.div 
                    className="absolute inset-x-0 bottom-0 h-[30vh] z-25 pointer-events-none bg-gradient-to-t from-white/30 to-transparent dark:from-alpine-blue/10 dark:to-transparent blur-[20px]"
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Front Mountain Layer (Smooth Glass) */}
                <motion.div
                    style={{ 
                        y: mountainForegroundY
                    }}
                    className="absolute inset-x-0 bottom-0 top-auto h-[40vh] z-30 origin-bottom pointer-events-none transform-gpu"
                >
                    <svg className="w-full h-full text-alpine-snow dark:text-black fill-current" preserveAspectRatio="none" viewBox="0 0 1440 200" style={{ filter: 'drop-shadow(0 -30px 60px rgba(0,0,0,0.5)) backdrop-blur-md' }}>
                        <path d="M0,200 L0,80 C200,150 400,30 700,120 C1000,210 1200,40 1440,90 L1440,200 Z" />
                    </svg>
                </motion.div>

                {/* Layer 4: Weather & Peak Info — Refined Glassmorphic Panel */}
                <motion.div
                    layout
                    initial={{ opacity: 0, x: -40, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    transition={{ opacity: { delay: 1.5, duration: 1.2 }, x: { delay: 1.5, duration: 1.2, type: "spring", damping: 20 }, layout: { type: "spring", damping: 25, stiffness: 200 } }}
                    style={{ opacity: textOpacity }}
                    onClick={handlePeakClick}
                    className={`absolute z-40 glass-premium p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl cursor-pointer hover:border-alpine-glacier/30 transition-colors duration-300 group/peak ${
                        isPeakExpanded 
                            ? 'bottom-[2vh] md:bottom-12 left-4 sm:left-6 md:left-16 right-4 sm:right-auto max-w-[500px] shadow-[0_10px_60px_rgba(0,0,0,0.8)] border-alpine-glacier/30' 
                            : 'bottom-28 sm:bottom-36 left-4 sm:left-6 md:left-16 max-w-[260px] sm:max-w-sm'
                    }`}
                >
                    {/* Subtle inner shimmer */}
                    <div className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden pointer-events-none">
                        <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" style={{ animation: 'shimmer 5s infinite' }} />
                    </div>

                    <motion.p layout="position" className="text-white/50 text-[9px] sm:text-[10px] tracking-[0.25em] font-medium uppercase mb-2 sm:mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-alpine-glacier/60" />
                        {t('hero.featured_peak', 'Featured Peak')}
                    </motion.p>
                    <motion.h3 layout="position" className="text-white font-serif text-lg sm:text-2xl md:text-3xl font-bold mb-0.5 sm:mb-1 tracking-wide">{peak.name}</motion.h3>
                    <motion.p layout="position" className="text-white/60 text-xs sm:text-sm mb-3 sm:mb-5 font-light">{peak.location} — {peak.elevation}</motion.p>

                    <motion.div layout="position" className="h-[1px] w-full bg-gradient-to-r from-white/20 via-white/10 to-transparent mb-3 sm:mb-5" />

                    <motion.div layout="position" className="flex items-center gap-2 sm:gap-3">
                        <div className="relative">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-alpine-glacier animate-pulse" />
                            <div className="absolute inset-0 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-alpine-glacier/50 animate-ping" />
                        </div>
                        <div>
                            <p className="text-white/40 text-[8px] sm:text-[9px] tracking-[0.2em] uppercase mb-0.5 font-medium">{t('hero.live_conditions', 'Live Conditions')}</p>
                            <p className="text-white/90 font-medium text-xs sm:text-sm">
                                {isDark ? `${t('hero.nighttime', 'Nighttime')}, ` : `${t('weather.' + weather.condition, weather.condition)}, `}
                                {weather.temp !== null ? `${weather.temp}°C` : '--'}
                            </p>
                        </div>
                    </motion.div>

                    <AnimatePresence>
                        {isPeakExpanded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 pt-4 border-t border-white/10 overflow-hidden max-h-[50vh] overflow-y-auto hide-scrollbar"
                            >
                                {isPeakLoading ? (
                                    <div className="flex items-center gap-3 text-white/50 text-xs font-medium uppercase tracking-wider">
                                        <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-alpine-glacier animate-spin" />
                                        Connecting to Summit Guide...
                                    </div>
                                ) : (
                                    <div className="text-[13px] sm:text-sm text-white/90 leading-relaxed font-normal">
                                        <div className="whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{
                                            __html: formatMarkdown(displayedPeakInfo)
                                        }} />
                                        {displayedPeakInfo !== peakInfo && peakInfo && (
                                            <span className="inline-block w-1.5 h-4 bg-[#64BEFF] ml-0.5 animate-pulse rounded-sm align-middle" />
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* AI hint on hover (hide when expanded) */}
                    {!isPeakExpanded && (
                        <motion.div layout="position" className="mt-3 sm:mt-4 opacity-0 group-hover/peak:opacity-100 transition-opacity duration-300">
                            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-alpine-glacier/60 tracking-wider uppercase font-medium">
                                <span>✨</span>
                                <span>Click to reveal peak intelligence</span>
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Layer 5: Scroll Indicator — Minimal & Premium */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 1.5 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3 pointer-events-none"
                >
                    <div className="w-5 h-9 rounded-full border border-white/20 flex justify-center pt-2 relative overflow-hidden">
                        <motion.div
                            animate={{ y: [0, 14, 0] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            className="w-1 h-2 rounded-full bg-white/60"
                        />
                    </div>
                    <span className="text-[9px] tracking-[0.4em] uppercase text-white/30 font-light">{t('hero.scroll', 'Scroll')}</span>
                </motion.div>

            </div>
        </section>
    );
};
