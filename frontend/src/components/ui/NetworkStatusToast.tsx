import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, ServerOff, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../../lib/constants';

/**
 * One calm status pill, bottom-left:
 *  - the device is offline,
 *  - the device is online but the API server isn't answering (lib/api broadcasts `mm:server-status`),
 *  - and a short "back online" confirmation when either recovers.
 */
export const NetworkStatusToast: React.FC = () => {
    const { t } = useTranslation();
    const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
    const [serverDown, setServerDown] = useState(false);
    const [checking, setChecking] = useState(false);
    const [showReconnectedToast, setShowReconnectedToast] = useState<boolean>(false);
    const hideTimer = useRef<number | undefined>(undefined);

    const flashReconnected = () => {
        setShowReconnectedToast(true);
        window.clearTimeout(hideTimer.current);
        hideTimer.current = window.setTimeout(() => setShowReconnectedToast(false), 4000);
    };

    // While the server is unreachable, quietly re-check every 8 s
    const probe = async () => {
        setChecking(true);
        try {
            const res = await fetch(`${API_URL}/api/health`, { cache: 'no-store', signal: AbortSignal.timeout?.(4000) });
            // Any HTTP answer (even 429 / 503 degraded) proves the server process is up
            if (res.status > 0) {
                setServerDown(false);
                flashReconnected();
                window.dispatchEvent(new CustomEvent('mm:server-status', { detail: { reachable: true, fromProbe: true } }));
            }
        } catch { /* still down */ } finally {
            setChecking(false);
        }
    };

    useEffect(() => {
        const handleOnline = () => { setIsOnline(true); flashReconnected(); };
        const handleOffline = () => { setIsOnline(false); setShowReconnectedToast(false); };
        const handleServer = (e: Event) => {
            const { reachable, fromProbe } = (e as CustomEvent).detail || {};
            if (fromProbe) return;
            if (reachable) { setServerDown(prev => { if (prev) flashReconnected(); return false; }); }
            else setServerDown(true);
        };
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        window.addEventListener('mm:server-status', handleServer);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('mm:server-status', handleServer);
            window.clearTimeout(hideTimer.current);
        };
    }, []);

    useEffect(() => {
        if (!serverDown || !isOnline) return;
        const id = window.setInterval(probe, 8000);
        return () => window.clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serverDown, isOnline]);

    const pill = 'px-4 py-3 rounded-2xl border backdrop-blur-xl flex items-center gap-3 pointer-events-auto shadow-[0_14px_36px_-12px_rgba(0,0,0,0.7)]';

    return (
        <div className="fixed bottom-6 left-6 z-[9999] pointer-events-none max-w-[calc(100vw-3rem)]" role="status" aria-live="polite">
            <AnimatePresence mode="wait">
                {!isOnline ? (
                    <motion.div key="offline" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                        className={`${pill} border-[#E2A071]/35 bg-[#1B120C]/85`}>
                        <span className="p-2 rounded-xl bg-[#E2A071]/15 text-[#E8B48E]"><WifiOff size={16} /></span>
                        <span className="flex flex-col">
                            <span className="text-xs font-semibold text-white">{t('app.status.offline')}</span>
                            <span className="text-[11px] text-white/60">{t('app.status.offlineSub')}</span>
                        </span>
                    </motion.div>
                ) : serverDown ? (
                    <motion.div key="server" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                        className={`${pill} border-red-400/30 bg-[#1A0D10]/85`}>
                        <span className="p-2 rounded-xl bg-red-400/15 text-red-300"><ServerOff size={16} /></span>
                        <span className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-white">{t('app.status.serverDown')}</span>
                            <span className="text-[11px] text-white/60 truncate">
                                {import.meta.env.DEV ? `Start the backend (${API_URL || 'same origin'})` : t('app.status.retrying')}
                            </span>
                        </span>
                        <button onClick={probe} disabled={checking} className="ml-1 h-8 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-colors">
                            <RefreshCw size={12} className={checking ? 'animate-spin' : ''} /> {t('app.status.retry')}
                        </button>
                    </motion.div>
                ) : showReconnectedToast ? (
                    <motion.div key="back" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                        className={`${pill} border-emerald-400/30 bg-[#0B1A14]/85`}>
                        <span className="p-2 rounded-xl bg-emerald-400/15 text-emerald-300"><Wifi size={16} /></span>
                        <span className="text-xs font-semibold text-white">{t('app.status.back')}</span>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
};
