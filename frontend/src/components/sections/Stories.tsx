import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store/useStore';

// Expanded dummy data to demonstrate pagination
const STORIES = [
    { 
        id: 1, title: 'The Eiger North Face', author: 'Rahul Krishnan', region: 'Swiss Alps', 
        image: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?q=80&w=1600&auto=format&fit=crop',
        excerpt: 'A grueling 18-hour ascent up the infamous Nordwand. The loose limestone tested every ounce of our mental fortitude.'
    },
    { 
        id: 2, title: 'Dolomites Sunrise', author: 'Arun Thomas', region: 'Italy', 
        image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1600&auto=format&fit=crop',
        excerpt: 'Navigating the Via Ferrata as the sun broke the horizon. The jagged spires offered a surreal, vertical playground.'
    },
    { 
        id: 3, title: 'Mont Blanc Circuit', author: 'Nithin Varghese', region: 'France', 
        image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=1600&auto=format&fit=crop',
        excerpt: 'Crossing three international borders on foot. An immersion into centuries of Alpine climbing culture.'
    },
    { 
        id: 4, title: 'Zugspitze Summit', author: 'Sneha Nair', region: 'Germany', 
        image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=1600&auto=format&fit=crop',
        excerpt: 'A sudden blizzard forced us to rethink our strategy. The glacier crossing was treacherous, but rewarding.'
    },
    { 
        id: 5, title: 'Matterhorn Ascent', author: 'Vivek G.', region: 'Switzerland', 
        image: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a86?q=80&w=1600&auto=format&fit=crop',
        excerpt: 'Scaling the iconic Hörnli Ridge. Standing on the razor-thin summit ridge was an unforgettable triumph.'
    },
    // Page 2
    { 
        id: 6, title: 'Aiguille du Midi', author: 'Rahul Krishnan', region: 'Chamonix, FR', 
        image: 'https://images.unsplash.com/photo-1647468153096-27bcfe49c303?q=80&w=1600&auto=format&fit=crop',
        excerpt: 'Exposed ridges and thin air. The traverse to the cosmic arête tested our rope skills at altitude.'
    },
    { 
        id: 7, title: 'Gran Paradiso', author: 'Sneha Nair', region: 'Aosta Valley, IT', 
        image: 'https://images.unsplash.com/photo-1549880181-56a44cf4a9a1?q=80&w=1600&auto=format&fit=crop',
        excerpt: 'A perfect introductory 4000m peak that threw unexpected crevasses our way near the summit.'
    },
    { 
        id: 8, title: 'Grossglockner', author: 'Arun Thomas', region: 'Austria', 
        image: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?q=80&w=1600&auto=format&fit=crop',
        excerpt: 'Navigating the Stüdlgrat. The sheer drop on either side of the ridge made for an exhilarating climb.'
    },
    { 
        id: 9, title: 'Jungfrau Journey', author: 'Vivek G.', region: 'Bernese Alps', 
        image: 'https://images.unsplash.com/photo-1491555103944-7c647fd857e6?q=80&w=1600&auto=format&fit=crop',
        excerpt: 'Taking the railway up and climbing the rest. The deep snow made the final push incredibly taxing.'
    },
    { 
        id: 10, title: 'Monte Rosa', author: 'Nithin Varghese', region: 'Swiss-Italian Border', 
        image: 'https://images.unsplash.com/photo-1465056836041-7f43ac27dcb5?q=80&w=1600&auto=format&fit=crop',
        excerpt: 'The second highest peak in the Alps. A massive glacier expedition requiring strict discipline.'
    }
];

const ITEMS_PER_PAGE = 5;

export const Stories = () => {
    const { t } = useTranslation();
    const translationScope = useStore((state) => state.translationScope);
    
    const [page, setPage] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);

    const totalPages = Math.ceil(STORIES.length / ITEMS_PER_PAGE);
    
    // Get the current slice of stories based on the page
    const currentStories = STORIES.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

    const handleNextPage = () => {
        setPage((prev) => (prev + 1) % totalPages);
        setActiveIndex(0); // reset active index when page changes
    };

    const handlePrevPage = () => {
        setPage((prev) => (prev - 1 + totalPages) % totalPages);
        setActiveIndex(0);
    };

    return (
        <section id="stories" className="relative w-full min-h-screen bg-white dark:bg-black transition-colors duration-500 flex flex-col py-16 md:py-24 px-4 md:px-12">
            
            {/* Header (Outside the accordion) */}
            <div className="w-full max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-6 relative z-20">
                <div>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.6 }}
                        className="text-alpine-glacier dark:text-alpine-sunrise text-xs md:text-sm font-semibold tracking-[0.3em] uppercase mb-3"
                    >
                        {t('stories.title', 'Expedition Logs')}
                    </motion.p>
                    <motion.h2
                        initial={{ x: -40, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.8, delay: 0.1, type: "spring", bounce: 0.4 }}
                        className="text-black dark:text-white text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight transition-colors duration-500"
                    >
                        {t('stories.subtitle', 'Raw Field Notes')}
                    </motion.h2>
                </div>

                {/* View All Button */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.2 }}
                >
                    <Link
                        to="/stories"
                        className="flex items-center gap-2 group text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-all duration-300 border border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white px-6 py-3 rounded-full"
                    >
                        <span className="font-medium tracking-wide uppercase text-xs tracking-[0.2em]">{t('stories.view_all', 'View Archives')}</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>

            {/* Accordion Container */}
            <motion.div 
                initial={{ opacity: 0, y: 60, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[1600px] mx-auto flex-1 flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-2xl border border-white/10 min-h-[60vh] md:min-h-[70vh]">
                <AnimatePresence mode="popLayout">
                    {currentStories.map((story, index) => {
                        const isActive = index === activeIndex;

                        const displayTitle = translationScope === 'everything' 
                            ? t(`dynamic_stories.${story.id}.title`, { defaultValue: story.title }) 
                            : story.title;
                            
                        const displayRegion = translationScope === 'everything' 
                            ? t(`dynamic_stories.${story.id}.region`, { defaultValue: story.region }) 
                            : story.region;

                        return (
                            <motion.div
                                key={`${page}-${story.id}`} // Force re-render on page change for entry animation
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ 
                                    opacity: 1, 
                                    scale: 1,
                                    flex: isActive ? 5 : 1,
                                }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.5, layout: { type: "spring", stiffness: 200, damping: 25, mass: 0.8 } }}
                                onMouseEnter={() => window.innerWidth >= 768 && setActiveIndex(index)}
                                onClick={() => window.innerWidth < 768 && setActiveIndex(index)}
                                className={`relative overflow-hidden cursor-pointer group ${
                                    isActive ? 'cursor-default' : 'hover:brightness-110'
                                }`}
                            >
                                {/* Background Image */}
                                <motion.img
                                    src={story.image}
                                    alt={displayTitle}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    animate={{ 
                                        scale: isActive ? 1.05 : 1.2,
                                        filter: isActive ? 'brightness(0.9) saturate(1.1)' : 'brightness(0.4) saturate(0.5)'
                                    }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                                
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80" />
                                <div className="absolute inset-0 border-r md:border-r-[1px] border-b md:border-b-0 border-white/10" />

                                {/* Content */}
                                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12">
                                    
                                    {/* Collapsed State */}
                                    <AnimatePresence mode="wait">
                                        {!isActive && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute inset-0 flex items-center justify-center md:pb-12 md:items-end"
                                            >
                                                <h3 className="text-white/60 font-serif text-lg md:text-2xl tracking-widest whitespace-nowrap md:-rotate-90 origin-bottom-left md:translate-x-6 md:mb-16">
                                                    {displayRegion}
                                                </h3>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Expanded State */}
                                    <AnimatePresence mode="wait">
                                        {isActive && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 30 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 20 }}
                                                transition={{ duration: 0.4, delay: 0.2 }}
                                                className="relative z-10 w-full md:w-[800px] max-w-[90vw]"
                                            >
                                                <div className="flex items-center gap-2 text-alpine-glacier mb-3">
                                                    <MapPin size={14} className="md:w-4 md:h-4" />
                                                    <span className="text-xs md:text-sm font-bold tracking-[0.2em] uppercase">{displayRegion}</span>
                                                </div>
                                                
                                                <h3 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-[1.1] tracking-tight">
                                                    {displayTitle}
                                                </h3>
                                                
                                                <p className="text-white/70 text-sm md:text-lg leading-relaxed mb-6 md:mb-8 max-w-xl font-light">
                                                    "{story.excerpt}"
                                                </p>
                                                
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-auto w-full max-w-xl gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-[1px] w-8 md:w-12 bg-white/30" />
                                                        <p className="text-white/90 font-medium tracking-wide uppercase text-xs md:text-sm">By <span className="font-bold">{story.author}</span></p>
                                                    </div>

                                                    <Link to={`/stories/${story.id}`}>
                                                        <button className="group/btn relative px-4 py-2 md:px-6 md:py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white overflow-hidden hover:bg-white hover:text-black transition-all duration-300 flex items-center gap-2">
                                                            <span className="font-bold tracking-wider text-[10px] md:text-xs uppercase relative z-10">Read</span>
                                                            <ArrowRight size={14} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                                                        </button>
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>

            {/* Pagination Controls */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="w-full max-w-[1600px] mx-auto flex items-center justify-between mt-6 md:mt-8 relative z-20">
                <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <div 
                            key={i} 
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === page ? 'w-8 bg-alpine-glacier' : 'w-2 bg-black/20 dark:bg-white/20'}`}
                        />
                    ))}
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handlePrevPage}
                        className="p-3 rounded-full border border-black/20 dark:border-white/20 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                        aria-label="Previous batch"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button 
                        onClick={handleNextPage}
                        className="p-3 rounded-full border border-black/20 dark:border-white/20 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                        aria-label="Next batch"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </motion.div>

        </section>
    );
};
