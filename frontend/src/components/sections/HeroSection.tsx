import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowUpRight, ArrowDown } from 'lucide-react';
import { Loader2 } from '../ui/BrandLoader';
import { peaksData, hashPeakName, defaultPool, snowyPool, nightPool, getHeroImageUrl, daySlides, nightSlides } from '../../data/peaks';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../../lib/constants';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { PeakInfoSkeleton } from '../ui/Skeleton';
import { useIntro, splitGraphemes } from '../../lib/intro';
import { Magnetic } from '../ui/Magnetic';
import { loadAlpineWeather, windLabel } from '../../lib/weather';
import { AscentFilm } from '../ui/AscentFilm';

// ─── Live Wallpaper: Starfield Canvas (Ultra Premium) ──────────────────
const StarfieldCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;

        // Pre-render star sprites to eliminate 40,000+ per-second canvas arc calls!
        const createStarSprite = (size: number, cr: number, cg: number, cb: number) => {
            const off = document.createElement('canvas');
            off.width = size * 4;
            off.height = size * 4;
            const octx = off.getContext('2d');
            if (octx) {
                octx.beginPath();
                octx.arc(size * 2, size * 2, size, 0, Math.PI * 2);
                octx.fillStyle = `rgb(${cr}, ${cg}, ${cb})`;
                octx.fill();
            }
            return off;
        };

        const whiteStar = createStarSprite(2, 255, 255, 255);
        const blueStar = createStarSprite(2, 200, 220, 255);
        const goldStar = createStarSprite(2, 255, 240, 220);

        // Generate layered stars (optimized count for zero lag)
        const stars = [
            ...Array.from({ length: 80 }, () => ({
                x: Math.random() * w, y: Math.random() * h,
                r: Math.random() * 0.8 + 0.3,
                twinkleSpeed: Math.random() * 0.02 + 0.008,
                twinkleOffset: Math.random() * Math.PI * 2,
                driftX: (Math.random() - 0.5) * 0.03,
                driftY: (Math.random() - 0.5) * 0.015,
                sprite: whiteStar,
            })),
            ...Array.from({ length: 30 }, () => ({
                x: Math.random() * w, y: Math.random() * h,
                r: Math.random() * 1.5 + 0.8,
                twinkleSpeed: Math.random() * 0.025 + 0.01,
                twinkleOffset: Math.random() * Math.PI * 2,
                driftX: (Math.random() - 0.5) * 0.06,
                driftY: (Math.random() - 0.5) * 0.03,
                sprite: Math.random() > 0.5 ? blueStar : goldStar,
            })),
            ...Array.from({ length: 15 }, () => ({
                x: Math.random() * w, y: Math.random() * h,
                r: Math.random() * 2 + 1.5,
                twinkleSpeed: Math.random() * 0.03 + 0.015,
                twinkleOffset: Math.random() * Math.PI * 2,
                driftX: (Math.random() - 0.5) * 0.08,
                driftY: (Math.random() - 0.5) * 0.04,
                sprite: blueStar,
            })),
        ];

        // Fluid multi-ratio resize handler
        const resize = () => {
            const prevW = w || window.innerWidth;
            const prevH = h || window.innerHeight;
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
            if (stars.length > 0 && prevW > 0 && prevH > 0) {
                const rx = w / prevW;
                const ry = h / prevH;
                stars.forEach(s => {
                    s.x = Math.max(0, Math.min(w, s.x * rx));
                    s.y = Math.max(0, Math.min(h, s.y * ry));
                });
            }
        };
        window.addEventListener('resize', resize, { passive: true });

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
        let lastTime = 0;
        let isVisible = true;

        const draw = (time: number = 0) => {
            if (document.hidden || !isVisible) {
                animRef.current = 0;
                return;
            }
            if (time - lastTime < 20) {
                animRef.current = requestAnimationFrame(draw);
                return;
            }
            lastTime = time;

            ctx.clearRect(0, 0, w, h);
            tick++;

            // Draw twinkling stars using high-speed hardware sprites
            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];
                const twinkle = Math.sin(tick * s.twinkleSpeed + s.twinkleOffset) * 0.5 + 0.5;
                ctx.globalAlpha = 0.3 + twinkle * 0.7;
                ctx.drawImage(s.sprite, s.x - s.r * 2, s.y - s.r * 2, s.r * 4, s.r * 4);

                s.x += s.driftX;
                s.y += s.driftY;
                if (s.x < -5) s.x = w + 5;
                if (s.x > w + 5) s.x = -5;
                if (s.y < -5) s.y = h + 5;
                if (s.y > h + 5) s.y = -5;
            }

            // Spawn shooting stars more frequently
            if (tick % 90 === 0) spawnShootingStar();
            if (tick % 60 === 30 && Math.random() > 0.4) spawnShootingStar();
            if (tick === 30) { spawnShootingStar(); spawnShootingStar(); }

            // Draw shooting stars
            for (let i = 0; i < shootingStars.length; i++) {
                const ss = shootingStars[i];
                if (!ss.active) continue;
                ss.life++;
                const dx = Math.cos(ss.angle) * ss.speed;
                const dy = Math.sin(ss.angle) * ss.speed;
                ss.x += dx;
                ss.y += dy;

                const progress = ss.life / ss.maxLife;
                ss.opacity = progress < 0.15 ? progress / 0.15 : Math.max(0, 1 - ((progress - 0.15) / 0.85));

                if (ss.life >= ss.maxLife || ss.x > w + 200 || ss.y > h + 200) {
                    ss.active = false;
                    continue;
                }

                if (ss.life % 2 === 0 && ss.opacity > 0.3) {
                    ss.sparkles.push({
                        x: ss.x + (Math.random() - 0.5) * 4,
                        y: ss.y + (Math.random() - 0.5) * 4,
                        alpha: ss.opacity * 0.7,
                        r: Math.random() * 1.2 + 0.3,
                    });
                }

                for (let j = ss.sparkles.length - 1; j >= 0; j--) {
                    const sp = ss.sparkles[j];
                    sp.alpha *= 0.92;
                    if (sp.alpha > 0.02) {
                        ctx.globalAlpha = sp.alpha;
                        ctx.drawImage(blueStar, sp.x - sp.r * 2, sp.y - sp.r * 2, sp.r * 4, sp.r * 4);
                    } else {
                        ss.sparkles.splice(j, 1);
                    }
                }

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
            }

            ctx.globalAlpha = 1.0;

            // Cleanup inactive shooting stars
            for (let i = shootingStars.length - 1; i >= 0; i--) {
                if (!shootingStars[i].active && shootingStars[i].sparkles.length === 0) shootingStars.splice(i, 1);
            }

            if (!document.hidden && isVisible) {
                animRef.current = requestAnimationFrame(draw);
            } else {
                animRef.current = 0;
            }
        };

        let observer: IntersectionObserver | null = null;
        if (typeof IntersectionObserver !== 'undefined' && canvas) {
            observer = new IntersectionObserver(([entry]) => {
                isVisible = entry.isIntersecting;
                if (isVisible && !document.hidden && !animRef.current) {
                    animRef.current = requestAnimationFrame(draw);
                } else if (!isVisible && animRef.current) {
                    cancelAnimationFrame(animRef.current);
                    animRef.current = 0;
                }
            }, { threshold: 0.05 });
            observer.observe(canvas);
        }

        const handleVisibilityChange = () => {
            if (!document.hidden && isVisible && !animRef.current) {
                animRef.current = requestAnimationFrame(draw);
            } else if (document.hidden && animRef.current) {
                cancelAnimationFrame(animRef.current);
                animRef.current = 0;
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });

        animRef.current = requestAnimationFrame(draw);
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
            if (observer) observer.disconnect();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('resize', resize);
        };
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
        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;
        const resize = () => {
            const prevW = w || window.innerWidth;
            const prevH = h || window.innerHeight;
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
            if (motes.length > 0 && prevW > 0 && prevH > 0) {
                const rx = w / prevW;
                const ry = h / prevH;
                motes.forEach(m => {
                    m.x = Math.max(0, Math.min(w, m.x * rx));
                    m.y = Math.max(0, Math.min(h, m.y * ry));
                });
            }
        };
        window.addEventListener('resize', resize, { passive: true });

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
            if (!ctx) return;
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
            if (!ctx) return;
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

        let isVisible = true;
        let tick = 0;
        let lastLightTime = 0;
        const draw = (time: number = 0) => {
            if (!ctx || document.hidden || !isVisible) {
                animRef.current = 0;
                return;
            }
            if (time - lastLightTime < 24) {
                animRef.current = requestAnimationFrame(draw);
                return;
            }
            lastLightTime = time;
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

        let observer: IntersectionObserver | null = null;
        if (typeof IntersectionObserver !== 'undefined' && canvas) {
            observer = new IntersectionObserver(([entry]) => {
                isVisible = entry.isIntersecting;
                if (isVisible && !document.hidden && !animRef.current) {
                    animRef.current = requestAnimationFrame(draw);
                } else if (!isVisible && animRef.current) {
                    cancelAnimationFrame(animRef.current);
                    animRef.current = 0;
                }
            }, { threshold: 0.05 });
            observer.observe(canvas);
        }

        animRef.current = requestAnimationFrame(draw);
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
            if (observer) observer.disconnect();
            window.removeEventListener('resize', resize);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />;
};

// Skylines of the two hero plates, traced in each photo's own pixel space (1280 px wide). The ridge
// and everything below it is drawn again *over* the title, so ASCEND stands behind the mountains.
const SKYLINES: Record<string, { w: number; h: number; ridge: string }> = {
    '1464822759023-fed622ff2c3b': {
        w: 1280, h: 853,
        ridge: '0,268 40,255 70,240 100,236 125,246 150,250 180,247 205,246 230,252 260,268 300,290 340,316 380,338 420,350 460,346 500,340 540,336 580,330 620,330 660,326 700,320 740,324 780,334 810,346 840,350 870,340 900,326 940,318 980,306 1010,296 1040,290 1070,300 1110,312 1150,304 1190,288 1230,276 1260,266 1280,262',
    },
    '1519681393784-d120267933ba': {
        w: 1280, h: 854,
        ridge: '0,610 40,575 80,545 120,520 155,495 175,492 195,505 230,525 260,530 300,515 340,495 380,480 420,474 460,478 500,470 540,455 580,430 612,410 635,414 660,440 680,470 720,500 760,495 800,475 830,460 850,452 870,462 900,490 940,510 980,525 1020,535 1060,545 1090,548 1105,520 1130,515 1160,510 1190,470 1220,420 1250,385 1280,370',
    },
};
const skylineFor = (src: string) => SKYLINES[Object.keys(SKYLINES).find(id => src.includes(id)) ?? ''];

export const HeroSection = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end end"]
    });

    const { theme, weather } = useStore();
    const { demoLoginAsync, isLoggedIn } = useAuthStore();
    const navigate = useNavigate();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const { t } = useTranslation();
    const introDone = useIntro(s => s.introDone);
    const heroTitle = t('hero.ascend', 'Ascend');

    const [isDemoLoading, setIsDemoLoading] = useState(false);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { damping: 30, stiffness: 200 });
    const springY = useSpring(mouseY, { damping: 30, stiffness: 200 });

    useEffect(() => {
        // Skip on coarse pointers/touch devices to conserve battery, CPU & avoid INP latency
        if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
            return;
        }

        let rafId: number | null = null;
        const handleMouseMove = (e: MouseEvent) => {
            if (rafId !== null) return;
            rafId = requestAnimationFrame(() => {
                mouseX.set((e.clientX / window.innerWidth - 0.5) * 30);
                mouseY.set((e.clientY / window.innerHeight - 0.5) * 30);
                rafId = null;
            });
        };
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (rafId !== null) cancelAnimationFrame(rafId);
        };
    }, [mouseX, mouseY]);

    const rotateX = useTransform(springY, (y: number) => y * 0.3);
    const rotateY = useTransform(springX, (x: number) => -x * 0.3);


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

    // Clean Natural Parallax Values
    // Depth exit: the title recedes into the fog while the ridges pull apart toward the camera
    // ── Flight to the summit ──
    // The hero pins for ~3 screens of scroll. The opening shot breaks up (title sinks behind the ridge), the camera
    // climbs (the valley drops away and pushes in), cloud banks rush past, a white-out covers the cut,
    // and the camera breaks out above a sea of clouds where the final line and the call to action wait.
    const p = scrollYProgress;
    const textY = useTransform(p, [0, 0.12], ['0%', '45%']);
    const textOpacity = useTransform(p, [0, 0.09], [1, 0]);
    const textScale = useTransform(p, [0, 0.12], [1, 0.9]);
    const plateY = useTransform(p, [0, 0.62], ['0%', '30%']);
    const plateScale = useTransform(p, [0, 0.62], [1, 1.28]);
    const bankA = { y: useTransform(p, [0.12, 0.48], ['105vh', '-130vh']), scale: useTransform(p, [0.12, 0.48], [1, 1.7]), opacity: useTransform(p, [0.12, 0.2, 0.4, 0.48], [0, 1, 1, 0]) };
    const bankB = { y: useTransform(p, [0.26, 0.6], ['110vh', '-120vh']), scale: useTransform(p, [0.26, 0.6], [1.1, 1.9]), opacity: useTransform(p, [0.26, 0.34, 0.52, 0.6], [0, 1, 1, 0]) };
    const whiteout = useTransform(p, [0.5, 0.6, 0.66, 0.76], [0, 0.96, 0.96, 0]);
    const summitOpacity = useTransform(p, [0.6, 0.64], [0, 1]);
    const summitScale = useTransform(p, [0.6, 1], [1.22, 1]);
    const summitY = useTransform(p, [0.6, 1], ['10%', '0%']);
    const caption1 = useTransform(p, [0.13, 0.19, 0.28, 0.34], [0, 1, 1, 0]);
    const caption1Y = useTransform(p, [0.13, 0.34], [40, -40]);
    const caption2 = useTransform(p, [0.36, 0.42, 0.5, 0.55], [0, 1, 1, 0]);
    const caption2Y = useTransform(p, [0.36, 0.55], [40, -40]);
    const finale = useTransform(p, [0.74, 0.84], [0, 1]);
    const finaleY = useTransform(p, [0.74, 0.9], [60, 0]);
    const hudOpacity = useTransform(p, [0.06, 0.12, 0.92, 1], [0, 1, 1, 0.6]);

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

    const formatMarkdown = (text: string): string => {
        if (!text) return '';
        // Escape first: this string is rendered as HTML and comes from an AI endpoint
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#A3C9E2] font-semibold">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
            .replace(/\n/g, '<br/>');
    };
    // ────────────────────────────────────────────────────────────────────────

    useEffect(() => { loadAlpineWeather(); }, []);

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

    // Alpine local time for the meta row, refreshed every 30s
    const formatAlpineTime = () => new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Zurich', timeZoneName: 'short' }).format(new Date());
    const [alpineTime, setAlpineTime] = useState(formatAlpineTime);
    useEffect(() => {
        const id = window.setInterval(() => setAlpineTime(formatAlpineTime()), 30000);
        return () => window.clearInterval(id);
    }, []);

    const heroLetters = useMemo(() => splitGraphemes(heroTitle), [heroTitle]);
    const skyline = skylineFor(activeImage);
    // Depth: the title drifts against the plate (and the mountains in front of it) as the pointer moves
    const titleX = useTransform(springX, (x: number) => -x * 0.6);
    const titleY = useTransform(springY, (y: number) => -y * 0.4);

    // Everything in the hero waits for the intro curtain, then plays in sequence
    const EASE = [0.16, 1, 0.3, 1] as const;
    // Opening shot, once the intro curtain lifts: 3 → ASCEND rises from behind the ridge, 4 → the rest of the frame.
    // Scrolling (or reduced motion) cuts straight to the end.
    const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const [stage, setStage] = useState(0);
    useEffect(() => {
        if (!introDone) return;
        if (reduceMotion) { setStage(4); return; }
        const timers = [[3, 250], [4, 1500]].map(([st, ms]) => window.setTimeout(() => setStage(v => Math.max(v, st)), ms));
        const skip = () => setStage(4);
        window.addEventListener('wheel', skip, { passive: true, once: true });
        window.addEventListener('touchmove', skip, { passive: true, once: true });
        window.addEventListener('keydown', skip, { once: true });
        return () => {
            timers.forEach(window.clearTimeout);
            window.removeEventListener('wheel', skip);
            window.removeEventListener('touchmove', skip);
            window.removeEventListener('keydown', skip);
        };
    }, [introDone, reduceMotion]);
    const titleUp = stage >= 3;
    const frameIn = stage >= 4;
    // Altimeter: base camp to today's summit across the climb
    const summitM = parseInt(peak.elevation.replace(/[^0-9]/g, ''), 10) || 4491;
    const BASE_M = 2940;
    const altitudeLabel = useTransform(p, [0, 0.95], [BASE_M, summitM], { clamp: true });
    const altitudeText = useTransform(altitudeLabel, v => Math.round(v).toLocaleString('en-US'));
    const summitPlate = (isDark ? nightSlides[3] : daySlides[3]) ?? daySlides[0];

    // Frame elements (kicker, line, actions, meta) arrive once the title has risen
    const enter = (delay: number, from: Record<string, number | string> = { opacity: 0, y: 24 }) => ({
        initial: from,
        animate: frameIn ? { opacity: 1, y: 0, x: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } } : undefined,
        transition: { duration: 1.2, delay: Math.max(0, delay - 1), ease: EASE },
    });

    const ctas = (
        <div className="flex flex-col items-center md:items-end gap-4">
            {!isLoggedIn && (
                <div className="flex items-center gap-2.5 sm:gap-3">
                    <Magnetic strength={0.25} glow="rgba(255,255,255,0.35)">
                        <button
                            onClick={() => navigate('/signup')}
                            className="group/cta relative flex items-center gap-3 sm:gap-4 whitespace-nowrap rounded-full bg-white text-alpine-navy dark:text-black pl-5 sm:pl-6 pr-1.5 py-1.5 text-[13px] font-semibold tracking-wide shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45)] cursor-pointer"
                        >
                            {t('hero.join', 'Join the community')}
                            <span className="grid place-items-center w-9 h-9 rounded-full bg-alpine-navy text-white dark:bg-black transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/cta:rotate-45">
                                <ArrowUpRight size={16} strokeWidth={2.25} />
                            </span>
                        </button>
                    </Magnetic>
                    <button
                        onClick={() => navigate('/login')}
                        className="whitespace-nowrap rounded-full border border-white/35 bg-white/[0.06] backdrop-blur-md px-5 sm:px-6 py-3 text-[13px] font-semibold tracking-wide text-white hover:bg-white/15 transition-colors cursor-pointer"
                    >
                        {t('hero.login', 'Log in')}
                    </button>
                </div>
            )}
            <button
                onClick={handleDemoLogin}
                disabled={isDemoLoading}
                className="group/demo inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/70 hover:text-white transition-colors cursor-pointer"
            >
                {isDemoLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} className="text-alpine-glacier" />}
                <span className="relative">
                    Explore the demo dashboard
                    <span className="absolute left-0 -bottom-1 h-px w-full origin-left scale-x-0 bg-white/70 transition-transform duration-500 group-hover/demo:scale-x-100" />
                </span>
            </button>
        </div>
    );

    // The title column is laid out twice, identically: the back copy (behind the mountain cutout) shows only
    // ASCEND, the front copy shows everything else, so the word sits behind the ridge while the rest stays on top
    const titleColumn = (layer: 'back' | 'front') => {
        const back = layer === 'back';
        const only = (visible: boolean) => (visible ? undefined : { visibility: 'hidden' as const });
        return (
            <motion.div
                aria-hidden={back ? undefined : true}
                style={{ y: textY, opacity: textOpacity, scale: textScale }}
                className={`absolute inset-0 ${back ? 'z-[7]' : 'z-40'} flex flex-col items-center justify-center pointer-events-none transform-gpu -mt-[29vh] md:-mt-[33vh] dark:-mt-[1vh] dark:md:-mt-[4vh] px-4`}
            >
                <motion.p
                    {...enter(0.25, { opacity: 0, y: 14, filter: 'blur(6px)' })}
                    style={only(!back)}
                    className="hidden dark:block text-white/90 text-[10px] md:text-xs tracking-[0.55em] uppercase font-semibold mb-3 md:mb-5 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)]"
                >
                    {t('hero.presents', 'Mountaineer Mallu Presents')}
                </motion.p>

                <motion.div style={{ x: titleX, y: titleY, ...only(back) }} className="transform-gpu">
                    <motion.h1
                        aria-label={back ? heroTitle : undefined}
                        className="hero-title text-[clamp(4.5rem,19vw,19rem)] font-serif leading-[0.82] tracking-[-0.02em] font-light relative text-white uppercase transform-gpu"
                        // Rises from behind the mountains like the sun: the cutout hides it until it clears the ridge
                        initial={{ y: '95%', opacity: 0, letterSpacing: '0.06em' }}
                        animate={titleUp ? { y: '0%', opacity: 1, letterSpacing: '-0.02em' } : undefined}
                        transition={{ duration: 2.8, ease: [0.22, 1, 0.36, 1], opacity: { duration: 0.9 } }}
                    >
                        {/* Then a light glint sweeps across */}
                        <span aria-hidden="true" className="relative inline-flex pt-[0.04em] pb-[0.08em] -mb-[0.08em]">
                            {heroLetters.map((ch, i) => (
                                <span key={i} className="inline-block bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/70 font-light">
                                    {ch === ' ' ? '\u00A0' : ch}
                                </span>
                            ))}
                            {frameIn && back && (
                                <span className="hero-glint inline-flex">
                                    {heroLetters.map((ch, i) => <span key={i} className="inline-block">{ch === ' ' ? '\u00A0' : ch}</span>)}
                                </span>
                            )}
                        </span>
                    </motion.h1>
                </motion.div>

                <div className="mt-5 md:mt-8 flex items-center gap-4 md:gap-6" style={only(!back)}>
                    <motion.span
                        initial={{ scaleX: 0 }} animate={frameIn ? { scaleX: 1 } : undefined} transition={{ duration: 1.4, delay: 0.1, ease: EASE }}
                        className="h-px w-10 md:w-20 origin-right bg-gradient-to-r from-transparent to-white/80"
                    />
                    <motion.p
                        {...enter(1.15, { opacity: 0, y: 10 })}
                        className="text-white text-[10px] md:text-[13px] tracking-[0.4em] uppercase font-semibold whitespace-nowrap [text-shadow:0_1px_14px_rgba(0,0,0,0.7)]"
                    >
                        {t('hero.awaits', 'The European Alps Await')}
                    </motion.p>
                    <motion.span
                        initial={{ scaleX: 0 }} animate={frameIn ? { scaleX: 1 } : undefined} transition={{ duration: 1.4, delay: 0.1, ease: EASE }}
                        className="h-px w-10 md:w-20 origin-left bg-gradient-to-l from-transparent to-white/80"
                    />
                </div>

                {/* Phones: actions sit under the title */}
                {/* Present (but hidden) in the back copy too, so both copies lay out identically */}
                <motion.div {...enter(1.35)} style={only(!back)} className={`md:hidden mt-9 ${back ? '' : 'pointer-events-auto'}`}>
                    {ctas}
                </motion.div>
            </motion.div>
        );
    };

    return (
        // Own presence boundary: the page wrapper's <AnimatePresence initial={false}> would otherwise skip every
        // entrance animation in here on first load
        <AnimatePresence>
        <section key="hero" ref={sectionRef} className={`relative w-full ${reduceMotion ? 'h-screen' : 'h-[420vh]'} bg-transparent dark:bg-transparent hero-section-cursor overflow-clip`}>
            <div className="sticky top-0 w-full h-[100svh] overflow-hidden">

                {/* Everything photographic dissolves to transparent at the bottom, so the hero melts into the page behind it */}
                <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,#000_66%,transparent_99%)] [-webkit-mask-image:linear-gradient(to_bottom,#000_66%,transparent_99%)]">
                {/* ── Plate: today's peak, pushed in from darkness as the intro lifts, then a slow drift ── */}
                <motion.div style={{ y: plateY, scale: plateScale }} className="absolute inset-0 w-[110%] h-[120%] -left-[5%] -top-[10%] z-0 overflow-hidden transform-gpu pointer-events-none select-none">
                    <motion.div
                        className="absolute inset-0 w-[110%] h-[110%] -left-[5%] -top-[5%] transform-gpu"
                        style={{ rotateX, rotateY }}
                    >
                        <motion.div
                            className="absolute inset-0"
                            initial={{ scale: 1.16 }}
                            animate={introDone ? { scale: 1 } : undefined}
                            transition={{ duration: 2.8, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <motion.img
                                key={activeImage}
                                src={getHeroImageUrl(activeImage)}
                                alt={`${peak.name}, ${peak.location}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.9, ease: EASE }}
                                className="hero-still absolute inset-0 w-full h-full object-cover"
                                loading="eager"
                                fetchPriority="high"
                                decoding="async"
                                draggable={false}
                            />
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Living light: sun bloom and cloud shadows by day, moonlight by night */}
                <div className="hero-daylife dark:hidden" aria-hidden="true">
                    <span className="hero-sun" />
                    <span className="hero-cloudshadow hero-cloudshadow--a" />
                    <span className="hero-cloudshadow hero-cloudshadow--b" />
                </div>
                <div className="hero-nightlife hidden dark:block" aria-hidden="true">
                    <span className="hero-moon" />
                </div>
                <div className="cine-clouds z-[4] opacity-70 dark:opacity-35" aria-hidden="true" />

                {/* Night sky over the plate in dark mode; falling snow when the peak is below freezing */}
                <AnimatePresence>
                    {isDark ? (
                        <motion.div key="stars" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }} className="absolute inset-0 z-[5] pointer-events-none">
                            <StarfieldCanvas />
                        </motion.div>
                    ) : (weather.isSnowing || (weather.temp !== null && weather.temp <= 0)) ? (
                        <motion.div key="snow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }} className="absolute inset-0 z-[5] pointer-events-none">
                            <LightModeAtmosphere />
                        </motion.div>
                    ) : null}
                </AnimatePresence>

                {/* Grade: deep top for the navbar, readable centre, soft vignette */}
                <div aria-hidden="true" className="absolute inset-0 z-[6] pointer-events-none">
                    <div className="absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-black/50 via-black/15 to-transparent" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_42%,rgba(4,16,31,0.44),rgba(4,16,31,0.12)_60%,transparent_80%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.45)_100%)]" />
                </div>

                {/* First light behind the ridge: warm dawn by day, cold moonlight by night */}
                <motion.div
                    aria-hidden="true"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={stage >= 3 ? { opacity: 1, scale: 1 } : undefined}
                    transition={{ duration: 3.2, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 z-[7] pointer-events-none bg-[radial-gradient(ellipse_55%_35%_at_50%_36%,rgba(255,206,160,0.42),rgba(255,180,130,0.14)_55%,transparent_80%)] dark:bg-[radial-gradient(ellipse_55%_35%_at_50%_50%,rgba(170,195,255,0.28),rgba(140,160,230,0.08)_55%,transparent_80%)]"
                />
                {titleColumn('back')}

                {/* The mountains, again: the same plate (same transforms, so pixel-aligned) clipped to everything below the
                    traced skyline, drawn over the title. preserveAspectRatio="slice" reproduces object-cover exactly. */}
                {skyline && (
                    <motion.div style={{ y: plateY, scale: plateScale }} aria-hidden="true" className="absolute inset-0 w-[110%] h-[120%] -left-[5%] -top-[10%] z-[8] overflow-hidden transform-gpu pointer-events-none select-none">
                        <motion.div className="absolute inset-0 w-[110%] h-[110%] -left-[5%] -top-[5%] transform-gpu" style={{ rotateX, rotateY }}>
                            <motion.div
                                className="absolute inset-0"
                                initial={{ scale: 1.16 }}
                                animate={introDone ? { scale: 1 } : undefined}
                                transition={{ duration: 2.8, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <svg viewBox={`0 0 ${skyline.w} ${skyline.h}`} preserveAspectRatio="xMidYMid slice" className="hero-still absolute inset-0 w-full h-full">
                                    <defs>
                                        <clipPath id="hero-ridge">
                                            <polygon points={`${skyline.ridge} ${skyline.w},${skyline.h} 0,${skyline.h}`} />
                                        </clipPath>
                                        {/* Approximates the screen grade over the mountains so the cutout doesn't read brighter */}
                                        <linearGradient id="hero-ridge-shade" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0" stopColor="#04101F" stopOpacity="0.32" />
                                            <stop offset="0.6" stopColor="#04101F" stopOpacity="0.12" />
                                            <stop offset="1" stopColor="#000" stopOpacity="0.35" />
                                        </linearGradient>
                                    </defs>
                                    <g clipPath="url(#hero-ridge)">
                                        <image href={getHeroImageUrl(activeImage)} width={skyline.w} height={skyline.h} preserveAspectRatio="none" />
                                        <rect width={skyline.w} height={skyline.h} fill="url(#hero-ridge-shade)" />
                                    </g>
                                </svg>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Dawn: the opening shot comes up out of darkness (an overlay, cheaper than animating a filter) */}
                <motion.div
                    aria-hidden="true"
                    initial={{ opacity: 0.6 }}
                    animate={introDone ? { opacity: 0 } : undefined}
                    transition={{ duration: 2.8, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 z-[8] bg-[#02060D] pointer-events-none"
                />

                {/* Cloud banks rushing past as the camera climbs */}
                {!reduceMotion && (
                    <>
                        <motion.div aria-hidden="true" style={bankA} className="hero-bank absolute -inset-x-[30%] top-0 h-[90vh] z-[9] pointer-events-none" />
                        <motion.div aria-hidden="true" style={bankB} className="hero-bank hero-bank--b absolute -inset-x-[35%] top-0 h-[110vh] z-[9] pointer-events-none" />

                        {/* Above the clouds: the summit plate, revealed through the white-out */}
                        <motion.div aria-hidden="true" style={{ opacity: summitOpacity }} className="absolute inset-0 z-[10] overflow-hidden pointer-events-none">
                            <motion.img
                                src={getHeroImageUrl(summitPlate.src)}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                style={{ scale: summitScale, y: summitY }}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_42%,rgba(4,16,31,0.38),transparent_75%)]" />
                            <div className="absolute inset-x-0 top-0 h-[35%] bg-gradient-to-b from-black/45 to-transparent" />
                        </motion.div>
                        <motion.div aria-hidden="true" style={{ opacity: whiteout }} className="absolute inset-0 z-[11] pointer-events-none bg-[radial-gradient(ellipse_at_50%_50%,#FFFFFF,#EEF2F6_60%,#DCE4EC)] dark:bg-[radial-gradient(ellipse_at_50%_50%,#3A4A63,#1E2A3D_60%,#101827)]" />
                    </>
                )}
                </div>

                {titleColumn('front')}

                {/* Story lines on the way up */}
                {!reduceMotion && (
                    <>
                        {/* The climb as footage: letterbox, slate + timecode, snow rushing past the lens */}
                        <AscentFilm progress={p} />

                        <motion.div style={{ opacity: caption1, y: caption1Y }} className="absolute inset-x-0 top-[38%] z-40 text-center px-6 pointer-events-none">
                            <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] text-white/80 mb-3 md:mb-4 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)]">{isDark ? '03:40' : '05:12'} · {t('hero.story_camp', 'Base camp')}</p>
                            <p className="font-serif italic font-light text-4xl md:text-7xl text-white [text-shadow:0_4px_30px_rgba(0,0,0,0.5)]">{t('hero.story1', 'We leave before first light.')}</p>
                        </motion.div>
                        <motion.div style={{ opacity: caption2, y: caption2Y }} className="absolute inset-x-0 top-[38%] z-40 text-center px-6 pointer-events-none">
                            <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] text-white/80 mb-3 md:mb-4 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)]">{t('hero.story_clouds', 'Into the clouds')}</p>
                            <p className="font-serif italic font-light text-4xl md:text-7xl text-white [text-shadow:0_4px_30px_rgba(0,0,0,0.5)]">{t('hero.story2', 'Every step, a little higher.')}</p>
                        </motion.div>

                        {/* Summit finale */}
                        <motion.div style={{ opacity: finale, y: finaleY }} className="absolute inset-0 z-40 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
                            <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.45em] text-white/85 mb-4 md:mb-6 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)]">{t('hero.summit', 'Summit')} · {peak.name} · {peak.elevation}</p>
                            <h2 className="font-serif font-light text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.95] text-white [text-shadow:0_8px_40px_rgba(0,0,0,0.45)]">
                                {t('hero.finale_1', 'Above the clouds,')}<br /><span className="italic">{t('hero.finale_2', 'you belong.')}</span>
                            </h2>
                            <div className="mt-10 md:mt-12 pointer-events-auto">{ctas}</div>
                        </motion.div>

                        {/* Altimeter */}
                        <motion.div style={{ opacity: hudOpacity }} className="absolute left-1/2 -translate-x-1/2 bottom-6 md:bottom-8 z-40 flex flex-col items-center gap-2 px-10 py-3 pointer-events-none bg-[radial-gradient(closest-side,rgba(4,16,31,0.38),transparent)]">
                            <span className="font-mono text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-white/70">{t('hero.altitude', 'Altitude')}</span>
                            <span className="font-serif text-3xl md:text-4xl text-white tabular-nums [text-shadow:0_2px_16px_rgba(0,0,0,0.5)]"><motion.span>{altitudeText}</motion.span><span className="ml-1 text-sm text-white/70">m</span></span>
                            <span className="relative w-32 md:w-48 h-px bg-white/25 overflow-hidden">
                                <motion.span style={{ scaleX: p }} className="absolute inset-0 origin-left bg-white" />
                            </span>
                        </motion.div>
                    </>
                )}

                {/* ── Frame: meta row under the navbar ── */}
                <motion.div
                    style={{ opacity: textOpacity }}
                    className="absolute inset-x-5 md:inset-x-12 top-24 md:top-28 z-40 flex items-center justify-between pointer-events-none"
                >
                    <motion.div {...enter(1, { opacity: 0, x: -16 })} className="flex items-center gap-3 font-mono text-[9px] md:text-[11px] uppercase tracking-[0.3em] text-white/75 [text-shadow:0_1px_10px_rgba(0,0,0,0.5)]">
                        <span className="w-6 md:w-10 h-px bg-white/50" />
                        {peak.lat.toFixed(2)}°N · {peak.lon.toFixed(2)}°E
                    </motion.div>
                    <motion.div {...enter(1, { opacity: 0, x: 16 })} className="flex items-center gap-3 font-mono text-[9px] md:text-[11px] uppercase tracking-[0.3em] text-white/75 [text-shadow:0_1px_10px_rgba(0,0,0,0.5)]">
                        <span className="hidden sm:inline">Alpine time</span> {alpineTime}
                        <span className="w-6 md:w-10 h-px bg-white/50" />
                    </motion.div>
                </motion.div>

                {/* ── Frame: actions bottom-right and a rotating scroll badge (desktop) ── */}
                <motion.div style={{ opacity: textOpacity }} className="hidden md:block absolute right-24 lg:right-28 bottom-10 z-40">
                    <motion.div {...enter(1.4)}>{ctas}</motion.div>
                </motion.div>

                <motion.button
                    type="button"
                    aria-label={t('hero.scroll', 'Scroll')}
                    onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                    style={{ opacity: textOpacity }}
                    className="hidden md:grid absolute left-1/2 -translate-x-1/2 bottom-8 z-40 w-24 h-24 place-items-center text-alpine-navy dark:text-white cursor-pointer"
                >
                    <motion.span {...enter(1.8, { opacity: 0, y: 12 })} className="absolute inset-0">
                        <svg viewBox="0 0 100 100" className="hero-scroll-badge w-full h-full" aria-hidden="true">
                            <defs><path id="hero-scroll-ring" d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" /></defs>
                            <text fontSize="7.4" className="fill-current font-semibold uppercase">
                                {/* textLength spreads the phrase evenly around the full ring (2π·38 ≈ 238) */}
                                <textPath href="#hero-scroll-ring" textLength="236" lengthAdjust="spacing">Scroll to explore • Scroll to explore •</textPath>
                            </text>
                        </svg>
                    </motion.span>
                    <motion.span {...enter(1.9, { opacity: 0, y: -8 })} className="grid place-items-center w-9 h-9 rounded-full border border-current/30">
                        <ArrowDown size={15} className="hero-scroll-arrow" />
                    </motion.span>
                </motion.button>


                {/* The peak card joins the frame once the opening story has played */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={frameIn ? { opacity: 1, y: 0 } : undefined}
                    transition={{ duration: 1.2, delay: 0.35, ease: EASE }}
                    className="absolute inset-0 z-40 pointer-events-none"
                >
                {/* Layer 4: Weather & Peak Info — Refined Glassmorphic Panel (Desktop & Mobile) */}
                <motion.div
                    initial={{ opacity: 1, x: 0 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ opacity: textOpacity }}
                    onClick={handlePeakClick}
                    className={`absolute glass-premium hero-peak-card pointer-events-auto cursor-pointer hover:border-alpine-glacier/30 transition-[color,background-color,border-color,box-shadow] duration-300 group/peak ${
                        isPeakExpanded 
                            ? 'z-50 shadow-[0_10px_60px_rgba(0,0,0,0.8)] border-alpine-glacier/30 p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl bottom-4 sm:bottom-6 left-3 sm:left-6 md:left-12 w-[calc(100%-1.5rem)] sm:w-[360px] max-w-sm flex flex-col' 
                            : 'z-30 sm:z-40 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl bottom-4 sm:bottom-6 md:bottom-8 left-3 sm:left-6 md:left-12 w-[240px] sm:w-[270px] md:w-[300px] max-w-xs flex flex-col'
                    }`}
                >
                    {/* Subtle inner shimmer */}
                    <div className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden pointer-events-none">
                        <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" style={{ animation: 'shimmer 5s infinite' }} />
                    </div>

                    <p className="text-white/50 text-[8px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] font-medium uppercase mb-1 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-alpine-glacier/60" />
                        {t('hero.featured_peak', 'Featured Peak')}
                    </p>
                    <h3 className="text-white font-serif text-sm sm:text-2xl md:text-3xl font-normal mb-0.5 sm:mb-1 tracking-wide">{peak.name}</h3>
                    <p className="text-white/60 text-[10px] sm:text-sm mb-2 sm:mb-5 font-light">{peak.location} — {peak.elevation}</p>

                    {/* Only show live conditions when we actually have them */}
                    {weather.temp !== null && (
                        <>
                            <div className="h-[1px] w-full bg-gradient-to-r from-white/20 via-white/10 to-transparent mb-2 sm:mb-5" />
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="relative">
                                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-alpine-glacier animate-pulse" />
                                    <div className="absolute inset-0 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-alpine-glacier/50 animate-ping" />
                                </div>
                                <div>
                                    <p className="text-white/55 text-[7px] sm:text-[9px] tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-0.5 font-medium">{t('hero.live_conditions', 'Live Conditions')}</p>
                                    <p className="text-white/90 font-medium text-[10px] sm:text-sm">
                                        {t('weather.' + weather.condition, weather.condition)}, {weather.temp}°C
                                        {windLabel(weather) && <span className="block font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-white/55 mt-0.5">{windLabel(weather)}</span>}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}

                    <AnimatePresence>
                        {isPeakExpanded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 pt-4 border-t border-white/10 overflow-hidden max-h-[50vh] overflow-y-auto hide-scrollbar"
                            >
                                {isPeakLoading ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-alpine-glacier text-xs font-semibold uppercase tracking-wider">
                                            <Sparkles size={13} className="animate-pulse" />
                                            <span>Looking up this peak…</span>
                                        </div>
                                        <PeakInfoSkeleton />
                                    </div>
                                ) : (
                                    <div className="text-[13px] sm:text-sm text-white/90 leading-relaxed font-normal">
                                        <div className="whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{
                                            __html: formatMarkdown(peakInfo)
                                        }} />
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
                </motion.div>

            </div>
        </section>
        </AnimatePresence>
    );
};
