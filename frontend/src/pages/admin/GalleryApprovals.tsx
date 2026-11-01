import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Play, Maximize2 } from 'lucide-react';
import { Loader2 } from '../../components/ui/BrandLoader';
import { galleryApi } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAdminAction } from '../../store/useAdminAction';

export const GalleryApprovals = () => {
    const [pendingItems, setPendingItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState<string | null>(null);
    const [selectedMedia, setSelectedMedia] = useState<any | null>(null);
    const { showToast, ToastComponent } = useToast();

    const { requestAction } = useAdminAction();

    useEffect(() => { fetchItems(); }, []);

    const fetchItems = async () => {
        try {
            const data = await galleryApi.listPending();
            setPendingItems(data.items);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleApprove = (id: string) => {
        const itemToApprove = pendingItems.find(i => i._id === id);
        if (!itemToApprove) return;

        requestAction(
            'Approve Media',
            `Are you sure you want to approve "${itemToApprove.title}"? It will be visible in the public gallery.`,
            {
                execute: async () => { await galleryApi.approve(id); },
                optimistic: () => setPendingItems(prev => prev.filter(i => i._id !== id)),
                revert: () => setPendingItems(prev => [...prev, itemToApprove]),
                successMessage: 'Media approved.'
            },
            'info',
            'Approve'
        );
    };

    const handleReject = (id: string) => {
        const itemToReject = pendingItems.find(i => i._id === id);
        if (!itemToReject) return;

        requestAction(
            'Reject Media',
            `Are you sure you want to reject and delete "${itemToReject.title}"?`,
            {
                execute: async () => { await galleryApi.reject(id); },
                optimistic: () => setPendingItems(prev => prev.filter(i => i._id !== id)),
                revert: () => setPendingItems(prev => [...prev, itemToReject]),
                successMessage: 'Media rejected.'
            },
            'danger',
            'Reject'
        );
    };

    return (
        <div className="space-y-6">
            {ToastComponent}
            
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}</div>
            ) : pendingItems.length === 0 ? (
                <div className="p-16 text-center text-white/30 font-mono text-sm premium-card rounded-2xl border border-white/5 bg-white/[0.02]">[ NO_PENDING_UPLOADS ]</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingItems.map(item => (
                        <motion.div key={item._id} layout className="premium-card rounded-2xl overflow-hidden group">
                            <div className="aspect-video relative">
                                {item.type === 'video' ? (
                                    <video src={item.url} className="w-full h-full object-cover" muted />
                                ) : (
                                    <img src={item.url} className="w-full h-full object-cover" />
                                )}
                                {item.type === 'video' && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="bg-black/50 backdrop-blur-md p-3 rounded-full"><Play fill="white" size={20} /></div></div>
                                )}
                                <button onClick={() => setSelectedMedia(item)} className="absolute top-2 right-2 p-2 bg-black/50 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Maximize2 size={16} /></button>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-white mb-1">{item.title}</h3>
                                <p className="text-white/40 text-xs mb-4">Uploaded by {item.uploadedBy?.name || 'Unknown'}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => handleApprove(item._id)} disabled={actionId === item._id} className="flex-1 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all flex items-center justify-center gap-1 font-medium text-sm">
                                        {actionId === item._id ? <Loader2 className="animate-spin" size={14} /> : <><Check size={14} /> Approve</>}
                                    </button>
                                    <button onClick={() => handleReject(item._id)} disabled={actionId === item._id} className="flex-1 py-2 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-all flex items-center justify-center gap-1 font-medium text-sm">
                                        <X size={14} /> Reject
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Fullscreen Modal */}
            <AnimatePresence>
                {selectedMedia && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
                        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        className="fixed inset-y-0 right-0 left-[var(--sidebar-width,0px)] z-[100] flex items-center justify-center bg-black/90 p-4 md:p-12 cursor-pointer transition-[color,background-color,border-color,box-shadow] duration-300"
                        onClick={() => setSelectedMedia(null)}
                    >
                        <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-4 backdrop-blur-lg" onClick={() => setSelectedMedia(null)}>
                            <X size={32} />
                        </button>

                        <motion.div
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 20 }}
                            className="relative w-full max-w-6xl aspect-video rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.1)] cursor-default"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                            {selectedMedia.type === 'video' ? (
                                <video src={selectedMedia.url || selectedMedia.image} autoPlay loop controls className="w-full h-full object-contain bg-black" />
                            ) : (
                                <img src={selectedMedia.url || selectedMedia.image} className="w-full h-full object-contain bg-black" />
                            )}
                            <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                                <h2 className="text-4xl font-serif text-white">{selectedMedia.title}</h2>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
