import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
    motion, AnimatePresence, useMotionValue, useSpring, useTransform,
    type MotionValue,
} from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, CheckCircle, Check, AlertCircle, XCircle, Eye, EyeOff, Sparkles, ArrowRight, ArrowLeft, Clock, Flag, ShieldCheck, CloudSun } from 'lucide-react';
import { Loader2 } from '../ui/BrandLoader';
import { GoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';
import { DynamicLogo } from '../ui/DynamicLogo';
import { useAuthStore } from '../../store/useAuthStore';
import { useStore } from '../../store/useStore';
import { authApi } from '../../lib/api';
import { peaksData, daySlides, nightSlides, getHeroImageUrl } from '../../data/peaks';
import { PhotoSlideshow, type SlideshowImage } from '../ui/PhotoSlideshow';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface AuthHubProps {
    initialMode: 'login' | 'signup';
}

type Mode = 'login' | 'signup';

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const QUOTES = [
    { text: 'The summit is optional. Coming home is mandatory.', by: 'Ed Viesturs' },
    { text: 'It is not the mountain we conquer, but ourselves.', by: 'Sir Edmund Hillary' },
    { text: 'Climb the mountain so you can see the world, not so the world can see you.', by: 'David McCullough Jr.' },
];

const CAMP_TICKS = ['Base', 'I', 'II', 'III', 'Summit'];

/* ═══════════════════════════════════════════════════════════════
   Ascent meter — the form's progress as a climb to the summit.
   Driven entirely by motion values (no re-renders while it moves).
   ═══════════════════════════════════════════════════════════════ */
const AscentMeter: React.FC<{
    progress: MotionValue<number>;
    altitude: MotionValue<string>;
    summit: string;
    tone?: 'onImage' | 'surface';
}> = ({ progress, altitude, summit, tone = 'onImage' }) => {
    const width = useTransform(progress, v => `${Math.max(0, Math.min(1, v)) * 100}%`);
    const onImage = tone === 'onImage';
    return (
        <div className="w-full" aria-hidden="true">
            <div className={`flex items-end justify-between mb-3 font-mono text-[10px] uppercase tracking-[0.28em] ${onImage ? 'text-white/60' : 'text-alpine-navy/50 dark:text-white/45'}`}>
                <span>Ascent</span>
                <span className={onImage ? 'text-white' : 'text-alpine-navy dark:text-white'}>
                    <motion.span className="tabular-nums">{altitude}</motion.span>
                    <span className="opacity-60"> / {summit}</span>
                </span>
            </div>
            <div className={`relative h-[3px] rounded-full ${onImage ? 'bg-white/15' : 'bg-alpine-navy/10 dark:bg-white/10'}`}>
                <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-alpine-glacier via-alpine-sunrise to-alpine-gold"
                    style={{ width }}
                />
                <motion.div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_0_4px_rgba(226,160,113,0.28),0_0_18px_rgba(226,160,113,0.9)]"
                    style={{ left: width }}
                />
                {CAMP_TICKS.map((_, i) => (
                    <span
                        key={i}
                        className={`absolute top-1/2 -translate-y-1/2 w-[3px] h-[9px] rounded-full ${onImage ? 'bg-white/35' : 'bg-alpine-navy/20 dark:bg-white/25'}`}
                        style={{ left: `${(i / (CAMP_TICKS.length - 1)) * 100}%` }}
                    />
                ))}
            </div>
            <div className={`flex justify-between mt-2.5 font-mono text-[9px] uppercase tracking-[0.2em] ${onImage ? 'text-white/45' : 'text-alpine-navy/40 dark:text-white/35'}`}>
                {CAMP_TICKS.map(c => <span key={c}>{c}</span>)}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════
   Cinematic photo slideshow (crossfade + Ken Burns drift)
   ═══════════════════════════════════════════════════════════════ */
const AuthPhoto: React.FC<{ slides: SlideshowImage[]; showProgress?: boolean }> = React.memo(({ slides, showProgress }) => (
    <div className="absolute inset-0 overflow-hidden bg-[#0B1626]">
        <PhotoSlideshow slides={slides} interval={6500} showProgress={showProgress} priority />
        <div className="absolute inset-0 bg-gradient-to-b from-[#06101E]/55 via-transparent via-35% to-[#06101E]/90 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06101E]/40 to-transparent pointer-events-none" />
    </div>
));

/* ═══════════════════════════════════════════════════════════════
   Floating-label field (theme-aware via CSS variables)
   ═══════════════════════════════════════════════════════════════ */
const Field: React.FC<{
    id: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    state?: 'error' | 'success';
    trailing?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>> = ({ id, label, icon: Icon, state, trailing, ...input }) => (
    <div className="ascent-field" data-state={state}>
        <Icon size={17} className="ascent-icon" aria-hidden="true" />
        <input id={id} placeholder=" " {...input} />
        <label htmlFor={id}>{label}</label>
        {trailing && <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">{trailing}</div>}
    </div>
);

/* ═══════════════════════════════════════════════════════════════
   Password strength — five camps to the summit
   ═══════════════════════════════════════════════════════════════ */
const CAMPS = [
    { key: 'length', label: '8+ chars', camp: 'Base Camp' },
    { key: 'lowercase', label: 'a–z', camp: 'Camp I' },
    { key: 'uppercase', label: 'A–Z', camp: 'Camp II' },
    { key: 'number', label: '0–9', camp: 'Camp III' },
    { key: 'special', label: '#!?', camp: 'Summit' },
] as const;

const AltitudeStrengthMeter: React.FC<{ strength: number; checks: Record<string, boolean> }> = ({ strength, checks }) => {
    const reached = strength === 0 ? 'Trailhead' : CAMPS[strength - 1].camp;
    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden"
        >
            <div className="pt-3 pb-0.5">
                <div className="flex items-center justify-between mb-2 text-[10px] font-mono uppercase tracking-[0.2em]">
                    <span className="text-alpine-navy/45 dark:text-white/45">Password strength</span>
                    <span className={strength === 5 ? 'text-[#9A5E43] dark:text-alpine-gold' : 'text-alpine-blue dark:text-alpine-glacier'}>
                        {strength === 5 ? 'Summit reached' : reached}
                    </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                    {CAMPS.map((c, i) => (
                        <div key={c.key} className="h-1 rounded-full bg-alpine-navy/10 dark:bg-white/10 overflow-hidden">
                            <div
                                className="h-full w-full origin-left rounded-full transition-transform duration-500"
                                style={{
                                    transform: `scaleX(${i < strength ? 1 : 0})`,
                                    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                                    background: strength === 5 ? 'linear-gradient(90deg,#E2A071,#C9A96E)' : '#4A6A8C',
                                }}
                            />
                        </div>
                    ))}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {CAMPS.map(c => {
                        const met = checks[c.key];
                        return (
                            <span
                                key={c.key}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border transition-colors duration-300 ${
                                    met
                                        ? 'border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/40 dark:text-emerald-300'
                                        : 'border-alpine-navy/10 text-alpine-navy/45 dark:border-white/10 dark:text-white/40'
                                }`}
                            >
                                {met ? <Check size={10} /> : <span className="w-2.5 text-center">·</span>}
                                {c.label}
                            </span>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};

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

const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
    useEffect(() => {
        const mq = window.matchMedia(query);
        const onChange = () => setMatches(mq.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, [query]);
    return matches;
};

// Signup-only rows expand/collapse in place instead of remounting the form
const Reveal: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.38, ease: EASE }}
        className="overflow-hidden"
    >
        <div className="pb-3.5">{children}</div>
    </motion.div>
);

// Staggered entrance for the form column
const column = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};
const rise = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

/* ═══════════════════════════════════════════════════════════════
   SUMMIT ATELIER — MAIN AUTH COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export const AuthHub: React.FC<AuthHubProps> = ({ initialMode }) => {
    const [mode, setMode] = useState<Mode>(initialMode);
    const navigate = useNavigate();
    const { t } = useTranslation();
    const weather = useStore(s => s.weather);
    const theme = useStore(s => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const isDesktop = useMediaQuery('(min-width: 1024px)');
    // Google's iframe needs an explicit pixel width (max 400); fit it to the form column
    const googleWidth = useMemo(() => (typeof window === 'undefined' ? 400 : Math.min(400, window.innerWidth - 48)), []);

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
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [emailTouched, setEmailTouched] = useState(false);

    const [lockCountdown, setLockCountdown] = useState(0);
    const [, setLockedUntil] = useState<string | null>(null);

    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
    const usernameTimerRef = useRef<NodeJS.Timeout | null>(null);
    const successTimerRef = useRef<NodeJS.Timeout | null>(null);

    const { loginAsync, signupAsync, loginWithGoogleAsync, demoLoginAsync } = useAuthStore();

    // ─── Rotating mountaineering quote ─────────────────────────
    const [quoteIndex, setQuoteIndex] = useState(0);
    useEffect(() => {
        const iv = setInterval(() => setQuoteIndex(i => (i + 1) % QUOTES.length), 7000);
        return () => clearInterval(iv);
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

    useEffect(() => () => {
        if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current);
        if (successTimerRef.current) clearTimeout(successTimerRef.current);
    }, []);

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

    // ─── Ascent progress: how far up the route the form is ─────
    const formProgress = useMemo(() => {
        if (isSuccess) return 1;
        if (mode === 'login') {
            return ((isValidEmail(email) ? 1 : 0) + (password.length > 0 ? 1 : 0)) / 2 * 0.92;
        }
        const steps = [
            name.length >= 2 && usernameStatus !== 'taken' ? 1 : 0,
            isValidEmail(email) ? 1 : 0,
            pwdStrength / 5,
            confirmPassword.length > 0 && password === confirmPassword ? 1 : 0,
            consent ? 1 : 0,
        ];
        return steps.reduce((a, b) => a + b, 0) / steps.length * 0.92;
    }, [isSuccess, mode, email, password, name, usernameStatus, pwdStrength, confirmPassword, consent]);

    const progressTarget = useMotionValue(0);
    const progress = useSpring(progressTarget, { stiffness: 55, damping: 18, restDelta: 0.0005 });
    useEffect(() => { progressTarget.set(formProgress); }, [formProgress, progressTarget]);

    const objective = useMemo(() => {
        const d = new Date();
        return peaksData[(d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()) % Math.min(4, peaksData.length)];
    }, []);
    const objectiveElevation = parseInt(objective.elevation.replace(/[^0-9]/g, ''), 10) || 4478;
    const altitude = useTransform(progress, v => `${Math.round(v * objectiveElevation).toLocaleString()} m`);

    // Five photos per theme: daytime peaks in light mode, night skies in dark mode
    const slides = useMemo(
        () => (isDark ? nightSlides : daySlides).map(s => ({ ...s, src: getHeroImageUrl(s.src) })),
        [isDark]
    );

    // ─── Navigation ────────────────────────────────────────────
    const goPost = (user: any) => {
        // Brief summit moment so the success state is felt, then route on
        setIsSuccess(true);
        successTimerRef.current = setTimeout(() => {
            if (!user.isProfileComplete) navigate('/profile-complete', { replace: true });
            else if (['Admin', 'SuperAdmin'].includes(user.role)) navigate('/summit-control-panel', { replace: true });
            else navigate('/portal', { replace: true });
        }, 650);
    };

    // ─── Submit ────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLocked || isLoading) return;
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
        if (isLocked || isLoading) return;
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
    const switchMode = (m: Mode) => {
        if (m === mode) return;
        setError('');
        setMode(m);
        window.history.replaceState(null, '', m === 'login' ? '/login' : '/signup');
    };

    const goBack = () => {
        if (window.history.length > 1) navigate(-1);
        else navigate('/');
    };

    const busy = isLoading || isSuccess;
    const quote = QUOTES[quoteIndex];

    /* ─── Form column (shared by desktop and the mobile sheet) ─── */
    const formColumn = (
        <motion.div variants={column} initial="hidden" animate="show" className="w-full max-w-[420px] mx-auto">
            {/* Heading */}
            <motion.div variants={rise} className="mb-8">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={mode}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.28, ease: EASE }}
                    >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#9A5E43] dark:text-alpine-sunrise mb-4 flex items-center gap-3">
                            <span className="w-6 h-px bg-current opacity-60" />
                            {mode === 'login' ? 'Members' : 'New expedition'}
                        </p>
                        <h1 className="font-serif text-[2.4rem] sm:text-[2.9rem] leading-[1.02] tracking-tight text-alpine-navy dark:text-alpine-snow">
                            {mode === 'login' ? <>Welcome <em className="font-normal italic text-alpine-blue dark:text-alpine-glacier">back</em>.</> : <>Begin your <em className="font-normal italic text-alpine-blue dark:text-alpine-glacier">ascent</em>.</>}
                        </h1>
                        <p className="mt-3.5 text-[15px] leading-relaxed text-alpine-navy/60 dark:text-white/55">
                            {mode === 'login'
                                ? 'Sign in to your expeditions, events and crew.'
                                : "Join Kerala's alpine circle across Europe — it takes a minute."}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {/* Segmented switcher */}
            <motion.div
                variants={rise}
                role="tablist"
                aria-label="Authentication mode"
                className="relative grid grid-cols-2 p-1 rounded-full bg-alpine-navy/[0.05] dark:bg-white/[0.05] border border-alpine-navy/[0.06] dark:border-white/[0.08] mb-7"
            >
                {(['login', 'signup'] as const).map(m => (
                    <button
                        key={m}
                        type="button"
                        role="tab"
                        aria-selected={mode === m}
                        onClick={() => switchMode(m)}
                        className={`relative py-2.5 rounded-full text-[13px] font-semibold tracking-wide transition-colors duration-300 ${
                            mode === m ? 'text-alpine-navy dark:text-alpine-navy' : 'text-alpine-navy/55 hover:text-alpine-navy dark:text-white/55 dark:hover:text-white'
                        }`}
                    >
                        {mode === m && (
                            <motion.span
                                layoutId="auth-mode-pill"
                                className="absolute inset-0 rounded-full bg-white dark:bg-alpine-snow shadow-[0_1px_2px_rgba(8,40,76,0.08),0_6px_20px_-8px_rgba(8,40,76,0.35)]"
                                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                            />
                        )}
                        <span className="relative">{m === 'login' ? 'Sign in' : 'Create account'}</span>
                    </button>
                ))}
            </motion.div>

            {/* Lockout */}
            <AnimatePresence>
                {isLocked && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="rounded-2xl border border-amber-600/25 bg-amber-500/10 text-amber-900 dark:text-amber-200 p-4 mb-5 text-sm">
                            <div className="flex items-center gap-2 mb-1 font-semibold">
                                <Clock size={16} /> Account cooldown
                            </div>
                            <p className="opacity-80 text-xs">Too many attempts. Try again in <span className="font-mono font-bold">{fmtLock(lockCountdown)}</span>.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error */}
            <AnimatePresence>
                {error && !isLocked && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto', x: [0, -6, 6, -3, 3, 0] }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4, ease: EASE }}
                        className="overflow-hidden"
                        role="alert"
                    >
                        <div className="rounded-2xl border border-red-500/25 bg-red-500/[0.08] text-red-700 dark:text-red-200 p-3.5 mb-5 flex items-center gap-2.5 text-sm">
                            <AlertCircle size={16} className="flex-shrink-0" />
                            <p className="leading-snug">{error}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Google */}
            <motion.div variants={rise} className="w-full min-h-[44px] flex justify-center">
                <GoogleLogin
                    onSuccess={handleGoogle}
                    onError={() => setError('Google Authentication Failed')}
                    theme={isDark ? 'filled_black' : 'outline'}
                    size="large"
                    shape="pill"
                    width={String(googleWidth)}
                    text={mode === 'login' ? 'continue_with' : 'signup_with'}
                />
            </motion.div>

            <motion.div variants={rise} className="flex items-center gap-4 my-6" aria-hidden="true">
                <div className="flex-1 h-px bg-alpine-navy/10 dark:bg-white/10" />
                <span className="text-[10px] uppercase tracking-[0.3em] text-alpine-navy/40 dark:text-white/35">or with email</span>
                <div className="flex-1 h-px bg-alpine-navy/10 dark:bg-white/10" />
            </motion.div>

            {/* ═══ FORM — one persistent form; signup rows expand in place ═══ */}
            <motion.form variants={rise} onSubmit={handleSubmit} noValidate={mode === 'signup'}>
                <AnimatePresence initial={false}>
                    {mode === 'signup' && (
                        <Reveal key="username">
                            <Field
                                id="auth-username"
                                label={t('auth.username_placeholder')}
                                icon={User}
                                type="text"
                                autoComplete="username"
                                value={name}
                                onChange={handleNameChange}
                                required
                                minLength={2}
                                maxLength={100}
                                state={usernameStatus === 'taken' ? 'error' : usernameStatus === 'available' ? 'success' : undefined}
                                trailing={
                                    usernameStatus === 'checking' ? <Loader2 size={16} className="text-alpine-blue dark:text-alpine-glacier animate-spin" />
                                        : usernameStatus === 'available' ? <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400" />
                                            : usernameStatus === 'taken' ? <XCircle size={16} className="text-red-500 dark:text-red-400" /> : null
                                }
                            />
                            {usernameStatus === 'taken' && <p className="mt-1.5 ml-1 text-xs text-red-600 dark:text-red-300">That username is already claimed.</p>}
                        </Reveal>
                    )}
                </AnimatePresence>

                <div className="pb-3.5">
                    <Field
                        id="auth-email"
                        label={t('auth.email_placeholder')}
                        icon={Mail}
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onBlur={() => setEmailTouched(true)}
                        required
                        disabled={isLocked}
                        state={mode === 'signup' && emailTouched && !emailValid ? 'error' : undefined}
                    />
                </div>

                <div className="pb-3.5">
                    <Field
                        id="auth-password"
                        label={t('auth.password_placeholder')}
                        icon={Lock}
                        type={showPassword ? 'text' : 'password'}
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(password.length > 0)}
                        required
                        disabled={isLocked}
                        trailing={
                            <button
                                type="button"
                                onClick={() => setShowPassword(v => !v)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                className="p-1 rounded-md text-alpine-navy/40 hover:text-alpine-navy dark:text-white/45 dark:hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        }
                    />
                    <AnimatePresence initial={false}>
                        {mode === 'login' && (
                            <motion.div
                                key="forgot"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3, ease: EASE }}
                                className="overflow-hidden flex justify-end"
                            >
                                <button
                                    type="button"
                                    onClick={() => setShowForgotPassword(true)}
                                    className="mt-2.5 text-[13px] text-alpine-blue hover:text-alpine-navy dark:text-alpine-glacier dark:hover:text-white underline-offset-4 hover:underline transition-colors"
                                >
                                    {t('auth.forgot_password')}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <AnimatePresence>
                        {mode === 'signup' && (passwordFocused || password.length > 0) && (
                            <AltitudeStrengthMeter strength={pwdStrength} checks={pwdChecks} />
                        )}
                    </AnimatePresence>
                </div>

                <AnimatePresence initial={false}>
                    {mode === 'signup' && (
                        <Reveal key="confirm">
                            <Field
                                id="auth-confirm"
                                label={t('auth.confirm_password')}
                                icon={CheckCircle}
                                type={showConfirmPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                                state={confirmPassword.length > 0 ? (passwordsMatch ? 'success' : 'error') : undefined}
                                trailing={
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(v => !v)}
                                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                        className="p-1 rounded-md text-alpine-navy/40 hover:text-alpine-navy dark:text-white/45 dark:hover:text-white transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                }
                            />
                        </Reveal>
                    )}
                    {mode === 'signup' && (
                        <Reveal key="consent">
                            <label className="flex items-start gap-3 cursor-pointer select-none group">
                                <input
                                    type="checkbox"
                                    checked={consent}
                                    onChange={e => setConsent(e.target.checked)}
                                    className="peer sr-only"
                                />
                                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border border-alpine-navy/25 dark:border-white/25 bg-white dark:bg-white/[0.04] grid place-items-center transition-colors peer-checked:bg-alpine-navy peer-checked:border-alpine-navy dark:peer-checked:bg-alpine-glacier dark:peer-checked:border-alpine-glacier peer-focus-visible:ring-2 peer-focus-visible:ring-alpine-blue/50">
                                    <motion.span
                                        initial={false}
                                        animate={{ scale: consent ? 1 : 0, opacity: consent ? 1 : 0 }}
                                        transition={{ type: 'spring', stiffness: 600, damping: 30 }}
                                    >
                                        <Check size={13} strokeWidth={3} className="text-white dark:text-alpine-navy" />
                                    </motion.span>
                                </span>
                                <span className="text-xs leading-relaxed text-alpine-navy/60 dark:text-white/55">{t('auth.consent')}</span>
                            </label>
                        </Reveal>
                    )}
                </AnimatePresence>

                {/* Submit */}
                <motion.button
                    type="submit"
                    disabled={busy || isLocked}
                    whileHover={!busy && !isLocked ? { y: -1 } : undefined}
                    whileTap={!busy && !isLocked ? { scale: 0.985 } : undefined}
                    className={`ascent-cta group mt-3 w-full h-[54px] rounded-full font-semibold text-[15px] tracking-wide flex items-center justify-center gap-2.5 transition-[box-shadow,background-color,opacity] duration-300 ${
                        isLocked
                            ? 'bg-alpine-navy/10 text-alpine-navy/40 dark:bg-white/10 dark:text-white/40 cursor-not-allowed'
                            : isSuccess
                                ? 'bg-emerald-600 text-white dark:bg-emerald-400 dark:text-alpine-navy shadow-[0_14px_40px_-12px_rgba(16,185,129,0.6)]'
                                : 'bg-alpine-navy text-white shadow-[0_14px_34px_-14px_rgba(8,40,76,0.7)] hover:shadow-[0_18px_44px_-14px_rgba(8,40,76,0.8)] dark:bg-gradient-to-r dark:from-[#E2A071] dark:via-[#D9A88C] dark:to-[#C9A96E] dark:text-alpine-navy dark:shadow-[0_14px_40px_-12px_rgba(226,160,113,0.6)] disabled:opacity-80'
                    }`}
                >
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                            key={isSuccess ? 'ok' : isLoading ? 'busy' : isLocked ? 'locked' : mode}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2, ease: EASE }}
                            className="flex items-center gap-2.5"
                        >
                            {isSuccess ? (
                                <><Flag size={18} /> Summit reached</>
                            ) : isLoading ? (
                                <><Loader2 size={18} className="animate-spin" /> Ascending…</>
                            ) : isLocked ? (
                                <><Clock size={17} /> Locked · {fmtLock(lockCountdown)}</>
                            ) : (
                                <>
                                    {mode === 'login' ? 'Sign in' : 'Create account'}
                                    <ArrowRight size={18} className="text-alpine-sunrise dark:text-alpine-navy transition-transform duration-300 group-hover:translate-x-1" />
                                </>
                            )}
                        </motion.span>
                    </AnimatePresence>
                </motion.button>

                <button
                    type="button"
                    onClick={handleDemo}
                    disabled={busy || isLocked}
                    className="group mt-3 w-full h-12 rounded-full text-sm font-medium flex items-center justify-center gap-2 text-alpine-navy/70 hover:text-alpine-navy hover:bg-alpine-navy/[0.04] dark:text-white/70 dark:hover:text-white dark:hover:bg-white/[0.05] transition-colors disabled:opacity-50"
                >
                    <Sparkles size={15} className="text-[#9A5E43] dark:text-alpine-gold transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                    Explore the demo dashboard
                </button>
            </motion.form>

            <motion.p variants={rise} className="mt-7 text-center text-sm text-alpine-navy/55 dark:text-white/50">
                {mode === 'login' ? 'New to Mountaineer Mallu?' : 'Already a member?'}{' '}
                <button
                    type="button"
                    onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                    className="font-semibold text-alpine-navy dark:text-alpine-snow underline decoration-alpine-sunrise/60 underline-offset-4 hover:decoration-alpine-sunrise transition-colors"
                >
                    {mode === 'login' ? 'Create an account' : 'Sign in'}
                </button>
            </motion.p>
        </motion.div>
    );

    const footer = (
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-alpine-navy/40 dark:text-white/30">
            <span className="flex items-center gap-1.5"><ShieldCheck size={13} /> Encrypted, GDPR-compliant</span>
            <span aria-hidden="true">·</span>
            <span>© {new Date().getFullYear()} Mountaineer Mallu</span>
        </div>
    );

    return (
        <div className="atelier relative min-h-screen w-full bg-[#F7F4EF] dark:bg-[#070B12] text-alpine-navy dark:text-alpine-snow selection:bg-alpine-sunrise/30">
            {isDesktop ? (
                <div className="grid grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] min-h-screen">
                    {/* ═══ LEFT: CINEMATIC PANEL ═══ */}
                    <motion.aside
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="sticky top-0 h-screen p-3"
                    >
                        <div className="relative h-full rounded-[1.75rem] overflow-hidden">
                            <AuthPhoto slides={slides} showProgress />
                            <div className="relative h-full flex flex-col justify-between p-10 xl:p-12 pt-12 xl:pt-14 text-white">
                                <div className="flex items-center justify-between">
                                    <button type="button" onClick={() => navigate('/')} aria-label="Mountaineer Mallu home" className="rounded-xl">
                                        <DynamicLogo className="h-10" showText forceWhiteText />
                                    </button>
                                    {weather.temp !== null && (
                                        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-[11px] text-white/85">
                                            <CloudSun size={13} />
                                            {weather.temp.toFixed(1)}°C{weather.condition ? ` · ${weather.condition}` : ''}
                                        </div>
                                    )}
                                </div>

                                <div className="max-w-xl">
                                    <p className="text-[11px] uppercase tracking-[0.32em] text-alpine-gold mb-5">
                                        Today's objective · {objective.name}, {objective.elevation}
                                    </p>
                                    <div className="min-h-[9.5rem] xl:min-h-[11rem]">
                                        <AnimatePresence mode="wait">
                                            <motion.blockquote
                                                key={quoteIndex}
                                                initial={{ opacity: 0, y: 14 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.8, ease: EASE }}
                                            >
                                                <p className="font-serif italic text-[2.1rem] xl:text-[2.6rem] leading-[1.15] tracking-tight [text-shadow:0_2px_24px_rgba(0,0,0,0.35)]">
                                                    “{quote.text}”
                                                </p>
                                                <footer className="mt-4 text-sm text-white/65">— {quote.by}</footer>
                                            </motion.blockquote>
                                        </AnimatePresence>
                                    </div>
                                    <div className="mt-10">
                                        <AscentMeter progress={progress} altitude={altitude} summit={objective.elevation} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.aside>

                    {/* ═══ RIGHT: FORM SURFACE ═══ */}
                    <main className="relative min-w-0 flex flex-col min-h-screen px-10 xl:px-16 py-8 overflow-hidden">
                        <div className="atelier-glow" aria-hidden="true" />
                        <div className="relative flex items-center justify-between">
                            <button
                                type="button"
                                onClick={goBack}
                                className="group inline-flex items-center gap-2 text-sm text-alpine-navy/60 hover:text-alpine-navy dark:text-white/60 dark:hover:text-white transition-colors"
                            >
                                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
                                Back to site
                            </button>
                            <span className="text-[11px] uppercase tracking-[0.3em] text-alpine-navy/35 dark:text-white/30">Mountaineer Mallu</span>
                        </div>
                        <div className="relative flex-1 flex items-center py-10">{formColumn}</div>
                        <div className="relative">{footer}</div>
                    </main>
                </div>
            ) : (
                /* ═══ MOBILE / TABLET: photo header + rising sheet ═══ */
                <div className="relative min-h-screen">
                    <div className="relative h-[34vh] min-h-[240px] sm:h-[38vh]">
                        <AuthPhoto slides={slides} />
                        <div className="relative h-full flex flex-col justify-between px-5 sm:px-8 pt-5 pb-14 text-white">
                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={goBack}
                                    aria-label="Back"
                                    className="w-10 h-10 rounded-full grid place-items-center bg-white/15 border border-white/20 backdrop-blur-md"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                <button type="button" onClick={() => navigate('/')} aria-label="Mountaineer Mallu home">
                                    <DynamicLogo className="h-8" showText forceWhiteText />
                                </button>
                            </div>
                            <AscentMeter progress={progress} altitude={altitude} summit={objective.elevation} />
                        </div>
                    </div>
                    <motion.main
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.7, ease: EASE }}
                        className="relative -mt-8 rounded-t-[2rem] bg-[#F7F4EF] dark:bg-[#070B12] px-6 sm:px-10 pt-9 pb-8 shadow-[0_-20px_40px_-20px_rgba(0,0,0,0.35)]"
                    >
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-alpine-navy/15 dark:bg-white/15" aria-hidden="true" />
                        {formColumn}
                        <div className="mt-10">{footer}</div>
                    </motion.main>
                </div>
            )}

            <ForgotPasswordModal isOpen={showForgotPassword} onClose={() => setShowForgotPassword(false)} />
        </div>
    );
};
