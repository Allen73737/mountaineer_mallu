import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'warning';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
    onConfirm, onCancel, variant = 'danger'
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                    onClick={onCancel}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-alpine-navy/95 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                        <div className="flex items-start gap-4 mb-6">
                            <div className={`p-3 rounded-xl shrink-0 ${variant === 'danger' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                                <p className="text-white/60 text-sm leading-relaxed">{message}</p>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={onCancel}
                                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`px-5 py-2.5 rounded-xl font-bold transition-all ${variant === 'danger'
                                    ? 'bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30'
                                    : 'bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/30'
                                }`}
                            >
                                {confirmLabel}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
