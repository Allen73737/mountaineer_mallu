import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, Plus, X, Send } from 'lucide-react';

const REVIEWS = [
    { id: 1, name: 'Sarah J.', text: "The Mont Blanc expedition changed my life. The guides were incredible and the camaraderie was unmatched.", rating: 5, expedition: 'Mont Blanc Circuit' },
    { id: 2, name: 'David M.', text: "Exceptional gear advice and route planning. I felt safe every step of the way up the Eiger.", rating: 5, expedition: 'Eiger Ascent' },
    { id: 3, name: 'Elena K.', text: "Mountaineer Mallu isn't just a guide service, it's a family. The winter meetup was spectacular.", rating: 4, expedition: 'Winter Alps Meetup' },
    { id: 4, name: 'Marcus T.', text: "A truly premium experience. The attention to detail from basecamp to summit was flawless.", rating: 5, expedition: 'Matterhorn Summit' },
];

export const Reviews = () => {
    const [index, setIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoveredStar, setHoveredStar] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % REVIEWS.length);
        }, 6000); // 6 second auto-fade
        return () => clearInterval(timer);
    }, []);

    const current = REVIEWS[index];

    return (
        <section className="py-32 px-6 md:px-12 bg-alpine-snow dark:bg-black text-alpine-navy dark:text-alpine-snow overflow-hidden relative">

            {/* Background massive typography */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] md:text-[25rem] font-serif font-black text-black/[0.02] dark:text-white/[0.02] whitespace-nowrap pointer-events-none select-none z-0">
                LEGACY
            </div>

            <div className="max-w-4xl mx-auto relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.8 }}
                    className="mb-16"
                >
                    <h2 className="text-4xl md:text-6xl font-serif mb-4 text-alpine-navy dark:text-alpine-snow">Words from the Summit</h2>
                    <div className="w-24 h-1 bg-alpine-blue dark:bg-alpine-sunrise mx-auto mb-8" />
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="group inline-flex items-center gap-2 px-6 py-3 bg-alpine-navy dark:bg-alpine-snow text-white dark:text-[#0B0C10] rounded-full font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl shadow-alpine-navy/20 dark:shadow-white/20"
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                        Write a Review
                    </button>
                </motion.div>

                <div className="relative h-80 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current.id}
                            initial={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(10px)" }}
                            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, scale: 1.1, y: -20, filter: "blur(10px)" }}
                            transition={{ duration: 0.8, ease: "anticipate" }}
                            className="absolute w-full px-4"
                        >
                            <Quote className="w-16 h-16 mx-auto mb-8 text-alpine-glacier/30" />

                            <p className="text-2xl md:text-4xl font-serif italic mb-10 leading-relaxed text-alpine-navy/90 dark:text-alpine-snow/90 text-shadow-sm">
                                "{current.text}"
                            </p>

                            <div className="flex flex-col items-center gap-3">
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={20}
                                            className={i < current.rating ? "fill-alpine-sunrise text-alpine-sunrise" : "fill-transparent text-gray-300 dark:text-gray-700"}
                                        />
                                    ))}
                                </div>
                                <h4 className="font-bold text-lg text-alpine-navy dark:text-alpine-snow tracking-wide">{current.name}</h4>
                                <span className="text-sm uppercase tracking-widest text-alpine-blue dark:text-alpine-glacier font-semibold">{current.expedition}</span>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Pagination Dots */}
                <div className="flex justify-center gap-3 mt-16">
                    {REVIEWS.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setIndex(i)}
                            className={`w-3 h-3 rounded-full transition-all duration-500 ${i === index ? 'bg-alpine-blue dark:bg-alpine-sunrise scale-150' : 'bg-black/20 dark:bg-white/20'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Review Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-[#0B0C10]/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", bounce: 0.4 }}
                            className="relative w-full max-w-lg bg-white dark:bg-[#15171E] rounded-3xl p-8 shadow-2xl border border-black/5 dark:border-white/10 z-10"
                        >
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-[#0B0C10]/60 dark:text-white/60 hover:text-[#0B0C10] dark:hover:text-white"
                            >
                                <X size={24} />
                            </button>

                            <h3 className="text-3xl font-serif font-bold text-[#0B0C10] dark:text-white mb-2">Leave your Mark</h3>
                            <p className="text-[#0B0C10]/60 dark:text-white/60 mb-8">Tell us about your latest expedition</p>

                            <form onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }} className="flex flex-col gap-6">
                                <div className="flex justify-center gap-2 py-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onMouseEnter={() => setHoveredStar(star)}
                                            onMouseLeave={() => setHoveredStar(0)}
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star
                                                size={36}
                                                className={`transition-colors duration-200 ${(hoveredStar || rating) >= star ? "fill-alpine-sunrise text-alpine-sunrise drop-shadow-[0_0_10px_rgba(255,160,122,0.5)]" : "text-black/10 dark:text-white/10"}`}
                                            />
                                        </button>
                                    ))}
                                </div>

                                <div className="flex gap-4">
                                    <input required type="text" placeholder="Your Name" className="flex-1 w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-alpine-blue dark:focus:border-alpine-sunrise rounded-xl px-4 py-3 outline-none text-[#0B0C10] dark:text-white transition-colors" />
                                    <input required type="text" placeholder="Expedition (Optional)" className="flex-1 w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-alpine-blue dark:focus:border-alpine-sunrise rounded-xl px-4 py-3 outline-none text-[#0B0C10] dark:text-white transition-colors" />
                                </div>

                                <textarea required rows={4} placeholder="Your incredible journey..." className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-alpine-blue dark:focus:border-alpine-sunrise rounded-xl px-4 py-3 outline-none text-[#0B0C10] dark:text-white resize-none transition-colors" />

                                <button type="submit" className="w-full mt-2 py-4 rounded-xl bg-alpine-navy dark:bg-alpine-snow text-white dark:text-[#0B0C10] font-bold text-lg flex items-center justify-center gap-2 hover:bg-alpine-navy/90 dark:hover:bg-white/90 transition-colors shadow-lg">
                                    <Send size={20} /> Submit Story
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
};
