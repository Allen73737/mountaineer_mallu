import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, LogOut, Check, X } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    description?: string;
    message?: string; // fallback for AdminDashboard
    confirmText?: string;
    confirmLabel?: string; // fallback
    cancelText?: string;
    icon?: 'warning' | 'logout' | 'default';
    variant?: 'warning' | 'danger' | 'info'; // fallback
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    description,
    message,
    confirmText,
    confirmLabel,
    cancelText = 'Cancel',
    icon,
    variant,
    onConfirm,
    onCancel
}) => {
    const finalDescription = description || message || '';
    const finalConfirmText = confirmText || confirmLabel || 'Confirm';
    const finalIcon = icon || (variant === 'warning' || variant === 'danger' ? 'warning' : 'default');
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#02050A]/80 backdrop-blur-md"
                        onClick={onCancel}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md glass-premium rounded-3xl border border-white/10 p-8 shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden group"
                    >
                        {/* Ambient glow effect based on icon */}
                        <div className={`absolute -inset-20 bg-gradient-to-br to-transparent blur-3xl opacity-20 pointer-events-none transition-all duration-500 group-hover:opacity-40
                            ${finalIcon === 'warning' ? 'from-red-500' : finalIcon === 'logout' ? 'from-orange-500' : 'from-alpine-glacier'}
                        `} />

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 
                                ${finalIcon === 'warning' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                                  finalIcon === 'logout' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
                                  'bg-alpine-glacier/10 text-alpine-glacier border border-alpine-glacier/20'}
                            `}>
                                {finalIcon === 'warning' && <AlertTriangle size={32} />}
                                {finalIcon === 'logout' && <LogOut size={32} />}
                                {finalIcon === 'default' && <Check size={32} />}
                            </div>

                            <h3 className="text-2xl font-serif font-bold text-white mb-3">{title}</h3>
                            <p className="text-white/60 mb-8 leading-relaxed">{finalDescription}</p>

                            <div className="flex w-full gap-4">
                                <button
                                    onClick={onCancel}
                                    className="flex-1 py-3 px-4 rounded-xl font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-all border border-transparent flex items-center justify-center gap-2"
                                >
                                    <X size={18} /> {cancelText}
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2
                                        ${finalIcon === 'warning' ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20' : 
                                          finalIcon === 'logout' ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/20' : 
                                          'bg-white text-black hover:bg-white/90 shadow-white/20'}
                                    `}
                                >
                                    {finalConfirmText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
