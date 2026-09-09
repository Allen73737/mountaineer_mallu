import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Compass, Mountain } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const AltitudeHUD = () => {
    const { scrollYProgress } = useScroll();
    const location = useLocation();
    const [elevation, setElevation] = useState(0);

    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
    const elevationValue = useTransform(smoothProgress, [0, 1], [0, 2962]);
    const gaugeHeight = useTransform(smoothProgress, [0, 1], ['0%', '100%']);

    useEffect(() => {
        const unsubscribe = elevationValue.on("change", (latest) => {
            setElevation(Math.round(latest));
        });
        return () => unsubscribe();
    }, [elevationValue]);

    if (location.pathname.startsWith('/summit-control-panel')) {
        return null;
    }

    const getElevationStage = (alt: number) => {
        if (alt < 500) return 'Base Camp HQ';
        if (alt < 1200) return 'Alpine Ridge';
        if (alt < 2000) return 'Glacier Pass';
        if (alt < 2700) return 'High Camp';
        return 'Zugspitze Summit';
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-center gap-4 pointer-events-none"
        >
            <div className="glass-premium px-4 py-5 rounded-2xl border border-white/15 backdrop-blur-2xl flex flex-col items-center gap-3 shadow-[0_10px_40px_rgba(0,0,0,0.4)] pointer-events-auto group hover:border-alpine-glacier/50 transition-all duration-500">
                <div className="p-2 rounded-xl bg-white/10 text-alpine-glacier group-hover:rotate-45 transition-transform duration-500">
                    <Compass size={18} />
                </div>

                <div className="flex flex-col items-center text-center my-1">
                    <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-alpine-sunrise">
                        ALTITUDE
                    </span>
                    <div className="text-xl font-mono font-bold text-white tracking-wider my-0.5 flex items-baseline gap-0.5">
                        <span>{elevation.toLocaleString()}</span>
                        <span className="text-xs text-white/50 font-normal">m</span>
                    </div>
                    <span className="text-[9px] tracking-widest uppercase text-alpine-glacier/90 font-medium max-w-[100px] truncate">
                        {getElevationStage(elevation)}
                    </span>
                </div>

                <div className="w-1.5 h-24 rounded-full bg-white/10 relative overflow-hidden my-1">
                    <motion.div
                        className="w-full bg-gradient-to-t from-alpine-glacier via-alpine-sunrise to-white rounded-full absolute bottom-0 shadow-[0_0_10px_rgba(56,189,248,0.8)]"
                        style={{ height: gaugeHeight }}
                    />
                </div>

                <div className="flex items-center gap-1 text-[9px] tracking-widest uppercase text-white/60 font-semibold">
                    <Mountain size={12} className="text-alpine-sunrise" />
                    <span>2962m</span>
                </div>
            </div>
        </motion.div>
    );
};
