import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, CheckCircle, Loader2 } from 'lucide-react';
import { DynamicLogo } from '../../components/ui/DynamicLogo';
import { useAuthStore, mockUser } from '../../store/useAuthStore';

export const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [consent, setConsent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuthStore();
    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        if (!consent) {
            alert("Please consent to GDPR communications.");
            return;
        }

        setIsLoading(true);

        // Simulate network request
        setTimeout(() => {
            // Mock signup - auto login as new user
            login({ ...mockUser, name, email });
            setIsLoading(false);
            navigate('/profile-complete', { replace: true });
        }, 1500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-bl from-alpine-navy via-alpine-navy/95 to-alpine-forest/20 py-12">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-alpine-glacier/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-alpine-snow/5 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="w-full max-w-md z-10 p-8 m-4 rounded-3xl glass-dark border border-white/10 shadow-2xl"
            >
                <div className="flex justify-center mb-6">
                    <div className="bg-white/10 p-2 rounded-2xl backdrop-blur-md inline-block shadow-inner ring-1 ring-white/20">
                        <DynamicLogo className="h-10" showText={false} />
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2 tracking-wide">Join the Community</h1>
                    <p className="text-white/60 text-sm">Prepare for your next expedition</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-5">
                    <div className="space-y-4">
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-alpine-glacier transition-colors" size={18} />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Full Name"
                                required
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50 transition-all"
                            />
                        </div>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-alpine-glacier transition-colors" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email Address"
                                required
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50 transition-all"
                            />
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-alpine-glacier transition-colors" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                required
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50 transition-all"
                            />
                        </div>
                        <div className="relative group">
                            <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-alpine-glacier transition-colors" size={18} />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm Password"
                                required
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center mt-0.5">
                                <input
                                    type="checkbox"
                                    checked={consent}
                                    onChange={(e) => setConsent(e.target.checked)}
                                    className="peer appearance-none w-5 h-5 border-2 border-white/20 rounded bg-black/20 checked:bg-alpine-glacier checked:border-alpine-glacier transition-all cursor-pointer"
                                />
                                <CheckCircle className="absolute text-alpine-navy opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" size={14} />
                            </div>
                            <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors leading-tight">
                                I consent to receiving event notifications and community updates (GDPR compliant).
                            </span>
                        </label>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 mt-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <span>Begin Journey</span>}
                    </motion.button>

                    <div className="text-center mt-6">
                        <p className="text-white/60 text-sm">
                            Already a member?{' '}
                            <Link to="/login" className="text-alpine-glacier hover:text-white transition-colors font-medium">
                                Access Command
                            </Link>
                        </p>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};
