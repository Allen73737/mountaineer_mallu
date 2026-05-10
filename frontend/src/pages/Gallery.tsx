import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, X, Maximize2, UploadCloud, Loader2 } from 'lucide-react';
import { galleryApi } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { Skeleton } from '../components/ui/Skeleton';
import { usersApi } from '../lib/api';
import { useToast } from '../components/ui/Toast';
import { Heart, BookmarkPlus, Download } from 'lucide-react';
import { BackButton } from '../components/ui/BackButton';

export const GalleryPage = () => {
    const [mediaItems, setMediaItems] = useState<any[]>([]);
    const [selectedMedia, setSelectedMedia] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadPreview, setUploadPreview] = useState('');
    const [showCollectionModal, setShowCollectionModal] = useState(false);
    const [userCollections, setUserCollections] = useState<any[]>([]);
    const [newCollectionName, setNewCollectionName] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);
    const { isLoggedIn, user } = useAuthStore();
    const { showToast, ToastComponent } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn) {
            usersApi.getMyProfile().then(res => setUserCollections(res.user.collections || [])).catch(console.error);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const data = await galleryApi.list(1, 50);
                setMediaItems(data.items);
            } catch (err) {
                console.error('Failed to load gallery:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchGallery();
    }, []);

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

    const handleUpload = async () => {
        if (!uploadFile || !uploadTitle) {
            showToast('Please provide a title and select a file.', 'error');
            return;
        }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('media', uploadFile);
            formData.append('title', uploadTitle);
            formData.append('type', uploadFile.type.startsWith('video') ? 'video' : 'image');
            await galleryApi.upload(formData);
            showToast('Media uploaded! Awaiting admin approval.', 'success');
            setShowUpload(false);
            setUploadFile(null);
            setUploadTitle('');
            setUploadPreview('');
        } catch (err: any) {
            showToast(err.message || 'Upload failed.', 'error');
        } finally {
            setUploading(false);
        }
    };

    // Assign grid spans for visual variety
    const getSpan = (i: number) => {
        const item = mediaItems[i];
        if (item?.span && item.span !== 'col-span-1 row-span-1') return item.span;
        const patterns = ['col-span-2 row-span-2', 'col-span-1 row-span-1', 'col-span-1 row-span-2', 'col-span-1 row-span-1', 'col-span-2 row-span-1', 'col-span-1 row-span-2', 'col-span-1 row-span-1', 'col-span-2 row-span-1'];
        return patterns[i % patterns.length];
    };

    const handleLike = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!isLoggedIn) return showToast('Please log in to like media', 'error');
        try {
            const res = await galleryApi.toggleLike(id);
            setMediaItems(items => items.map(item => item._id === id ? { ...item, likes: res.likes } : item));
            if (selectedMedia?._id === id) setSelectedMedia({ ...selectedMedia, likes: res.likes });
        } catch (err: any) {
            showToast(err.message || 'Action failed', 'error');
        }
    };

    const handleDownload = async (e: React.MouseEvent, item: any) => {
        e.stopPropagation();
        if (!isLoggedIn) return showToast('Please log in to download media', 'error');
        try {
            // Force download
            const response = await fetch(item.url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = item.title || 'mountaineer-mallu-media';
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);

            // Track download in user portal
            await usersApi.trackDownload(item._id);
            showToast('Download started. Tracked in your Portal.', 'success');
        } catch (err: any) {
            showToast('Download failed.', 'error');
        }
    };

    const handleSaveToCollection = async (collectionId: string) => {
        if (!selectedMedia) return;
        try {
            const res = await usersApi.addToCollection(collectionId, selectedMedia._id);
            setUserCollections(res.collections);
            showToast('Saved to collection!', 'success');
            setShowCollectionModal(false);
        } catch (err: any) {
            showToast(err.message || 'Action failed', 'error');
        }
    };

    const handleCreateCollection = async () => {
        if (!newCollectionName) return;
        try {
            const res = await usersApi.createCollection(newCollectionName);
            setUserCollections(res.collections);
            setNewCollectionName('');
            showToast('Collection created!', 'success');
        } catch (err: any) {
            showToast(err.message || 'Action failed', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-24 px-4 md:px-8">
            {ToastComponent}

            <div className="max-w-7xl mx-auto px-4 relative z-50">
                <BackButton />
            </div>

            {/* Header */}
            <div className="max-w-7xl mx-auto mb-16 px-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, type: "spring" }}
                        className="text-5xl md:text-7xl font-serif font-black mb-6 text-alpine-glacier"
                    >
                        Visual Vault
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="text-white/60 text-lg md:text-xl font-light max-w-2xl"
                    >
                        An unfiltered collection of our highest altitudes. Click to expand raw footage and high-resolution captures.
                    </motion.p>
                </div>

                {isLoggedIn && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => setShowUpload(true)}
                        className="px-6 py-3 bg-alpine-glacier/10 border border-alpine-glacier/30 text-alpine-glacier rounded-xl hover:bg-alpine-glacier/20 transition-all flex items-center gap-2 font-medium shrink-0"
                    >
                        <UploadCloud size={18} /> Upload Media
                    </motion.button>
                )}
            </div>

            {/* Bento Grid */}
            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] gap-4 md:gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="rounded-3xl" />)}
                    </div>
                ) : mediaItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[40vh] text-center">
                        <p className="text-white/30 font-mono text-sm tracking-widest">[ VAULT_EMPTY ]</p>
                    </div>
                ) : (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                        }}
                        className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] gap-4 md:gap-6"
                    >
                        {mediaItems.map((media, i) => (
                            <motion.div
                                key={media._id || i}
                                variants={{
                                    hidden: { opacity: 0, scale: 0.9, y: 50 },
                                    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
                                }}
                                className={`relative rounded-3xl overflow-hidden cursor-pointer group ${getSpan(i)}`}
                                onClick={() => setSelectedMedia(media)}
                            >
                                {media.type === 'video' ? (
                                    <>
                                        <video
                                            src={media.url}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            className="w-full h-full object-cover filter brightness-50 group-hover:brightness-100 transition-all duration-700"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="bg-black/40 backdrop-blur-md p-4 rounded-full">
                                                <Play fill="white" size={32} />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <img
                                        src={media.url}
                                        alt={media.title}
                                        className="w-full h-full object-cover filter brightness-50 group-hover:brightness-100 group-hover:scale-110 transition-all duration-1000"
                                    />
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="absolute bottom-6 left-6 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 translate-y-4 group-hover:translate-y-0">
                                    <div className="bg-white/20 backdrop-blur-md p-2 rounded-full">
                                        <Maximize2 size={16} />
                                    </div>
                                    <span className="font-serif text-xl tracking-wide shadow-black drop-shadow-lg">{media.title}</span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>

            {/* Fullscreen Modal */}
            <AnimatePresence>
                {selectedMedia && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
                        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 md:p-12 cursor-pointer"
                        onClick={() => setSelectedMedia(null)}
                    >
                        <div className="absolute top-8 left-8 md:top-12 md:left-12 z-[60]">
                            <BackButton onBack={() => setSelectedMedia(null)} onHome={() => { setSelectedMedia(null); navigate('/'); }} />
                        </div>

                        <motion.div
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 20 }}
                            className="relative w-full max-w-6xl aspect-video rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.1)] cursor-default"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                            {selectedMedia.type === 'video' ? (
                                <video src={selectedMedia.url} autoPlay loop controls className="w-full h-full object-contain bg-black" />
                            ) : (
                                <img src={selectedMedia.url} className="w-full h-full object-contain bg-black" />
                            )}
                            <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none flex items-end justify-between">
                                <div>
                                    <h2 className="text-4xl font-serif text-white mb-2">{selectedMedia.title}</h2>
                                    <p className="text-white/60 font-medium">Uploaded by {selectedMedia.uploadedBy?.name}</p>
                                </div>
                                <div className="flex gap-4 pointer-events-auto">
                                    <button 
                                        onClick={(e) => handleLike(e, selectedMedia._id)}
                                        className="flex flex-col items-center gap-1 group"
                                    >
                                        <div className={`w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${selectedMedia.likes?.includes(user?.id) ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white group-hover:bg-white/20'}`}>
                                            <Heart size={20} fill={selectedMedia.likes?.includes(user?.id) ? 'currentColor' : 'none'} />
                                        </div>
                                        <span className="text-xs font-bold text-white drop-shadow-md">{selectedMedia.likes?.length || 0}</span>
                                    </button>
                                    
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); isLoggedIn ? setShowCollectionModal(true) : showToast('Please log in', 'error'); }}
                                        className="flex flex-col items-center gap-1 group"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white/20 transition-all">
                                            <BookmarkPlus size={20} />
                                        </div>
                                        <span className="text-xs font-bold text-white drop-shadow-md">Save</span>
                                    </button>

                                    <button 
                                        onClick={(e) => handleDownload(e, selectedMedia)}
                                        className="flex flex-col items-center gap-1 group"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-alpine-glacier/20 backdrop-blur-md flex items-center justify-center text-alpine-glacier group-hover:bg-alpine-glacier/30 transition-all">
                                            <Download size={20} />
                                        </div>
                                        <span className="text-xs font-bold text-white drop-shadow-md">Download</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Collection Select Modal */}
            <AnimatePresence>
                {showCollectionModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setShowCollectionModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95 }}
                            className="bg-[#11141A] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                            <h3 className="text-2xl font-serif text-white mb-6">Save to Collection</h3>
                            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto custom-scrollbar mb-6">
                                {userCollections.map(c => (
                                    <button 
                                        key={c._id} 
                                        onClick={() => handleSaveToCollection(c._id)}
                                        className="w-full text-left px-5 py-3 rounded-xl bg-black/50 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-white font-medium flex justify-between items-center"
                                    >
                                        {c.name}
                                        <span className="text-white/40 text-xs">{c.items.length} items</span>
                                    </button>
                                ))}
                            </div>
                            <div className="pt-4 border-t border-white/5 flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="New Collection Name"
                                    value={newCollectionName}
                                    onChange={e => setNewCollectionName(e.target.value)}
                                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-alpine-glacier/50 text-sm"
                                />
                                <button 
                                    onClick={handleCreateCollection}
                                    className="px-4 py-2 bg-alpine-glacier text-[#0A0D14] font-bold rounded-xl text-sm"
                                >
                                    Create
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Upload Modal */}
            <AnimatePresence>
                {showUpload && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setShowUpload(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95 }}
                            className="bg-alpine-navy border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-bold text-white mb-6 font-serif">Upload to Vault</h2>

                            <input
                                type="text"
                                placeholder="Title"
                                value={uploadTitle}
                                onChange={e => setUploadTitle(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 mb-4 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50"
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
                                    className="flex-1 py-3 rounded-xl bg-alpine-glacier text-alpine-navy font-bold hover:bg-white transition-all flex items-center justify-center gap-2"
                                >
                                    {uploading ? <Loader2 className="animate-spin" size={18} /> : 'Upload'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
