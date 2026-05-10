import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Wrench } from 'lucide-react';

interface MaintenanceBannerProps {
    message: string;
    isAdmin?: boolean;
}

export const MaintenanceBanner: React.FC<MaintenanceBannerProps> = ({ message, isAdmin }) => {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -60, opacity: 0 }}
                transition={{ type: 'spring', damping: 20 }}
                className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20"
            >
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <motion.div
                            animate={{ rotate: [0, -10, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                            <Wrench size={18} className="text-white/90 shrink-0" />
                        </motion.div>
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-bold uppercase tracking-widest text-white/70 shrink-0">Maintenance</span>
                            <span className="text-white/40">|</span>
                            <p className="text-sm font-medium truncate">
                                {message || 'The site is currently undergoing scheduled maintenance. Some features may be temporarily unavailable.'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {isAdmin && (
                            <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-widest">Admin View</span>
                        )}
                        <button
                            onClick={() => setDismissed(true)}
                            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                            aria-label="Dismiss"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
