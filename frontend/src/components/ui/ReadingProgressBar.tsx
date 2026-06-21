import React from 'react';
import { motion, useScroll } from 'framer-motion';

export const ReadingProgressBar: React.FC = () => {
    const { scrollYProgress } = useScroll();

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[100]"
            style={{
                scaleX: scrollYProgress,
                background: 'linear-gradient(90deg, #A3C9E2 0%, #E2A071 50%, #A3C9E2 100%)',
                boxShadow: '0 0 10px rgba(163, 201, 226, 0.8), 0 0 20px rgba(226, 160, 113, 0.4)'
            }}
        />
    );
};
