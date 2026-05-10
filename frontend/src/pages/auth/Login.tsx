import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, Loader2, Shield, Clock } from 'lucide-react';
import { BackButton } from '../../components/ui/BackButton';
import { GoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';
import { DynamicLogo } from '../../components/ui/DynamicLogo';
import { useAuthStore } from '../../store/useAuthStore';
import { ForgotPasswordModal } from '../../components/auth/ForgotPasswordModal';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    // Account lockout state
    const [lockCountdown, setLockCountdown] = useState(0);
    const [lockedUntil, setLockedUntil] = useState<string | null>(null);

    const { loginAsync, loginWithGoogleAsync } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const from = location.state?.from?.pathname || '/';

    // Lockout countdown timer
    useEffect(() => {
        if (lockCountdown <= 0) return;
        const interval = setInterval(() => {
            setLockCountdown(prev => {
                if (prev <= 1) {
                    setLockedUntil(null);
                    setError('');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [lockCountdown]);

    const formatLockTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (lockCountdown > 0) return;
        setIsLoading(true);
        setError('');

        try {
            const user = await loginAsync(email, password);
            navigatePostLogin(user);
        } catch (err: any) {
            // Handle account lockout response (HTTP 423)
            if (err.status === 423 && err.data) {
                const remaining = err.data.lockRemaining || 1800;
                setLockCountdown(remaining);
                setLockedUntil(err.data.lockedUntil);
            }
            setError(err.message || 'Invalid credentials. Please try again.');
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setIsLoading(true);
        setError('');
        try {
            const user = await loginWithGoogleAsync(credentialResponse.credential);
            navigatePostLogin(user);
        } catch (err: any) {
            setError(err.message || 'Google authentication failed.');
            setIsLoading(false);
        }
    };

    const navigatePostLogin = (user: any) => {
        if (!user.isProfileComplete) {
            navigate('/profile-complete', { replace: true });
        } else if (['Admin', 'SuperAdmin'].includes(user.role)) {
            navigate(from === '/' ? '/summit-control-panel' : from, { replace: true });
        } else {
            navigate(from, { replace: true });
        }
    };

    const isLocked = lockCountdown > 0;

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-alpine-navy via-alpine-navy/90 to-alpine-glacier/20">
            {/* Background elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-alpine-glacier/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-alpine-blue/10 rounded-full blur-[100px]" />
            </div>

            {/* Navigation Controls */}
            <div className="absolute top-6 left-6 md:top-8 md:left-8 z-50">
                <BackButton />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md z-10 p-8 m-4 rounded-3xl glass-dark border border-white/10 shadow-2xl relative overflow-hidden"
            >
                {/* Liquid glass shimmer effect */}
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg]" />

                <div className="flex justify-center mb-8">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/10 p-3 rounded-2xl backdrop-blur-md inline-block shadow-inner ring-1 ring-white/20"
                    >
                        <DynamicLogo className="h-12" showText={false} />
                    </motion.div>
                </div>

                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-white mb-2 font-serif tracking-wide">{t('auth.login_title')}</h1>
                    <p className="text-white/60">{t('auth.login_subtitle')}</p>
                </div>

                {/* Account Lockout Warning */}
                <AnimatePresence>
                    {isLocked && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, scale: 0.95 }}
                            animate={{ opacity: 1, height: 'auto', scale: 1 }}
                            exit={{ opacity: 0, height: 0, scale: 0.95 }}
                            className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 mb-6 backdrop-blur-sm overflow-hidden"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <Clock size={18} className="text-amber-400 flex-shrink-0" />
                                <span className="font-medium text-sm">Account Temporarily Locked</span>
                            </div>
                            <p className="text-xs text-amber-200/70 mb-3">
                                Too many failed login attempts. Please wait before trying again.
                            </p>
                            <div className="flex items-center justify-center gap-2 bg-black/20 rounded-lg py-2 px-4">
                                <span className="text-2xl font-mono font-bold text-amber-400 tabular-nums tracking-wider">
                                    {formatLockTime(lockCountdown)}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {error && !isLocked && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-500/20 border border-red-500/50 text-red-200 rounded-xl p-4 mb-6 flex items-center gap-3 text-sm backdrop-blur-sm"
                        >
                            <AlertCircle size={18} />
                            <p>{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mb-6 flex justify-center">
                    <div className="w-full relative z-20">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google Login Failed')}
                            theme="filled_black"
                            size="large"
                            shape="pill"
                            width="100%"
                            text="continue_with"
                        />
                    </div>
                </div>

                <div className="relative flex items-center mb-6">
                    <div className="flex-grow border-t border-white/10"></div>
                    <span className="flex-shrink-0 mx-4 text-white/40 text-xs font-medium uppercase tracking-wider">or sign in with email</span>
                    <div className="flex-grow border-t border-white/10"></div>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                        <motion.div className="relative group" whileFocus={{ scale: 1.01 }}>
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-alpine-glacier transition-colors" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t('auth.email_placeholder')}
                                required
                                disabled={isLocked}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50 focus:border-transparent transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            />
                        </motion.div>
                        <motion.div className="relative group" whileFocus={{ scale: 1.01 }}>
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-alpine-glacier transition-colors" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={t('auth.password_placeholder')}
                                required
                                disabled={isLocked}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50 focus:border-transparent transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            />
                        </motion.div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <Shield size={12} className="text-alpine-glacier/40" />
                            <span className="text-[10px] text-white/25 tracking-wider uppercase">Encrypted</span>
                        </div>
                        <button type="button" onClick={() => setShowForgotPassword(true)} className="text-sm text-alpine-glacier/80 hover:text-alpine-glacier transition-colors">
                            {t('auth.forgot_password')}
                        </button>
                    </div>

                    {/* Magnetic hover effect wrapper for button */}
                    <motion.button
                        whileHover={!isLocked ? { scale: 1.02 } : {}}
                        whileTap={!isLocked ? { scale: 0.98 } : {}}
                        type="submit"
                        disabled={isLoading || isLocked}
                        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 overflow-hidden relative group ${
                            isLocked 
                                ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300/50 cursor-not-allowed'
                                : 'bg-white/10 hover:bg-white/20 border border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                        }`}
                    >
                        {!isLocked && <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-alpine-glacier/0 via-alpine-glacier/20 to-alpine-glacier/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />}
                        {isLoading ? (
                            <Loader2 className="animate-spin text-white" size={24} />
                        ) : isLocked ? (
                            <>
                                <Clock size={20} />
                                <span>Locked ({formatLockTime(lockCountdown)})</span>
                            </>
                        ) : (
                            <>
                                <LogIn size={20} />
                                <span>{t('auth.access_command')}</span>
                            </>
                        )}
                    </motion.button>

                    <div className="text-center mt-6">
                        <p className="text-white/60">
                            {t('auth.new_explorer')}{' '}
                            <Link to="/signup" className="text-alpine-glacier hover:text-white transition-colors font-medium">
                                {t('auth.signup_link')}
                            </Link>
                        </p>
                    </div>
                </form>
            </motion.div>

            <ForgotPasswordModal 
                isOpen={showForgotPassword} 
                onClose={() => setShowForgotPassword(false)} 
            />
        </div>
    );
};
