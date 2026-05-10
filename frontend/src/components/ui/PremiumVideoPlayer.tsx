import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, RotateCcw } from 'lucide-react';

interface PremiumVideoPlayerProps {
    src: string;
    poster?: string;
    isActive?: boolean;
    className?: string;
    autoPlay?: boolean;
}

export const PremiumVideoPlayer: React.FC<PremiumVideoPlayerProps> = ({ 
    src, 
    poster, 
    isActive = false, 
    className = "",
    autoPlay = false
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [isMuted, setIsMuted] = useState(true);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    // Sync play state with isActive prop (for carousels)
    useEffect(() => {
        if (!videoRef.current) return;
        if (isActive && autoPlay) {
            videoRef.current.play().catch(() => setIsPlaying(false));
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, [isActive, autoPlay]);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        videoRef.current.muted = !videoRef.current.muted;
        setIsMuted(!isMuted);
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const current = videoRef.current.currentTime;
        const total = videoRef.current.duration;
        setProgress((current / total) * 100);
    };

    const handleLoadedMetadata = () => {
        if (!videoRef.current) return;
        setDuration(videoRef.current.duration);
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!videoRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        videoRef.current.currentTime = percentage * videoRef.current.duration;
    };

    const toggleFullscreen = () => {
        if (!videoRef.current) return;
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            videoRef.current.parentElement?.requestFullscreen();
        }
    };

    return (
        <div 
            className={`relative group bg-black rounded-lg overflow-hidden ${className}`}
            onMouseEnter={() => { setShowControls(true); setIsHovering(true); }}
            onMouseLeave={() => { setShowControls(false); setIsHovering(false); }}
        >
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="w-full h-full object-cover"
                loop
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onClick={togglePlay}
                playsInline
            />

            {/* Cinematic Vignette Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            {/* Play/Pause Large Center Overlay */}
            <AnimatePresence>
                {!isPlaying && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2 }}
                        className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
                    >
                        <div className="w-20 h-20 rounded-full glass-premium flex items-center justify-center text-white shadow-2xl">
                            <Play size={40} className="ml-1" fill="currentColor" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom Premium Controls Bar */}
            <AnimatePresence>
                {showControls && (
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-20"
                    >
                        <div className="glass-premium rounded-xl p-3 md:p-4 border border-white/10 shadow-2xl backdrop-blur-2xl">
                            {/* Progress bar */}
                            <div 
                                className="relative h-1.5 w-full bg-white/10 rounded-full mb-4 cursor-pointer overflow-hidden group/bar"
                                onClick={handleSeek}
                            >
                                <motion.div 
                                    className="absolute inset-y-0 left-0 bg-alpine-glacier rounded-full shadow-[0_0_10px_rgba(163,201,226,0.6)]"
                                    style={{ width: `${progress}%` }}
                                />
                                <div className="absolute inset-y-0 left-0 bg-white/20 opacity-0 group-hover/bar:opacity-100 transition-opacity" style={{ width: '100%' }} />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 md:gap-6">
                                    <button onClick={togglePlay} className="text-white hover:text-alpine-glacier transition-colors">
                                        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                                    </button>

                                    <div className="flex items-center gap-3 group/volume">
                                        <button onClick={toggleMute} className="text-white hover:text-alpine-glacier transition-colors">
                                            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                        </button>
                                        <div className="w-0 group-hover/volume:w-20 overflow-hidden transition-all duration-300 h-1 bg-white/20 rounded-full relative">
                                            <div className="absolute inset-y-0 left-0 bg-white rounded-full" style={{ width: isMuted ? '0%' : '80%' }} />
                                        </div>
                                    </div>

                                    <span className="text-[10px] md:text-xs font-display font-medium text-white/60 tracking-widest uppercase">
                                        {Math.floor(videoRef.current?.currentTime || 0)}s / {Math.floor(duration)}s
                                    </span>
                                </div>

                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => { if(videoRef.current) videoRef.current.currentTime = 0; }}
                                        className="text-white/60 hover:text-white transition-colors"
                                    >
                                        <RotateCcw size={16} />
                                    </button>
                                    <button onClick={toggleFullscreen} className="text-white hover:text-alpine-glacier transition-colors">
                                        <Maximize size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Right Label */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6">
                <div className="glass-premium px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-alpine-glacier animate-pulse" />
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/80">Premium Feed</span>
                </div>
            </div>
        </div>
    );
};
