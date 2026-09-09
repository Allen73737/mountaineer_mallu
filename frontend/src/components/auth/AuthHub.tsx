import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
    User, Mail, Lock, CheckCircle, Loader2, AlertCircle, XCircle, 
    Shield, Eye, EyeOff, Sparkles, LogIn, UserPlus, ArrowRight, Clock, Mountain
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';
import { DynamicLogo } from '../ui/DynamicLogo';
import { BackButton } from '../ui/BackButton';
import SoftAurora from '../ui/SoftAurora';
import { useAuthStore } from '../../store/useAuthStore';
import { useStore } from '../../store/useStore';
import { authApi } from '../../lib/api';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface AuthHubProps {
    initialMode: 'login' | 'signup';
}

/* ═══════════════════════════════════════════════════════════════
   LAYER 1a: Midnight Summit Starfield (Canvas Stars)
   ═══════════════════════════════════════════════════════════════ */
const SummitStarfield: React.FC = React.memo(() => {
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
        window.addEventListener('resize', resize, { passive: true });

        const createSprite = (size: number, r: number, g: number, b: number) => {
            const c = document.createElement('canvas');
            c.width = c.height = size * 4;
            const cx = c.getContext('2d');
            if (cx) { cx.beginPath(); cx.arc(size * 2, size * 2, size, 0, Math.PI * 2); cx.fillStyle = `rgb(${r},${g},${b})`; cx.fill(); }
            return c;
        };
        const whiteSprite = createSprite(1.5, 255, 255, 255);
        const blueSprite = createSprite(1.5, 180, 220, 255);

        const stars = Array.from({ length: 45 }, () => ({
            x: Math.random() * w, y: Math.random() * h,
            r: Math.random() * 0.9 + 0.3,
            twinkleSpeed: Math.random() * 0.015 + 0.006,
            twinkleOffset: Math.random() * Math.PI * 2,
            sprite: Math.random() > 0.3 ? whiteSprite : blueSprite,
        }));

        let shootingStar: { x: number; y: number; angle: number; speed: number; len: number; life: number; maxLife: number; active: boolean } | null = null;
        let lastShot = 0;

        const draw = () => {
            if (document.hidden) { animRef.current = 0; return; }
            ctx.clearRect(0, 0, w, h);
            const now = performance.now() * 0.001;

            for (const s of stars) {
                const alpha = 0.3 + Math.sin(now * s.twinkleSpeed * 10 + s.twinkleOffset) * 0.35 + 0.35;
                ctx.globalAlpha = alpha;
                ctx.drawImage(s.sprite, s.x - s.r * 2, s.y - s.r * 2, s.r * 4, s.r * 4);
            }

            if (!shootingStar?.active && now - lastShot > 6 + Math.random() * 8) {
                lastShot = now;
                const angle = Math.PI * 0.15 + Math.random() * 0.3;
                shootingStar = {
                    x: Math.random() * w * 0.7, y: Math.random() * h * 0.3,
                    angle, speed: 6 + Math.random() * 4, len: 60 + Math.random() * 40,
                    life: 0, maxLife: 40 + Math.random() * 20, active: true,
                };
            }

            if (shootingStar?.active) {
                const ss = shootingStar;
                ss.life++;
                ss.x += Math.cos(ss.angle) * ss.speed;
                ss.y += Math.sin(ss.angle) * ss.speed;
                const progress = ss.life / ss.maxLife;
                const opacity = progress < 0.15 ? progress / 0.15 : Math.max(0, 1 - (progress - 0.15) / 0.85);

                if (ss.life >= ss.maxLife) { ss.active = false; }
                else {
                    const tx = ss.x - Math.cos(ss.angle) * ss.len;
                    const ty = ss.y - Math.sin(ss.angle) * ss.len;
                    const grad = ctx.createLinearGradient(tx, ty, ss.x, ss.y);
                    grad.addColorStop(0, 'rgba(255,255,255,0)');
                    grad.addColorStop(0.7, `rgba(180,220,255,${opacity * 0.5})`);
                    grad.addColorStop(1, `rgba(255,255,255,${opacity})`);
                    ctx.globalAlpha = 1;
                    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(ss.x, ss.y);
                    ctx.strokeStyle = grad; ctx.lineWidth = 1.5; ctx.lineCap = 'round'; ctx.stroke();
                    ctx.beginPath(); ctx.arc(ss.x, ss.y, 2, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255,255,255,${opacity})`; ctx.fill();
                }
            }

            ctx.globalAlpha = 1;
            animRef.current = requestAnimationFrame(draw);
        };

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReducedMotion) {
            animRef.current = requestAnimationFrame(draw);
        } else {
            for (const s of stars) {
                ctx.globalAlpha = 0.5;
                ctx.drawImage(s.sprite, s.x - s.r * 2, s.y - s.r * 2, s.r * 4, s.r * 4);
            }
            ctx.globalAlpha = 1;
        }

        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 pointer-events-none" />;
});

/* ═══════════════════════════════════════════════════════════════
   LAYER 8: Altitude Password Strength Meter
   ═══════════════════════════════════════════════════════════════ */
const AltitudeStrengthMeter: React.FC<{ strength: number; checks: Record<string, boolean> }> = ({ strength, checks }) => {
    const bands = [
        { key: 'length', label: '8+ chars', altitude: 'Base Camp', color: 'bg-slate-400 dark:bg-slate-500' },
        { key: 'lowercase', label: 'Lowercase', altitude: 'Trail Head', color: 'bg-alpine-glacier' },
        { key: 'uppercase', label: 'Uppercase', altitude: 'High Camp', color: 'bg-[#00c6ff]' },
        { key: 'number', label: 'Number', altitude: 'Death Zone', color: 'bg-sky-400' },
        { key: 'special', label: 'Symbol', altitude: 'Summit', color: 'bg-amber-400' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="rounded-xl bg-black/20 dark:bg-white/[0.04] border border-white/10 p-4 my-2"
        >
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-sky-200/70 dark:text-white/40">
                    Altitude Check
                </span>
                <span className={`font-mono text-xs font-bold tracking-wider ${strength === 5 ? 'text-amber-400' : 'text-sky-300 dark:text-alpine-glacier'}`}>
                    {strength === 5 ? '⛰️ SUMMIT ACHIEVED' : `${strength}/5`}
                </span>
            </div>

            <div className="space-y-1.5">
                {bands.map((band, i) => {
                    const met = (checks as any)[band.key];
                    return (
                        <div key={band.key} className="flex items-center gap-2.5">
                            <div className="w-16 text-[9px] font-mono text-sky-200/60 dark:text-white/30 text-right truncate">
                                {band.altitude}
                            </div>
                            <div className="flex-1 h-2 rounded-full bg-black/20 dark:bg-white/5 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 origin-left ${met ? band.color : 'bg-transparent'} ${strength === 5 && i === 4 ? 'animate-[summit-achieved_2s_ease-in-out_infinite]' : ''}`}
                                    style={{
                                        transform: met ? 'scaleX(1)' : 'scaleX(0)',
                                        transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}
                                />
                            </div>
                            <div className="w-14 text-[9px] text-sky-200/60 dark:text-white/30 truncate">
                                {band.label}
                            </div>
                            <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${met ? 'bg-emerald-400' : 'bg-white/20'}`} />
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
};

/* ═══════════════════════════════════════════════════════════════
   LAYER 2: Parallax Mountain Silhouettes
   ═══════════════════════════════════════════════════════════════ */
const MountainLayers: React.FC<{ mouseY: number }> = React.memo(({ mouseY }) => {
    const layers = [
        {
            path: "M0,300 L0,140 C180,100 360,180 540,120 C720,60 900,160 1080,100 C1260,40 1380,130 1440,80 L1440,300 Z",
            darkColor: "rgba(8,40,76,0.35)",
            lightColor: "rgba(10,37,64,0.45)",
            offset: 0.008,
            height: "35vh",
            blur: "blur(6px)",
        },
        {
            path: "M0,250 L0,130 C240,190 420,70 660,150 C900,230 1080,90 1260,160 C1350,120 1400,140 1440,110 L1440,250 Z",
            darkColor: "rgba(8,40,76,0.6)",
            lightColor: "rgba(13,43,69,0.7)",
            offset: 0.015,
            height: "28vh",
            blur: "blur(2px)",
        },
        {
            path: "M0,200 L0,120 C200,160 400,80 600,140 C800,200 1000,100 1200,150 C1350,90 1420,130 1440,100 L1440,200 Z",
            darkColor: "rgba(5,15,30,0.85)",
            lightColor: "rgba(6,20,38,0.9)",
            offset: 0.025,
            height: "22vh",
            blur: "blur(0px)",
        },
    ];

    return (
        <>
            {layers.map((layer, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 + i * 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, delay: 0.3 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-x-0 bottom-0 pointer-events-none z-[2]"
                    style={{
                        height: layer.height,
                        transform: `translateY(${mouseY * layer.offset}px)`,
                        filter: layer.blur,
                    }}
                >
                    <svg className="w-[120%] -ml-[10%] h-full" preserveAspectRatio="none" viewBox="0 0 1440 300">
                        <path d={layer.path} className="hidden dark:block" fill={layer.darkColor} />
                        <path d={layer.path} className="block dark:hidden" fill={layer.lightColor} />
                    </svg>
                </motion.div>
            ))}
        </>
    );
});

/* ═══════════════════════════════════════════════════════════════
   LAYER 9: Summit Coordinate Data
   ═══════════════════════════════════════════════════════════════ */
const SUMMIT_COORDS = [
    { name: 'Matterhorn', lat: '45.9766°N', lon: '7.6586°E', alt: '4,478m' },
    { name: 'Mont Blanc', lat: '45.8326°N', lon: '6.8652°E', alt: '4,808m' },
    { name: 'Eiger', lat: '46.5778°N', lon: '8.0053°E', alt: '3,967m' },
    { name: 'Jungfrau', lat: '46.5367°N', lon: '7.9614°E', alt: '4,158m' },
];

/* ═══════════════════════════════════════════════════════════════
   VALIDATION HELPERS
   ═══════════════════════════════════════════════════════════════ */
const validatePassword = (pwd: string) => ({
    length: pwd.length >= 8,
    uppercase: /[A-Z]/.test(pwd),
    lowercase: /[a-z]/.test(pwd),
    number: /\d/.test(pwd),
    special: /[^a-zA-Z0-9\s]/.test(pwd)
});

const calculateStrength = (checks: ReturnType<typeof validatePassword>) =>
    Object.values(checks).filter(Boolean).length;

const isValidEmail = (email: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

/* ═══════════════════════════════════════════════════════════════
   SUMMIT GATE — MAIN AUTH COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export const AuthHub: React.FC<AuthHubProps> = ({ initialMode }) => {
    const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
    const navigate = useNavigate();
    const { t } = useTranslation();
    const theme = useStore(s => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    useEffect(() => { setMode(initialMode); }, [initialMode]);

    // ─── Form State ────────────────────────────────────────────
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [consent, setConsent] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [emailTouched, setEmailTouched] = useState(false);

    const [lockCountdown, setLockCountdown] = useState(0);
    const [, setLockedUntil] = useState<string | null>(null);

    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
    const usernameTimerRef = useRef<NodeJS.Timeout | null>(null);

    const { loginAsync, signupAsync, loginWithGoogleAsync, demoLoginAsync } = useAuthStore();

    // ─── Mouse Parallax ────────────────────────────────────────
    const mouseXRaw = useMotionValue(0);
    const mouseYRaw = useMotionValue(0);
    const mouseX = useSpring(mouseXRaw, { stiffness: 40, damping: 20 });
    const mouseY = useSpring(mouseYRaw, { stiffness: 40, damping: 20 });
    const [rawMouseY, setRawMouseY] = useState(0);

    useEffect(() => {
        const handleMouse = (e: MouseEvent) => {
            const cx = (e.clientX / window.innerWidth - 0.5) * 2;
            const cy = (e.clientY / window.innerHeight - 0.5) * 2;
            mouseXRaw.set(cx * 14);
            mouseYRaw.set(cy * 14);
            setRawMouseY(cy * 14);
        };
        window.addEventListener('mousemove', handleMouse, { passive: true });
        return () => window.removeEventListener('mousemove', handleMouse);
    }, []);

    // ─── Lockout Timer ─────────────────────────────────────────
    useEffect(() => {
        if (lockCountdown <= 0) return;
        const iv = setInterval(() => {
            setLockCountdown(p => {
                if (p <= 1) { setLockedUntil(null); setError(''); return 0; }
                return p - 1;
            });
        }, 1000);
        return () => clearInterval(iv);
    }, [lockCountdown]);

    const fmtLock = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    // ─── Username Check ────────────────────────────────────────
    const checkUsername = useCallback((u: string) => {
        if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current);
        if (!u || u.length < 2) { setUsernameStatus('idle'); return; }
        setUsernameStatus('checking');
        usernameTimerRef.current = setTimeout(async () => {
            try {
                const r = await authApi.checkUsername(u);
                setUsernameStatus(r.available ? 'available' : 'taken');
            } catch { setUsernameStatus('idle'); }
        }, 500);
    }, []);

    useEffect(() => () => { if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current); }, []);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
        checkUsername(e.target.value);
    };

    // ─── Derived State ─────────────────────────────────────────
    const pwdChecks = validatePassword(password);
    const pwdStrength = calculateStrength(pwdChecks);
    const isPasswordValid = pwdStrength === 5;
    const emailValid = emailTouched ? isValidEmail(email) : true;
    const passwordsMatch = confirmPassword.length > 0 ? password === confirmPassword : true;
    const isLocked = lockCountdown > 0;

    // ─── Navigation ────────────────────────────────────────────
    const goPost = (user: any) => {
        if (!user.isProfileComplete) navigate('/profile-complete', { replace: true });
        else if (['Admin', 'SuperAdmin'].includes(user.role)) navigate('/summit-control-panel', { replace: true });
        else navigate('/portal', { replace: true });
    };

    // ─── Submit ────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLocked) return;
        setError('');

        if (mode === 'signup') {
            if (usernameStatus === 'taken') { setError("This username is already claimed."); return; }
            if (!isValidEmail(email)) { setError("Please provide a valid email address."); return; }
            if (!isPasswordValid) { setError("Please complete all 5 security parameters."); return; }
            if (password !== confirmPassword) { setError("Passwords do not match."); return; }
            if (!consent) { setError("Please accept communications consent."); return; }
        }

        setIsLoading(true);
        try {
            const user = mode === 'login'
                ? await loginAsync(email, password)
                : await signupAsync(name, email, password, consent);
            goPost(user);
        } catch (err: any) {
            if (err.status === 423 && err.data) { setLockCountdown(err.data.lockRemaining || 1800); setLockedUntil(err.data.lockedUntil); }
            setError(err.message || 'Authentication failed. Please verify credentials.');
            setIsLoading(false);
        }
    };

    const handleDemo = async () => {
        if (isLocked) return;
        setIsLoading(true); setError('');
        try { const u = await demoLoginAsync(); goPost(u); }
        catch (err: any) { setError(err.message || 'Demo access unavailable.'); setIsLoading(false); }
    };

    const handleGoogle = async (res: any) => {
        setIsLoading(true); setError('');
        try { const u = await loginWithGoogleAsync(res.credential); goPost(u); }
        catch (err: any) { setError(err.message || 'Google authentication failed.'); setIsLoading(false); }
    };

    // ─── Seamless Mode Switcher (Zero Unmounting / Zero Reloading) ───
    const switchMode = (m: 'login' | 'signup') => {
        setError('');
        setMode(m);
        window.history.replaceState(null, '', m === 'login' ? '/login' : '/signup');
    };

    const coord = useMemo(() => SUMMIT_COORDS[Math.floor(Math.random() * SUMMIT_COORDS.length)], []);

    const stagger = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.15 } },
    };
    const staggerChild = {
        hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
        visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
    };

    return (
        <div className="min-h-screen w-full flex flex-col relative overflow-hidden bg-gradient-to-b from-[#091E3A] via-[#12365B] to-[#0A1828] dark:from-[#030712] dark:via-[#081526] dark:to-[#02050b] text-white selection:bg-sky-400/30">

            {/* ═══ LAYER 1: IMMERSIVE BACKGROUND (SOFT AURORA & CANVAS STARS) ═══ */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Canvas Starfield */}
                <SummitStarfield />

                {/* Soft Aurora (Included in both modes for ultra-premium atmosphere) */}
                <div className="absolute inset-0 z-0 opacity-50 dark:opacity-60 mix-blend-screen overflow-hidden">
                    <SoftAurora
                        color1={isDark ? "#A3C9E2" : "#38bdf8"}
                        color2={isDark ? "#E2A071" : "#818cf8"}
                        brightness={isDark ? 0.9 : 1.15}
                        speed={0.5}
                    />
                </div>

                {/* Vignette Overlay */}
                <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 35%, rgba(4,14,28,0.7) 100%)' }} />
            </div>

            {/* ═══ LAYER 2: PARALLAX MOUNTAIN SILHOUETTES ═══ */}
            <MountainLayers mouseY={rawMouseY} />

            {/* ═══ LAYER 9a: HUD Badge (top-right desktop) ═══ */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 1.2 }}
                className="fixed top-6 right-6 z-30 hidden xl:flex flex-col items-end gap-0.5 pointer-events-none"
            >
                <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-sky-200/50 dark:text-white/20">
                    ALT {coord.alt} ▲
                </span>
                <span className="font-mono text-[8px] tracking-[0.15em] uppercase text-sky-200/30 dark:text-white/12">
                    Summit Gate v2.0
                </span>
            </motion.div>

            {/* ═══ MAIN CONTENT: THE SUMMIT GATE CARD ═══ */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 z-10 relative">
                
                {/* Back Button positioned cleanly above card */}
                <div className="w-full max-w-md md:max-w-xl lg:max-w-[580px] xl:max-w-[640px] flex items-center justify-start mb-4">
                    <BackButton />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.94, filter: 'blur(15px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-md md:max-w-xl lg:max-w-[580px] xl:max-w-[640px] relative"
                    style={{ x: mouseX, y: mouseY }}
                >
                    {/* ═══ LAYER 4: FROSTED GLASS FORM CONTAINER ═══ */}
                    <div
                        className={`relative rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] overflow-hidden backdrop-blur-3xl transition-all duration-500 ${
                            isDark
                                ? 'bg-[rgba(8,35,68,0.35)] border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(163,201,226,0.15)]'
                                : 'bg-[rgba(13,37,64,0.75)] border border-sky-300/30 shadow-[0_30px_90px_rgba(5,20,40,0.45),inset_0_1px_0_rgba(255,255,255,0.25)]'
                        }`}
                    >
                        {/* Specular Top Arc Highlight */}
                        <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-white/15 to-transparent rounded-t-2xl sm:rounded-t-3xl pointer-events-none z-10" />

                        {/* Card Border Shimmer */}
                        <div className="absolute inset-0 rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] pointer-events-none z-50 overflow-hidden">
                            <motion.div
                                className="absolute inset-[-1px] rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem]"
                                style={{
                                    background: 'linear-gradient(135deg, transparent 30%, rgba(56,189,248,0.18) 50%, transparent 70%)',
                                    backgroundSize: '200% 200%',
                                }}
                                animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                            />
                        </div>

                        <div className="relative z-10 p-6 sm:p-8 md:p-10 lg:p-12">

                            {/* ─── Brand Logo & Title ─── */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                className="text-center mb-6 sm:mb-8"
                            >
                                <div className="inline-flex items-center justify-center mb-3">
                                    <DynamicLogo className="h-10 sm:h-12 md:h-14" showText={false} />
                                </div>

                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={mode}
                                        initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                        exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                    >
                                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] font-bold font-serif tracking-tight mb-2 text-white drop-shadow-sm">
                                            {mode === 'login' ? 'Return to Summit' : 'Begin Your Ascent'}
                                        </h1>
                                        <p className="text-xs sm:text-sm md:text-base text-sky-100/70 dark:text-white/60 font-light tracking-wide max-w-lg mx-auto">
                                            {mode === 'login'
                                                ? 'Enter your credentials to access the summit dashboard'
                                                : "Join Kerala's premier European mountaineering circle"
                                            }
                                        </p>
                                    </motion.div>
                                </AnimatePresence>
                            </motion.div>

                            {/* ─── SEGMENTED MODE SWITCHER ─── */}
                            <div className="relative p-1.5 sm:p-2 rounded-2xl bg-black/35 backdrop-blur-xl border border-white/15 mb-6 sm:mb-8 flex items-center shadow-inner">
                                <button
                                    type="button"
                                    onClick={() => switchMode('login')}
                                    className={`relative flex-1 py-2.5 sm:py-3.5 px-4 sm:px-6 rounded-xl sm:rounded-2xl text-xs sm:text-sm md:text-base font-bold tracking-wide transition-colors duration-300 flex items-center justify-center gap-2.5 z-10 ${
                                        mode === 'login'
                                            ? 'text-white font-bold shadow-lg'
                                            : 'text-sky-100/60 dark:text-white/50 hover:text-white'
                                    }`}
                                >
                                    {mode === 'login' && (
                                        <motion.div
                                            layoutId="auth-mode-pill"
                                            className="absolute inset-0 bg-[#A3C9E2]/20 border border-[#A3C9E2]/40 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.3)] z-[-1]"
                                            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                                        />
                                    )}
                                    <LogIn size={17} className={mode === 'login' ? 'text-[#A3C9E2]' : ''} />
                                    <span>Sign In</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => switchMode('signup')}
                                    className={`relative flex-1 py-2.5 sm:py-3.5 px-4 sm:px-6 rounded-xl sm:rounded-2xl text-xs sm:text-sm md:text-base font-bold tracking-wide transition-colors duration-300 flex items-center justify-center gap-2.5 z-10 ${
                                        mode === 'signup'
                                            ? 'text-white font-bold shadow-lg'
                                            : 'text-sky-100/60 dark:text-white/50 hover:text-white'
                                    }`}
                                >
                                    {mode === 'signup' && (
                                        <motion.div
                                            layoutId="auth-mode-pill"
                                            className="absolute inset-0 bg-[#A3C9E2]/20 border border-[#A3C9E2]/40 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.3)] z-[-1]"
                                            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                                        />
                                    )}
                                    <UserPlus size={17} className={mode === 'signup' ? 'text-[#A3C9E2]' : ''} />
                                    <span>Create Account</span>
                                </button>
                            </div>

                            {/* ─── Lockout Banner ─── */}
                            <AnimatePresence>
                                {isLocked && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-amber-500/15 border border-amber-500/30 text-amber-200 rounded-xl p-3.5 sm:p-4 mb-5 text-xs sm:text-sm overflow-hidden"
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <Clock size={16} className="text-amber-400 animate-pulse" />
                                            <span className="font-mono font-bold uppercase tracking-wider">Account Cooldown Active</span>
                                        </div>
                                        <p className="mb-2 text-amber-200/80">Too many failed login attempts. Please wait.</p>
                                        <div className="text-center font-mono font-bold text-lg sm:text-xl text-amber-300 bg-amber-500/15 py-1.5 rounded-lg border border-amber-500/30">
                                            {fmtLock(lockCountdown)}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* ─── Error Banner ─── */}
                            <AnimatePresence>
                                {error && !isLocked && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, y: -8, height: 0 }}
                                        className="bg-red-500/15 border border-red-500/30 text-red-200 rounded-xl p-3.5 mb-5 flex items-center gap-2.5 text-xs sm:text-sm overflow-hidden"
                                    >
                                        <AlertCircle size={16} className="flex-shrink-0 text-red-400" />
                                        <p className="leading-tight">{error}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* ─── Google OAuth Button ─── */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="mb-6 flex justify-center"
                            >
                                <div className="w-full rounded-xl sm:rounded-2xl overflow-hidden border border-white/15">
                                    <GoogleLogin
                                        onSuccess={handleGoogle}
                                        onError={() => setError('Google Authentication Failed')}
                                        theme={isDark ? "filled_black" : "outline"}
                                        size="large"
                                        shape="rectangular"
                                        width="100%"
                                        text={mode === 'login' ? 'continue_with' : 'signup_with'}
                                    />
                                </div>
                            </motion.div>

                            {/* ─── Divider ─── */}
                            <div className="relative flex items-center mb-6">
                                <div className="flex-grow h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                <span className="flex-shrink-0 mx-3 text-sky-200/50 dark:text-white/30 text-[9px] sm:text-[10px] font-mono tracking-[0.2em] uppercase">
                                    or email
                                </span>
                                <div className="flex-grow h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            </div>

                            {/* ═══ FORM (Single-Page Seamless Crossfade) ═══ */}
                            <AnimatePresence mode="wait">
                                <motion.form
                                    key={mode}
                                    initial={{ opacity: 0, x: mode === 'login' ? -20 : 20, filter: 'blur(4px)' }}
                                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, x: mode === 'login' ? 20 : -20, filter: 'blur(4px)' }}
                                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                    onSubmit={handleSubmit}
                                >
                                    <motion.div
                                        variants={stagger}
                                        initial="hidden"
                                        animate="visible"
                                        className="space-y-4 sm:space-y-5"
                                    >
                                        {/* ═══ LAYER 5: PREMIUM INPUT FIELDS ═══ */}

                                        {/* Username (Signup Only) */}
                                        {mode === 'signup' && (
                                            <motion.div variants={staggerChild}>
                                                <label className="block text-[10px] sm:text-xs font-mono uppercase tracking-[0.18em] text-sky-200/70 dark:text-white/40 mb-1.5">Username</label>
                                                <div className="summit-input-line relative group">
                                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-200/50 dark:text-white/30 group-focus-within:text-sky-300 dark:group-focus-within:text-alpine-glacier transition-colors duration-300" size={16} />
                                                    <input
                                                        type="text"
                                                        value={name}
                                                        onChange={handleNameChange}
                                                        placeholder={t('auth.username_placeholder')}
                                                        required
                                                        minLength={2}
                                                        maxLength={100}
                                                        className={`w-full bg-black/20 dark:bg-white/[0.04] border-b ${
                                                            usernameStatus === 'taken' ? 'border-red-400' : usernameStatus === 'available' ? 'border-emerald-400' : 'border-white/15'
                                                        } py-3 sm:py-3.5 pl-10 pr-10 text-sm md:text-base text-white placeholder:text-sky-200/40 dark:placeholder:text-white/25 focus:outline-none rounded-t-xl transition-all duration-300 font-sans`}
                                                    />
                                                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                                                        {usernameStatus === 'checking' && <Loader2 size={15} className="text-sky-300 dark:text-alpine-glacier animate-spin" />}
                                                        {usernameStatus === 'available' && <CheckCircle size={15} className="text-emerald-400" />}
                                                        {usernameStatus === 'taken' && <XCircle size={15} className="text-red-400" />}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Email */}
                                        <motion.div variants={staggerChild}>
                                            <label className="block text-[10px] sm:text-xs font-mono uppercase tracking-[0.18em] text-sky-200/70 dark:text-white/40 mb-1.5">Email Address</label>
                                            <div className="summit-input-line relative group">
                                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-200/50 dark:text-white/30 group-focus-within:text-sky-300 dark:group-focus-within:text-alpine-glacier transition-colors duration-300" size={16} />
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={e => setEmail(e.target.value)}
                                                    onBlur={() => setEmailTouched(true)}
                                                    placeholder={t('auth.email_placeholder')}
                                                    required
                                                    disabled={isLocked}
                                                    className={`w-full bg-black/20 dark:bg-white/[0.04] border-b ${
                                                        mode === 'signup' && emailTouched && !emailValid ? 'border-red-400' : 'border-white/15'
                                                    } py-3 sm:py-3.5 pl-10 pr-4 text-sm md:text-base text-white placeholder:text-sky-200/40 dark:placeholder:text-white/25 focus:outline-none rounded-t-xl transition-all duration-300 disabled:opacity-40 font-sans`}
                                                />
                                            </div>
                                        </motion.div>

                                        {/* Password */}
                                        <motion.div variants={staggerChild}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <label className="block text-[10px] sm:text-xs font-mono uppercase tracking-[0.18em] text-sky-200/70 dark:text-white/40">Password</label>
                                                {mode === 'login' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowForgotPassword(true)}
                                                        className="text-xs text-sky-300 dark:text-alpine-glacier hover:text-white font-medium tracking-wide hover:underline underline-offset-2 transition-colors"
                                                    >
                                                        Forgot password?
                                                    </button>
                                                )}
                                            </div>
                                            <div className="summit-input-line relative group">
                                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-200/50 dark:text-white/30 group-focus-within:text-sky-300 dark:group-focus-within:text-alpine-glacier transition-colors duration-300" size={16} />
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={password}
                                                    onChange={e => setPassword(e.target.value)}
                                                    onFocus={() => setPasswordFocused(true)}
                                                    onBlur={() => setPasswordFocused(password.length > 0)}
                                                    placeholder={t('auth.password_placeholder')}
                                                    required
                                                    disabled={isLocked}
                                                    className="w-full bg-black/20 dark:bg-white/[0.04] border-b border-white/15 py-3 sm:py-3.5 pl-10 pr-10 text-sm md:text-base text-white placeholder:text-sky-200/40 dark:placeholder:text-white/25 focus:outline-none rounded-t-xl transition-all duration-300 disabled:opacity-40 font-sans"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sky-200/50 dark:text-white/30 hover:text-white transition-colors"
                                                >
                                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </motion.div>

                                        {/* Altitude Strength Meter */}
                                        <AnimatePresence>
                                            {mode === 'signup' && passwordFocused && (
                                                <AltitudeStrengthMeter strength={pwdStrength} checks={pwdChecks} />
                                            )}
                                        </AnimatePresence>

                                        {/* Confirm Password (Signup Only) */}
                                        {mode === 'signup' && (
                                            <motion.div variants={staggerChild}>
                                                <label className="block text-[10px] sm:text-xs font-mono uppercase tracking-[0.18em] text-sky-200/70 dark:text-white/40 mb-1.5">Confirm Password</label>
                                                <div className="summit-input-line relative group">
                                                    <CheckCircle className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${confirmPassword.length > 0 && passwordsMatch ? 'text-emerald-400' : 'text-sky-200/50 dark:text-white/30 group-focus-within:text-sky-300 dark:group-focus-within:text-alpine-glacier'}`} size={16} />
                                                    <input
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        value={confirmPassword}
                                                        onChange={e => setConfirmPassword(e.target.value)}
                                                        placeholder={t('auth.confirm_password')}
                                                        required
                                                        className={`w-full bg-black/20 dark:bg-white/[0.04] border-b ${
                                                            confirmPassword.length > 0 && !passwordsMatch ? 'border-red-400' : confirmPassword.length > 0 && passwordsMatch ? 'border-emerald-400' : 'border-white/15'
                                                        } py-3 sm:py-3.5 pl-10 pr-10 text-sm md:text-base text-white placeholder:text-sky-200/40 dark:placeholder:text-white/25 focus:outline-none rounded-t-xl transition-all duration-300 font-sans`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sky-200/50 dark:text-white/30 hover:text-white transition-colors"
                                                    >
                                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Consent Checkbox (Signup Only) */}
                                        {mode === 'signup' && (
                                            <motion.label variants={staggerChild} className="flex items-start gap-2.5 cursor-pointer pt-1">
                                                <input
                                                    type="checkbox"
                                                    checked={consent}
                                                    onChange={e => setConsent(e.target.checked)}
                                                    className="mt-0.5 rounded border-white/20 text-sky-400 focus:ring-sky-400 cursor-pointer accent-sky-400"
                                                />
                                                <span className="text-xs text-sky-100/70 dark:text-white/50 leading-tight">{t('auth.consent')}</span>
                                            </motion.label>
                                        )}

                                        {/* ═══ SUBMIT BUTTON ═══ */}
                                        <motion.div variants={staggerChild}>
                                            <button
                                                type="submit"
                                                disabled={isLoading || isLocked}
                                                className={`group relative w-full py-3.5 sm:py-4 lg:py-4.5 rounded-xl sm:rounded-2xl font-serif font-bold text-sm sm:text-base lg:text-lg tracking-[0.12em] uppercase flex items-center justify-center gap-2.5 overflow-hidden transition-all duration-300 ${
                                                    isLocked
                                                        ? 'bg-white/10 text-amber-300/50 border border-white/10 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-[#08284C] via-[#103E70] to-[#08284C] border border-[#A3C9E2]/35 shadow-[0_12px_40px_rgba(8,40,76,0.5)] hover:border-[#C9A96E]/50 hover:shadow-[0_16px_50px_rgba(8,40,76,0.7)] active:scale-[0.98] text-white'
                                                }`}
                                                style={!isLocked ? { animation: 'summit-breathe 4s ease-in-out infinite' } : undefined}
                                            >
                                                {!isLocked && (
                                                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl sm:rounded-2xl">
                                                        <div
                                                            className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent"
                                                            style={{ animation: 'summit-shimmer 4s ease-in-out infinite' }}
                                                        />
                                                    </div>
                                                )}

                                                <span className="relative z-10 flex items-center gap-2.5">
                                                    {isLoading ? (
                                                        <Loader2 className="animate-spin" size={19} />
                                                    ) : isLocked ? (
                                                        <><Clock size={17} /><span>LOCKED ({fmtLock(lockCountdown)})</span></>
                                                    ) : (
                                                        <>
                                                            {mode === 'login' ? <Mountain size={18} className="text-[#C9A96E]" /> : <ArrowRight size={18} className="text-[#C9A96E] group-hover:translate-x-1 transition-transform" />}
                                                            <span>{mode === 'login' ? 'Enter the Summit' : 'Begin Ascent'}</span>
                                                        </>
                                                    )}
                                                </span>
                                            </button>
                                        </motion.div>

                                        {/* Demo Dashboard Button */}
                                        <motion.div variants={staggerChild}>
                                            <button
                                                type="button"
                                                onClick={handleDemo}
                                                disabled={isLoading || isLocked}
                                                className="group w-full py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-medium text-xs sm:text-sm flex items-center justify-center gap-2 border border-white/15 text-white/80 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/30 transition-all duration-300"
                                            >
                                                <Sparkles size={15} className="text-[#C9A96E] group-hover:scale-110 transition-transform" />
                                                <span>Explore Demo Dashboard</span>
                                            </button>
                                        </motion.div>

                                        {/* Mode Switch Footer Prompt */}
                                        <motion.div variants={staggerChild} className="text-center pt-3 sm:pt-4 border-t border-white/10">
                                            {mode === 'login' ? (
                                                <p className="text-xs sm:text-sm text-sky-100/70 dark:text-white/50">
                                                    Don't have an account?{' '}
                                                    <button
                                                        type="button"
                                                        onClick={() => switchMode('signup')}
                                                        className="font-bold text-sky-300 dark:text-alpine-glacier hover:text-white hover:underline underline-offset-2 transition-all ml-1"
                                                    >
                                                        Create an Account →
                                                    </button>
                                                </p>
                                            ) : (
                                                <p className="text-xs sm:text-sm text-sky-100/70 dark:text-white/50">
                                                    Already have an account?{' '}
                                                    <button
                                                        type="button"
                                                        onClick={() => switchMode('login')}
                                                        className="font-bold text-sky-300 dark:text-alpine-glacier hover:text-white hover:underline underline-offset-2 transition-all ml-1"
                                                    >
                                                        Sign In to Summit →
                                                    </button>
                                                </p>
                                            )}
                                        </motion.div>
                                    </motion.div>
                                </motion.form>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* ═══ LAYER 9b: Summit Coordinates & Security Badge ═══ */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="flex items-center justify-center gap-3 mt-6 text-[10px] sm:text-xs font-mono tracking-wide text-sky-200/50 dark:text-white/20"
                    >
                        <span className="hidden sm:inline">⌖ {coord.lat}, {coord.lon}</span>
                        <span className="hidden sm:inline">·</span>
                        <span className="flex items-center gap-1">
                            <Shield size={12} className="text-sky-300/60 dark:text-alpine-glacier/40" />
                            AES-256
                        </span>
                        <span>·</span>
                        <span>{coord.name}</span>
                    </motion.div>
                </motion.div>
            </div>

            {/* ═══ BOTTOM FOOTER ═══ */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="w-full text-center text-[10px] sm:text-xs text-sky-200/40 dark:text-white/15 z-10 relative py-4 font-mono tracking-wider"
            >
                © {new Date().getFullYear()} Mountaineer Mallu. All rights reserved.
            </motion.div>

            <ForgotPasswordModal isOpen={showForgotPassword} onClose={() => setShowForgotPassword(false)} />
        </div>
    );
};
