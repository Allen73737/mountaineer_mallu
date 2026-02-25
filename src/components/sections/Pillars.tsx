import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { Quote, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const LEADERS = [
    { id: 1, name: 'Arjun M.', role: 'Founder & Chief Guide', image: 'https://images.unsplash.com/photo-1548365328-8c6db2b291d5?q=80&w=600&h=600&fit=crop', quote: "Every mountain teaches us something pure." },
    { id: 2, name: 'Divya R.', role: 'Safety Coordinator', image: 'https://images.unsplash.com/photo-1583852002596-fdfeb193306a?q=80&w=600&h=600&fit=crop', quote: "Preparation is the only oxygen you need." },
    { id: 3, name: 'Basil V.', role: 'Gear Expert', image: 'https://images.unsplash.com/photo-1552697275-c72eb62a98f1?q=80&w=600&h=600&fit=crop', quote: "Trust your equipment, trust your team." },
    { id: 4, name: 'Aisha T.', role: 'Trail Lead', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&h=600&fit=crop', quote: "The summit is just the halfway point." },
];

export const Pillars = () => {
    const [topIndex, setTopIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: false, amount: 0.3 });
    const controls = useAnimation();

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isInView) {
            controls.start('visible');
            timer = setInterval(() => {
                setTopIndex((prev) => (prev + 1) % LEADERS.length);
            }, 3500);
        }
        return () => clearInterval(timer);
    }, [isInView, controls]);

    return (
        <section className="py-24 px-6 md:px-12 bg-alpine-snow dark:bg-black/80 text-alpine-navy dark:text-alpine-snow overflow-hidden">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 items-center h-full min-h-[60vh]" ref={containerRef}>

                {/* Left Side Info */}
                <div className="md:w-1/2 min-w-min z-20">
                    <motion.h2
                        initial="hidden"
                        animate={controls}
                        variants={{
                            hidden: { opacity: 0, x: -50 },
                            visible: { opacity: 1, x: 0, transition: { type: "spring", damping: 15 } }
                        }}
                        className="text-5xl md:text-7xl font-serif mb-6 leading-tight drop-shadow-sm"
                    >
                        Pillars of the Community
                    </motion.h2>
                    <motion.p
                        initial="hidden"
                        animate={controls}
                        variants={{
                            hidden: { opacity: 0, filter: "blur(10px)" },
                            visible: { opacity: 1, filter: "blur(0px)", transition: { duration: 1, delay: 0.2 } }
                        }}
                        className="text-alpine-navy/70 dark:text-alpine-snow/70 font-light mb-10 text-xl md:text-2xl"
                    >
                        The heartbeat of Mountaineer Mallu. Our seasoned team leads ensure every expedition is safe, thrilling, and unforgettable.
                    </motion.p>

                    <motion.div
                        initial="hidden"
                        animate={controls}
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0, transition: { delay: 0.4 } }
                        }}
                    >
                        <Link to="/team" className="group flex items-center gap-4 text-alpine-blue dark:text-alpine-sunrise font-medium text-lg w-max">
                            Meet the Full Core <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </motion.div>
                </div>

                {/* Right Side Stacked Spring Cards */}
                <div className="md:w-1/2 w-full h-[500px] relative perspective-[1000px] flex justify-center items-center">
                    {LEADERS.map((leader, i) => {
                        // Calculate position in the stack relative to current topIndex
                        let relativeIndex = (i - topIndex + LEADERS.length) % LEADERS.length;

                        // If it just got discarded (it was topIndex exactly 1 step ago), animate it flying out then back in
                        // Standard order: 0 is front, 1 is behind that, 2 is behind that, etc.
                        const isFront = relativeIndex === 0;

                        return (
                            <motion.div
                                key={leader.id}
                                animate={{
                                    scale: 1 - relativeIndex * 0.1, // Scale down as it goes back
                                    y: relativeIndex === 0 ? 0 : relativeIndex * -40, // stagger vertically up
                                    zIndex: LEADERS.length - relativeIndex,
                                    opacity: 1 - relativeIndex * 0.2,
                                    rotateX: relativeIndex * 5,
                                    filter: `blur(${relativeIndex}px)`,
                                }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 100,
                                    damping: 14,
                                    mass: 1,
                                }}
                                className={`absolute w-80 h-[400px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 ${isFront ? 'cursor-pointer' : 'pointer-events-none'}`}
                                onClick={() => setTopIndex((prev) => (prev + 1) % LEADERS.length)}
                            >
                                <img src={leader.image} alt={leader.name} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-1000" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90" />

                                <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                                    <Quote size={32} className="text-white/30 mb-4" />
                                    <p className="font-serif italic text-xl mb-6 text-alpine-glacier drop-shadow-md">
                                        "{leader.quote}"
                                    </p>

                                    <div>
                                        <h3 className="text-3xl font-serif font-medium text-white mb-2">{leader.name}</h3>
                                        <p className="text-sm tracking-widest uppercase text-alpine-sunrise font-semibold">{leader.role}</p>
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
