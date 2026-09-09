import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';

export const NetworkStatusToast: React.FC = () => {
    const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
    const [showReconnectedToast, setShowReconnectedToast] = useState<boolean>(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setShowReconnectedToast(true);
            const timer = setTimeout(() => setShowReconnectedToast(false), 4000);
            return () => clearTimeout(timer);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowReconnectedToast(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const isDisconnected = !isOnline;

    if (!isDisconnected && !showReconnectedToast) {
        return null;
    }

    return (
        <div className="fixed bottom-6 left-6 z-[9999] pointer-events-none">
            <AnimatePresence mode="wait">
                {isDisconnected && (
                    <motion.div
                        key="offline-toast"
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="glass-premium px-4 py-3 rounded-2xl border border-amber-500/40 bg-amber-950/40 dark:bg-amber-950/60 backdrop-blur-xl flex items-center gap-3 shadow-[0_10px_30px_rgba(245,158,11,0.2)] pointer-events-auto"
                    >
                        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 animate-pulse">
                            <WifiOff size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-amber-200 tracking-wide">
                                Network Offline
                            </span>
                            <span className="text-[10px] text-amber-300/70 font-medium">
                                Viewing cached expedition data
                            </span>
                        </div>
                    </motion.div>
                )}

                {showReconnectedToast && !isDisconnected && (
                    <motion.div
                        key="reconnected-toast"
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="glass-premium px-4 py-3 rounded-2xl border border-emerald-500/40 bg-emerald-950/40 dark:bg-emerald-950/60 backdrop-blur-xl flex items-center gap-3 shadow-[0_10px_30px_rgba(16,185,129,0.2)] pointer-events-auto"
                    >
                        <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                            <Wifi size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-emerald-200 tracking-wide">
                                Connection Restored
                            </span>
                            <span className="text-[10px] text-emerald-300/70 font-medium">
                                Alpine sync online
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
