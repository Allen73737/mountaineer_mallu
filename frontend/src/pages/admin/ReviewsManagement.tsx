import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle, XCircle, Trash2, Loader2, MessageSquare, Edit2, Save, X } from 'lucide-react';
import { reviewsApi } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { useAdminAction } from '../../store/useAdminAction';

export const ReviewsManagement = () => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{content: string, rating: number, status: string}>({ content: '', rating: 5, status: 'pending' });
    const { showToast, ToastComponent } = useToast();

    const { requestAction } = useAdminAction();

    useEffect(() => {
        fetchReviews();
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
