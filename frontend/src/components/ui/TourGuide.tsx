import React, { useEffect, useState, useRef } from 'react';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Play, Pause, SkipForward, Video } from 'lucide-react';
import { MotionGraphicsDemo } from './MotionGraphicsDemo';

export const TourGuide = () => {
    const { hasSeenWalkthrough, setHasSeenWalkthrough } = useStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [showModal, setShowModal] = useState(false);
    const [isCinematic, setIsCinematic] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const driverRef = useRef<any>(null);
    const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

    const isDemoUser = user?.email === 'demo@mountaineermallu.com';

    // Only invite signed-in members, and only where the tour makes sense — never interrupt
    // anonymous visitors or someone mid-way through login/signup/admin work.
    const tourEligibleRoute = location.pathname === '/' || location.pathname.startsWith('/portal') || location.pathname.startsWith('/dashboard');
    useEffect(() => {
        if (!hasSeenWalkthrough && user && tourEligibleRoute) {
            const timer = setTimeout(() => {
                setShowModal(true);
            }, isDemoUser ? 100 : 3500);
            return () => clearTimeout(timer);
        }
        if (!tourEligibleRoute) setShowModal(false);
    }, [hasSeenWalkthrough, isDemoUser, user, tourEligibleRoute]);

    // Handle Cinematic Autoplay loop
    useEffect(() => {
        if (isCinematic && isPlaying) {
            autoplayTimerRef.current = setInterval(() => {
                if (driverRef.current) {
                    driverRef.current.moveNext();
                }
            }, 5000); // Wait 5 seconds per step
        } else {
            if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
        }

        return () => {
            if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
        };
    }, [isCinematic, isPlaying]);

    // Clean up driver if unmounted
    useEffect(() => {
        return () => {
            if (driverRef.current && driverRef.current.isActivated) {
                driverRef.current.destroy();
            }
        };
    }, []);

    const startTour = (cinematic: boolean = false) => {
        setShowModal(false);
        if (cinematic) {
            setIsCinematic(true);
            return; // Don't start driver.js, MotionGraphicsDemo will take over
        }

        const steps: DriveStep[] = [
            {
                popover: {
                    title: 'Welcome to Basecamp',
                    description: 'This is the Interactive Guided Tour. We will walk you through the entire premium ecosystem step by step.',
                    onNextClick: () => {
                        navigate('/');
                        setTimeout(() => { if (driverRef.current) driverRef.current.moveNext(); }, 600);
                    }
                }
            },
            {
                element: 'nav',
                popover: {
                    title: 'Global Navigation',
                    description: 'Your compass to the world. From here, you can instantly access breathtaking expedition stories, active live events, and the global community vault regardless of where you are.'
                }
            },
            {
                popover: {
                    title: 'Initializing Portal',
                    description: 'Let us transport you into your personal explorer command center, the heart of your digital mountaineering experience.',
                    onNextClick: () => {
                        navigate('/portal');
                        setTimeout(() => { if (driverRef.current) driverRef.current.moveNext(); }, 600);
                    }
                }
            },
            { 
                element: '#tour-sidebar', 
                popover: { 
                    title: 'Navigation Terminal', 
                    description: 'This is your primary control array. Seamlessly switch between your profile metrics, logged expeditions, active community factions, and pending submissions.' 
                } 
            },
            { 
                element: '#tour-user-info', 
                popover: { 
                    title: 'Explorer Identity', 
                    description: 'Your encrypted digital identity. This displays your current faction status, global ranking, and overall expedition prestige level.' 
                } 
            },
            { 
                element: '#tour-main-content', 
                popover: { 
                    title: 'Command Dashboard', 
                    description: 'The central hub. Here you monitor real-time telemetry, track your global altitude records, and view upcoming regional events tailored to your rank.',
                    onNextClick: () => {
                        navigate('/portal/write');
                        setTimeout(() => { if (driverRef.current) driverRef.current.moveNext(); }, 600);
                    }
                }
            },
            {
                popover: { 
                    title: 'AI Story Editor', 
                    description: 'Our revolutionary publishing suite. Draft compelling narratives using our rich text editor. The integrated AI will autonomously generate tags, suggest Unsplash cover imagery, and refine your prose.',
                    onNextClick: () => {
                        navigate('/portal/upload');
                        setTimeout(() => { if (driverRef.current) driverRef.current.moveNext(); }, 600);
                    }
                }
            },
            {
                popover: { 
                    title: 'Media Vault Upload', 
                    description: 'Preserve your legacy. Upload massive 4K RAW files directly to our secure cloud. Your media is automatically optimized and distributed to your faction.',
                    onNextClick: () => {
                        navigate('/portal/communities');
                        setTimeout(() => { if (driverRef.current) driverRef.current.moveNext(); }, 600);
                    }
                }
            },
            {
                popover: { 
                    title: 'Global Factions', 
                    description: 'Mountaineering is a collective pursuit. Join elite regional factions, compete on live leaderboards, and track your team\'s progress across the Himalayas and Alps.',
                    onNextClick: () => {
                        navigate('/portal');
                        setTimeout(() => { if (driverRef.current) driverRef.current.moveNext(); }, 600);
                    }
                }
            },
            {
                popover: { 
                    title: 'Tour Complete', 
                    description: 'You are now ready to begin your ascent. Remember, as a Demo Explorer, you are in read-only mode. Create a real account to start logging your expeditions.' 
                }
            }
        ];

        const driverObj = driver({
            showProgress: true,
            animate: true,
            showButtons: ['next', 'previous', 'close'],
            popoverClass: 'driverjs-theme', // Custom ultra-premium styling class
            steps: steps,
            onDestroyed: () => {
                setHasSeenWalkthrough(true);
                setIsCinematic(false);
                setIsPlaying(false);
            },
        });

        driverRef.current = driverObj;
        driverObj.drive();
    };

    const skipTour = () => {
        setShowModal(false);
        setHasSeenWalkthrough(true);
    };

    return (
        <>
            {/* Ultra Premium Custom CSS for Driver.js */}
            <style>{`
                .driverjs-theme {
                    background-color: rgba(10, 13, 20, 0.85) !important;
                    backdrop-filter: blur(16px) !important;
                    color: white !important;
                    border: 1px solid rgba(163, 201, 226, 0.2) !important;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.05) !important;
                    border-radius: 16px !important;
                    font-family: inherit !important;
                    padding: 20px !important;
                }
                .driver-popover-title {
                    font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif !important;
                    font-size: 20px !important;
                    color: #fff !important;
                    font-weight: 700 !important;
                    letter-spacing: 0.05em !important;
                    margin-bottom: 8px !important;
                }
                .driver-popover-description {
                    color: rgba(255,255,255,0.7) !important;
                    font-size: 14px !important;
                    line-height: 1.6 !important;
                    margin-bottom: 20px !important;
                }
                .driver-popover-footer {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: space-between !important;
                    margin-top: 15px !important;
                }
                .driver-popover-footer button {
                    background: linear-gradient(135deg, rgba(163,201,226,0.1), rgba(163,201,226,0.05)) !important;
                    color: #a3c9e2 !important;
                    border: 1px solid rgba(163,201,226,0.2) !important;
                    text-shadow: none !important;
                    border-radius: 8px !important;
                    padding: 8px 16px !important;
                    font-weight: 600 !important;
                    font-size: 13px !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.05em !important;
                    transition: all 0.3s ease !important;
                }
                .driver-popover-footer button:hover {
                    background: rgba(163,201,226,0.2) !important;
                    border-color: rgba(163,201,226,0.5) !important;
                    box-shadow: 0 0 15px rgba(163,201,226,0.3) !important;
                    color: #fff !important;
                }
                .driver-popover-progress-text {
                    color: rgba(163,201,226,0.6) !important;
                    font-size: 12px !important;
                    font-weight: 700 !important;
                    letter-spacing: 0.1em !important;
                }
                .driver-popover-close-btn {
                    color: rgba(255,255,255,0.4) !important;
                    transition: color 0.2s !important;
                }
                .driver-popover-close-btn:hover {
                    color: #fff !important;
                }
            `}</style>
            
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-[#0A0D14] border border-white/10 rounded-3xl p-10 max-w-lg w-full mx-4 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-alpine-blue via-[#A3C9E2] to-alpine-blue" />
                            <h3 className="text-3xl font-serif font-bold text-white mb-3 tracking-wide drop-shadow-sm">Welcome to Basecamp</h3>
                            <p className="text-white/60 mb-8 font-light text-lg leading-relaxed">
                                {isDemoUser ? 'Would you like a cinematic guided tour of your premium explorer portal?' : 'Would you like a quick guided tour of your premium explorer portal?'}
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={skipTour}
                                    className="flex-1 py-3 px-4 rounded-xl font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-all border border-transparent"
                                >
                                    Skip for now
                                </button>
                                {isDemoUser && (
                                    <button
                                        onClick={() => startTour(true)}
                                        className="flex-1 py-3 px-4 rounded-xl font-semibold bg-alpine-glacier/10 text-alpine-glacier hover:bg-alpine-glacier/20 border border-alpine-glacier/30 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Video size={18} /> Cinematic Demo
                                    </button>
                                )}
                                <button
                                    onClick={() => startTour(false)}
                                    className="flex-1 py-3 px-4 rounded-xl font-bold bg-white text-black hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                >
                                    Interactive Tour
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isCinematic && (
                    <MotionGraphicsDemo 
                        onComplete={() => {
                            setIsCinematic(false);
                            setHasSeenWalkthrough(true);
                        }} 
                    />
                )}
            </AnimatePresence>
        </>
    );
};
