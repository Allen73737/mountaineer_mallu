import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, KeyRound, Lock, ArrowRight, X, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Loader2 } from '../ui/BrandLoader';
import { authApi } from '../../lib/api';
import { PasswordStrengthMeter } from '../ui/PasswordStrengthMeter';

const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s]).{8,128}$/;

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const ForgotPasswordModal = ({ isOpen, onClose }: Props) => {
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);

    const isPasswordStrong = useMemo(() => STRONG_PASSWORD_REGEX.test(newPassword), [newPassword]);

    // Reset state when modal closes
    React.useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setStep(1);
                setEmail('');
                setOtp('');
                setNewPassword('');
                setError('');
            }, 300);
        }
    }, [isOpen]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await authApi.forgotPassword(email);
            setStep(2);
        } catch (err: any) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await authApi.verifyOtp({ email, otp });
            setStep(3);
        } catch (err: any) {
            setError(err.message || 'Invalid OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isPasswordStrong) {
            setError('Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            await authApi.resetPassword({ email, otp, newPassword });
            setStep(4);
        } catch (err: any) {
            setError(err.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="w-full max-w-md relative bg-[#15171E] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
                    >
                        {/* Shimmer effect */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-alpine-glacier via-alpine-blue to-alpine-sunrise" />

                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8">
                            {/* Step 1: Email */}
                            {step === 1 && (
                                <motion.form
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleSendOtp}
                                >
                                    <div className="w-12 h-12 bg-alpine-glacier/20 rounded-2xl flex items-center justify-center mb-6 text-alpine-glacier">
                                        <Mail size={24} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2 font-serif">Forgot Password</h2>
                                    <p className="text-white/60 mb-6 text-sm leading-relaxed">
                                        Enter your email address and we'll send you a 6-digit code to reset your password.
                                    </p>

                                    {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

                                    <div className="relative group mb-6">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-alpine-glacier transition-colors" size={20} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50 transition-all"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading || !email}
                                        className="w-full py-3.5 rounded-xl bg-alpine-glacier text-alpine-navy font-bold flex items-center justify-center gap-2 hover:bg-alpine-glacier/90 transition-colors btn-premium"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                                        {isLoading ? 'Sending...' : 'Send Reset Code'}
                                    </button>
                                </motion.form>
                            )}

                            {/* Step 2: Verify OTP */}
                            {step === 2 && (
                                <motion.form
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleVerifyOtp}
                                >
                                    <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-6 text-amber-400">
                                        <KeyRound size={24} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2 font-serif">Enter Code</h2>
                                    <p className="text-white/60 mb-6 text-sm leading-relaxed">
                                        We sent a verification code to <span className="text-white font-medium">{email}</span>.
                                    </p>

                                    {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

                                    <div className="relative group mb-6">
                                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-amber-400 transition-colors" size={20} />
                                        <input
                                            type="text"
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            placeholder="6-digit code"
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-center tracking-[0.5em] font-bold text-lg transition-all"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading || otp.length !== 6}
                                        className="w-full py-3.5 rounded-xl bg-amber-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-amber-400 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                                        {isLoading ? 'Verifying...' : 'Verify Code'}
                                    </button>
                                </motion.form>
                            )}

                            {/* Step 3: New Password */}
                            {step === 3 && (
                                <motion.form
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleResetPassword}
                                >
                                    <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 text-emerald-400">
                                        <Lock size={24} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2 font-serif">New Password</h2>
                                    <p className="text-white/60 mb-6 text-sm leading-relaxed">
                                        Please create a new secure password for your account.
                                    </p>

                                    {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

                                    <div className="relative group mb-3">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-emerald-400 transition-colors" size={20} />
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new secure password"
                                            required
                                            autoComplete="new-password"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                        />
                                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors" tabIndex={-1}>
                                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>

                                    <AnimatePresence>
                                        {newPassword.length > 0 && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="mb-6">
                                                <PasswordStrengthMeter password={newPassword} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <button
                                        type="submit"
                                        disabled={isLoading || !isPasswordStrong}
                                        className="w-full py-3.5 rounded-xl bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                                        {isLoading ? 'Saving...' : 'Reset Password'}
                                    </button>
                                </motion.form>
                            )}

                            {/* Step 4: Success */}
                            {step === 4 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center"
                                >
                                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2 font-serif">Password Reset!</h2>
                                    <p className="text-white/60 mb-8 text-sm leading-relaxed">
                                        Your password has been successfully updated. You can now access your account with your new credentials.
                                    </p>
                                    <button
                                        onClick={onClose}
                                        className="w-full py-3.5 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors border border-white/20"
                                    >
                                        Return to Login
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
