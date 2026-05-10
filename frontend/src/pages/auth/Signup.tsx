import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, CheckCircle, Loader2, AlertCircle, XCircle, Shield } from 'lucide-react';
import { BackButton } from '../../components/ui/BackButton';
import { GoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';
import { DynamicLogo } from '../../components/ui/DynamicLogo';
import { useAuthStore } from '../../store/useAuthStore';
import { authApi } from '../../lib/api';

// Broadened password validation — matches backend policy
const validatePassword = (pwd: string) => {
    return {
        length: pwd.length >= 8,
        uppercase: /[A-Z]/.test(pwd),
        lowercase: /[a-z]/.test(pwd),
        number: /\d/.test(pwd),
        special: /[^a-zA-Z0-9\s]/.test(pwd)
    };
};

const calculateStrength = (checks: ReturnType<typeof validatePassword>) => {
    return Object.values(checks).filter(Boolean).length;
};

// Email format validation
const isValidEmail = (email: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

export const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [consent, setConsent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [passwordFocused, setPasswordFocused] = useState(false);

    // Username availability state
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
    const usernameTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Email validation state
    const [emailTouched, setEmailTouched] = useState(false);

    const { signupAsync, loginWithGoogleAsync } = useAuthStore();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const pwdChecks = validatePassword(password);
    const pwdStrength = calculateStrength(pwdChecks);
    const isPasswordValid = pwdStrength === 5;

    // Debounced username availability check
    const checkUsernameAvailability = useCallback((username: string) => {
        if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current);

        if (!username || username.length < 2) {
            setUsernameStatus('idle');
            return;
        }

        setUsernameStatus('checking');
        usernameTimerRef.current = setTimeout(async () => {
            try {
                const result = await authApi.checkUsername(username);
                setUsernameStatus(result.available ? 'available' : 'taken');
            } catch {
                setUsernameStatus('idle');
            }
        }, 500); // 500ms debounce
    }, []);

    useEffect(() => {
        return () => { if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current); };
    }, []);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setName(value);
        checkUsernameAvailability(value);
    };

    // Strength styling
    const strengthConfig = [
        { color: 'bg-red-500', glow: 'rgba(239,68,68,0.3)', width: '0%', text: 'Very Weak' },
        { color: 'bg-red-400', glow: 'rgba(248,113,113,0.3)', width: '20%', text: 'Weak' },
        { color: 'bg-orange-400', glow: 'rgba(251,146,60,0.3)', width: '40%', text: 'Fair' },
        { color: 'bg-yellow-400', glow: 'rgba(250,204,21,0.3)', width: '60%', text: 'Good' },
        { color: 'bg-alpine-glacier', glow: 'rgba(67,176,241,0.3)', width: '80%', text: 'Strong' },
        { color: 'bg-green-500', glow: 'rgba(34,197,94,0.3)', width: '100%', text: 'Excellent' }
    ];

    const currentStrength = strengthConfig[pwdStrength];
    const emailValid = emailTouched ? isValidEmail(email) : true;
    const passwordsMatch = confirmPassword.length > 0 ? password === confirmPassword : true;

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (usernameStatus === 'taken') {
            setError("This username is already taken. Please choose another one.");
            return;
        }
        if (!isValidEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }
        if (!isPasswordValid) {
            setError("Please meet all password requirements before continuing.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (!consent) {
            setError("Please consent to GDPR communications.");
            return;
        }

        setIsLoading(true);

        try {
            await signupAsync(name, email, password, consent);
            navigate('/profile-complete', { replace: true });
        } catch (err: any) {
            setError(err.message || 'Signup failed. Please try again.');
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setIsLoading(true);
        setError('');
        try {
            await loginWithGoogleAsync(credentialResponse.credential);
            navigate('/profile-complete', { replace: true });
        } catch (err: any) {
            setError(err.message || 'Google authentication failed.');
            setIsLoading(false);
        }
    };

    const RequirementItem = ({ fulfilled, text }: { fulfilled: boolean, text: string }) => (
        <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="flex items-center gap-2 text-xs"
        >
            {fulfilled ? (
                <CheckCircle size={14} className="text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]" />
            ) : (
                <XCircle size={14} className="text-white/30" />
            )}
            <span className={fulfilled ? "text-green-100" : "text-white/40"}>{text}</span>
        </motion.div>
    );

    // Username status icon
    const UsernameStatusIcon = () => {
        if (usernameStatus === 'checking') return <Loader2 size={16} className="text-alpine-glacier/60 animate-spin" />;
        if (usernameStatus === 'available') return <CheckCircle size={16} className="text-green-400" />;
        if (usernameStatus === 'taken') return <XCircle size={16} className="text-red-400" />;
        return null;
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-bl from-alpine-navy via-alpine-navy/95 to-alpine-forest/20 py-12">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-alpine-glacier/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-alpine-snow/5 rounded-full blur-[100px]" />
            </div>

            {/* Navigation Controls */}
            <div className="absolute top-6 left-6 md:top-8 md:left-8 z-50">
                <BackButton />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md z-10 p-8 m-4 rounded-3xl glass-dark border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl relative overflow-hidden"
            >
                {/* Premium gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                <div className="flex justify-center mb-6 relative">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/10 p-2 rounded-2xl backdrop-blur-md inline-block shadow-inner ring-1 ring-white/20"
                    >
                        <DynamicLogo className="h-10" showText={false} />
                    </motion.div>
                </div>

                <div className="text-center mb-8 relative">
                    <h1 className="text-2xl font-bold text-white mb-2 tracking-wide font-serif">{t('auth.signup_title')}</h1>
                    <p className="text-white/60 text-sm">{t('auth.signup_subtitle')}</p>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: -10 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -10 }}
                            className="bg-red-500/10 border border-red-500/30 text-red-200 rounded-xl p-4 mb-6 flex items-center gap-3 text-sm backdrop-blur-sm shadow-[0_0_15px_rgba(239,68,68,0.1)] overflow-hidden"
                        >
                            <AlertCircle size={18} className="flex-shrink-0" />
                            <p className="leading-relaxed">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mb-6 flex justify-center relative">
                    <div className="w-full relative z-20 transition-transform hover:scale-[1.02] duration-300">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google Signup Failed')}
                            theme="filled_black"
                            size="large"
                            shape="pill"
                            width="100%"
                            text="signup_with"
                        />
                    </div>
                </div>

                <div className="relative flex items-center mb-6">
                    <div className="flex-grow border-t border-white/10"></div>
                    <span className="flex-shrink-0 mx-4 text-white/40 text-xs font-medium uppercase tracking-wider">or sign up with email</span>
                    <div className="flex-grow border-t border-white/10"></div>
                </div>

                <form onSubmit={handleSignup} className="space-y-4 relative">
                    <div className="space-y-4">
                        {/* Username with availability check */}
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-alpine-glacier transition-colors duration-300" size={18} />
                            <input
                                type="text"
                                value={name}
                                onChange={handleNameChange}
                                placeholder={t('auth.username_placeholder')}
                                required
                                minLength={2}
                                maxLength={100}
                                className={`w-full bg-black/30 border rounded-xl py-3.5 pl-12 pr-12 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50 transition-all duration-300 shadow-inner ${
                                    usernameStatus === 'taken' ? 'border-red-500/50' : 
                                    usernameStatus === 'available' ? 'border-green-500/30' : 
                                    'border-white/10 focus:border-alpine-glacier/30'
                                }`}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <UsernameStatusIcon />
                            </div>
                        </div>
                        {/* Username feedback */}
                        <AnimatePresence>
                            {usernameStatus === 'taken' && (
                                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                    className="text-red-400 text-xs pl-1 -mt-2">
                                    This username is already taken
                                </motion.p>
                            )}
                            {usernameStatus === 'available' && (
                                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                    className="text-green-400 text-xs pl-1 -mt-2">
                                    ✓ Username is available
                                </motion.p>
                            )}
                        </AnimatePresence>

                        {/* Email with validation */}
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-alpine-glacier transition-colors duration-300" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={() => setEmailTouched(true)}
                                placeholder={t('auth.email_placeholder')}
                                required
                                className={`w-full bg-black/30 border rounded-xl py-3.5 pl-12 pr-4 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50 transition-all duration-300 shadow-inner ${
                                    emailTouched && !emailValid ? 'border-red-500/50' : 'border-white/10 focus:border-alpine-glacier/30'
                                }`}
                            />
                        </div>
                        <AnimatePresence>
                            {emailTouched && !emailValid && email.length > 0 && (
                                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                    className="text-red-400 text-xs pl-1 -mt-2">
                                    Please enter a valid email address
                                </motion.p>
                            )}
                        </AnimatePresence>
                        
                        {/* Password Field with Strength Integration */}
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-alpine-glacier transition-colors duration-300" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(password.length > 0)}
                                placeholder={t('auth.password_placeholder')}
                                required
                                maxLength={128}
                                autoComplete="new-password"
                                className="w-full bg-black/30 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50 focus:border-alpine-glacier/30 transition-all duration-300 shadow-inner"
                            />
                        </div>

                        {/* Ultra-Premium Password Strength Indicator */}
                        <AnimatePresence>
                            {passwordFocused && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="bg-black/20 rounded-xl p-4 border border-white/5 backdrop-blur-md mt-1 mb-2">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs text-white/60">Password Strength</span>
                                            <span className={`text-xs font-bold transition-colors duration-300 ${password.length === 0 ? 'text-white/30' : currentStrength.color.replace('bg-', 'text-')}`}>
                                                {password.length === 0 ? 'Required' : currentStrength.text}
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-3">
                                            <motion.div
                                                className={`h-full ${currentStrength.color}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: password.length === 0 ? '0%' : currentStrength.width }}
                                                transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                                                style={{ boxShadow: `0 0 10px ${currentStrength.glow}` }}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                                            <RequirementItem fulfilled={pwdChecks.length} text="8+ characters" />
                                            <RequirementItem fulfilled={pwdChecks.uppercase} text="Uppercase letter" />
                                            <RequirementItem fulfilled={pwdChecks.lowercase} text="Lowercase letter" />
                                            <RequirementItem fulfilled={pwdChecks.number} text="Number" />
                                            <RequirementItem fulfilled={pwdChecks.special} text="Special character" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Confirm Password */}
                        <div className="relative group">
                            <CheckCircle className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                                confirmPassword.length > 0 && passwordsMatch ? 'text-green-400' : 'text-white/40 group-focus-within:text-alpine-glacier'
                            }`} size={18} />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder={t('auth.confirm_password')}
                                required
                                maxLength={128}
                                autoComplete="new-password"
                                className={`w-full bg-black/30 border rounded-xl py-3.5 pl-12 pr-4 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50 transition-all duration-300 shadow-inner ${
                                    confirmPassword.length > 0 && !passwordsMatch ? 'border-red-500/50' : 
                                    confirmPassword.length > 0 && passwordsMatch ? 'border-green-500/30' : 
                                    'border-white/10 focus:border-alpine-glacier/30'
                                }`}
                            />
                        </div>
                        <AnimatePresence>
                            {confirmPassword.length > 0 && !passwordsMatch && (
                                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                    className="text-red-400 text-xs pl-1 -mt-2">
                                    Passwords do not match
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex flex-col gap-2 mt-4">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center mt-0.5">
                                <input
                                    type="checkbox"
                                    checked={consent}
                                    onChange={(e) => setConsent(e.target.checked)}
                                    className="peer appearance-none w-5 h-5 border-2 border-white/20 rounded bg-black/20 checked:bg-alpine-glacier checked:border-alpine-glacier transition-all duration-300 cursor-pointer shadow-inner"
                                />
                                <CheckCircle className="absolute text-alpine-navy opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none duration-300" size={14} />
                            </div>
                            <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors duration-300 leading-tight">
                                {t('auth.consent')}
                            </span>
                        </label>
                    </div>

                    {/* Security badge */}
                    <div className="flex items-center justify-center gap-2 mt-3">
                        <Shield size={12} className="text-alpine-glacier/50" />
                        <span className="text-[10px] text-white/30 tracking-wider uppercase">256-bit encrypted • Secure connection</span>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading || !isPasswordValid || !passwordsMatch || usernameStatus === 'taken' || !emailValid}
                        className={`w-full py-4 mt-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-lg ${
                            isLoading || !isPasswordValid || !passwordsMatch || usernameStatus === 'taken' || !emailValid
                                ? 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                                : 'bg-alpine-glacier text-alpine-navy hover:bg-alpine-glacier/90 hover:shadow-[0_0_20px_rgba(67,176,241,0.4)]'
                        }`}
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <span>{t('auth.begin_journey')}</span>}
                    </motion.button>

                    <div className="text-center mt-6">
                        <p className="text-white/60 text-sm">
                            {t('auth.already_member')}{' '}
                            <Link to="/login" className="text-alpine-glacier hover:text-white transition-colors duration-300 font-medium">
                                {t('auth.access_command')}
                            </Link>
                        </p>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};
