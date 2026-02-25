import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CHRONICLES = [
    { id: 1, title: 'The Eiger North Face', excerpt: 'A gruelling 3-day ascent battling severe blizzards and sheer vertical ice. Surviving the Mordwand.', author: 'Rahul Krishnan', date: 'Oct 2025', region: 'Swiss Alps', image: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?q=80&w=1200' },
    { id: 2, title: 'Dolomites Via Ferrata', excerpt: 'Traversing the iron paths left from WWI. A high-altitude dance along razor-sharp limestone ridges.', author: 'Arun Thomas', date: 'Aug 2025', region: 'Italy', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200' },
    { id: 3, title: 'Mont Blanc Circuit', excerpt: 'A grueling 170km trek through three countries. Testing physical endurance and mental fortitude.', author: 'Nithin Varghese', date: 'Jul 2025', region: 'France', image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=1200' },
    { id: 4, title: 'Zugspitze Winter Summit', excerpt: 'Pushing to Germany\'s highest peak in the dead of winter. Navigating deep powder and avalanche risk.', author: 'Sneha Nair', date: 'Jan 2025', region: 'Germany', image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=1200' },
    { id: 5, title: 'Matterhorn Ascent', excerpt: 'The iconic pyramid. A story of strict discipline, perfect weather windows, and ultimate triumph.', author: 'Vivek G.', date: 'Sep 2024', region: 'Switzerland', image: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a86?q=80&w=1200' },
    { id: 6, title: 'Glacier Express Route', excerpt: 'Ice climbing across deep crevasses. The silent, terrifying beauty of millennia-old frozen rivers.', author: 'Divya R.', date: 'Jun 2024', region: 'Swiss Alps', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200' },
];

export const StoriesPage = () => {
    return (
        <div className="min-h-screen bg-alpine-snow dark:bg-black text-alpine-navy dark:text-alpine-snow pt-32 pb-24 px-6 md:px-12">
            <div className="max-w-7xl mx-auto">

                {/* Cinematic Header */}
                <div className="mb-24 flex flex-col md:flex-row gap-12 items-end justify-between border-b border-black/10 dark:border-white/10 pb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, type: "spring", damping: 15 }}
                    >
                        <h1 className="text-6xl md:text-8xl font-serif font-bold text-alpine-navy dark:text-alpine-snow drop-shadow-sm mb-6">
                            The Chronicles
                        </h1>
                        <p className="text-xl md:text-2xl font-light text-alpine-navy/60 dark:text-alpine-snow/60 max-w-2xl">
                            Authentic field reports, survival tales, and breathtaking journals from the Mountaineer Mallu community.
                        </p>
                    </motion.div>
                </div>

                {/* Masonry Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {CHRONICLES.map((story, i) => (
                        <motion.div
                            key={story.id}
                            initial={{ opacity: 0, y: 100 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: i * 0.1, type: "spring", damping: 15 }}
                            className={`group relative rounded-3xl overflow-hidden glass-dark bg-white/50 dark:bg-black/30 border border-black/5 dark:border-white/10 hover:shadow-2xl transition-shadow ${i === 0 || i === 3 ? 'md:col-span-2 lg:col-span-2 aspect-[21/9] md:aspect-[21/10]' : 'aspect-square md:aspect-[3/4]'}`}
                        >
                            <img
                                src={story.image}
                                className="w-full h-full object-cover filter brightness-75 group-hover:brightness-100 group-hover:scale-105 transition-all duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-700" />

                            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
                                <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                                    <div className="flex flex-wrap gap-4 mb-4">
                                        <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-alpine-glacier bg-black/50 backdrop-blur-md px-3 py-1 rounded-full"><MapPin size={14} /> {story.region}</span>
                                        <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-alpine-sunrise bg-black/50 backdrop-blur-md px-3 py-1 rounded-full"><Calendar size={14} /> {story.date}</span>
                                    </div>

                                    <h2 className={`font-serif text-white mb-4 drop-shadow-lg ${i === 0 || i === 3 ? 'text-4xl md:text-5xl' : 'text-3xl'}`}>{story.title}</h2>

                                    <p className="text-white/80 font-light text-sm md:text-base mb-6 line-clamp-2">{story.excerpt}</p>

                                    <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                        <span className="text-xs font-semibold uppercase tracking-widest text-white/50">By {story.author}</span>
                                        <Link to={`/stories/${story.id}`} className="flex items-center gap-2 text-alpine-glacier font-medium text-sm hover:text-white transition-colors">
                                            Read Log <ArrowRight size={16} />
                                        </Link>
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
