import React from 'react';
import { motion } from 'framer-motion';
import { Compass, LucideIcon, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    actionText?: string;
    actionLink?: string;
    onAction?: () => void;
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon = Compass,
    title,
    description = 'No trail records match your current coordinates. Adjust your filters or explore new horizons.',
    actionText,
    actionLink,
    onAction,
    className = ''
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`w-full py-16 px-6 flex flex-col items-center justify-center text-center rounded-3xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-[#0A0E14]/40 backdrop-blur-xl ${className}`}
        >
            {/* Compass / Mountain Badge with Ambient Pulse */}
            <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#A3C9E2]/20 to-[#E2A071]/10 dark:from-[#A3C9E2]/15 dark:to-[#A3C9E2]/10 flex items-center justify-center border border-black/5 dark:border-white/10 shadow-inner">
                    <Icon className="w-10 h-10 text-[#4A6A8C] dark:text-[#A3C9E2]" />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-[#A3C9E2]/10 blur-xl -z-10 animate-pulse" />
            </div>

            {/* Title & Description */}
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-alpine-navy dark:text-alpine-snow mb-3">
                {title}
            </h3>
            <p className="text-sm md:text-base font-light text-alpine-navy/60 dark:text-alpine-snow/60 max-w-md mb-8 leading-relaxed">
                {description}
            </p>

            {/* Optional Call to Action */}
            {actionText && (
                actionLink ? (
                    <Link
                        to={actionLink}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-alpine-navy dark:bg-white text-white dark:text-alpine-navy font-medium text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/5 dark:shadow-white/10"
                    >
                        <span>{actionText}</span>
                        <ArrowRight size={16} />
                    </Link>
                ) : (
                    <button
                        onClick={onAction}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-alpine-navy dark:bg-white text-white dark:text-alpine-navy font-medium text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/5 dark:shadow-white/10"
                    >
                        <span>{actionText}</span>
                        <ArrowRight size={16} />
                    </button>
                )
            )}
        </motion.div>
    );
};
