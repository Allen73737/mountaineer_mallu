import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Check, X, Play, Loader2, Trash2, UploadCloud, Maximize2, Minimize2, Eye, EyeOff, Edit2 } from 'lucide-react';
import { galleryApi } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAdminAction } from '../../store/useAdminAction';

export const GalleryManagement = () => {
    const [allItems, setAllItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadPreview, setUploadPreview] = useState('');
    const [selectedMedia, setSelectedMedia] = useState<any | null>(null);
    const [editItem, setEditItem] = useState<any | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [savingEdit, setSavingEdit] = useState(false);
    const [isModalFullscreen, setIsModalFullscreen] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const { showToast, ToastComponent } = useToast();

    const { requestAction } = useAdminAction();

    useEffect(() => { fetchItems(); }, []);

    const fetchItems = async () => {
        try {
            const all = await galleryApi.listAll(1, 100);
            setAllItems(all.items);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleDelete = (id: string) => {
        const itemToDelete = allItems.find(i => i._id === id);
        if (!itemToDelete) return;

        requestAction(
            'Delete Media',
            `Are you sure you want to delete "${itemToDelete.title}"?`,
            {
                execute: async () => { await galleryApi.delete(id); },
                optimistic: () => setAllItems(prev => prev.filter(i => i._id !== id)),
                revert: () => setAllItems(prev => [...prev, itemToDelete]),
                successMessage: 'Media deleted.'
            },
            'danger',
            'Delete'
        );
    };

    const handleEditSave = () => {
        if (!editItem) return;
        const originalItem = allItems.find(i => i._id === editItem._id);
        const newTitle = editTitle;
        const itemId = editItem._id;

        requestAction(
            'Update Title',
            `Are you sure you want to update the title to "${newTitle}"?`,
            {
                execute: async () => { await galleryApi.update(itemId, { title: newTitle }); },
                optimistic: () => {
                    setAllItems(prev => prev.map(i => i._id === itemId ? { ...i, title: newTitle } : i));
                    setEditItem(null);
                },
                revert: () => {
                    if (originalItem) setAllItems(prev => prev.map(i => i._id === itemId ? { ...i, title: originalItem.title } : i));
                },
                successMessage: 'Title updated.'
            },
            'info',
            'Save Changes'
        );
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 100 * 1024 * 1024) {
                showToast('File too large. Maximum 100MB.', 'error');
                return;
            }
            setUploadFile(file);
            if (file.type.startsWith('image')) {
                setUploadPreview(URL.createObjectURL(file));
            } else {
                setUploadPreview('');
            }
        }
    };

    const handleUpload = () => {
        if (!uploadFile || !uploadTitle) {
            showToast('Please provide a title and select a file.', 'error');
            return;
        }

        const fileToUpload = uploadFile;
        const titleToUpload = uploadTitle;

        requestAction(
            'Upload Media',
            `Are you sure you want to upload "${fileToUpload.name}" directly to the gallery?`,
            {
                execute: async () => {
                    const formData = new FormData();
                    formData.append('media', fileToUpload);
                    formData.append('title', titleToUpload);
                    formData.append('type', fileToUpload.type.startsWith('video') ? 'video' : 'image');
                    await galleryApi.upload(formData);
                    fetchItems();
                },
                optimistic: () => {
                    setShowUpload(false);
                    setUploadFile(null);
                    setUploadTitle('');
                    setUploadPreview('');
                },
                successMessage: 'Media uploaded successfully.'
            },
            'info',
            'Upload'
        );
    };

    return (
        <div className="space-y-6">
            {ToastComponent}

            <div className="flex justify-end">
                <button onClick={() => setShowUpload(true)} className="py-2.5 px-5 flex items-center gap-2 bg-alpine-glacier text-alpine-navy font-bold rounded-xl btn-premium">
                    <UploadCloud size={18} /><span>Upload Media</span>
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {allItems.map(item => (
                        <div key={item._id} className="relative rounded-2xl overflow-hidden group premium-card">
                            <div className="aspect-square relative">
                                {item.type === 'video' ? <video src={item.url} className="w-full h-full object-cover" muted /> : <img src={item.url} className="w-full h-full object-cover" />}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/80 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-[2px] lg:backdrop-blur-sm">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => { setEditItem(item); setEditTitle(item.title); }} className="p-2.5 bg-white/20 rounded-xl hover:bg-white/40 text-white transition-colors shadow-lg" title="Edit Title">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => setSelectedMedia(item)} className="p-2.5 bg-white/20 rounded-xl hover:bg-white/40 text-white transition-colors shadow-lg" title="View Fullscreen">
                                            <Maximize2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(item._id)} className="p-2.5 bg-red-500/80 rounded-xl hover:bg-red-500 text-white transition-colors shadow-lg" title="Delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-2 left-2">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${item.status === 'approved' ? 'bg-emerald-500/30 text-emerald-300' : item.status === 'pending' ? 'bg-amber-500/30 text-amber-300' : 'bg-red-500/30 text-red-300'}`}>{item.status}</span>
                            </div>
                            <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                                <p className="text-xs text-white font-medium">{item.title}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            <AnimatePresence>
                {showUpload && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-y-0 right-0 left-[var(--sidebar-width,0px)] z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-all duration-300"
                        onClick={() => setShowUpload(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95 }}
                            className="premium-card p-8 transition-all duration-300 relative max-w-md w-full rounded-3xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white font-serif">Direct Upload</h2>
                                <button type="button" onClick={() => setShowUpload(false)} className="text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-lg p-2">
                                    <X size={18} />
                                </button>
                            </div>

                            <input
                                value={uploadTitle}
                                onChange={(e) => setUploadTitle(e.target.value)}
                                placeholder="Gallery Title"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50 mb-4"
                            />

                            <div
                                onClick={() => fileRef.current?.click()}
                                className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center cursor-pointer hover:border-alpine-glacier/50 hover:bg-white/5 transition-all mb-6"
                            >
                                {uploadPreview ? (
                                    <img src={uploadPreview} className="max-h-48 mx-auto rounded-xl object-contain" />
                                ) : uploadFile ? (
                                    <p className="text-white/60">{uploadFile.name}</p>
                                ) : (
                                    <div className="text-white/40">
                                        <UploadCloud className="mx-auto mb-2" size={32} />
                                        <p>Click to select image or video</p>
                                        <p className="text-xs mt-1">Max 100MB • JPG, PNG, WebP, MP4</p>
                                    </div>
                                )}
                                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" className="hidden" onChange={handleFileSelect} />
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setShowUpload(false)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all">Cancel</button>
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading || !uploadFile}
                                    className="flex-1 py-3 rounded-xl bg-alpine-glacier text-alpine-navy font-bold btn-premium flex items-center justify-center gap-2"
                                >
                                    {uploading ? <Loader2 className="animate-spin" size={18} /> : 'Upload'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
                {editItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-y-0 right-0 left-[var(--sidebar-width,0px)] z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-all duration-300"
                        onClick={() => setEditItem(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95 }}
                            className="premium-card p-8 transition-all duration-300 relative max-w-md w-full rounded-3xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-bold text-white font-serif mb-6">Edit Gallery Media</h2>
                            <input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="Gallery Title"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50 mb-6"
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setEditItem(null)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all">Cancel</button>
                                <button onClick={handleEditSave} disabled={savingEdit || !editTitle} className="flex-1 py-3 rounded-xl bg-alpine-glacier text-alpine-navy font-bold btn-premium flex items-center justify-center gap-2">
                                    {savingEdit ? <Loader2 className="animate-spin" size={18} /> : 'Save Changes'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Fullscreen Modal */}
            <AnimatePresence>
                {selectedMedia && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
                        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        className="fixed inset-y-0 right-0 left-[var(--sidebar-width,0px)] z-[100] flex items-center justify-center bg-black/90 p-4 md:p-12 cursor-pointer transition-all duration-300"
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
                            onClick={(e) => e.stopPropagation()}
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
