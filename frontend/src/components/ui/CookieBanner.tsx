import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Cookie } from 'lucide-react';
import { useCookieConsent } from '../../store/useCookieConsent';

export const CookieBanner = () => {
    const { hasConsented, acknowledge } = useCookieConsent();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Don't render anything if SSR or if already consented
    if (!isMounted || hasConsented) return null;

    return (
        <AnimatePresence>
            {!hasConsented && (
                <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 pointer-events-none flex justify-center">
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0, transition: { duration: 0.3 } }}
                        className="w-full max-w-4xl pointer-events-auto"
                    >
                        <div className="glass-dark border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                            {/* Background shimmer */}
                            <div className="absolute inset-0 bg-gradient-to-r from-alpine-glacier/5 via-transparent to-alpine-glacier/5 pointer-events-none" />

                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-alpine-glacier/20 p-2 rounded-lg text-alpine-glacier">
                                            <Cookie size={20} />
                                        </div>
                                        <h3 className="text-xl font-bold text-white font-serif tracking-wide">Essential Cookies Only</h3>
                                    </div>
                                    <p className="text-sm text-white/60 leading-relaxed">
                                        We value your privacy. This website only uses strictly necessary cookies to ensure proper functionality, such as keeping you securely logged in. We do not use any analytics, marketing, or tracking cookies.
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                    <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-white/80 text-sm font-medium whitespace-nowrap bg-white/5 cursor-default">
                                        <Shield size={16} className="text-alpine-glacier" />
                                        Secure & Private
                                    </div>
                                    <button
                                        onClick={acknowledge}
                                        className="px-6 py-2.5 rounded-xl bg-alpine-glacier text-alpine-navy hover:bg-alpine-glacier/90 text-sm font-bold transition-all whitespace-nowrap shadow-[0_0_15px_rgba(67,176,241,0.3)] hover:shadow-[0_0_20px_rgba(67,176,241,0.5)]"
                                    >
                                        Got it
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
