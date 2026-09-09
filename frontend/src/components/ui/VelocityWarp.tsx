import React, { useEffect } from 'react';
import { motion, useScroll, useVelocity, useSpring, useTransform } from 'framer-motion';

interface VelocityWarpProps {
    children: React.ReactNode;
    className?: string;
    maxSkewDegrees?: number;
}

export const VelocityWarp: React.FC<VelocityWarpProps> = ({
    children,
    className = '',
    maxSkewDegrees = 1.8,
}) => {
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);

    const rawVelocity = useSpring(scrollVelocity, {
        stiffness: 140,
        damping: 18,
        mass: 0.2,
    });

    const skewY = useTransform(
        rawVelocity,
        [-2000, 0, 2000],
        [-maxSkewDegrees, 0, maxSkewDegrees]
    );

    const scaleY = useTransform(
        rawVelocity,
        [-2000, 0, 2000],
        [1.006, 1, 1.006]
    );

    return (
        <motion.div
            style={{
                skewY,
                scaleY,
                transformOrigin: '50% 50%',
            }}
            className={`relative will-change-transform transform-gpu ${className}`}
        >
            {children}
        </motion.div>
    );
};
