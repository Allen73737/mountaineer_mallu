import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { storiesApi } from '../lib/api';
import { CardSkeleton } from '../components/ui/Skeleton';
import { BackButton } from '../components/ui/BackButton';

export const StoriesPage = () => {
    const [stories, setStories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<any>(null);

    useEffect(() => {
        const fetchStories = async () => {
            setLoading(true);
            try {
                const data = await storiesApi.list(page, 12);
                setStories(data.stories);
                setPagination(data.pagination);
            } catch (err) {
                console.error('Failed to load stories:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStories();
    }, [page]);

    return (
        <div className="min-h-screen bg-alpine-snow dark:bg-black text-alpine-navy dark:text-alpine-snow pt-32 pb-24 px-6 md:px-12">
            <div className="max-w-7xl mx-auto relative z-50">
                <BackButton />

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

                {/* Loading Skeletons */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)}
                    </div>
                ) : stories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[40vh] text-center">
                        <p className="text-alpine-navy/40 dark:text-white/30 text-xl font-serif">No chronicles yet. The journey begins soon.</p>
                    </div>
                ) : (
                    <>
                        {/* Masonry Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {stories.map((story, i) => (
                                <motion.div
                                    key={story._id || i}
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
                                                <Link to={`/stories/${story._id}`} className="flex items-center gap-2 text-alpine-glacier font-medium text-sm hover:text-white transition-colors">
                                                    Read Log <ArrowRight size={16} />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.pages > 1 && (
                            <div className="flex justify-center gap-3 mt-16">
                                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-10 h-10 rounded-full font-medium transition-all ${p === page
                                            ? 'bg-alpine-glacier text-alpine-navy'
                                            : 'bg-white/10 dark:bg-white/5 text-alpine-navy/60 dark:text-white/50 hover:bg-white/20 dark:hover:bg-white/10'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
