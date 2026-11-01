import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Check, X, Play, Trash2, UploadCloud, Maximize2, Minimize2, Eye, EyeOff, Edit2, Sparkles, Tag, Wand2, CheckCircle } from 'lucide-react';
import { Loader2 } from '../../components/ui/BrandLoader';
import { galleryApi, aiApi } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAdminAction } from '../../store/useAdminAction';
import { UnsplashSearchPicker } from '../../components/ui/UnsplashSearchPicker';

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
    const [taggingId, setTaggingId] = useState<string | null>(null);
    const [bulkTagging, setBulkTagging] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const { showToast, ToastComponent } = useToast();

    // AI Image Suggestion State
    const [unsplashUrl, setUnsplashUrl] = useState<string | null>(null);
    const [suggestedImages, setSuggestedImages] = useState<any[]>([]);
    const [imagesLoading, setImagesLoading] = useState(false);
    const [imageModalOpen, setImageModalOpen] = useState(false);

    const { requestAction } = useAdminAction();

    const handleSuggestImages = async () => {
        if (!uploadTitle) {
            showToast('Please enter a title to get AI suggestions.', 'error');
            return;
        }
        setImagesLoading(true);
        try {
            const context = { title: uploadTitle };
            const data = await aiApi.suggestImages(context);
            setSuggestedImages(data.images);
            setImageModalOpen(true);
        } catch (err: any) {
            showToast(err.message || 'Failed to fetch image suggestions.', 'error');
        } finally {
            setImagesLoading(false);
        }
    };

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
            setUnsplashUrl(null);
            if (file.type.startsWith('image')) {
                setUploadPreview(URL.createObjectURL(file));
            } else {
                setUploadPreview('');
            }
        }
    };

    const handleUpload = () => {
        if ((!uploadFile && !unsplashUrl) || !uploadTitle) {
            showToast('Please provide a title and select a file or AI suggestion.', 'error');
            return;
        }

        const fileToUpload = uploadFile;
        const titleToUpload = uploadTitle;
        const urlToUpload = unsplashUrl;

        requestAction(
            'Upload Media',
            fileToUpload ? `Are you sure you want to upload "${fileToUpload.name}" directly to the gallery?` : 'Upload AI-suggested image to the gallery?',
            {
                execute: async () => {
                    const formData = new FormData();
                    if (fileToUpload) {
                        formData.append('media', fileToUpload);
                        formData.append('type', fileToUpload.type.startsWith('video') ? 'video' : 'image');
                    } else if (urlToUpload) {
                        formData.append('unsplashUrl', urlToUpload);
                        formData.append('type', 'image');
                    }
                    formData.append('title', titleToUpload);
                    await galleryApi.upload(formData);
                    fetchItems();
                },
                optimistic: () => {
                    setShowUpload(false);
                    setUploadFile(null);
                    setUploadTitle('');
                    setUploadPreview('');
                    setUnsplashUrl(null);
                },
                successMessage: 'Media uploaded successfully.'
            },
            'info',
            'Upload'
        );
    };

    const handleAiTag = async (itemId: string) => {
        setTaggingId(itemId);
        try {
            const data = await aiApi.tagGalleryItem(itemId);
            setAllItems(prev => prev.map(i => i._id === itemId ? { ...i, aiTags: data.tags } : i));
            showToast('AI tags generated!', 'success');
        } catch (err: any) {
            showToast(err.message || 'AI tagging failed', 'error');
        } finally {
            setTaggingId(null);
        }
    };

    const handleBulkTag = async () => {
        setBulkTagging(true);
        try {
            const data = await aiApi.bulkTagGallery();
            showToast(data.message, 'success');
            fetchItems(); // Refresh to show new tags
        } catch (err: any) {
            showToast(err.message || 'Bulk tagging failed', 'error');
        } finally {
            setBulkTagging(false);
        }
    };

    return (
        <div className="space-y-6">
            {ToastComponent}

            <div className="flex justify-end gap-3">
                <button onClick={handleBulkTag} disabled={bulkTagging} className="py-2.5 px-5 flex items-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 font-bold rounded-xl transition-all disabled:opacity-40">
                    {bulkTagging ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    <span>{bulkTagging ? 'Tagging...' : 'AI Auto-Tag All'}</span>
                </button>
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
                                        <button onClick={() => handleAiTag(item._id)} disabled={taggingId === item._id} className="p-2.5 bg-purple-500/80 rounded-xl hover:bg-purple-500 text-white transition-colors shadow-lg disabled:opacity-40" title="AI Auto-Tag">
                                            {taggingId === item._id ? <Loader2 size={18} className="animate-spin" /> : <Tag size={18} />}
                                        </button>
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
                                {item.aiTags && item.aiTags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                        {item.aiTags.map((tag: string, idx: number) => (
                                            <span key={idx} className="px-1.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 text-[8px] font-medium border border-purple-500/20">{tag}</span>
                                        ))}
                                    </div>
                                )}
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
                        className="fixed inset-y-0 right-0 left-[var(--sidebar-width,0px)] z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-[color,background-color,border-color,box-shadow] duration-300"
                        onClick={() => setShowUpload(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95 }}
                            className="premium-card p-8 transition-[color,background-color,border-color,box-shadow] duration-300 relative max-w-md w-full rounded-3xl"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white font-serif">Direct Upload</h2>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleSuggestImages}
                                        disabled={imagesLoading}
                                        className="flex items-center gap-1.5 text-alpine-glacier hover:text-white transition-colors text-xs font-medium bg-white/5 hover:bg-white/10 rounded-lg px-3 py-2"
                                    >
                                        {imagesLoading ? <Loader2 className="animate-spin" size={14} /> : <Wand2 size={14} />}
                                        AI Suggest
                                    </button>
                                    <button type="button" onClick={() => setShowUpload(false)} className="text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-lg p-2">
                                        <X size={18} />
                                    </button>
                                </div>
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
                                {uploadPreview || unsplashUrl ? (
                                    <img src={uploadPreview || unsplashUrl || ''} className="max-h-48 mx-auto rounded-xl object-contain" />
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

                            <div className="mb-6">
                                <UnsplashSearchPicker 
                                    placeholder="Or search Unsplash directly for an image..." 
                                    onSelect={(url) => {
                                        setUnsplashUrl(url);
                                        setUploadFile(null);
                                        setUploadPreview('');
                                    }} 
                                />
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setShowUpload(false)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all">Cancel</button>
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading || (!uploadFile && !unsplashUrl)}
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
                        className="fixed inset-y-0 right-0 left-[var(--sidebar-width,0px)] z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-[color,background-color,border-color,box-shadow] duration-300"
                        onClick={() => setEditItem(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95 }}
                            className="premium-card p-8 transition-[color,background-color,border-color,box-shadow] duration-300 relative max-w-md w-full rounded-3xl"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
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

            {/* AI Image Suggestion Modal */}
            <AnimatePresence>
                {imageModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#0A0D14] rounded-3xl w-full max-w-4xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-4 sm:p-6 border-b border-white/10 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg sm:text-xl font-serif text-white">AI Image Suggestions</h3>
                                    <p className="text-xs sm:text-sm text-white/50">Images sourced from Unsplash based on your title.</p>
                                </div>
                                <button
                                    onClick={() => setImageModalOpen(false)}
                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {suggestedImages.map((img: any) => (
                                        <div 
                                            key={img.id} 
                                            className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-black/5"
                                            onClick={() => {
                                                setUnsplashUrl(img.url);
                                                setUploadFile(null);
                                                setUploadPreview('');
                                                setImageModalOpen(false);
                                            }}
                                        >
                                            <img src={img.thumb} alt={img.altText} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                                <span className="text-white text-xs font-medium truncate">Photo by {img.authorName}</span>
                                                <div className="mt-2 text-alpine-glacier flex items-center gap-1 text-sm font-semibold">
                                                    <CheckCircle size={14} /> Select
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
