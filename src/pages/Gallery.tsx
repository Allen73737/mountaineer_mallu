import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Maximize2 } from 'lucide-react';

const MEDIA_VAULT = [
    { id: 1, type: 'video', url: 'https://player.vimeo.com/external/434045526.sd.mp4?s=c27ee2bb3c81e8adbc9ccf066b1a37a5146ae9b6&profile_id=164&oauth2_token_id=57447761', title: 'Summit Ascent', span: 'col-span-2 row-span-2' },
    { id: 2, type: 'image', url: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=1200', title: 'Rest Camp', span: 'col-span-1 row-span-1' },
    { id: 3, type: 'image', url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=1200', title: 'Snow Ridge', span: 'col-span-1 row-span-2' },
    { id: 4, type: 'image', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200', title: 'Ice Cave', span: 'col-span-1 row-span-1' },
    { id: 5, type: 'image', url: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?q=80&w=1200', title: 'Dawn Hike', span: 'col-span-2 row-span-1' },
    { id: 6, type: 'video', url: 'https://player.vimeo.com/external/475879743.sd.mp4?s=7b08fe656fa5c2cbf3a941ea875ce1f8b66ddb48&profile_id=165&oauth2_token_id=57447761', title: 'Basecamp Prep', span: 'col-span-1 row-span-2' },
    { id: 7, type: 'image', url: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a86?q=80&w=1200', title: 'The Spine', span: 'col-span-1 row-span-1' },
    { id: 8, type: 'image', url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200', title: 'Alpine Lake', span: 'col-span-2 row-span-1' },
];

export const GalleryPage = () => {
    const [selectedMedia, setSelectedMedia] = useState<typeof MEDIA_VAULT[0] | null>(null);

    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-24 px-4 md:px-8">

            {/* Header */}
            <div className="max-w-7xl mx-auto mb-16 px-4">
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

            {/* Bento Grid */}
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                    }}
                    className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] gap-4 md:gap-6"
                >
                    {MEDIA_VAULT.map((media, i) => (
                        <motion.div
                            key={media.id}
                            variants={{
                                hidden: { opacity: 0, scale: 0.9, y: 50 },
                                visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
                            }}
                            className={`relative rounded-3xl overflow-hidden cursor-pointer group ${media.span}`}
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
            </div>

            {/* Fullscreen Modal Override */}
            <AnimatePresence>
                {selectedMedia && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
                        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 md:p-12 cursor-pointer"
                        onClick={() => setSelectedMedia(null)}
                    >
                        <button
                            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-4 backdrop-blur-lg"
                            onClick={() => setSelectedMedia(null)}
                        >
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
                                <video src={selectedMedia.url} autoPlay loop controls className="w-full h-full object-contain bg-black" />
                            ) : (
                                <img src={selectedMedia.url} className="w-full h-full object-contain bg-black" />
                            )}
                            <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                                <h2 className="text-4xl font-serif text-white">{selectedMedia.title}</h2>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
