import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle, XCircle, Trash2, MessageSquare, Edit2, Save, X, Sparkles, TrendingUp, ThumbsUp, ThumbsDown, RefreshCw, BarChart3, Quote } from 'lucide-react';
import { Loader2 } from '../../components/ui/BrandLoader';
import { reviewsApi, aiApi } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { useAdminAction } from '../../store/useAdminAction';

export const ReviewsManagement = () => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{content: string, rating: number, status: string}>({ content: '', rating: 5, status: 'pending' });
    const { showToast, ToastComponent } = useToast();
    const [reviewSummary, setReviewSummary] = useState<any>(null);
    const [summaryLoading, setSummaryLoading] = useState(false);

    const { requestAction } = useAdminAction();

    useEffect(() => {
        fetchReviews();
        fetchReviewSummary();
    }, []);

    const fetchReviews = async () => {
        try {
            const data = await reviewsApi.getAllAdmin();
            setReviews(data);
        } catch (err: any) {
            showToast(err.message || 'Failed to fetch reviews', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchReviewSummary = async () => {
        setSummaryLoading(true);
        try {
            const data = await aiApi.getReviewSummary();
            setReviewSummary(data.summary);
        } catch (err) {
            console.error('Failed to load review summary:', err);
        } finally {
            setSummaryLoading(false);
        }
    };

    const handleEditClick = (review: any) => {
        setEditingId(review._id);
        setEditForm({ content: review.content, rating: review.rating, status: review.status });
    };

    const handleSave = (id: string) => {
        const review = reviews.find(r => r._id === id);
        if (!review) return;

        requestAction(
            'Update Review',
            `Are you sure you want to update this review by ${review.author?.name}?`,
            {
                execute: async () => { await reviewsApi.update(id, editForm); fetchReviews(); },
                optimistic: () => {
                    setReviews(prev => prev.map(r => r._id === id ? { ...r, ...editForm } : r));
                    setEditingId(null);
                },
                successMessage: `Review updated.`
            },
            'info',
            'Save'
        );
    };

    const handleDelete = (id: string) => {
        const review = reviews.find(r => r._id === id);
        if (!review) return;

        requestAction(
            'Delete Review',
            `Are you sure you want to permanently delete this review by ${review.author?.name}?`,
            {
                execute: async () => { await reviewsApi.delete(id); fetchReviews(); },
                optimistic: () => setReviews(prev => prev.filter(r => r._id !== id)),
                revert: () => setReviews(prev => [...prev, review]),
                successMessage: 'Review deleted.'
            },
            'danger',
            'Delete'
        );
    };

    return (
        <div className="space-y-8">
            {ToastComponent}

            <header>
                <div className="flex items-center gap-3 mb-2">
                    <MessageSquare className="text-alpine-glacier" size={28} />
                    <h1 className="text-3xl font-bold font-serif tracking-wide text-gradient-glacier glow-text">Review Moderation</h1>
                </div>
                <p className="text-white/50 text-sm">Approve or reject user-submitted reviews before they appear publicly.</p>
            </header>

            {/* AI Review Sentiment Dashboard */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 via-transparent to-alpine-glacier/5"
            >
                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10 p-5 md:p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30">
                                <BarChart3 size={20} className="text-purple-400" />
                            </div>
                            <div>
                                <h2 className="font-bold text-white text-base flex items-center gap-2">
                                    AI Sentiment Analysis
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">AI</span>
                                </h2>
                                <p className="text-white/40 text-xs">Community feedback intelligence</p>
                            </div>
                        </div>
                        <button onClick={fetchReviewSummary} disabled={summaryLoading} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
                            <RefreshCw size={16} className={`text-white/50 ${summaryLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {summaryLoading && !reviewSummary ? (
                        <div className="space-y-3">
                            {[1,2,3].map(i => <div key={i} className="h-5 bg-white/5 rounded-lg animate-pulse" style={{ width: `${90 - i * 20}%` }} />)}
                        </div>
                    ) : reviewSummary ? (
                        <div className="space-y-4">
                            {/* Overall Sentiment */}
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-black/20 border border-white/5">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-amber-400">{reviewSummary.averageRating?.toFixed(1)}</p>
                                    <div className="flex mt-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={10} className={i < Math.round(reviewSummary.averageRating) ? 'text-amber-400 fill-amber-400' : 'text-white/20'} />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-white capitalize">{reviewSummary.overallSentiment} Sentiment</p>
                                    <p className="text-xs text-white/50 mt-0.5">{reviewSummary.summary}</p>
                                </div>
                            </div>

                            {/* Themes */}
                            {reviewSummary.themes && reviewSummary.themes.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {reviewSummary.themes.map((theme: any, idx: number) => (
                                        <div key={idx} className="p-3 rounded-xl bg-black/10 border border-white/5">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-semibold text-white">{theme.theme}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                                                    theme.sentiment === 'positive' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                                    theme.sentiment === 'negative' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                                    'bg-white/10 text-white/50 border-white/10'
                                                }`}>{theme.sentiment}</span>
                                            </div>
                                            {theme.quote && (
                                                <p className="text-[10px] text-white/30 italic flex items-start gap-1 mt-1">
                                                    <Quote size={8} className="shrink-0 mt-0.5" /> "{theme.quote}"
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Highlights & Concerns */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {reviewSummary.highlights && reviewSummary.highlights.length > 0 && (
                                    <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/60 mb-2 flex items-center gap-1"><ThumbsUp size={10} /> Highlights</p>
                                        {reviewSummary.highlights.map((h: string, i: number) => (
                                            <p key={i} className="text-xs text-emerald-300/80 mb-1">• {h}</p>
                                        ))}
                                    </div>
                                )}
                                {reviewSummary.concerns && reviewSummary.concerns.length > 0 && (
                                    <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-red-400/60 mb-2 flex items-center gap-1"><ThumbsDown size={10} /> Concerns</p>
                                        {reviewSummary.concerns.map((c: string, i: number) => (
                                            <p key={i} className="text-xs text-red-300/80 mb-1">• {c}</p>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Recommendation */}
                            {reviewSummary.recommendation && (
                                <div className="flex items-start gap-2 p-3 rounded-xl bg-alpine-glacier/5 border border-alpine-glacier/10">
                                    <TrendingUp size={14} className="text-alpine-glacier shrink-0 mt-0.5" />
                                    <p className="text-xs text-alpine-glacier/80">{reviewSummary.recommendation}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-white/30">No reviews to analyze yet.</p>
                    )}
                </div>
            </motion.div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="animate-spin text-alpine-glacier" size={32} />
                </div>
            ) : reviews.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
                    <Star className="mx-auto text-white/20 mb-4" size={48} />
                    <h3 className="text-lg font-bold text-white mb-2">No Reviews Yet</h3>
                    <p className="text-white/40 text-sm">When users submit reviews, they will appear here for moderation.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <motion.div
                            key={review._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="premium-card rounded-2xl p-5 flex items-start gap-6 relative overflow-hidden"
                        >
                            {/* Status border indicator */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                review.status === 'approved' ? 'bg-emerald-500' :
                                review.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'
                            }`} />

                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-3">
                                    <img 
                                        src={review.author?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${review.author?.name}`} 
                                        alt={review.author?.name} 
                                        className="w-10 h-10 rounded-full border border-white/10"
                                    />
                                    <div>
                                        <h3 className="text-white font-bold text-sm">{review.author?.name}</h3>
                                        {editingId === review._id ? (
                                            <div className="flex gap-2 items-center mt-1">
                                                <select value={editForm.rating} onChange={e => setEditForm({...editForm, rating: Number(e.target.value)})} className="bg-white/10 border border-white/20 rounded px-2 py-0.5 text-xs text-white">
                                                    {[1,2,3,4,5].map(n => <option key={n} value={n} className="bg-[#0A0D14]">{n} Stars</option>)}
                                                </select>
                                                <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="bg-white/10 border border-white/20 rounded px-2 py-0.5 text-xs text-white">
                                                    <option value="pending" className="bg-[#0A0D14]">Pending</option>
                                                    <option value="approved" className="bg-[#0A0D14]">Approved</option>
                                                    <option value="rejected" className="bg-[#0A0D14]">Rejected</option>
                                                </select>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={10} className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-white/20"} />
                                                    ))}
                                                </div>
                                                <span className="text-[10px] text-white/40">{new Date(review.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                    {editingId !== review._id && (
                                        <div className="ml-auto">
                                            <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg ${
                                                review.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' :
                                                review.status === 'rejected' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                                            }`}>
                                                {review.status}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                
                                {editingId === review._id ? (
                                    <textarea 
                                        value={editForm.content} 
                                        onChange={e => setEditForm({...editForm, content: e.target.value})}
                                        className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50 min-h-[80px]"
                                    />
                                ) : (
                                    <p className="text-white/70 text-sm leading-relaxed italic">"{review.content}"</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2 border-l border-white/10 pl-6 shrink-0 justify-center">
                                {editingId === review._id ? (
                                    <>
                                        <button 
                                            onClick={() => handleSave(review._id)}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors text-xs font-semibold"
                                        >
                                            <Save size={14} /> Save
                                        </button>
                                        <button 
                                            onClick={() => setEditingId(null)}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors text-xs font-semibold"
                                        >
                                            <X size={14} /> Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button 
                                            onClick={() => handleEditClick(review)}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-alpine-glacier/10 hover:bg-alpine-glacier/20 text-alpine-glacier transition-colors text-xs font-semibold"
                                        >
                                            <Edit2 size={14} /> Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(review._id)}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors text-xs font-semibold mt-auto"
                                        >
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};
