import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    React.useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const colors = {
        success: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200',
        error: 'bg-red-500/20 border-red-500/50 text-red-200',
        info: 'bg-alpine-glacier/20 border-alpine-glacier/50 text-alpine-glacier'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-6 left-1/2 z-[100] px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl text-sm font-medium ${colors[type]}`}
        >
            {message}
        </motion.div>
    );
};

// Hook for easy toast usage
export const useToast = () => {
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ message, type });
    };

    const ToastComponent = toast ? (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
    ) : null;

    return { showToast, ToastComponent };
};
