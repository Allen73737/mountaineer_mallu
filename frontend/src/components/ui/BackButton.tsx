import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

interface BackButtonProps {
    onBack?: () => void;
    onHome?: () => void;
    backTo?: string;
    to?: string;
}

export const BackButton = ({ onBack, onHome, backTo, to = "/" }: BackButtonProps) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else if (backTo) {
            navigate(backTo);
        } else {
            navigate(-1);
        }
    };

    const handleHome = (e: React.MouseEvent) => {
        if (onHome) {
            e.preventDefault();
            onHome();
        }
    };

    return (
        <div className={`flex items-center gap-3 mb-8 md:mb-12 mt-6 md:mt-12 relative z-[60]`}>
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                onClick={handleBack}
                aria-label="Go back"
                className="group flex items-center gap-2 text-alpine-navy/80 hover:text-alpine-navy dark:text-white/70 dark:hover:text-white transition-colors duration-300 min-h-[44px] min-w-[44px]"
            >
                <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-all duration-300 border border-black/10 dark:border-white/[0.08] group-hover:border-black/20 dark:group-hover:border-white/15 group-hover:-translate-x-0.5 shadow-sm dark:shadow-lg">
                    <ArrowLeft size={18} />
                </div>
                <span className="hidden md:inline text-sm font-bold tracking-widest uppercase">Back</span>
            </motion.button>

            <div className="w-[1px] h-6 bg-black/10 dark:bg-white/10 hidden md:block" />

            <Link to={to} onClick={handleHome} aria-label="Go to home">
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="group flex items-center gap-2 text-alpine-navy/80 hover:text-alpine-navy dark:text-white/70 dark:hover:text-white transition-colors duration-300 min-h-[44px] min-w-[44px]"
                >
                    <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-all duration-300 border border-black/10 dark:border-white/[0.08] group-hover:border-black/20 dark:group-hover:border-white/15 shadow-sm dark:shadow-lg">
                        <Home size={18} />
                    </div>
                    <span className="hidden md:inline text-sm font-bold tracking-widest uppercase">Home</span>
                </motion.button>
            </Link>
        </div>
    );
};
