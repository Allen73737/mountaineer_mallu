import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Instagram, Youtube, Heart, MessageCircle, Play, ArrowUpRight } from 'lucide-react';
import { API_URL } from '../../lib/constants';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface InstagramPost {
    id: string;
    type: string;
    url: string;
    imageUrl: string;
    caption: string;
    likes: number;
    comments: number;
    timestamp: string;
}

interface YouTubeVideo {
    id: string;
    title: string;
    url: string;
    thumbnailUrl: string;
    views: string;
    duration: string;
    publishedAt: string;
}

const DEFAULT_IG_POSTS: InstagramPost[] = [
    {
        id: 'ig-1',
        type: 'IMAGE',
        url: 'https://instagram.com',
        imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop',
        caption: 'First light over Mont Blanc. Another dawn, another peak conquered with the community.',
        likes: 342,
        comments: 28,
        timestamp: new Date().toISOString(),
    },
    {
        id: 'ig-2',
        type: 'IMAGE',
        url: 'https://instagram.com',
        imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop',
        caption: 'Camp 3 night sky in the Swiss Alps. Silence at 3,800m altitude.',
        likes: 512,
        comments: 44,
        timestamp: new Date().toISOString(),
    },
    {
        id: 'ig-3',
        type: 'IMAGE',
        url: 'https://instagram.com',
        imageUrl: 'https://images.unsplash.com/photo-1549880181-56a44cf4a9a1?q=80&w=800&auto=format&fit=crop',
        caption: 'Traversing the Gran Paradiso ridgeline under crystal blue skies.',
        likes: 421,
        comments: 31,
        timestamp: new Date().toISOString(),
    },
];

const DEFAULT_YT_VIDEOS: YouTubeVideo[] = [
    {
        id: 'yt-1',
        title: 'Alpine Summit Ascent: Eiger Nordwand Winter Expedition',
        url: 'https://youtube.com',
        thumbnailUrl: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?q=80&w=800&auto=format&fit=crop',
        views: '14.2K',
        duration: '18:42',
        publishedAt: '2 days ago',
    },
    {
        id: 'yt-2',
        title: 'Essential High-Altitude Gear: Surviving Alpine Conditions',
        url: 'https://youtube.com',
        thumbnailUrl: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=800&auto=format&fit=crop',
        views: '8.7K',
        duration: '12:15',
        publishedAt: '1 week ago',
    },
    {
        id: 'yt-3',
        title: 'Dolomites Via Ferrata: Guide for Malayalee Mountaineers',
        url: 'https://youtube.com',
        thumbnailUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop',
        views: '22.1K',
        duration: '24:08',
        publishedAt: '2 weeks ago',
    },
];

export const AltitudeNetwork = () => {
    const { t } = useTranslation();
    const [igPosts, setIgPosts] = useState<InstagramPost[]>(DEFAULT_IG_POSTS);
    const [ytVideos, setYtVideos] = useState<YouTubeVideo[]>(DEFAULT_YT_VIDEOS);
    const [loading, setLoading] = useState(false);
    const [activeVideoIndex, setActiveVideoIndex] = useState(0);
    const [igHoveredIdx, setIgHoveredIdx] = useState<number | null>(null);
    const [autoIgIndex, setAutoIgIndex] = useState(0);
    const [isHoveringList, setIsHoveringList] = useState(false);

    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef, { margin: "-10%" });

    useEffect(() => {
        const fetchFeeds = async () => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2500);

                const [igRes, ytRes] = await Promise.all([
                    fetch(`${API_URL}/api/social/instagram`, { signal: controller.signal }).catch(() => null),
                    fetch(`${API_URL}/api/social/youtube`, { signal: controller.signal }).catch(() => null)
                ]);
                clearTimeout(timeoutId);

                if (igRes && igRes.ok) {
                    const igData = await igRes.json().catch(() => null);
                    if (igData?.success && Array.isArray(igData.data) && igData.data.length > 0) {
                        setIgPosts(igData.data.slice(0, 3));
                    }
                }
                if (ytRes && ytRes.ok) {
                    const ytData = await ytRes.json().catch(() => null);
                    if (ytData?.success && Array.isArray(ytData.data) && ytData.data.length > 0) {
                        setYtVideos(ytData.data.slice(0, 3));
                    }
                }
            } catch (error) {
                // Silently fallback to curated items without disruption
            }
        };

        fetchFeeds();
    }, []);

    // ── DYNAMIC AUTO-CYCLE INTERACTION FOR INSTAGRAM (Viewport paused) ──
    useEffect(() => {
        if (!isInView || isHoveringList || igPosts.length === 0) return;
        
        const interval = setInterval(() => {
            setAutoIgIndex((prev) => (prev + 1) % igPosts.length);
        }, 4000); // Crossfade every 4 seconds
        
        return () => clearInterval(interval);
    }, [isInView, isHoveringList, igPosts.length]);

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'Recent';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Recent';
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
    };



    return (
        <section 
            id="altitude-network"
            ref={sectionRef} 
            className="relative w-full min-h-[120vh] bg-transparent dark:bg-transparent overflow-hidden transition-colors duration-500 py-20 flex flex-col"
        >
            {/* Ambient Background Blur */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-blue-500/5 dark:from-blue-600/10 to-transparent blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16 flex-grow flex flex-col">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-10%" }}
                        transition={{ duration: 0.8 }}
                        className="max-w-2xl"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                            <p className="text-alpine-glacier dark:text-alpine-sunrise text-xs md:text-sm font-semibold tracking-[0.3em] uppercase">
                                Global Broadcast
                            </p>
                        </div>
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-alpine-navy dark:text-white mb-4">
                            Altitude Network
                        </h2>
                        <p className="text-alpine-navy/60 dark:text-white/60 font-light text-lg md:text-xl">
                            Real-time dispatches from the world's most unforgiving peaks.
                        </p>
                    </motion.div>
                </div>

                {/* ══ DUAL SPLIT-SCREEN LAYOUT ══ */}
                <div className="flex flex-col lg:flex-row gap-16 lg:gap-16 flex-grow h-auto lg:h-[800px] pb-12 lg:pb-0">
                    
                    {/* ── LEFT: INSTAGRAM (THE KINETIC DECK) ── */}
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-10%" }}
                        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full lg:w-1/2 h-full flex flex-col group"
                    >
                        {/* Instagram Header */}
                        <div className="flex justify-between items-end mb-8 pb-4 border-b border-alpine-navy/10 dark:border-white/10">
                            <div>
                                <h3 className="text-2xl md:text-3xl font-light text-alpine-navy dark:text-white flex items-center gap-3 mb-2">
                                    <Instagram className="w-6 h-6 text-pink-600 dark:text-pink-500" /> 
                                    Field Notes
                                </h3>
                                <a href="https://www.instagram.com/mountaineermallu/" target="_blank" rel="noreferrer" className="text-sm font-bold tracking-widest uppercase text-alpine-navy/50 dark:text-white/50 hover:text-pink-600 dark:hover:text-pink-500 transition-colors">
                                    @mountaineermallu
                                </a>
                            </div>
                            <div className="text-[4rem] font-serif font-black text-alpine-navy/5 dark:text-white/5 leading-none">IG</div>
                        </div>

                        {/* ── EFFORTLESS EDITORIAL HOVER LIST ── */}
                        <div className="w-full flex-grow flex flex-col h-full mt-2">
                            
                            {/* MASSIVE HIGHLIGHTED HERO IMAGE */}
                            <div className="relative w-full h-[55%] md:h-[60%] rounded-t-[2rem] rounded-b-xl overflow-hidden bg-black shadow-2xl mb-4 group border border-white/5">
                                {igPosts.map((post, idx) => {
                                    // Determine what to display based on hover or auto-cycle
                                    const isDisplay = isHoveringList && igHoveredIdx !== null ? igHoveredIdx === idx : autoIgIndex === idx;
                                    
                                    return (
                                        <div 
                                            key={post.id + "img"}
                                            className="absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out"
                                            style={{ opacity: isDisplay ? 1 : 0, zIndex: isDisplay ? 10 : 0 }}
                                        >
                                            <img 
                                                src={post.imageUrl} 
                                                alt="Instagram Dispatch"
                                                loading="lazy"
                                                decoding="async"
                                                className="w-full h-full object-cover transition-transform duration-[2s] ease-out scale-100 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                                            
                                            {/* Top-Right Badge */}
                                            {idx === 0 && (
                                                <div className="absolute top-4 right-4 px-3 py-1 bg-red-600 text-white text-[10px] font-bold tracking-widest uppercase rounded-full shadow-lg">
                                                    Latest
                                                </div>
                                            )}

                                            {/* Hover HUD Data */}
                                            <div className="absolute bottom-6 left-6 flex items-center gap-4 text-white/80 text-xs font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                                <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-pink-500" /> {post.likes}</span>
                                                <span className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4" /> {post.comments}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* ELEGANT TYPOGRAPHY LIST (The effortless hover area) */}
                            <div 
                                className="flex flex-col flex-grow w-full justify-between pb-4"
                                onMouseEnter={() => setIsHoveringList(true)}
                                onMouseLeave={() => { setIsHoveringList(false); setIgHoveredIdx(null); }}
                            >
                                {igPosts.map((post, idx) => {
                                    const isActive = isHoveringList && igHoveredIdx !== null ? igHoveredIdx === idx : autoIgIndex === idx;
                                    
                                    return (
                                        <a 
                                            key={post.id + "list"}
                                            href={post.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            onMouseEnter={() => setIgHoveredIdx(idx)}
                                            className="relative flex items-center justify-between py-5 border-b border-alpine-navy/10 dark:border-white/10 last:border-0 group cursor-pointer"
                                        >
                                            {/* Left: Number & Caption */}
                                            <div className="flex items-center gap-4 md:gap-6 w-[80%]">
                                                <span className={`font-serif italic text-lg transition-colors duration-300 ${isActive ? 'text-alpine-navy dark:text-white' : 'text-alpine-navy/30 dark:text-white/30'}`}>
                                                    0{idx + 1}
                                                </span>
                                                <h4 className={`font-light text-sm md:text-base line-clamp-1 transition-colors duration-300 ${isActive ? 'text-alpine-navy dark:text-white' : 'text-alpine-navy/50 dark:text-white/50'}`}>
                                                    {post.caption || 'Field Dispatch from the summit.'}
                                                </h4>
                                            </div>
                                            
                                            {/* Right: Date & Arrow */}
                                            <div className="flex items-center gap-4">
                                                <span className="hidden md:block text-[10px] font-bold tracking-widest uppercase text-alpine-navy/40 dark:text-white/40">
                                                    {formatDate(post.timestamp)}
                                                </span>
                                                <ArrowUpRight className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'text-alpine-navy dark:text-white translate-x-1 -translate-y-1' : 'text-alpine-navy/20 dark:text-white/20'}`} />
                                            </div>
                                            
                                            {/* Hover Highlight Line */}
                                            <div className={`absolute bottom-0 left-0 h-[1px] bg-alpine-navy dark:bg-white transition-all duration-500 ease-out ${isActive ? 'w-full' : 'w-0'}`} />
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>

                    {/* Divider Line on Desktop */}
                    <div className="hidden lg:block w-[1px] h-full bg-gradient-to-b from-transparent via-alpine-navy/20 dark:via-white/20 to-transparent" />

                    {/* ── RIGHT: YOUTUBE (THE CINEMATIC ACCORDION) ── */}
                    <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-10%" }}
                        transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full lg:w-1/2 h-full flex flex-col"
                    >
                        {/* YouTube Header */}
                        <div className="flex justify-between items-end mb-8 pb-4 border-b border-alpine-navy/10 dark:border-white/10">
                            <div>
                                <h3 className="text-2xl md:text-3xl font-light text-alpine-navy dark:text-white flex items-center gap-3 mb-2">
                                    <Youtube className="w-7 h-7 text-[#FF0000]" /> 
                                    Expedition Films
                                </h3>
                                <a href="https://www.youtube.com/@MountaineerMallu" target="_blank" rel="noreferrer" className="text-sm font-bold tracking-widest uppercase text-alpine-navy/50 dark:text-white/50 hover:text-[#FF0000] transition-colors">
                                    Mountaineer Mallu
                                </a>
                            </div>
                            <div className="text-[4rem] font-serif font-black text-alpine-navy/5 dark:text-white/5 leading-none">YT</div>
                        </div>

                        {/* Interactive Accordion */}
                        <div className="w-full flex-grow flex flex-col gap-4 h-full min-h-[500px]">
                            {ytVideos.map((video, idx) => {
                                const isActive = activeVideoIndex === idx;
                                
                                return (
                                    <motion.div 
                                        key={video.id}
                                        className="relative rounded-3xl overflow-hidden cursor-pointer bg-black border border-alpine-navy/10 dark:border-white/10 shadow-lg group"
                                        animate={{ 
                                            flexGrow: isActive ? 10 : 1,
                                            flexBasis: isActive ? 'auto' : '80px' 
                                        }}
                                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                        onClick={() => setActiveVideoIndex(idx)}
                                    >
                                        {/* Background Image */}
                                        <img 
                                            src={video.thumbnailUrl} 
                                            alt={video.title} 
                                            loading="lazy"
                                            decoding="async"
                                            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
                                        
                                        {/* Content Wrapper */}
                                        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                                            
                                            {/* Compressed State (Horizontal Bar) */}
                                            <motion.div 
                                                className="absolute inset-0 p-6 flex items-center justify-between pointer-events-none"
                                                animate={{ opacity: isActive ? 0 : 1 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <h4 className="text-white font-medium text-lg truncate pr-10">{video.title}</h4>
                                                <Play className="w-6 h-6 text-white/50" />
                                            </motion.div>

                                            {/* Expanded State (Full Detail) */}
                                            <motion.div 
                                                className="relative pointer-events-none"
                                                animate={{ 
                                                    opacity: isActive ? 1 : 0, 
                                                    y: isActive ? 0 : 20 
                                                }}
                                                transition={{ duration: 0.5, delay: isActive ? 0.3 : 0 }}
                                            >
                                                <div className="mb-4">
                                                    <span className="px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-md bg-white/10 text-white text-xs font-bold tracking-widest">
                                                        {video.duration}
                                                    </span>
                                                </div>
                                                <h4 className="text-white text-2xl md:text-3xl font-light mb-4 leading-tight">
                                                    {video.title}
                                                </h4>
                                                <div className="flex items-center gap-6 text-white/70 text-xs font-bold tracking-widest uppercase">
                                                    <span>{video.views} Views</span>
                                                    <span>{formatDate(video.publishedAt)}</span>
                                                </div>
                                                
                                                <a 
                                                    href={video.url} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="mt-8 inline-flex items-center gap-3 px-6 py-3 bg-white text-black rounded-full font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform pointer-events-auto"
                                                >
                                                    <Play className="w-4 h-4" /> Watch Film
                                                </a>
                                            </motion.div>

                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
