import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, ShieldCheck } from 'lucide-react';

const REVIEWS = [
    { id: 1, name: 'Sarah J.', text: "The Mont Blanc expedition changed my life. The guides were incredible and the camaraderie was unmatched.", rating: 5, expedition: 'Mont Blanc Circuit', date: 'Oct 2025' },
    { id: 2, name: 'David M.', text: "Exceptional gear advice and route planning. I felt safe every step of the way up the Eiger.", rating: 5, expedition: 'Eiger Ascent', date: 'Sep 2025' },
    { id: 3, name: 'Elena K.', text: "Mountaineer Mallu isn't just a guide service, it's a family. The winter meetup was spectacular.", rating: 4, expedition: 'Winter Alps Meetup', date: 'Dec 2024' },
    { id: 4, name: 'Marcus T.', text: "A truly premium experience. The attention to detail from basecamp to summit was flawless. Will ascend again.", rating: 5, expedition: 'Matterhorn Summit', date: 'Aug 2024' },
    { id: 5, name: 'Chloe B.', text: "They pushed me beyond my limits while ensuring I was never in absolute danger. The perfect balance.", rating: 5, expedition: 'Dolomite Ridge Walk', date: 'Jul 2024' },
    { id: 6, name: 'Liam W.', text: "Logistics were handled seamlessly. All I had to worry about was putting one foot in front of the other.", rating: 4, expedition: 'Zugspitze Summit', date: 'Jan 2024' },
];

export const ReviewsPage = () => {
    return (
        <div className="min-h-screen bg-alpine-snow dark:bg-black text-alpine-navy dark:text-alpine-snow pt-32 pb-24 px-6 md:px-12 relative overflow-hidden">

            <div className="max-w-7xl mx-auto">

                {/* Header Stats */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-12 border-b border-black/10 dark:border-white/10 pb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, type: 'spring' }}
                    >
                        <h1 className="text-6xl md:text-8xl font-serif font-black mb-6 drop-shadow-sm">The Legacy</h1>
                        <p className="text-xl md:text-2xl font-light text-alpine-navy/60 dark:text-alpine-snow/60 max-w-xl">
                            Don't just take our word for it. Read raw accounts from those who have touched the sky with us.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2, type: 'spring' }}
                        className="flex gap-8"
                    >
                        <div className="text-center">
                            <div className="text-5xl font-serif font-black text-alpine-blue dark:text-alpine-sunrise">4.9<span className="text-2xl text-opacity-50">/5</span></div>
                            <div className="text-sm font-bold tracking-widest uppercase mt-2 text-alpine-navy/60 dark:text-alpine-snow/60">Average Rating</div>
                        </div>
                        <div className="w-px bg-black/10 dark:bg-white/10" />
                        <div className="text-center">
                            <div className="text-5xl font-serif font-black text-alpine-blue dark:text-alpine-sunrise">800+</div>
                            <div className="text-sm font-bold tracking-widest uppercase mt-2 text-alpine-navy/60 dark:text-alpine-snow/60">Summits Reached</div>
                        </div>
                    </motion.div>
                </div>

                {/* Masonry Review Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {REVIEWS.map((review, i) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.6, delay: i * 0.1, type: "spring", bounce: 0.4 }}
                            className="glass-dark bg-white/50 dark:bg-black/20 p-8 rounded-3xl border border-black/5 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-500 group relative overflow-hidden"
                        >
                            <Quote className="absolute -top-4 -left-4 w-32 h-32 text-alpine-glacier/10 dark:text-alpine-snow/5 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, idx) => (
                                            <Star
                                                key={idx}
                                                size={18}
                                                className={idx < review.rating ? "fill-alpine-sunrise text-alpine-sunrise" : "fill-transparent text-gray-300 dark:text-gray-700"}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs font-bold text-alpine-forest dark:text-alpine-glacier bg-alpine-forest/10 dark:bg-alpine-glacier/10 px-2 py-1 rounded">
                                        <ShieldCheck size={14} /> Verified Climber
                                    </div>
                                </div>

                                <p className="font-serif text-2xl md:text-3xl italic leading-snug mb-8 text-alpine-navy/90 dark:text-alpine-snow/90 flex-grow">
                                    "{review.text}"
                                </p>

                                <div className="mt-auto border-t border-black/10 dark:border-white/10 pt-6">
                                    <h4 className="font-bold text-lg mb-1">{review.name}</h4>
                                    <div className="flex justify-between items-center text-sm font-semibold tracking-wider uppercase text-alpine-navy/50 dark:text-alpine-snow/50">
                                        <span className="text-alpine-blue dark:text-alpine-sunrise">{review.expedition}</span>
                                        <span>{review.date}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </div>
    );
};
