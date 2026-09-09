import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { WifiOff, RefreshCw, Home, AlertCircle, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ErrorStateProps {
    title?: string;
    message?: string;
    statusCode?: number | string;
    onRetry?: () => Promise<void> | void;
    backLink?: string;
    backText?: string;
    className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
    title = 'Altitude Link Disrupted',
    message = 'We could not establish a clean telemetry downlink to the alpine archives. Please verify your connection or retry.',
    statusCode,
    onRetry,
    backLink = '/',
    backText = 'Return to Basecamp',
    className = ''
}) => {
    const [retrying, setRetrying] = useState(false);

    const handleRetry = async () => {
        if (!onRetry) return;
        setRetrying(true);
        try {
            await onRetry();
        } finally {
            setRetrying(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={`w-full py-16 px-6 flex flex-col items-center justify-center text-center rounded-3xl border border-red-500/20 dark:border-red-500/30 bg-red-500/5 dark:bg-red-950/10 backdrop-blur-xl ${className}`}
        >
            {/* Status Code or Alert Icon Badge */}
            <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl bg-red-500/10 dark:bg-red-500/20 border border-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 shadow-inner">
                    {statusCode === 503 ? (
                        <ShieldAlert className="w-10 h-10" />
                    ) : (
                        <WifiOff className="w-10 h-10" />
                    )}
                </div>
                {statusCode && (
                    <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-red-600 text-white shadow-md">
                        {statusCode}
                    </span>
                )}
            </div>

            {/* Error Message */}
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-alpine-navy dark:text-alpine-snow mb-3">
                {title}
            </h3>
            <p className="text-sm md:text-base font-light text-alpine-navy/70 dark:text-alpine-snow/70 max-w-md mb-8 leading-relaxed">
                {message}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-4">
                {onRetry && (
                    <button
                        onClick={handleRetry}
                        disabled={retrying}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#08284C] dark:bg-[#A3C9E2] text-white dark:text-[#08284C] font-medium text-sm transition-all hover:scale-105 active:scale-95 shadow-md disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={retrying ? 'animate-spin' : ''} />
                        <span>{retrying ? 'Re-establishing Link...' : 'Retry Connection'}</span>
                    </button>
                )}

                <Link
                    to={backLink}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-black/10 dark:border-white/15 bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-alpine-navy dark:text-alpine-snow font-medium text-sm transition-all hover:scale-105 active:scale-95"
                >
                    <Home size={16} />
                    <span>{backText}</span>
                </Link>
            </div>
        </motion.div>
    );
};
