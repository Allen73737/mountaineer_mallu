import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, X, ShieldAlert, Sparkles } from 'lucide-react';

interface MaintenanceBannerProps {
    message: string;
    isAdmin?: boolean;
    theme?: 'alpine_blue' | 'pitch_black' | 'white';
}

export const MaintenanceBanner: React.FC<MaintenanceBannerProps> = ({ message, isAdmin, theme = 'pitch_black' }) => {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    // Premium Theme Definitions
    const themes = {
        alpine_blue: {
            bg: 'bg-gradient-to-r from-blue-900/90 via-blue-800/90 to-alpine-navy/90',
            border: 'border-blue-400/30',
            textPrimary: 'text-white',
            textSecondary: 'text-blue-200/70',
            iconColor: 'text-blue-300',
            glow: 'shadow-[0_0_40px_rgba(59,130,246,0.3)]',
            accent: 'bg-blue-500',
        },
        pitch_black: {
            bg: 'bg-[#0B0C10]/95',
            border: 'border-white/10',
            textPrimary: 'text-white',
            textSecondary: 'text-white/50',
            iconColor: 'text-amber-400',
            glow: 'shadow-[0_0_40px_rgba(0,0,0,0.8)]',
            accent: 'bg-amber-500',
        },
        white: {
            bg: 'bg-white/95',
            border: 'border-black/5',
            textPrimary: 'text-[#0B0C10]',
            textSecondary: 'text-black/50',
            iconColor: 'text-rose-500',
            glow: 'shadow-[0_20px_40px_rgba(0,0,0,0.05)]',
            accent: 'bg-rose-500',
        }
    };

    const currentTheme = themes[theme];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: '-100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '-100%', opacity: 0, filter: 'blur(10px)' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[95%] max-w-4xl"
            >
                <div className={`relative overflow-hidden rounded-2xl border ${currentTheme.border} ${currentTheme.bg} backdrop-blur-xl ${currentTheme.glow} p-1`}>
                    
                    {/* Animated Warning Track / Scanning Laser */}
                    <motion.div 
                        className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)' }}
                        animate={{ backgroundPosition: ['0px 0px', '40px 40px'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                    
                    <motion.div 
                        className={`absolute top-0 bottom-0 w-32 ${currentTheme.accent} opacity-20 blur-2xl pointer-events-none`}
                        animate={{ left: ['-20%', '120%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />

                    <div className="relative z-10 flex items-center justify-between gap-4 px-5 py-3">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            {/* Pulsing Icon */}
                            <div className="relative">
                                <motion.div
                                    className={`absolute inset-0 rounded-full ${currentTheme.accent} blur-md opacity-50`}
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                                <div className={`relative p-2 rounded-xl bg-black/10 dark:bg-white/5 border border-black/5 dark:border-white/10 ${currentTheme.iconColor}`}>
                                    <ShieldAlert size={20} />
                                </div>
                            </div>

                            <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${currentTheme.iconColor}`}>System Maintenance</span>
                                    {isAdmin && (
                                        <span className={`text-[8px] font-mono px-2 py-0.5 rounded-sm uppercase tracking-widest ${theme === 'white' ? 'bg-black text-white' : 'bg-white text-black'}`}>
                                            Admin Override Active
                                        </span>
                                    )}
                                </div>
                                <p className={`text-sm font-medium truncate ${currentTheme.textPrimary}`}>
                                    {message || 'The site is currently undergoing scheduled maintenance. Services may be disrupted.'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setDismissed(true)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${theme === 'white' ? 'bg-black/5 hover:bg-black/10 text-black' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                            >
                                Acknowledge
                                <X size={14} />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
