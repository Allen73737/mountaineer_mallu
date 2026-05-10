import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { storiesApi, galleryApi } from '../../lib/api';
import { CheckCircle, Clock, XCircle, FileText, Image as ImageIcon, Loader } from 'lucide-react';

export const UserSubmissionsTab = () => {
    const [stories, setStories] = useState<any[]>([]);
    const [media, setMedia] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const [storiesRes, mediaRes] = await Promise.all([
                    storiesApi.getMyStories(),
                    galleryApi.getMyMedia()
                ]);
                setStories(storiesRes.stories);
                setMedia(mediaRes.items);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSubmissions();
    }, []);

    const renderStatus = (status: string) => {
        switch (status) {
            case 'approved':
                return <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 bg-green-500/10 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-green-500/20"><CheckCircle size={14} /> Approved</span>;
            case 'rejected':
                return <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 bg-red-500/10 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-red-500/20"><XCircle size={14} /> Rejected</span>;
            default:
                return <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-amber-500/20"><Clock size={14} /> Pending</span>;
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full"><Loader className="w-8 h-8 text-alpine-glacier animate-spin" /></div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col h-full"
        >
            <div className="mb-6 sm:mb-10">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-alpine-navy dark:text-white mb-3 sm:mb-4 tracking-wide">My Submissions</h1>
                <p className="text-alpine-navy/60 dark:text-white/60 text-base sm:text-lg font-light">Track the editorial status of your stories and media.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 flex-1 overflow-y-auto custom-scrollbar sm:pr-2 pb-8">
                {/* Stories Queue */}
                <div className="bg-white/60 dark:bg-[#11141A] backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-black/5 dark:border-white/5 shadow-xl dark:shadow-2xl h-fit">
                    <h3 className="text-lg sm:text-xl font-bold text-alpine-navy dark:text-white mb-4 sm:mb-6 flex items-center gap-2 pb-3 sm:pb-4 border-b border-black/5 dark:border-white/5">
                        <FileText size={20} className="text-alpine-glacier" />
                        Story Logs
                    </h3>
                    <div className="flex flex-col gap-3 sm:gap-4">
                        {stories.length === 0 ? (
                            <p className="text-alpine-navy/30 dark:text-white/30 text-sm text-center py-6 sm:py-8">No stories submitted yet.</p>
                        ) : (
                            stories.map(story => (
                                <div key={story._id} className="bg-black/5 dark:bg-black/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-black/5 dark:border-white/5 flex gap-3 sm:gap-4 hover:bg-black/10 dark:hover:bg-black/50 transition-colors">
                                    <img src={story.image} alt={story.title} className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl object-cover flex-shrink-0" />
                                    <div className="flex-1 flex flex-col justify-center min-w-0">
                                        <h4 className="text-alpine-navy dark:text-white font-bold text-sm mb-1 line-clamp-1">{story.title}</h4>
                                        <p className="text-alpine-navy/50 dark:text-white/50 text-xs mb-2 sm:mb-3">{new Date(story.createdAt).toLocaleDateString()}</p>
                                        <div className="mt-auto self-start">
                                            {renderStatus(story.status)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Media Queue */}
                <div className="bg-white/60 dark:bg-[#11141A] backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-black/5 dark:border-white/5 shadow-xl dark:shadow-2xl h-fit">
                    <h3 className="text-lg sm:text-xl font-bold text-alpine-navy dark:text-white mb-4 sm:mb-6 flex items-center gap-2 pb-3 sm:pb-4 border-b border-black/5 dark:border-white/5">
                        <ImageIcon size={20} className="text-alpine-glacier" />
                        Gallery Media
                    </h3>
                    <div className="flex flex-col gap-3 sm:gap-4">
                        {media.length === 0 ? (
                            <p className="text-alpine-navy/30 dark:text-white/30 text-sm text-center py-6 sm:py-8">No media uploaded yet.</p>
                        ) : (
                            media.map(item => (
                                <div key={item._id} className="bg-black/5 dark:bg-black/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-black/5 dark:border-white/5 flex gap-3 sm:gap-4 hover:bg-black/10 dark:hover:bg-black/50 transition-colors">
                                    {item.type === 'video' ? (
                                        <video src={item.url} className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl object-cover flex-shrink-0" />
                                    ) : (
                                        <img src={item.url} alt={item.title} className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl object-cover flex-shrink-0" />
                                    )}
                                    <div className="flex-1 flex flex-col justify-center min-w-0">
                                        <h4 className="text-alpine-navy dark:text-white font-bold text-sm mb-1 line-clamp-1">{item.title}</h4>
                                        <p className="text-alpine-navy/50 dark:text-white/50 text-xs mb-2 sm:mb-3">{new Date(item.createdAt).toLocaleDateString()}</p>
                                        <div className="mt-auto self-start">
                                            {renderStatus(item.status)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
