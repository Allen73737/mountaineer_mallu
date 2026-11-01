import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Star, Quote, Plus, X, Send } from 'lucide-react';
import { Loader2 } from '../ui/BrandLoader';
import { reviewsApi } from '../../lib/api';
import { useAuthStore } from '../../store/useAuthStore';
import { useToast } from '../ui/Toast';
import { LanguageInput } from '../ui/LanguageInput';
import { LineReveal } from '../ui/LineReveal';

const FALLBACK_REVIEWS = [
    {
        _id: 'fb-1',
        author: { name: 'Rahul Nair' },
        content: 'Ascending Mont Blanc with Mountaineer Mallu was a life-changing experience. The camaraderie and mountain guidance were top notch!',
        rating: 5
    },
    {
        _id: 'fb-2',
        author: { name: 'Ananya V.' },
        content: 'An incredible community of passionate hikers. The organizing team ensured safety and amazing mountain views every step of the way.',
        rating: 5
    }
];

/** Break a quote into subtitle-sized lines (~7 words, at most 4 lines; the last one ellipsised). */
const subtitleLines = (text: string, perLine = 7, maxLines = 4) => {
    const words = text.trim().split(/\s+/);
    const lines: string[] = [];
    for (let i = 0; i < words.length && lines.length < maxLines; i += perLine) lines.push(words.slice(i, i + perLine).join(' '));
    if (words.length > perLine * maxLines) lines[maxLines - 1] += '…';
    return lines;
};

export const Reviews = () => {
    const [reviews, setReviews] = useState<any[]>(FALLBACK_REVIEWS);
    const [loading, setLoading] = useState(false);
    const [index, setIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);
    const isInView = useInView(sectionRef, { margin: "-10%" });
    
    // Form state
    const [rating, setRating] = useState(0);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    const { isLoggedIn } = useAuthStore();
    const { showToast, ToastComponent } = useToast();

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const data = await reviewsApi.getApproved();
            if (data && data.length > 0) {
                setReviews(data);
            }
        } catch (err) {
            console.error('Failed to fetch reviews', err);
        }
    };

    useEffect(() => {
        if (!isInView || reviews.length <= 1) return;
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % reviews.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [isInView, reviews.length]);

    useEffect(() => {
        if (!isModalOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsModalOpen(false); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isModalOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoggedIn) {
            showToast('You must be logged in to submit a review', 'error');
            return;
        }
        if (!rating || !content.trim()) {
            showToast('Please provide a rating and review text', 'error');
            return;
        }

        setSubmitting(true);
        try {
            await reviewsApi.submit({ content, rating });
            showToast('Review submitted successfully! Pending approval.', 'success');
            setIsModalOpen(false);
            setContent('');
            setRating(0);
        } catch (err: any) {
            showToast(err.message || 'Failed to submit review', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const current = reviews[index];

    return (
        <section ref={sectionRef} className="py-24 md:py-36 px-6 md:px-12 bg-transparent dark:bg-transparent text-alpine-navy dark:text-alpine-snow overflow-hidden relative min-h-[500px] contain-layout">
            {ToastComponent}

            {/* Background massive typography */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10rem] md:text-[20rem] lg:text-[25rem] font-serif font-normal text-alpine-navy/[0.02] dark:text-white/[0.02] whitespace-nowrap pointer-events-none select-none z-0">
                LEGACY
            </div>

            {/* Ambient glow */}
            <div className="absolute top-1/3 left-1/4 w-[30vw] h-[30vw] rounded-full opacity-[0.03] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(163,201,226,0.8) 0%, transparent 60%)' }} />

            <div className="w-full max-w-5xl mx-auto relative z-10 text-center">
                <div className="mb-12 md:mb-16">
                    <p className="text-alpine-blue dark:text-alpine-glacier text-xs md:text-sm font-semibold tracking-[0.3em] uppercase mb-3 md:mb-4">Testimonials</p>
                    <h2 className="cine-title has-lines text-4xl md:text-6xl lg:text-[5rem] font-serif font-normal tracking-tight mb-4 md:mb-6 text-alpine-navy dark:text-alpine-snow [text-shadow:0_1px_2px_rgba(0,0,0,0.12)] leading-none m-0"><LineReveal>Words from the Summit</LineReveal></h2>
                    <div className="w-16 md:w-24 h-[2px] bg-gradient-to-r from-alpine-blue to-alpine-glacier dark:from-alpine-sunrise dark:to-alpine-gold mx-auto mb-6 md:mb-8" />
                    <button
                        onClick={() => {
                            if (!isLoggedIn) {
                                showToast('Log in to leave a review', 'error');
                                return;
                            }
                            setIsModalOpen(true);
                        }}
                        className="group inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-alpine-navy dark:bg-alpine-snow text-white dark:text-[#0B0C10] rounded-full font-bold text-sm md:text-base hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl shadow-alpine-navy/20 dark:shadow-white/20 btn-premium"
                    >
                        <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                        Write a Review
                    </button>
                </div>

                <div className="relative h-72 md:h-80 flex items-center justify-center">
                    {loading ? (
                        <Loader2 className="animate-spin text-alpine-glacier" size={32} />
                    ) : reviews.length === 0 ? (
                        <p className="text-alpine-navy/40 dark:text-alpine-snow/40 italic">No reviews yet. Be the first!</p>
                    ) : current && (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={current._id}
                                initial={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(10px)" }}
                                animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                                exit={{ opacity: 0, scale: 1.1, y: -20, filter: "blur(10px)" }}
                                transition={{ duration: 0.8, ease: "anticipate" }}
                                className="absolute w-full px-2 md:px-4"
                            >
                                <Quote className="w-10 h-10 md:w-14 md:h-14 mx-auto mb-6 md:mb-8 text-alpine-glacier/20" />

                                {/* Set like film subtitles: centred lines on a dark backing, arriving one after another */}
                                <p className="mb-8 md:mb-10 text-base sm:text-lg md:text-2xl font-medium tracking-wide" aria-label={current.content}>
                                    {subtitleLines(current.content).map((line, i) => (
                                        <motion.span
                                            key={i}
                                            aria-hidden="true"
                                            className="block"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.25, delay: 0.5 + i * 0.9 }}
                                        >
                                            <span className="subtitle-line">{line}</span>
                                        </motion.span>
                                    ))}
                                </p>

                                <div className="flex flex-col items-center gap-3">
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={16}
                                                className={i < current.rating ? "fill-amber-400 text-amber-400" : "fill-transparent text-gray-300 dark:text-gray-700"}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-alpine-glacier to-alpine-blue flex items-center justify-center text-white font-bold text-xs uppercase overflow-hidden border border-white/10">
                                            {current.author?.avatar ? (
                                                <img src={current.author.avatar} alt="avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                current.author?.name?.slice(0, 2)
                                            )}
                                        </div>
                                        <div className="text-left">
                                            <h4 className="font-bold text-base md:text-lg text-alpine-navy dark:text-alpine-snow tracking-wide">{current.author?.name}</h4>
                                            <span className="text-xs uppercase tracking-widest text-alpine-blue dark:text-alpine-glacier font-semibold">Community Member</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>

                {/* Pagination Dots */}
                {reviews.length > 1 && (
                    <div className="flex justify-center items-center gap-2 md:gap-3 mt-12 md:mt-16">
                        {reviews.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setIndex(i)}
                                aria-label={`Show review ${i + 1}`}
                                className="tap-dot relative p-1.5"
                            >
                                <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-500 ${i === index ? 'bg-alpine-blue dark:bg-alpine-sunrise scale-125' : 'bg-black/15 dark:bg-white/15'}`} />
                                {i === index && (
                                    <motion.div
                                        layoutId="review-dot-ring"
                                        className="absolute -inset-1.5 rounded-full border border-alpine-blue/30 dark:border-alpine-sunrise/30"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Review Modal — portalled so section scroll transforms can't offset it */}
            {createPortal(<AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="review-modal-title">
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
                            className="relative w-full max-w-lg bg-white dark:bg-[#15171E] rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl border border-black/5 dark:border-white/10 z-10"
                        >
                            <button
                                type="button"
                                aria-label="Close"
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 md:top-6 right-4 md:right-6 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-[#0B0C10]/60 dark:text-white/60 hover:text-[#0B0C10] dark:hover:text-white"
                            >
                                <X size={22} />
                            </button>

                            <h3 id="review-modal-title" className="text-2xl md:text-3xl font-serif font-medium text-alpine-navy dark:text-white mb-2">Leave your Mark</h3>
                            <p className="text-base md:text-xl text-[#0B0C10]/70 dark:text-alpine-snow/80 max-w-3xl mx-auto font-light mb-8 md:mb-12">Your review helps our community grow.</p>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:gap-6">
                                <div className="flex justify-center gap-2 py-3 md:py-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            aria-label={`${star} star${star > 1 ? 's' : ''}`}
                                            aria-pressed={rating === star}
                                            onMouseEnter={() => setHoveredStar(star)}
                                            onMouseLeave={() => setHoveredStar(0)}
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star
                                                size={32}
                                                className={`transition-colors duration-200 ${(hoveredStar || rating) >= star ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" : "text-black/10 dark:text-white/10"}`}
                                            />
                                        </button>
                                    ))}
                                </div>

                                <div className="relative">
                                    <LanguageInput
                                        value={content}
                                        onChange={setContent}
                                        placeholder="Write your review here... (max 50 words)"
                                        isTextarea={true}
                                        rows={4}
                                    />
                                    <div className="absolute bottom-3 right-4 text-xs text-black/40 dark:text-white/40 pointer-events-none">
                                        {content.trim() ? content.trim().split(/\s+/).length : 0} / 50 words
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="w-full mt-1 md:mt-2 py-3 md:py-4 rounded-xl bg-alpine-navy dark:bg-alpine-snow text-white dark:text-[#0B0C10] font-bold text-base md:text-lg flex items-center justify-center gap-2 hover:bg-alpine-navy/90 dark:hover:bg-white/90 transition-colors shadow-lg btn-premium"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                    {submitting ? 'Submitting...' : 'Submit Review'}
                                </button>
                                <p className="text-[10px] text-center text-black/40 dark:text-white/40 italic">All reviews are moderated by admins before appearing on the site.</p>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>, document.body)}
        </section>
    );
};

