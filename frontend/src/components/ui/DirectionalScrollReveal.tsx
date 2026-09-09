import React from 'react';
import { motion } from 'framer-motion';

interface DirectionalScrollRevealProps {
    children: React.ReactNode;
    className?: string;
    id?: string;
    delay?: number;
}

export const DirectionalScrollReveal: React.FC<DirectionalScrollRevealProps> = ({
    children,
    className = '',
    id,
    delay = 0,
}) => {
    return (
        <section id={id} className={`relative w-full section-contain ${className}`}>
            <motion.div
                initial={{
                    opacity: 0,
                    y: 20,
                }}
                whileInView={{
                    opacity: 1,
                    y: 0,
                }}
                viewport={{ amount: 0.1, once: true }}
                transition={{
                    duration: 0.7,
                    delay,
                    ease: [0.16, 1, 0.3, 1],
                }}
                className="w-full transform-gpu"
            >
                {children}
            </motion.div>
        </section>
    );
};
