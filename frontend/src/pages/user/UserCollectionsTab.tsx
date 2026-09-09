import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usersApi } from '../../lib/api';
import { Folder, Download, Loader, Image as ImageIcon, Video } from 'lucide-react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export const UserCollectionsTab = () => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await usersApi.getMyProfile();
                setProfile(res.user);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center h-64"><LoadingSpinner /></div>;
    }

    const renderMediaCard = (item: any) => (
        <div key={item._id} className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden group border border-black/5 dark:border-white/5 shadow-lg bg-black/5 dark:bg-black/50">
            {item.type === 'video' ? (
                <video src={item.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
            ) : (
                <img src={item.url} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex justify-between items-end">
                <div>
                    <h4 className="text-white font-bold text-xs sm:text-sm line-clamp-1">{item.title}</h4>
                    <p className="text-white/60 text-xs mt-1">
                        {item.type === 'video' ? <Video size={12} className="inline mr-1" /> : <ImageIcon size={12} className="inline mr-1" />}
                        {item.type}
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col h-full"
        >
            <div className="mb-6 sm:mb-10">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-alpine-navy dark:text-white mb-3 sm:mb-4 tracking-wide">Collections Archive</h1>
                <p className="text-alpine-navy/60 dark:text-white/60 text-base sm:text-lg font-light">Your personalized gallery of saved expeditions and downloads.</p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar sm:pr-2 pb-8 flex flex-col gap-8 sm:gap-12">
                
                {/* Downloads Section */}
                <section>
                    <div className="flex items-center gap-3 mb-4 sm:mb-6 border-b border-black/10 dark:border-white/10 pb-3 sm:pb-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-alpine-glacier/10 flex items-center justify-center">
                            <Download size={18} className="text-alpine-glacier" />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-alpine-navy dark:text-white">Downloaded Media</h2>
                            <p className="text-alpine-navy/50 dark:text-white/50 text-xs sm:text-sm">Media you have downloaded to your device</p>
                        </div>
                    </div>
                    
                    {(!profile?.downloads || profile.downloads.length === 0) ? (
                        <div className="bg-white/60 dark:bg-[#11141A] backdrop-blur-md rounded-2xl sm:rounded-3xl p-8 sm:p-12 border border-black/5 dark:border-white/5 text-center flex flex-col items-center">
                            <Download size={48} className="text-alpine-navy/10 dark:text-white/10 mb-4" />
                            <p className="text-alpine-navy/40 dark:text-white/40">You haven't downloaded any media yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                            {profile.downloads.map(renderMediaCard)}
                        </div>
                    )}
                </section>

                {/* Collections Section */}
                <section>
                    <div className="flex items-center gap-3 mb-4 sm:mb-6 border-b border-black/10 dark:border-white/10 pb-3 sm:pb-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-alpine-glacier/10 flex items-center justify-center">
                            <Folder size={18} className="text-alpine-glacier" />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-alpine-navy dark:text-white">Saved Collections</h2>
                            <p className="text-alpine-navy/50 dark:text-white/50 text-xs sm:text-sm">Your custom curated galleries</p>
                        </div>
                    </div>

                    {(!profile?.collections || profile.collections.length === 0) ? (
                        <div className="bg-white/60 dark:bg-[#11141A] backdrop-blur-md rounded-2xl sm:rounded-3xl p-8 sm:p-12 border border-black/5 dark:border-white/5 text-center flex flex-col items-center">
                            <Folder size={48} className="text-alpine-navy/10 dark:text-white/10 mb-4" />
                            <p className="text-alpine-navy/40 dark:text-white/40">You haven't created any collections yet.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6 sm:gap-8">
                            {profile.collections.map((collection: any) => (
                                <div key={collection._id} className="bg-white/60 dark:bg-[#11141A] backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-black/5 dark:border-white/5 shadow-xl dark:shadow-2xl">
                                    <h3 className="text-lg sm:text-xl font-bold text-alpine-navy dark:text-white mb-4 sm:mb-6 uppercase tracking-wider">{collection.name}</h3>
                                    {collection.items.length === 0 ? (
                                        <p className="text-alpine-navy/30 dark:text-white/30 text-sm">This collection is empty.</p>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                                            {collection.items.map(renderMediaCard)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </motion.div>
    );
};
