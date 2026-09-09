import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usersApi } from '../../lib/api';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export const UserWishlistTab = () => {
    const [wishlist, setWishlist] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const data = await usersApi.getWishlist();
                setWishlist(data.wishlist || []);
            } catch (error) {
                console.error('Failed to load wishlist:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchWishlist();
    }, []);

    const handleRemove = async (itemId: string) => {
        try {
            // Optimistic update
            setWishlist(prev => prev.filter(item => item._id !== itemId));
            await usersApi.toggleWishlist(itemId);
        } catch (error) {
            console.error('Failed to remove from wishlist:', error);
            // Revert on error (could refetch, but this is simpler for now)
            const data = await usersApi.getWishlist();
            setWishlist(data.wishlist);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
        >
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-red-500/20 text-red-500 rounded-2xl">
                    <Heart size={32} className="fill-current" />
                </div>
                <div>
                    <h2 className="text-3xl font-serif font-bold tracking-wide">My Wishlist</h2>
                    <p className="text-alpine-navy/60 dark:text-white/50 mt-1">Your saved premium expedition gear and apparel.</p>
                </div>
            </div>

            {wishlist.length === 0 ? (
                <div className="p-12 text-center bg-black/5 dark:bg-white/5 rounded-3xl border border-black/10 dark:border-white/10">
                    <ShoppingBag size={48} className="mx-auto text-alpine-navy/30 dark:text-white/30 mb-4" />
                    <h3 className="text-xl font-serif font-bold mb-2">Your wishlist is empty</h3>
                    <p className="text-alpine-navy/60 dark:text-white/60 mb-6">Discover our premium collection of technical gear and apparel.</p>
                    <Link to="/#shop">
                        <button className="px-6 py-3 bg-alpine-navy dark:bg-alpine-glacier/20 text-white dark:text-alpine-glacier font-bold rounded-xl hover:bg-alpine-navy/90 dark:hover:bg-alpine-glacier/30 transition-all border border-transparent dark:border-alpine-glacier/30">
                            Explore Shop
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {wishlist.map((item, idx) => (
                            <motion.div
                                key={item._id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                                transition={{ duration: 0.3 }}
                                className="group relative"
                                style={{ perspective: '1000px' }}
                            >
                                <div className="h-full bg-white dark:bg-[#0B0C10] rounded-3xl p-4 border border-black/5 dark:border-white/10 shadow-lg transition-all duration-500 hover:shadow-2xl flex flex-col transform-style-3d group-hover:rotate-x-2 group-hover:rotate-y-[-2deg]">
                                    
                                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-4 bg-black/5 dark:bg-white/5 group-hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.5)] transition-all duration-500">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform duration-700 ease-out"
                                        />
                                        <div className="absolute top-3 right-3">
                                            <button 
                                                onClick={() => handleRemove(item._id)}
                                                className="w-10 h-10 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col flex-grow">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-serif text-lg font-bold text-alpine-navy dark:text-white leading-tight pr-4">
                                                {item.name}
                                            </h3>
                                            <p className="font-mono text-sm tracking-widest text-alpine-forest dark:text-alpine-glacier whitespace-nowrap">
                                                €{item.price}
                                            </p>
                                        </div>
                                        <p className="text-xs text-alpine-navy/50 dark:text-white/40 mb-4 line-clamp-2 leading-relaxed flex-grow">
                                            {item.description}
                                        </p>

                                        <button className="w-full py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-alpine-navy font-bold text-xs uppercase tracking-widest hover:bg-alpine-forest dark:hover:bg-alpine-glacier transition-colors flex justify-center items-center gap-2 group/btn">
                                            <span>Purchase Flow</span>
                                            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
};
