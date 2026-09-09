import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ReadingProgressBar } from '../components/ui/ReadingProgressBar';
import { motion } from 'framer-motion';
import { MapPin, Calendar, User, BookOpen, Loader2 } from 'lucide-react';
import { storiesApi } from '../lib/api';
import { BackButton } from '../components/ui/BackButton';
import { DetailSkeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';

export const StoryDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [story, setStory] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStory = async () => {
            try {
                if (!id) return;
                const data = await storiesApi.get(id);
                setStory(data.story);
            } catch (err: any) {
                setError(err.message || 'Failed to load story');
            } finally {
                setLoading(false);
            }
        };
        fetchStory();
    }, [id]);

    if (loading) {
        return <DetailSkeleton />;
    }

    if (error || !story) {
        return (
            <div className="min-h-screen bg-alpine-snow dark:bg-[#0B0C10] flex items-center justify-center p-6 text-alpine-navy dark:text-alpine-snow pt-24">
                <div className="max-w-md w-full">
                    <ErrorState
                        statusCode={error ? 500 : 404}
                        title={error ? "Chronicle Signal Lost" : "Chronicle Not Found"}
                        message={error || 'This expedition log could not be located in the alpine archives. It may have been archived or moved.'}
                        backLink="/stories"
                        backText="Back to Chronicles"
                    />
                </div>
            </div>
        );
    }

    const paragraphs = story.content?.split(/\n\n+/).filter((p: string) => p.trim()) || [];

    return (
        <div className="min-h-screen bg-alpine-snow dark:bg-[#0B0C10] text-[#0B0C10] dark:text-white pt-24 pb-20">
            <ReadingProgressBar />
            
            {/* Ambient Background Orbs */}
            {/* Hero Section */}
            <div className="relative h-[70vh] w-full overflow-hidden">
                <img 
                    src={story.image} 
                    alt={story.title}
                    className="w-full h-full object-cover filter brightness-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                
                <div className="absolute top-32 left-0 right-0 px-6 md:px-12 z-50">
                    <div className="max-w-7xl mx-auto">
                        <BackButton backTo="/stories" />
                    </div>
                </div>

                <div className="absolute bottom-0 inset-x-0 p-8 md:p-12 md:pb-20">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="flex flex-wrap gap-3 mb-6">
                                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-alpine-glacier bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                    <MapPin size={12} /> {story.region}
                                </span>
                                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-alpine-sunrise bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                    <Calendar size={12} /> {story.date}
                                </span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-8 leading-tight drop-shadow-2xl">
                                {story.title}
                            </h1>
                            <div className="flex items-center gap-4 text-white/70">
                                <div className="w-12 h-12 rounded-full bg-alpine-glacier/20 flex items-center justify-center border border-alpine-glacier/30">
                                    <User size={20} className="text-alpine-glacier" />
                                </div>
                                <div>
                                    <p className="font-bold text-lg text-white">{story.author}</p>
                                    <p className="text-sm font-medium uppercase tracking-wider text-white/40">Field Correspondent</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Article Content */}
            <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="prose prose-invert prose-alpine max-w-none"
                >
                    {/* Excerpt */}
                    {story.excerpt && (
                        <p className="text-2xl font-light text-white/80 leading-relaxed mb-12 border-l-4 border-alpine-glacier/40 pl-8 italic">
                            {story.excerpt}
                        </p>
                    )}

                    {/* Main Body */}
                    <div className="space-y-8">
                        {paragraphs.map((p: string, i: number) => (
                            <p key={i} className="text-lg md:text-xl text-white/70 leading-relaxed font-light">
                                {i === 0 && p.length > 1 ? (
                                    <>
                                        <span className="float-left text-7xl font-serif font-bold text-alpine-glacier mr-4 mt-2 leading-[0.8]">{p[0]}</span>
                                        {p.slice(1)}
                                    </>
                                ) : p}
                            </p>
                        ))}
                    </div>

                    {!paragraphs.length && (
                        <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-3xl">
                            <BookOpen size={32} className="mx-auto mb-4 text-white/20" />
                            <p className="text-white/30 italic">Detailed log entries are being synchronized...</p>
                        </div>
                    )}
                </motion.div>

                {/* Footer Actions */}
                <div className="mt-24 pt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                            <User size={24} className="text-white/40" />
                        </div>
                        <div>
                            <p className="font-bold text-white">Written by {story.author}</p>
                            <p className="text-sm text-white/40">Mountaineer Mallu Community</p>
                        </div>
                    </div>
                    <Link 
                        to="/stories" 
                        className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-bold transition-all"
                    >
                        Explore More Chronicles
                    </Link>
                </div>
            </div>
        </div>
    );
};
