import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Activity, Shield, TrendingUp, Cpu, Image as ImageIcon, Map, Users, Star, Mountain, Play, SkipForward, CheckCircle, Wand2, Type, Globe, Compass, Layout } from 'lucide-react';
import { DynamicLogo } from './DynamicLogo';

import { useNavigate } from 'react-router-dom';

interface MotionGraphicsDemoProps {
    onComplete: () => void;
}

export const MotionGraphicsDemo: React.FC<MotionGraphicsDemoProps> = ({ onComplete }) => {
    const [scene, setScene] = useState<number>(0);
    const [progress, setProgress] = useState<number>(0);
    const progressInterval = useRef<NodeJS.Timeout | null>(null);
    const navigate = useNavigate();

    const totalDuration = 55000; // Expanded to 55s

    useEffect(() => {
        // Expanded 9-Scene Timeline sequencer
        const timelines = [
            { time: 0, scene: 0 },      // The Summit (Homepage Hero)
            { time: 6000, scene: 1 },   // Global Map & Peaks
            { time: 12000, scene: 2 },  // Public Feed (Stories & Reviews)
            { time: 18000, scene: 3 },  // Portal Initialization
            { time: 23000, scene: 4 },  // Command Center
            { time: 30000, scene: 5 },  // AI Story Editor
            { time: 37000, scene: 6 },  // Media Vault
            { time: 43000, scene: 7 },  // Factions & Radar
            { time: 48000, scene: 8 },  // Outro
            { time: 55000, scene: 9 },  // CTA
        ];

        timelines.forEach((t) => {
            setTimeout(() => {
                setScene(t.scene);
                if (t.scene === 9) {
                    if (progressInterval.current) clearInterval(progressInterval.current);
                    setProgress(100);
                }
            }, t.time);
        });

        const updateRate = 50;
        let elapsed = 0;
        progressInterval.current = setInterval(() => {
            elapsed += updateRate;
            setProgress((elapsed / totalDuration) * 100);
            if (elapsed >= totalDuration) {
                if (progressInterval.current) clearInterval(progressInterval.current);
            }
        }, updateRate);

        return () => {
            if (progressInterval.current) clearInterval(progressInterval.current);
        };
    }, []);

    // Scene 4: Dashboard Counter
    const [stats, setStats] = useState({ expeditions: 0, altitude: 0, points: 0 });
    useEffect(() => {
        if (scene === 4) {
            let e = 0, a = 0, p = 0;
            const iv = setInterval(() => {
                e += 1; a += 1245; p += 345;
                if (e > 42) e = 42;
                if (a > 88480) a = 88480;
                if (p > 12450) p = 12450;
                setStats({ expeditions: e, altitude: a, points: p });
                if (e === 42 && a === 88480) clearInterval(iv);
            }, 50);
            return () => clearInterval(iv);
        }
    }, [scene]);

    // Scene 5: Typewriter
    const [typedText, setTypedText] = useState("");
    const storyText = "The wind bit through our gear at 6,000 meters. Every step was a battle against the elements, but the summit of Matterhorn called to us through the mist...";
    useEffect(() => {
        if (scene === 5) {
            let i = 0;
            const iv = setInterval(() => {
                setTypedText(storyText.substring(0, i));
                i++;
                if (i > storyText.length) clearInterval(iv);
            }, 30);
            return () => clearInterval(iv);
        }
    }, [scene]);

    const images = [
        "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80",
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
        "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&q=80",
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
        "https://images.unsplash.com/photo-1483728642387-6c3abe6c6b55?w=800&q=80",
        "https://images.unsplash.com/photo-1516655855035-d5215bcb5604?w=800&q=80"
    ];

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(20px)" }}
            className="fixed inset-0 z-[200] bg-[#02050A] text-white overflow-hidden font-sans"
        >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-alpine-glacier/10 via-[#02050A] to-[#02050A] opacity-60" />

            <div className="absolute top-8 left-8 z-50">
                <DynamicLogo className="h-8" showText={true} />
            </div>
            
            <button 
                onClick={onComplete}
                className="absolute top-8 right-8 z-50 px-6 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-all flex items-center gap-2 backdrop-blur-md text-sm font-semibold uppercase tracking-wider"
            >
                Skip Demo <SkipForward size={16} />
            </button>

            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/5 z-50">
                <motion.div 
                    className="h-full bg-gradient-to-r from-alpine-glacier via-[#64BEFF] to-alpine-glacier shadow-[0_0_15px_rgba(163,201,226,0.8)]"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="absolute inset-0 flex items-center justify-center p-8">
                <AnimatePresence mode="wait">
                    {/* SCENE 0: THE SUMMIT (HOMEPAGE) */}
                    {scene === 0 && (
                        <motion.div key="scene-0" initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0, filter: "blur(10px)" }} className="absolute inset-0 w-full h-full">
                            <motion.img 
                                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80" 
                                className="w-full h-full object-cover opacity-50 mix-blend-screen"
                                animate={{ scale: [1, 1.05] }}
                                transition={{ duration: 6, ease: "linear" }}
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                                <motion.h1 initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="text-6xl md:text-8xl font-serif font-black tracking-widest uppercase mb-6 glow-text text-center">The Alps Await</motion.h1>
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-xl text-white/70 tracking-[0.4em] uppercase font-light">Explore. Conquer. Inspire.</motion.p>
                            </div>
                        </motion.div>
                    )}

                    {/* SCENE 1: GLOBAL MAP */}
                    {scene === 1 && (
                        <motion.div key="scene-1" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="w-full max-w-6xl text-center">
                            <Globe size={64} className="text-alpine-glacier mx-auto mb-6" />
                            <h2 className="text-5xl font-serif font-bold text-white mb-8">Interactive Cartography</h2>
                            <div className="glass-premium h-96 rounded-3xl border border-white/10 relative overflow-hidden flex items-center justify-center">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1920&q=80')] bg-cover opacity-30" />
                                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute w-6 h-6 bg-red-500 rounded-full blur-sm" style={{ top: '40%', left: '30%' }} />
                                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }} className="absolute w-6 h-6 bg-alpine-glacier rounded-full blur-sm" style={{ top: '60%', right: '25%' }} />
                                <div className="z-10 text-2xl font-bold tracking-widest uppercase text-white/80 backdrop-blur-md px-8 py-4 rounded-xl border border-white/10">Real-Time Global Tracking</div>
                            </div>
                        </motion.div>
                    )}

                    {/* SCENE 2: PUBLIC FEED */}
                    {scene === 2 && (
                        <motion.div key="scene-2" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="w-full max-w-6xl">
                            <div className="text-center mb-12">
                                <h2 className="text-5xl font-serif font-bold text-white mb-4">The Community Feed</h2>
                                <p className="text-white/50 text-xl">Stories and reviews from explorers worldwide.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                {[1, 2, 3, 4].map((i) => (
                                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }} className="glass-premium p-6 rounded-2xl flex gap-6 items-center">
                                        <img src={images[i]} className="w-24 h-24 rounded-xl object-cover" />
                                        <div>
                                            <h3 className="font-bold text-lg mb-1">Ascent of Peak {i}</h3>
                                            <p className="text-white/50 text-sm">"The most gruelling climb of my life, but worth every step."</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* SCENE 3: PORTAL INITIALIZATION */}
                    {scene === 3 && (
                        <motion.div key="scene-3" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.5, opacity: 0, filter: "blur(20px)" }} className="flex flex-col items-center">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, ease: "linear", repeat: Infinity }} className="mb-8 relative">
                                <div className="absolute inset-0 bg-alpine-glacier/30 blur-3xl rounded-full" />
                                <Cpu size={80} className="text-alpine-glacier relative z-10" />
                            </motion.div>
                            <h1 className="text-6xl font-serif font-black tracking-widest uppercase mb-4 glow-text text-center">Portal Authentication</h1>
                            <p className="text-2xl text-alpine-glacier/80 tracking-[0.3em] uppercase font-light">Decrypting Explorer Profile...</p>
                        </motion.div>
                    )}

                    {/* SCENE 4: COMMAND CENTER (DASHBOARD) */}
                    {scene === 4 && (
                        <motion.div key="scene-4" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="col-span-full mb-8 text-center">
                                <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-serif font-bold text-white mb-2">Command Center</motion.h2>
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-white/50 text-lg">Real-time telemetry and expedition analytics.</motion.p>
                            </div>
                            
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="glass-premium p-8 rounded-3xl border border-white/10 relative overflow-hidden group">
                                <div className="absolute -inset-20 bg-gradient-to-tr from-purple-500/20 to-transparent blur-3xl group-hover:opacity-100 transition-opacity opacity-0" />
                                <TrendingUp className="text-purple-400 mb-6" size={32} />
                                <h3 className="text-white/60 uppercase tracking-widest text-sm font-bold mb-2">Total Elevation</h3>
                                <div className="text-6xl font-black text-white glow-text">{stats.altitude.toLocaleString()}<span className="text-2xl text-white/40">m</span></div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="glass-premium p-8 rounded-3xl border border-white/10 relative overflow-hidden group">
                                <div className="absolute -inset-20 bg-gradient-to-tr from-alpine-glacier/20 to-transparent blur-3xl group-hover:opacity-100 transition-opacity opacity-0" />
                                <Mountain className="text-alpine-glacier mb-6" size={32} />
                                <h3 className="text-white/60 uppercase tracking-widest text-sm font-bold mb-2">Expeditions Logged</h3>
                                <div className="text-6xl font-black text-white glow-text">{stats.expeditions}</div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }} className="glass-premium p-8 rounded-3xl border border-white/10 relative overflow-hidden group">
                                <div className="absolute -inset-20 bg-gradient-to-tr from-emerald-500/20 to-transparent blur-3xl group-hover:opacity-100 transition-opacity opacity-0" />
                                <Shield className="text-emerald-400 mb-6" size={32} />
                                <h3 className="text-white/60 uppercase tracking-widest text-sm font-bold mb-2">Faction Rating</h3>
                                <div className="text-6xl font-black text-white glow-text">{stats.points.toLocaleString()}</div>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* SCENE 5: STORY EDITOR */}
                    {scene === 5 && (
                        <motion.div key="scene-5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -100 }} className="w-full max-w-6xl flex flex-col gap-6">
                            <div className="text-center mb-4">
                                <motion.h2 className="text-5xl font-serif font-bold text-white mb-2">AI-Powered Publishing</motion.h2>
                                <motion.p className="text-white/50 text-lg">Craft your legacy with autonomous intelligence.</motion.p>
                            </div>
                            <div className="glass-premium rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex flex-col md:flex-row h-[500px]">
                                <div className="flex-1 p-10 bg-white/5 relative">
                                    <h3 className="text-3xl font-serif font-bold mb-6 flex items-center gap-3">
                                        Ascent of the Matterhorn <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full uppercase tracking-widest">Draft</span>
                                    </h3>
                                    <div className="prose prose-invert text-xl leading-relaxed text-white/80">
                                        {typedText}
                                        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="inline-block w-2 h-6 bg-alpine-glacier ml-1 align-middle" />
                                    </div>
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 4 }} className="absolute bottom-10 left-10 right-10 p-6 rounded-2xl bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 backdrop-blur-xl">
                                        <div className="flex items-center gap-3 text-purple-300 mb-3 font-semibold uppercase tracking-widest text-sm"><Wand2 size={18} /> AI Assistant Processing</div>
                                        <div className="flex gap-2">
                                            <span className="px-3 py-1 bg-white/10 rounded-full text-xs">#Alpinism</span>
                                            <span className="px-3 py-1 bg-white/10 rounded-full text-xs">#Matterhorn</span>
                                            <span className="px-3 py-1 bg-white/10 rounded-full text-xs">#Extreme</span>
                                        </div>
                                    </motion.div>
                                </div>
                                <div className="w-80 bg-black/40 p-6 border-l border-white/10">
                                    <h4 className="text-white/50 uppercase tracking-widest text-xs font-bold mb-4">AI Suggestions</h4>
                                    <div className="space-y-4">
                                        {[1,2,3].map((i) => (
                                            <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2 + (i * 0.5) }} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-alpine-glacier/50 transition-colors cursor-pointer">
                                                <div className="h-24 bg-white/10 rounded-lg mb-3 overflow-hidden">
                                                    <img src={images[i]} className="w-full h-full object-cover opacity-60" />
                                                </div>
                                                <div className="text-xs text-white/60">Suggested Cover Image</div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* SCENE 6: GALLERY */}
                    {scene === 6 && (
                        <motion.div key="scene-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: 100 }} className="w-full max-w-7xl h-full flex flex-col justify-center">
                            <div className="text-center mb-10">
                                <motion.h2 className="text-5xl font-serif font-bold text-white mb-2">The Community Vault</motion.h2>
                                <motion.p className="text-white/50 text-lg">High-resolution captures from around the globe.</motion.p>
                            </div>
                            <div className="grid grid-cols-3 gap-6 h-[60vh] overflow-hidden p-4">
                                {images.map((src, i) => (
                                    <motion.div 
                                        key={i} 
                                        initial={{ opacity: 0, y: 100, scale: 0.8 }} 
                                        animate={{ opacity: 1, y: 0, scale: 1 }} 
                                        transition={{ delay: i * 0.2, type: "spring", stiffness: 100 }}
                                        className={`rounded-3xl overflow-hidden relative group ${i % 2 === 0 ? 'h-full' : 'h-3/4 mt-auto'}`}
                                    >
                                        <img src={src} className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                                            <div className="flex justify-between w-full items-center">
                                                <div className="flex gap-2">
                                                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold">RAW</span>
                                                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold">4K</span>
                                                </div>
                                                <Star className="text-yellow-400 fill-yellow-400" />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* SCENE 7: FACTIONS */}
                    {scene === 7 && (
                        <motion.div key="scene-7" initial={{ opacity: 0, rotateX: 20 }} animate={{ opacity: 1, rotateX: 0 }} exit={{ opacity: 0, scale: 1.2 }} className="w-full max-w-6xl">
                            <div className="text-center mb-12">
                                <motion.h2 className="text-5xl font-serif font-bold text-white mb-2">Global Factions</motion.h2>
                                <motion.p className="text-white/50 text-lg">Ascend the ranks. Conquer together.</motion.p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="glass-premium p-8 rounded-3xl border border-white/10">
                                    <h3 className="text-xl font-bold uppercase tracking-widest text-alpine-glacier mb-6 flex items-center gap-3"><Shield /> Leaderboard</h3>
                                    <div className="space-y-4">
                                        {[
                                            { rank: 1, name: "Himalayan Vanguard", points: "984K", trend: "+12%" },
                                            { rank: 2, name: "Alpine Phantoms", points: "852K", trend: "+5%" },
                                            { rank: 3, name: "Andes Syndicate", points: "721K", trend: "-2%" }
                                        ].map((f, i) => (
                                            <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1 + (i * 0.2) }} className={`flex items-center justify-between p-4 rounded-xl ${i === 0 ? 'bg-alpine-glacier/20 border border-alpine-glacier/30' : 'bg-white/5'}`}>
                                                <div className="flex items-center gap-4">
                                                    <span className={`text-2xl font-black ${i === 0 ? 'text-alpine-glacier' : 'text-white/40'}`}>0{f.rank}</span>
                                                    <span className="font-bold text-lg">{f.name}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-white">{f.points}</div>
                                                    <div className={`text-xs ${f.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{f.trend}</div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>

                                <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.8 }} className="glass-premium rounded-3xl border border-white/10 overflow-hidden relative">
                                    <img src="https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=800&q=80" className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] to-transparent" />
                                    <div className="absolute bottom-0 left-0 p-8">
                                        <span className="px-4 py-1 bg-red-500 text-white text-xs font-bold uppercase tracking-widest rounded-full mb-4 inline-block">Live Event</span>
                                        <h3 className="text-3xl font-serif font-bold mb-2">Everest Basecamp Relay</h3>
                                        <p className="text-white/70 mb-6">Factions are actively competing in the khumbu icefall region.</p>
                                        <button className="px-6 py-3 bg-white text-black font-bold rounded-xl shadow-xl flex items-center gap-2 hover:scale-105 transition-transform"><Map size={18} /> View Radar</button>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}

                    {/* SCENE 8: OUTRO */}
                    {scene === 8 && (
                        <motion.div key="scene-8" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.5, opacity: 0 }} className="flex flex-col items-center">
                            <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                                <DynamicLogo className="h-40 mb-12" showText={false} />
                            </motion.div>
                            <h1 className="text-6xl md:text-8xl font-serif font-black tracking-widest uppercase mb-6 glow-text text-center">Your Journey<br/>Awaits</h1>
                            <p className="text-3xl text-white/50 tracking-[0.2em] uppercase font-light">Entering Basecamp...</p>
                        </motion.div>
                    )}

                    {/* SCENE 9: CALL TO ACTION */}
                    {scene === 9 && (
                        <motion.div key="scene-9" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center max-w-2xl bg-[#0A0D14]/80 p-12 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-[0_0_100px_rgba(163,201,226,0.1)]">
                            <Compass size={64} className="text-alpine-glacier mb-8" />
                            <h2 className="text-5xl font-serif font-bold text-white mb-4">Ready for the Real Ascent?</h2>
                            <p className="text-xl text-white/60 mb-10 leading-relaxed">
                                You've experienced a glimpse of what's possible. To log your own expeditions, upload real media, and ascend the faction leaderboards, you must create a real account.
                            </p>
                            <div className="flex w-full gap-4">
                                <button 
                                    onClick={onComplete}
                                    className="flex-1 py-4 rounded-xl border border-white/20 text-white/70 hover:text-white hover:bg-white/10 transition-all font-bold tracking-widest uppercase text-sm"
                                >
                                    Dismiss
                                </button>
                                <button 
                                    onClick={() => {
                                        onComplete();
                                        navigate('/signup');
                                    }}
                                    className="flex-1 py-4 rounded-xl bg-gradient-to-r from-alpine-glacier to-blue-500 text-white font-bold tracking-widest uppercase text-sm hover:scale-105 transition-transform shadow-[0_0_30px_rgba(163,201,226,0.4)]"
                                >
                                    Join Basecamp
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};
