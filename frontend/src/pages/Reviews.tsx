import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ShieldCheck, Plus, X, Send, Filter, CheckCircle, Sparkles, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../components/ui/BackButton';
import { reviewsApi } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { LanguageInput } from '../components/ui/LanguageInput';
import { toast } from 'sonner';
import { CreditTitle } from '../components/ui/CreditTitle';
import { Odometer } from '../components/ui/Odometer';

interface ReviewItem {
    id?: string | number;
    _id?: string;
    name?: string;
    author?: {
        name?: string;
        avatar?: string;
    };
    text?: string;
    content?: string;
    rating: number;
    expedition?: string;
    date?: string;
    createdAt?: string;
}

const FALLBACK_REVIEWS: ReviewItem[] = [
    { 
        id: 1, 
        name: 'Sarah J.', 
        text: "The Mont Blanc expedition changed my life. The guides were incredible and the camaraderie was unmatched.", 
        rating: 5, 
        expedition: 'Mont Blanc Circuit', 
        date: 'Oct 2025' 
    },
    { 
        id: 2, 
        name: 'David M.', 
        text: "Exceptional gear advice and route planning. I felt safe every step of the way up the Eiger.", 
        rating: 5, 
        expedition: 'Eiger Ascent', 
        date: 'Sep 2025' 
    },
    { 
        id: 3, 
        name: 'Elena K.', 
        text: "Mountaineer Mallu isn't just a guide service, it's a family. The winter meetup was spectacular.", 
        rating: 4, 
        expedition: 'Winter Alps Meetup', 
        date: 'Dec 2024' 
    },
    { 
        id: 4, 
        name: 'Marcus T.', 
        text: "A truly premium experience. The attention to detail from basecamp to summit was flawless. Will ascend again.", 
        rating: 5, 
        expedition: 'Matterhorn Summit', 
        date: 'Aug 2024' 
    },
    { 
        id: 5, 
        name: 'Chloe B.', 
        text: "They pushed me beyond my limits while ensuring I was never in absolute danger. The perfect balance.", 
        rating: 5, 
        expedition: 'Dolomite Ridge Walk', 
        date: 'Jul 2024' 
    },
    { 
        id: 6, 
        name: 'Liam W.', 
        text: "Logistics were handled seamlessly. All I had to worry about was putting one foot in front of the other.", 
        rating: 4, 
        expedition: 'Zugspitze Summit', 
        date: 'Jan 2024' 
    },
];

export const ReviewsPage = () => {
    const { t } = useTranslation();
    const { isLoggedIn, user } = useAuthStore();
    const [reviews, setReviews] = useState<ReviewItem[]>(FALLBACK_REVIEWS);
    const [loading, setLoading] = useState(false);
    const [filterRating, setFilterRating] = useState<number | 'all'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Review submission state
    const [submitRating, setSubmitRating] = useState(5);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchApprovedReviews = async () => {
            try {
                setLoading(true);
                const data = await reviewsApi.getApproved();
                if (data && data.length > 0) {
                    const mapped: ReviewItem[] = data.map((item: any) => ({
                        _id: item._id,
                        id: item._id,
                        name: item.author?.name || 'Verified Climber',
                        text: item.content,
                        rating: item.rating,
                        expedition: 'Alpine Expedition',
                        date: new Date(item.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                    }));
                    setReviews(mapped);
                }
            } catch (err) {
                // Keep fallback reviews
            } finally {
                setLoading(false);
            }
        };

        fetchApprovedReviews();
    }, []);

    const filteredReviews = useMemo(() => {
        if (filterRating === 'all') return reviews;
        return reviews.filter(r => r.rating === filterRating);
    }, [reviews, filterRating]);

    const averageRating = useMemo(() => {
        if (reviews.length === 0) return '5.0';
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        return (sum / reviews.length).toFixed(1);
    }, [reviews]);

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoggedIn) {
            toast.error('Authentication Required', {
                description: 'Please sign in to submit a climber testimonial.'
            });
            return;
        }

        if (!content.trim()) {
            toast.error('Please enter your review text.');
            return;
        }

        setSubmitting(true);
        try {
            await reviewsApi.submit({ content: content.trim(), rating: submitRating });
            toast.success('Climber Review Submitted!', {
                description: 'Thank you! Your testimonial has been routed to Mission Control for validation.',
                duration: 4000
            });
            setIsModalOpen(false);
            setContent('');
            setSubmitRating(5);
        } catch (err: any) {
            toast.error(err.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-alpine-snow dark:bg-black text-alpine-navy dark:text-alpine-snow pt-32 pb-24 px-6 md:px-12 relative overflow-hidden">
            {/* Ambient Lighting */}
            <div className="absolute top-24 left-1/4 w-[600px] h-[600px] bg-alpine-blue/5 dark:bg-alpine-sunrise/5 rounded-full blur-[150px] pointer-events-none -z-10" />

            <div className="max-w-7xl mx-auto">
                <BackButton backTo="/" />

                {/* Header Stats */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-12 border-b border-black/10 dark:border-white/10 pb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, type: 'spring' }}
                    >
                        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-alpine-blue/10 dark:bg-alpine-sunrise/10 text-alpine-blue dark:text-alpine-sunrise text-xs font-bold tracking-widest uppercase mb-4">
                            <Sparkles size={14} /> Field Testimonials
                        </span>
                        <CreditTitle lines={[t('reviews.title', 'The Legacy')]} creditClassName="text-alpine-blue dark:text-alpine-sunrise" className="text-5xl md:text-8xl font-serif font-normal drop-shadow-sm" />
                        <p className="text-lg md:text-2xl font-light text-alpine-navy/60 dark:text-alpine-snow/60 max-w-xl">
                            {t('reviews.subtitle', "Don't just take our word for it. Read raw accounts from those who have touched the sky with us.")}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-8 w-full md:w-auto"
                    >
                        <div className="flex items-center gap-8">
                            <div className="text-center">
                                <div className="text-5xl font-serif font-normal text-alpine-blue dark:text-alpine-sunrise">
                                    {averageRating}<span className="text-2xl text-opacity-50">/5</span>
                                </div>
                                <div className="text-xs font-bold tracking-widest uppercase mt-2 text-alpine-navy/60 dark:text-alpine-snow/60">
                                    {t('reviews.average_rating', 'Average Rating')}
                                </div>
                            </div>
                            <div className="w-px h-12 bg-black/10 dark:bg-white/10" />
                            <div className="text-center">
                                <div className="text-5xl font-serif font-normal text-alpine-blue dark:text-alpine-sunrise"><Odometer value={800} suffix="+" /></div>
                                <div className="text-xs font-bold tracking-widest uppercase mt-2 text-alpine-navy/60 dark:text-alpine-snow/60">
                                    {t('reviews.summits_reached', 'Summits Reached')}
                                </div>
                            </div>
                        </div>

                        {/* Write Review Button */}
                        <button
                            onClick={() => {
                                if (!isLoggedIn) {
                                    toast.error('Please log in to submit a review');
                                    return;
                                }
                                setIsModalOpen(true);
                            }}
                            className="px-6 py-3.5 bg-alpine-blue dark:bg-alpine-sunrise text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        >
                            <Plus size={16} /> Write Testimonial
                        </button>
                    </motion.div>
                </div>

                {/* Rating Filter Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-alpine-navy/50 dark:text-alpine-snow/50 mr-2 flex items-center gap-1">
                            <Filter size={14} /> Filter:
                        </span>
                        {(['all', 5, 4, 3] as const).map(option => (
                            <button
                                key={String(option)}
                                onClick={() => setFilterRating(option)}
                                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                                    filterRating === option
                                        ? 'bg-alpine-navy text-white dark:bg-white dark:text-black shadow-md'
                                        : 'bg-black/5 dark:bg-white/5 text-alpine-navy/60 dark:text-alpine-snow/60 hover:bg-black/10 dark:hover:bg-white/10'
                                }`}
                            >
                                {option === 'all' ? 'All Reviews' : `${option} Stars`}
                            </button>
                        ))}
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-alpine-navy/40 dark:text-alpine-snow/40">
                        Showing {filteredReviews.length} Verified Logs
                    </span>
                </div>

                {/* Masonry Review Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredReviews.map((review, i) => (
                        <motion.div
                            key={review.id || review._id || i}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.6, delay: (i % 3) * 0.1, type: "spring" }}
                            className="bg-white/85 dark:bg-white/[0.04] backdrop-blur-lg p-8 rounded-3xl border border-white dark:border-white/10 shadow-[0_10px_40px_-12px_rgba(8,40,76,0.15)] dark:shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)] hover:shadow-[0_24px_60px_-16px_rgba(8,40,76,0.28)] hover:-translate-y-1 hover:border-alpine-glacier/60 transition-[transform,background-color,border-color,box-shadow] duration-500 group relative overflow-hidden flex flex-col justify-between"
                        >
                            <Quote className="absolute -top-4 -left-4 w-32 h-32 text-alpine-glacier/10 dark:text-alpine-snow/5 -rotate-12 group-hover:rotate-0 transition-transform duration-700 pointer-events-none" />

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, idx) => (
                                            <Star
                                                key={idx}
                                                size={16}
                                                className={idx < review.rating ? "fill-alpine-sunrise text-alpine-sunrise" : "fill-transparent text-gray-300 dark:text-gray-700"}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-1 text-[11px] font-bold text-alpine-forest dark:text-alpine-glacier bg-alpine-forest/10 dark:bg-alpine-glacier/10 px-2.5 py-1 rounded-full">
                                        <ShieldCheck size={14} /> {t('reviews.verified_climber', 'Verified Climber')}
                                    </div>
                                </div>

                                <p className="font-serif text-xl md:text-2xl italic leading-relaxed mb-8 text-alpine-navy/90 dark:text-alpine-snow/90 flex-grow">
                                    "{review.text || review.content}"
                                </p>

                                <div className="mt-auto border-t border-black/10 dark:border-white/10 pt-6">
                                    <h4 className="font-bold text-base mb-1">{review.name || review.author?.name || 'Alpine Explorer'}</h4>
                                    <div className="flex justify-between items-center text-xs font-semibold tracking-wider uppercase text-alpine-navy/50 dark:text-alpine-snow/50">
                                        <span className="text-alpine-blue dark:text-alpine-sunrise">{review.expedition || 'Alps Route'}</span>
                                        <span>{review.date || 'Recent Climb'}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* ─── Submit Review Modal ──────────────────────────────── */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110]"
                        />
                        <div className="fixed inset-0 z-[111] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="w-full max-w-lg bg-alpine-snow dark:bg-[#080B10] border border-black/10 dark:border-white/15 rounded-3xl p-8 shadow-2xl relative"
                            >
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="absolute top-6 right-6 w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:scale-110 transition-transform"
                                >
                                    <X size={16} />
                                </button>

                                <div className="mb-6">
                                    <span className="text-xs font-bold uppercase tracking-widest text-alpine-blue dark:text-alpine-sunrise">
                                        Climber Field Log
                                    </span>
                                    <h2 className="text-2xl font-serif font-black mt-1">Submit Your Testimonial</h2>
                                    <p className="text-xs text-alpine-navy/60 dark:text-alpine-snow/60 mt-1">
                                        Share your summit experience with the global Mountaineer Mallu brotherhood.
                                    </p>
                                </div>

                                <form onSubmit={handleReviewSubmit} className="space-y-6">
                                    {/* Star Rating Selector */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-alpine-navy/60 dark:text-alpine-snow/60">
                                            Your Ascent Rating
                                        </label>
                                        <div className="flex items-center gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    type="button"
                                                    key={star}
                                                    onClick={() => setSubmitRating(star)}
                                                    onMouseEnter={() => setHoveredStar(star)}
                                                    onMouseLeave={() => setHoveredStar(0)}
                                                    className="p-1 hover:scale-120 transition-transform"
                                                >
                                                    <Star
                                                        size={28}
                                                        className={`transition-colors ${
                                                            (hoveredStar || submitRating) >= star
                                                                ? 'fill-alpine-sunrise text-alpine-sunrise'
                                                                : 'text-gray-300 dark:text-gray-700'
                                                        }`}
                                                    />
                                                </button>
                                            ))}
                                            <span className="text-xs font-bold ml-2 text-alpine-sunrise">
                                                {submitRating} of 5 Stars
                                            </span>
                                        </div>
                                    </div>

                                    {/* Review Text Area with Multilingual Virtual Keyboard */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-alpine-navy/60 dark:text-alpine-snow/60">
                                            Field Log Content (English / മലയാളം) *
                                        </label>
                                        <LanguageInput
                                            value={content}
                                            onChange={setContent}
                                            isTextarea
                                            rows={4}
                                            placeholder="Describe the terrain, guiding excellence, and alpine camaraderie..."
                                            className="w-full text-sm"
                                        />
                                        <p className="text-[11px] text-alpine-navy/40 dark:text-alpine-snow/40 mt-1">
                                            Supports direct Malayalam typing or English. Max 50 words.
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full py-3.5 bg-alpine-blue dark:bg-alpine-sunrise text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <Send size={16} /> {submitting ? 'Sending…' : 'Submit review'}
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
