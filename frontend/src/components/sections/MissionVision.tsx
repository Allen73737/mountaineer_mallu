import React, { useRef } from 'react';
import { motion, useInView, useScroll, useTransform, Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Helper component for premium staggered text animation
const AnimatedText = ({ text, className, delayOffset = 0 }: { text: string; className: string, delayOffset?: number }) => {
    // Split text into words
    const words = text.split(" ");

    const container: Variants = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.05, delayChildren: delayOffset * i },
        }),
    };

    const child: Variants = {
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
            viewport={{ once: true, margin: "0px 0px -40px 0px" }}
            className={`flex flex-wrap ${className}`}
        >
            {words.map((word, index) => (
                <motion.span variants={child} key={index} className="mr-2 md:mr-4 mb-2 flex">
                    <motion.span
                        variants={{
                            hidden: { opacity: 0, y: 15 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
                        }}
                        style={{ display: "inline-block" }}
                    >
                        {word}
                    </motion.span>
                </motion.span>
            ))}
        </motion.h3>
    );
};

export const MissionVision = () => {
    const { t } = useTranslation();
    const sectionRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "center center"]
    });
    
    // The fog starts fully opaque when the section just enters the viewport
    // and fades out entirely by the time the section is fully centered.
    const fogOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
    const fogY = useTransform(scrollYProgress, [0, 1], [100, 0]);

    return (
        <section ref={sectionRef} id="mission" className="pt-24 md:pt-32 pb-32 md:pb-40 px-6 md:px-12 bg-transparent dark:bg-transparent text-[#0B0C10] dark:text-alpine-snow relative overflow-hidden z-20">
            {/* Scrollytelling Fog Overlay */}
            <motion.div 
                style={{ opacity: fogOpacity, y: fogY }}
                className="absolute inset-0 z-30 pointer-events-none opacity-40"
            >
                {/* Smooth radial fog gradients */}
                <div className="absolute top-0 left-[-10%] w-[120%] h-[100%] bg-gradient-to-b from-white/15 via-white/5 to-transparent dark:from-black/25 dark:via-black/10 dark:to-transparent blur-3xl" />
                <div className="absolute top-1/4 left-1/4 w-[50%] h-[50%] bg-white/10 dark:bg-black/20 blur-3xl rounded-full" />
            </motion.div>

            {/* Subtle ambient gradient orbs */}
            <div className="absolute top-20 right-[-10%] w-[40vw] h-[40vw] rounded-full opacity-[0.04] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(226,160,113,0.8) 0%, transparent 70%)' }} />
            <div className="absolute bottom-20 left-[-10%] w-[35vw] h-[35vw] rounded-full opacity-[0.04] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(163,201,226,0.8) 0%, transparent 70%)' }} />

            <div className="w-full max-w-[1600px] mx-auto flex flex-col gap-24 md:gap-40 relative">

                {/* Mission */}
                <div className="flex flex-col md:flex-row gap-8 md:gap-24 items-start relative">
                    <div className="md:w-1/2 pt-4 relative z-10">
                        <AnimatedText
                            text={t('mission.title', 'OUR MISSION')}
                            className="text-5xl sm:text-6xl md:text-[5.5rem] lg:text-[7rem] font-black tracking-tighter uppercase text-alpine-sunrise leading-none mb-6"
                        />
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: 80 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-1.5 md:h-2 bg-gradient-to-r from-alpine-sunrise to-alpine-gold rounded-full"
                        />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="md:w-1/2 relative z-10"
                    >
                        <h3 className="text-2xl md:text-4xl lg:text-5xl font-serif leading-tight">
                            {t('mission.description', 'To forge unbreakable bonds on the highest peaks, pushing the boundaries of human endurance and shared heritage.')}
                        </h3>
                    </motion.div>
                </div>

                {/* Decorative connecting element */}
                <motion.div
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    className="hidden md:block w-[1px] h-24 bg-gradient-to-b from-alpine-sunrise/30 via-alpine-glacier/20 to-transparent mx-auto origin-top"
                />

                {/* Vision */}
                <div className="flex flex-col md:flex-row gap-8 md:gap-24 items-start relative">
                    <div className="md:w-1/2 md:order-last pt-4 text-left md:text-right flex flex-col items-start md:items-end relative z-10">
                        <AnimatedText
                            text={t('mission.vision_title', 'OUR VISION')}
                            className="text-5xl sm:text-6xl md:text-[5.5rem] lg:text-[7rem] font-black tracking-tighter uppercase text-alpine-glacier leading-none mb-6 justify-start md:justify-end"
                        />
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: 80 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-1.5 md:h-2 bg-gradient-to-r from-alpine-glacier to-alpine-blue rounded-full"
                        />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="md:w-1/2 md:order-first md:text-right relative z-10"
                    >
                        <h3 className="text-2xl md:text-4xl lg:text-5xl font-serif leading-tight">
                            {t('mission.vision_desc', 'A Europe where every Malayalee can find their path, conquer the impossible, and carry the spirit of the mountains within.')}
                        </h3>
                    </motion.div>
                </div>

            </div>
        </section>
    );
};
