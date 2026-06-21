import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Image as ImageIcon, X, ExternalLink, CheckCircle } from 'lucide-react';
import { aiApi } from '../../lib/api';

interface UnsplashImage {
    id: string;
    url: string;
    thumb: string;
    authorName: string;
    authorLink: string;
    altText: string;
}

interface Props {
    onSelect: (url: string) => void;
    triggerClassName?: string;
    placeholder?: string;
}

export const UnsplashSearchPicker: React.FC<Props> = ({ onSelect, triggerClassName = '', placeholder = 'Search high-res images...' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [images, setImages] = useState<UnsplashImage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!query.trim()) {
            setImages([]);
            setLoading(false);
            return;
        }

        if (debounceRef.current) clearTimeout(debounceRef.current);

        setLoading(true);
        setError('');

        debounceRef.current = setTimeout(async () => {
            try {
                const data = await aiApi.searchUnsplash(query);
                setImages(data.images || []);
            } catch (err: any) {
                setError('Failed to fetch images');
                setImages([]);
            } finally {
                setLoading(false);
            }
        }, 800); // 800ms debounce

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query]);

    return (
        <div className="relative w-full z-[100]" ref={containerRef}>
            <div className={`relative flex items-center bg-black/5 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl overflow-hidden transition-colors focus-within:border-alpine-glacier/50 ${triggerClassName}`}>
                <Search size={16} className="absolute left-3 text-alpine-navy/40 dark:text-white/40" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full bg-transparent text-sm pl-10 pr-10 py-2.5 text-alpine-navy dark:text-white placeholder-alpine-navy/30 dark:placeholder-white/30 focus:outline-none"
                />
                {loading && (
                    <Loader2 size={14} className="absolute right-3 animate-spin text-alpine-glacier" />
                )}
                {!loading && query && (
                    <button onClick={() => setQuery('')} className="absolute right-3 p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-alpine-navy/40 dark:text-white/40">
                        <X size={14} />
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (query.trim().length > 0 || images.length > 0) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-3 w-full bg-white/60 dark:bg-[#0A0D14]/80 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[400px]"
                    >
                        <div className="p-3 bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                            <span className="text-xs font-bold tracking-widest text-alpine-navy/50 dark:text-white/50 uppercase">
                                Unsplash Results
                            </span>
                            <span className="text-[10px] text-alpine-navy/40 dark:text-white/40 italic flex items-center gap-1">
                                Powered by <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="hover:text-alpine-glacier transition-colors font-semibold">Unsplash</a>
                            </span>
                        </div>

                        <div className="overflow-y-auto p-3 custom-scrollbar flex-1">
                            {error && (
                                <div className="text-center py-6 text-red-400 text-sm">{error}</div>
                            )}
                            
                            {!loading && !error && images.length === 0 && query && (
                                <div className="text-center py-8 flex flex-col items-center">
                                    <ImageIcon size={32} className="text-alpine-navy/20 dark:text-white/20 mb-2" />
                                    <p className="text-sm text-alpine-navy/50 dark:text-white/50">No images found for "{query}"</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {images.map((img) => (
                                    <div 
                                        key={img.id}
                                        onClick={() => {
                                            onSelect(img.url);
                                            setIsOpen(false);
                                        }}
                                        className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer bg-black/5 border border-transparent hover:border-alpine-glacier/50 transition-colors"
                                    >
                                        <img src={img.thumb} alt={img.altText} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 sm:p-3">
                                            <a 
                                                href={`${img.authorLink}?utm_source=mountaineer_mallu&utm_medium=referral`}
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-white/80 hover:text-white text-[10px] sm:text-xs font-medium truncate flex items-center gap-1"
                                            >
                                                {img.authorName} <ExternalLink size={10} />
                                            </a>
                                            <div className="mt-1 sm:mt-2 text-alpine-glacier flex items-center gap-1 text-[10px] sm:text-xs font-semibold">
                                                <CheckCircle size={12} /> Select Image
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {loading && images.length > 0 && (
                                <div className="flex justify-center py-4">
                                    <Loader2 size={20} className="animate-spin text-alpine-glacier" />
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
