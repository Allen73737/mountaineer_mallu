import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { DynamicLogo } from '../../components/ui/DynamicLogo';
import { useAuthStore, mockUser, mockAdmin, mockSuperAdmin } from '../../store/useAuthStore';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Simulate network request
        setTimeout(() => {
            // Mock authentication logic based on email
            if (email === 'admin@mountaineermallu.com') {
                login(mockAdmin);
                navigate(from, { replace: true });
            } else if (email === 'superadmin@mountaineermallu.com') {
                login(mockSuperAdmin);
                navigate(from, { replace: true });
            } else if (email === 'user@mountaineermallu.com') {
                login(mockUser);
                navigate('/profile-complete', { replace: true });
            } else if (email && password) { // generic login for testing
                login({ ...mockUser, email });
                navigate('/profile-complete', { replace: true });
            } else {
                setError('Invalid credentials. Please try again.');
                setIsLoading(false);
            }
        }, 1500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-alpine-navy via-alpine-navy/90 to-alpine-glacier/20">
            {/* Background elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-alpine-glacier/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-alpine-blue/10 rounded-full blur-[100px]" />
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
                    <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md inline-block shadow-inner ring-1 ring-white/20">
                        <DynamicLogo className="h-12" showText={false} />
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2 font-serif tracking-wide">Expedition Access</h1>
                    <p className="text-white/60">Enter your credentials to continue</p>
                </div>

                <AnimatePresence>
                    {error && (
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

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-alpine-glacier transition-colors" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address"
                                required
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50 focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-alpine-glacier transition-colors" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                required
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <a href="#" className="text-sm text-alpine-glacier/80 hover:text-alpine-glacier transition-colors">
                            Forgot password?
                        </a>
                    </div>

                    {/* Magnetic hover effect wrapper for button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.05)] overflow-hidden relative group"
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-alpine-glacier/0 via-alpine-glacier/20 to-alpine-glacier/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                        {isLoading ? (
                            <Loader2 className="animate-spin text-white" size={24} />
                        ) : (
                            <>
                                <LogIn size={20} />
                                <span>Access Command</span>
                            </>
                        )}
                    </motion.button>

                    <div className="text-center mt-6">
                        <p className="text-white/60">
                            New explorer?{' '}
                            <Link to="/signup" className="text-alpine-glacier hover:text-white transition-colors font-medium">
                                Sign up for the expedition
                            </Link>
                        </p>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};
