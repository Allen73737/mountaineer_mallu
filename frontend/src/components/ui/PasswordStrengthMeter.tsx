import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
    password: string;
}

export const PasswordStrengthMeter = ({ password }: PasswordStrengthMeterProps) => {
    const requirements = [
        { regex: /.{8,}/, text: "At least 8 characters" },
        { regex: /[a-z]/, text: "Lowercase letter" },
        { regex: /[A-Z]/, text: "Uppercase letter" },
        { regex: /[0-9]/, text: "Number" },
        { regex: /[^a-zA-Z0-9\s]/, text: "Special character (!@#$%...)" }
    ];

    const strength = requirements.reduce((acc, req) => acc + (req.regex.test(password) ? 1 : 0), 0);

    const getColor = (strength: number) => {
        if (strength === 0) return "bg-white/10";
        if (strength === 1) return "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]";
        if (strength === 2) return "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]";
        if (strength === 3) return "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]";
        if (strength === 4) return "bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.5)]";
        return "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]";
    };

    const getTextColor = (strength: number) => {
        if (strength === 0) return "text-white/40";
        if (strength === 1) return "text-red-400";
        if (strength === 2) return "text-orange-400";
        if (strength === 3) return "text-yellow-400";
        if (strength === 4) return "text-lime-400";
        return "text-emerald-400 font-bold";
    };

    const getStrengthText = () => {
        if (strength === 0) return "Waiting...";
        if (strength === 1) return "Very Weak";
        if (strength === 2) return "Weak";
        if (strength === 3) return "Fair";
        if (strength === 4) return "Good";
        return "Ultra Secure";
    };

    return (
        <div className="w-full mt-3 space-y-2.5 p-3 rounded-xl bg-black/20 border border-white/5 backdrop-blur-sm">
            <div className="flex justify-between items-center text-xs font-medium px-1">
                <span className="text-white/60">Security Level</span>
                <span className={`transition-colors duration-300 ${getTextColor(strength)}`}>{getStrengthText()}</span>
            </div>
            
            <div className="flex gap-1.5 h-1.5 w-full px-1">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-full flex-1 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                            className={`h-full w-full rounded-full transition-[color,background-color,border-color,box-shadow] duration-500 ${i < strength ? getColor(strength) : 'opacity-0'}`}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: i < strength ? 1 : 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            style={{ transformOrigin: 'left' }}
                        />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-2 mt-4 px-1">
                {requirements.map((req, i) => {
                    const isMet = req.regex.test(password);
                    return (
                        <div key={i} className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-semibold">
                            {isMet ? (
                                <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                                    <Check size={10} className="text-emerald-400" />
                                </div>
                            ) : (
                                <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                    <X size={10} className="text-white/30" />
                                </div>
                            )}
                            <span className={`transition-colors duration-300 ${isMet ? 'text-white/90' : 'text-white/40'}`}>
                                {req.text}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
