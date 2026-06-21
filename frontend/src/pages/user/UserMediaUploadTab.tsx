import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Image as ImageIcon, Video, Loader2, CheckCircle, Wand2, X } from 'lucide-react';
import { galleryApi, aiApi } from '../../lib/api';
import { AnimatePresence } from 'framer-motion';
import { UnsplashSearchPicker } from '../../components/ui/UnsplashSearchPicker';

export const UserMediaUploadTab = () => {
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadPreview, setUploadPreview] = useState('');
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    const [unsplashUrl, setUnsplashUrl] = useState<string | null>(null);
    const [suggestedImages, setSuggestedImages] = useState<any[]>([]);
    const [imagesLoading, setImagesLoading] = useState(false);
    const [imageModalOpen, setImageModalOpen] = useState(false);

    const handleSuggestImages = async () => {
        if (!uploadTitle) {
            setError('Please enter a title/description first to get AI suggestions.');
            return;
        }
        setImagesLoading(true);
        setError('');
        try {
            const context = { title: uploadTitle };
            const data = await aiApi.suggestImages(context);
            setSuggestedImages(data.images);
            setImageModalOpen(true);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch image suggestions.');
        } finally {
            setImagesLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 100 * 1024 * 1024) {
                setError('File too large. Maximum 100MB.');
                return;
            }
            setError('');
            setUploadFile(file);
            setUnsplashUrl(null);
            if (file.type.startsWith('image')) {
                setUploadPreview(URL.createObjectURL(file));
            } else {
                setUploadPreview('');
            }
        }
    };

    const handleUpload = async () => {
        if (!uploadTitle || (!uploadFile && !unsplashUrl)) {
            setError('Please provide a title and select a file or an AI suggestion.');
            return;
        }
        setUploading(true);
        setError('');
        try {
            const formData = new FormData();
            if (uploadFile) {
                formData.append('media', uploadFile);
                formData.append('type', uploadFile.type.startsWith('video') ? 'video' : 'image');
            } else if (unsplashUrl) {
                formData.append('unsplashUrl', unsplashUrl);
                formData.append('type', 'image');
            }
            formData.append('title', uploadTitle);
            
            await galleryApi.upload(formData);
            
            setSuccess(true);
            setUploadFile(null);
            setUploadTitle('');
            setUploadPreview('');
            setUnsplashUrl(null);
            
            setTimeout(() => setSuccess(false), 5000);
        } catch (err: any) {
            setError(err.message || 'Upload failed.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl mx-auto h-full flex flex-col"
        >
            <div className="mb-6 sm:mb-10 text-center">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-alpine-navy dark:text-white mb-3 sm:mb-4 tracking-wide">Contribute to Vault</h1>
                <p className="text-alpine-navy/60 dark:text-white/60 text-base sm:text-lg font-light px-2">Submit your raw footage and captures to the community gallery.</p>
            </div>

            {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4 sm:mb-6 bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
                    {error}
                </motion.div>
            )}

            {success && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-4 sm:mb-6 bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                    <CheckCircle size={18} /> Media submitted successfully and is pending admin approval!
                </motion.div>
            )}

            <div className="bg-white/60 dark:bg-[#11141A] backdrop-blur-md rounded-2xl sm:rounded-3xl border border-black/5 dark:border-white/5 shadow-xl dark:shadow-2xl p-4 sm:p-6 md:p-8 flex-1">
                <div className="space-y-4 sm:space-y-6">
                    <div>
                        <label className="block text-xs font-bold tracking-widest text-alpine-navy/50 dark:text-white/50 uppercase mb-2">Media Title / Description</label>
                        <input
                            type="text"
                            placeholder="e.g. Summit Sunrise at Mont Blanc"
                            value={uploadTitle}
                            onChange={e => setUploadTitle(e.target.value)}
                            className="w-full bg-black/5 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-3 sm:px-4 py-3 sm:py-4 text-alpine-navy dark:text-white placeholder:text-alpine-navy/20 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50 transition-all font-medium"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold tracking-widest text-alpine-navy/50 dark:text-white/50 uppercase mb-2 flex justify-between items-center">
                            <span>Media File</span>
                            <button
                                type="button"
                                onClick={handleSuggestImages}
                                disabled={imagesLoading}
                                className="flex items-center gap-1.5 text-alpine-glacier hover:text-alpine-navy dark:hover:text-white transition-colors"
                            >
                                {imagesLoading ? <Loader2 className="animate-spin" size={14} /> : <Wand2 size={14} />}
                                AI Suggest
                            </button>
                        </label>
                        <div
                            onClick={() => fileRef.current?.click()}
                            className="border-2 border-dashed border-black/10 dark:border-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-12 text-center cursor-pointer hover:border-alpine-glacier/50 hover:bg-black/5 dark:hover:bg-white/5 transition-all bg-black/[0.02] dark:bg-black/30 group relative"
                        >
                            {uploadPreview || unsplashUrl ? (
                                <img src={uploadPreview || unsplashUrl || ''} className="max-h-48 sm:max-h-64 mx-auto rounded-xl object-contain shadow-2xl" alt="Preview" />
                            ) : uploadFile ? (
                                <div className="flex flex-col items-center">
                                    {uploadFile.type.startsWith('video') ? <Video size={36} className="sm:w-12 sm:h-12 text-alpine-glacier mb-3 sm:mb-4" /> : <ImageIcon size={36} className="sm:w-12 sm:h-12 text-alpine-glacier mb-3 sm:mb-4" />}
                                    <p className="text-alpine-navy dark:text-white font-medium text-base sm:text-lg">{uploadFile.name}</p>
                                    <p className="text-alpine-navy/40 dark:text-white/40 text-sm mt-2">{(uploadFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                </div>
                            ) : (
                                <div className="text-alpine-navy/40 dark:text-white/40 group-hover:text-alpine-navy/60 dark:group-hover:text-white/60 transition-colors">
                                    <UploadCloud className="mx-auto mb-3 sm:mb-4" size={36} />
                                    <p className="font-medium text-base sm:text-lg mb-2">Click to select image or video</p>
                                    <p className="text-xs sm:text-sm font-mono text-alpine-navy/30 dark:text-white/30 uppercase tracking-widest">Max 100MB • JPG, PNG, WebP, MP4</p>
                                </div>
                            )}
                            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" className="hidden" onChange={handleFileSelect} />
                        </div>
                        <div className="mt-3">
                            <UnsplashSearchPicker 
                                placeholder="Or search Unsplash directly for a gallery image..." 
                                onSelect={(url) => {
                                    setUnsplashUrl(url);
                                    setUploadFile(null);
                                    setUploadPreview('');
                                }} 
                            />
                        </div>
                    </div>

                    <div className="pt-2 sm:pt-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleUpload}
                            disabled={uploading || !uploadFile || !uploadTitle}
                            className="w-full py-3 sm:py-4 rounded-xl bg-alpine-glacier text-[#0A0D14] font-bold tracking-wide shadow-[0_0_30px_rgba(163,201,226,0.3)] hover:shadow-[0_0_40px_rgba(163,201,226,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? <Loader2 className="animate-spin" size={20} /> : <UploadCloud size={20} />}
                            {uploading ? 'Uploading...' : 'Submit to Editors'}
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* AI Image Suggestion Modal */}
            <AnimatePresence>
                {imageModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 40 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white/10 dark:bg-[#0A0D14]/60 backdrop-blur-3xl rounded-[2rem] w-full max-w-6xl shadow-[0_0_100px_rgba(163,201,226,0.15)] border border-white/20 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 sm:p-8 border-b border-black/10 dark:border-white/10 flex justify-between items-center bg-gradient-to-r from-alpine-glacier/10 to-transparent">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-alpine-glacier/20 rounded-2xl border border-alpine-glacier/30 text-alpine-glacier">
                                        <Wand2 size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl sm:text-3xl font-serif font-bold text-alpine-navy dark:text-white tracking-wide">AI Visual Intelligence</h3>
                                        <p className="text-sm text-alpine-navy/70 dark:text-white/60 font-medium">Curated premium assets based on your title.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setImageModalOpen(false)}
                                    className="p-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors backdrop-blur-md border border-white/10"
                                >
                                    <X size={24} className="text-alpine-navy dark:text-white" />
                                </button>
                            </div>
                            
                            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar bg-black/5 dark:bg-transparent">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    {suggestedImages.map((img: any, idx: number) => (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                                            key={img.id} 
                                            className="group relative aspect-square rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-[0_20px_50px_rgba(163,201,226,0.3)] transition-all duration-500 border border-white/10 hover:border-alpine-glacier/50"
                                            onClick={() => {
                                                setUnsplashUrl(img.url);
                                                setUploadFile(null); // Clear file upload if they choose unsplash
                                                setUploadPreview('');
                                                setImageModalOpen(false);
                                            }}
                                        >
                                            <img src={img.thumb} alt={img.altText} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5">
                                                <span className="text-white text-sm font-medium tracking-wide">Photo by {img.authorName}</span>
                                                <div className="mt-3 py-2 px-4 bg-alpine-glacier text-[#0A0D14] rounded-xl flex items-center justify-center gap-2 text-sm font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                                    <CheckCircle size={16} /> Select Asset
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
