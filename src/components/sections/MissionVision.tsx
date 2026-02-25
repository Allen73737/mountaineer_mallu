import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

// Helper component for premium staggered text animation
const AnimatedText = ({ text, className, delayOffset = 0 }: { text: string; className: string, delayOffset?: number }) => {
    // Split text into words
    const words = text.split(" ");

    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.05, delayChildren: delayOffset * i },
        }),
    };

    const child = {
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
        hidden: {
            opacity: 0,
            y: 40,
        },
    };

    return (
        <motion.h3
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className={`flex flex-wrap ${className}`}
        >
            {words.map((word, index) => (
                <motion.span variants={child} key={index} className="mr-3 md:mr-5 mb-2 overflow-hidden flex">
                    {/* Add a subtle rotation or scale to the word block for a 'crazy good' feel */}
                    <motion.span
                        variants={{
                            hidden: { rotateY: 90, scale: 0.8 },
                            visible: { rotateY: 0, scale: 1, transition: { type: "spring", damping: 15 } }
                        }}
                        style={{ display: "inline-block", transformOrigin: "bottom center" }}
                    >
                        {word}
                    </motion.span>
                </motion.span>
            ))}
        </motion.h3>
    );
};

export const MissionVision = () => {
    return (
        <section className="pt-32 pb-40 px-6 md:px-12 bg-alpine-snow dark:bg-[#0B0C10] text-[#0B0C10] dark:text-alpine-snow relative overflow-hidden z-20">
            <div className="max-w-7xl mx-auto flex flex-col gap-40 relative">

                {/* Mission */}
                <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-start">
                    <div className="md:w-1/2 pt-4">
                        <AnimatedText
                            text="OUR MISSION"
                            className="text-6xl md:text-[5.5rem] lg:text-[7rem] font-black tracking-tighter uppercase text-alpine-sunrise leading-none mb-6"
                        />
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: 80 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-2 bg-alpine-sunrise rounded-full"
                        />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="md:w-1/2"
                    >
                        <h3 className="text-3xl md:text-5xl font-serif leading-tight">
                            To forge unbreakable bonds on the highest peaks, pushing the boundaries of human endurance and shared heritage.
                        </h3>
                    </motion.div>
                </div>

                {/* Vision */}
                <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-start">
                    <div className="md:w-1/2 md:order-last pt-4 text-left md:text-right flex flex-col items-start md:items-end">
                        <AnimatedText
                            text="OUR VISION"
                            className="text-6xl md:text-[5.5rem] lg:text-[7rem] font-black tracking-tighter uppercase text-alpine-glacier leading-none mb-6 justify-start md:justify-end"
                        />
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: 80 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-2 bg-alpine-glacier rounded-full"
                        />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="md:w-1/2 md:order-first md:text-right"
                    >
                        <h3 className="text-3xl md:text-5xl font-serif leading-tight">
                            A Europe where every Malayalee can find their path, conquer the impossible, and carry the spirit of the mountains within.
                        </h3>
                    </motion.div>
                </div>

            </div>
        </section>
    );
};
