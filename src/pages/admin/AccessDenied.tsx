import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AccessDenied = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[70vh] flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full p-8 rounded-3xl glass-dark border border-red-500/20 shadow-2xl text-center relative overflow-hidden"
            >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500/0 via-red-500/50 to-red-500/0" />

                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-400 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                    <ShieldAlert size={40} />
                </div>

                <h1 className="text-2xl font-bold text-white mb-3 tracking-wide">Access Denied</h1>
                <p className="text-white/60 text-sm mb-8 leading-relaxed">
                    You do not have the required clearance to access this sector of the expedition control panel.
                    If you believe this is an error, contact a Super Admin.
                </p>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(-1)}
                    className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium flex items-center justify-center gap-2 transition-all"
                >
                    <ArrowLeft size={18} />
                    <span>Return to Previous Coordinates</span>
                </motion.button>
            </motion.div>
        </div>
    );
};
