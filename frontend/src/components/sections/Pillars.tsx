import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { Quote, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { pillarsApi } from '../../lib/api';

export const Pillars = () => {
    const { t } = useTranslation();
    const [leaders, setLeaders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [topIndex, setTopIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: false, amount: 0.3 });
    const controls = useAnimation();

    useEffect(() => {
        const fetchLeaders = async () => {
            try {
                const data = await pillarsApi.list();
                setLeaders(data);
            } catch (err) {
                console.error("Failed to fetch leaders", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaders();
    }, []);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isInView && leaders.length > 0) {
            controls.start('visible');
            timer = setInterval(() => {
                setTopIndex((prev) => (prev + 1) % leaders.length);
            }, 3500);
        }
        return () => clearInterval(timer);
    }, [isInView, controls, leaders.length]);

    if (loading) {
        return (
            <section className="py-20 md:py-28 px-6 bg-alpine-snow dark:bg-black flex items-center justify-center min-h-[50vh]">
                <Loader2 className="animate-spin text-alpine-glacier" size={48} />
            </section>
        );
    }

    if (leaders.length === 0) return null;

    return (
        <section className="py-20 md:py-28 px-6 md:px-12 bg-alpine-snow dark:bg-black text-alpine-navy dark:text-alpine-snow overflow-hidden">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-10 md:gap-12 items-center h-full min-h-[50vh] md:min-h-[60vh]" ref={containerRef}>

                {/* Left Side Info */}
                <div className="md:w-1/2 min-w-min z-20 text-center md:text-left">
                    <motion.p
                        initial="hidden"
                        animate={controls}
                        variants={{
                            hidden: { opacity: 0, y: 10 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                        }}
                        className="text-alpine-blue dark:text-alpine-sunrise text-xs md:text-sm font-semibold tracking-[0.3em] uppercase mb-3"
                    >
                        {t('pillars.leadership_subtitle', 'Leadership')}
                    </motion.p>
                    <motion.h2
                        initial="hidden"
                        animate={controls}
                        variants={{
                            hidden: { opacity: 0, x: -50 },
                            visible: { opacity: 1, x: 0, transition: { type: "spring", damping: 15 } }
                        }}
                        className="text-4xl md:text-6xl lg:text-7xl font-serif mb-4 md:mb-6 leading-tight drop-shadow-sm"
                    >
                        {t('pillars.title', 'Pillars of the Community')}
                    </motion.h2>
                    <motion.p
                        initial="hidden"
                        animate={controls}
                        variants={{
                            hidden: { opacity: 0, filter: "blur(10px)" },
                            visible: { opacity: 1, filter: "blur(0px)", transition: { duration: 1, delay: 0.2 } }
                        }}
                        className="text-alpine-navy/70 dark:text-alpine-snow/70 font-light mb-8 md:mb-10 text-base md:text-xl lg:text-2xl max-w-lg mx-auto md:mx-0"
                    >
                        {t('pillars.subtitle', 'The heartbeat of Mountaineer Mallu. Our seasoned team leads ensure every expedition is safe, thrilling, and unforgettable.')}
                    </motion.p>

                    <motion.div
                        initial="hidden"
                        animate={controls}
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0, transition: { delay: 0.4 } }
                        }}
                    >
                        <Link to="/team" className="group inline-flex items-center gap-3 md:gap-4 text-alpine-blue dark:text-alpine-sunrise font-medium text-base md:text-lg w-max">
                            {t('pillars.meet_team', 'Meet the Full Core')} <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </motion.div>

                    {/* Card navigation dots on mobile */}
                    <div className="flex gap-2 mt-6 justify-center md:hidden">
                        {leaders.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setTopIndex(i)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === topIndex ? 'bg-alpine-blue dark:bg-alpine-sunrise scale-150' : 'bg-black/15 dark:bg-white/15'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Right Side Stacked Spring Cards */}
                <div className="md:w-1/2 w-full h-[380px] md:h-[500px] relative perspective-[1000px] flex justify-center items-center">
                    {leaders.map((leader, i) => {
                        let relativeIndex = (i - topIndex + leaders.length) % leaders.length;
                        const isFront = relativeIndex === 0;

                        return (
                            <motion.div
                                key={leader._id}
                                animate={{
                                    scale: 1 - relativeIndex * 0.08,
                                    y: relativeIndex === 0 ? 0 : relativeIndex * -35,
                                    zIndex: leaders.length - relativeIndex,
                                    opacity: 1 - relativeIndex * 0.2,
                                    rotateX: relativeIndex * 4,
                                    filter: `blur(${relativeIndex * 0.5}px)`,
                                }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 100,
                                    damping: 14,
                                    mass: 1,
                                }}
                                className={`absolute w-64 md:w-80 h-[340px] md:h-[420px] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-white/10 ${isFront ? 'cursor-pointer' : 'pointer-events-none'}`}
                                onClick={() => setTopIndex((prev) => (prev + 1) % leaders.length)}
                            >
                                <img src={leader.image} alt={leader.name} className="w-full h-full object-cover transition-all duration-1000" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />

                                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end text-white">
                                    <Quote size={24} className="text-white/20 mb-3 md:mb-4" />
                                    <p className="font-serif italic text-base md:text-xl mb-4 md:mb-6 text-alpine-glacier drop-shadow-md leading-relaxed">
                                        "{leader.quote}"
                                    </p>

                                    <div>
                                        <h3 className="text-2xl md:text-3xl font-serif font-medium text-white mb-1 md:mb-2">{leader.name}</h3>
                                        <p className="text-xs md:text-sm tracking-widest uppercase text-alpine-sunrise font-semibold">{leader.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
};

