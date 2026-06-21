import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PremiumVideoPlayer } from '../ui/PremiumVideoPlayer';

const MEDIA = [
    { id: 1, type: 'image', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1600&auto=format&fit=crop', title: 'Glacier Walk', subtitle: 'Khumbu Icefall' },
    { id: 2, type: 'video', url: 'https://player.vimeo.com/external/434045526.sd.mp4?s=c27ee2bb3c81e8adbc9ccf066b1a37a5146ae9b6&profile_id=164&oauth2_token_id=57447761', title: 'Summit Ascent', subtitle: 'Hillary Step' },
    { id: 3, type: 'image', url: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=1600&auto=format&fit=crop', title: 'Rest Camp', subtitle: 'Camp III' },
    { id: 4, type: 'image', url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=1600&auto=format&fit=crop', title: 'Snow Ridge', subtitle: 'Lhotse Face' },
    { id: 5, type: 'video', url: 'https://player.vimeo.com/external/480088927.sd.mp4?s=5a1f6a1e5d792b0051e707dc87d9047976e1a91e&profile_id=164&oauth2_token_id=57447761', title: 'Whiteout', subtitle: 'South Col' },
    { id: 6, type: 'image', url: 'https://images.unsplash.com/photo-1516655855035-d5215bcb5604?q=80&w=1600&auto=format&fit=crop', title: 'The Descent', subtitle: 'Basecamp Return' },
];

export const Gallery = () => {
    const { t } = useTranslation();
    const sectionRef = useRef<HTMLElement>(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

    // Track globally hovered item ID
    const [hoveredId, setHoveredId] = useState<number | null>(null);

    // Group into 3 columns, 2 items per column
    const columns = [
        { id: 'col-1', items: [MEDIA[0], MEDIA[1]] },
        { id: 'col-2', items: [MEDIA[2], MEDIA[3]] },
        { id: 'col-3', items: [MEDIA[4], MEDIA[5]] }
    ];

    return (
        // Changed Light mode background to alpine-navy to perfectly match Community Pulse
        <section ref={sectionRef} id="gallery" className="pt-24 pb-32 px-4 md:px-12 bg-alpine-navy dark:bg-black text-white">
            <div className="w-full max-w-[1600px] mx-auto">
                
                {/* Header Area */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6 md:gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8 }}
                    >
                        <p className="text-alpine-glacier dark:text-alpine-sunrise text-xs md:text-sm font-semibold tracking-[0.3em] uppercase mb-3">
                            {t('gallery.captured_moments', 'Captured Moments')}
                        </p>
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif mb-4 text-white">
                            {t('gallery.title', 'Visual Archive')}
                        </h2>
                        <p className="text-white/70 font-light max-w-xl text-base md:text-xl">
                            {t('gallery.subtitle', 'Glimpses into the raw beauty of our climbs. Real moments, unstaged and breathtaking.')}
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <Link
                            to="/gallery"
                            className="group flex items-center gap-3 md:gap-4 text-white font-medium transition-colors text-sm md:text-base border border-white/20 px-6 py-3 rounded-full hover:bg-white hover:text-alpine-blue dark:hover:text-black"
                        >
                            {t('gallery.view_more', 'Open Vault')} 
                            <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </motion.div>
                </div>

                {/* 2D Accordion Layout */}
                <div className="flex gap-2 md:gap-4 w-full h-[80vh] min-h-[600px] rounded-[2rem] overflow-hidden">
                    {columns.map((col, colIndex) => {
                        const isColHovered = hoveredId !== null && col.items.some(item => item.id === hoveredId);
                        const isAnyHovered = hoveredId !== null;
                        
                        // Horizontal Expansion (Column Width)
                        let colWidth = '33.333%';
                        if (isAnyHovered) {
                            colWidth = isColHovered ? '60%' : '20%';
                        }

                        return (
                            <motion.div 
                                key={col.id}
                                layout
                                initial={{ opacity: 0, y: 50 }}
                                animate={isInView ? { opacity: 1, y: 0, width: colWidth } : { width: colWidth }}
                                transition={{ 
                                    opacity: { duration: 0.8, delay: colIndex * 0.1 },
                                    width: { type: "spring", stiffness: 200, damping: 25 },
                                    y: { duration: 0.8 }
                                }}
                                className="flex flex-col gap-2 md:gap-4 h-full"
                            >
                                {col.items.map((item, itemIndex) => {
                                    const isItemHovered = hoveredId === item.id;
                                    
                                    // Vertical Expansion (Row Height) ONLY within the hovered column
                                    let itemHeight = '50%';
                                    if (isColHovered) {
                                        itemHeight = isItemHovered ? '70%' : '30%';
                                    }

                                    return (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            onMouseEnter={() => setHoveredId(item.id)}
                                            onMouseLeave={() => setHoveredId(null)}
                                            animate={{ height: itemHeight }}
                                            transition={{ type: "spring", stiffness: 200, damping: 25 }}
                                            className="gallery-item relative w-full group overflow-hidden bg-black rounded-2xl md:rounded-3xl"
                                        >
                                            {/* Media */}
                                            <div className="absolute inset-0 w-full h-full transform-gpu transition-transform duration-[1.5s] scale-[1.05] group-hover:scale-100">
                                                {item.type === 'video' ? (
                                                    <PremiumVideoPlayer
                                                        src={item.url}
                                                        isActive={true}
                                                        autoPlay={true}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <img
                                                        src={item.url}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                    />
                                                )}
                                            </div>
                                            
                                            {/* Overlay Gradients */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none" />
                                            
                                            {/* Content */}
                                            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 flex flex-col justify-end text-white z-20 pointer-events-none">
                                                <div className="flex items-center gap-4 mb-3">
                                                    {item.type === 'video' && <Play className="w-4 h-4 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" fill="currentColor" />}
                                                    <div className="w-8 h-[1px] bg-white/50" />
                                                    <span className="tracking-[0.2em] text-xs font-medium text-white/80">0{item.id}</span>
                                                </div>
                                                <h3 className="font-serif text-2xl md:text-4xl font-light mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                                                    {item.title}
                                                </h3>
                                                
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: isItemHovered ? 'auto' : 0, opacity: isItemHovered ? 1 : 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="overflow-hidden"
                                                >
                                                    <p className="text-white/80 tracking-widest uppercase text-[10px] md:text-xs font-semibold mt-2">
                                                        {item.subtitle}
                                                    </p>
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
