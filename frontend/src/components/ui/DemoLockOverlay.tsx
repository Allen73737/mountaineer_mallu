import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, UserPlus, X, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export const DemoLockOverlay = () => {
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const { logoutAsync } = useAuthStore();

    const handleInterceptClick = (e: React.MouseEvent) => {
        // Allow clicks on driver.js elements and MotionGraphicsDemo (which have high z-index)
        // Since this overlay is at z-[60], anything above it will naturally receive clicks.
        // For everything under it, this overlay catches the click.
        e.stopPropagation();
        e.preventDefault();
        setShowModal(true);
    };

    const handleExitDemo = async () => {
        await logoutAsync();
        setShowModal(false);
        navigate('/');
    };

    // Keyboard interception loophole fix
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Intercept Enter and Space keys to prevent triggering focused elements behind the overlay
            if (e.key === 'Enter' || e.key === ' ') {
                const target = e.target as HTMLElement;
                const isDriver = target.closest('.driver-popover');
                const isModal = target.closest('.glass-premium');
                const isNav = target.closest('nav'); // allow global nav if needed, but wait, driver.js handles its own clicks.
                
                if (!isDriver && !isModal) {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowModal(true);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown, true); // use capture phase
        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, []);

    return (
        <>
            {/* Invisible click interceptor */}
            <div 
                className="fixed inset-0 z-[60] cursor-not-allowed" 
                onClick={handleInterceptClick}
                onContextMenu={handleInterceptClick}
            />

            {/* Premium Block Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#02050A]/80 backdrop-blur-md"
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-md glass-premium rounded-3xl border border-white/10 p-8 shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden group text-center"
                        >
                            <div className="absolute -inset-20 bg-gradient-to-br from-alpine-glacier to-transparent blur-3xl opacity-20 pointer-events-none transition-all duration-500 group-hover:opacity-40" />
                            
                            <button 
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-alpine-glacier/10 text-alpine-glacier border border-alpine-glacier/20">
                                    <Lock size={32} />
                                </div>

                                <h3 className="text-2xl font-serif font-bold text-white mb-3">Demo Mode Restricted</h3>
                                <p className="text-white/60 mb-8 leading-relaxed">
                                    You are currently exploring a read-only demonstration. To create stories, upload media, and join factions, please create a real explorer account.
                                </p>

                                <div className="flex w-full gap-4">
                                    <button
                                        onClick={handleExitDemo}
                                        className="flex-1 py-3 px-4 rounded-xl font-bold text-red-400 hover:text-white hover:bg-red-500/20 transition-all border border-red-500/20 hover:border-red-500 flex items-center justify-center gap-2"
                                    >
                                        <LogOut size={18} /> Exit Demo
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleExitDemo();
                                            navigate('/signup');
                                        }}
                                        className="flex-1 py-3 px-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-alpine-glacier to-blue-500 text-white hover:scale-105 shadow-blue-500/20"
                                    >
                                        <UserPlus size={18} /> Join Now
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Persistent Floating Exit Button */}
            <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                onClick={handleExitDemo}
                className="fixed bottom-6 left-6 z-[100] px-4 py-3 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 backdrop-blur-md flex items-center gap-2 shadow-lg transition-colors font-bold tracking-wider text-sm group"
            >
                <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span>EXIT DEMO</span>
            </motion.button>
        </>
    );
};
