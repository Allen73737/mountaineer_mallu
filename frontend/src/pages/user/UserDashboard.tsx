import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { Home, LogOut, User, PenTool, Layers, Archive, Upload, Menu, X, Calendar, Compass, Heart } from 'lucide-react';
import { DynamicLogo } from '../../components/ui/DynamicLogo';
import { useSiteSettings } from '../../store/useSiteSettings';

import { UserProfileTab } from './UserProfileTab';
import { UserStoryEditorTab } from './UserStoryEditorTab';
import { UserSubmissionsTab } from './UserSubmissionsTab';
import { UserCollectionsTab } from './UserCollectionsTab';
import { UserMediaUploadTab } from './UserMediaUploadTab';
import { UserExpeditionsTab } from './UserExpeditionsTab';
import { UserCommunitiesTab } from './UserCommunitiesTab';
import { UserWishlistTab } from './UserWishlistTab';

/**
 * Each nav item can optionally declare a `sectionKey`.
 * If the admin sets that section to 'hidden' or 'coming_soon',
 * the tab is automatically removed from the user portal.
 */
const allNavItems = [
    { id: 'profile', path: '/portal', label: 'My Profile', icon: User },
    { id: 'expeditions', path: '/portal/expeditions', label: 'My Expeditions', icon: Calendar, sectionKey: 'events' },
    { id: 'communities', path: '/portal/communities', label: 'My Factions', icon: Compass, sectionKey: 'community' },
    { id: 'wishlist', path: '/portal/wishlist', label: 'My Wishlist', icon: Heart, sectionKey: 'shop' },
    { id: 'write', path: '/portal/write', label: 'Write Story', icon: PenTool, sectionKey: 'stories' },
    { id: 'upload', path: '/portal/upload', label: 'Upload Media', icon: Upload },
    { id: 'submissions', path: '/portal/submissions', label: 'My Submissions', icon: Layers },
    { id: 'collections', path: '/portal/collections', label: 'Collections & Downloads', icon: Archive },
];

export const UserDashboard = () => {
    const { user, logoutAsync } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const [showIntro, setShowIntro] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { settings } = useSiteSettings();

    // Filter nav items based on admin section visibility
    const navItems = useMemo(() => {
        return allNavItems.filter(item => {
            if (!item.sectionKey) return true; // Always show tabs without a section key (Profile, Upload, etc.)
            return settings.sections[item.sectionKey] === 'visible';
        });
    }, [settings]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowIntro(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    // Close mobile menu on navigation
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = async () => {
        await logoutAsync();
        navigate('/');
    };

    return (
        <>
            <AnimatePresence>
                {showIntro && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, filter: "blur(20px)" }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-alpine-snow dark:bg-[#050505]"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-alpine-blue/10 via-alpine-snow dark:via-black to-alpine-snow dark:to-black opacity-100" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, letterSpacing: "0px" }}
                            animate={{ opacity: 1, scale: 1, letterSpacing: "12px" }}
                            transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
                            className="relative z-10 flex flex-col items-center px-4"
                        >
                            <div className="w-px h-16 sm:h-24 bg-gradient-to-b from-transparent via-alpine-glacier to-transparent mb-6 sm:mb-8 animate-pulse" />
                            <h1 className="text-3xl sm:text-4xl md:text-7xl font-serif text-alpine-navy dark:text-white font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] drop-shadow-[0_0_40px_rgba(163,201,226,0.3)] glow-text text-center ml-[12px]">
                                Welcome
                            </h1>
                            <motion.h2 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 1 }}
                                className="text-2xl sm:text-3xl md:text-5xl text-gradient-glacier font-serif italic mt-4 sm:mt-6"
                            >
                                {user?.name}
                            </motion.h2>
                            <div className="w-px h-16 sm:h-24 bg-gradient-to-t from-transparent via-alpine-glacier to-transparent mt-6 sm:mt-8 animate-pulse" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="min-h-screen bg-alpine-snow dark:bg-[#050505] text-alpine-navy dark:text-white flex overflow-hidden font-sans selection:bg-alpine-glacier/30 transition-colors duration-500">
                
                {/* Mobile Header Bar */}
                <div className="fixed top-0 left-0 right-0 h-14 bg-white/80 dark:bg-[#0A0D14]/90 backdrop-blur-md border-b border-black/5 dark:border-white/5 flex items-center justify-between px-4 z-30 lg:hidden">
                    <DynamicLogo className="h-7" showText={true} />
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 rounded-xl bg-black/5 dark:bg-white/5 text-alpine-navy dark:text-white"
                    >
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Mobile Sidebar Overlay */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                    )}
                </AnimatePresence>

                {/* Sidebar - Desktop: always visible, Mobile: slide in/out */}
                <motion.aside 
                    className={`fixed lg:relative top-0 left-0 h-screen w-72 bg-white/70 dark:bg-[#0A0D14] border-r border-black/5 dark:border-white/5 flex flex-col z-40 backdrop-blur-md transform transition-transform duration-300 ease-in-out ${
                        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
                >
                    {/* Brand Area */}
                    <div className="p-6 sm:p-8 border-b border-black/5 dark:border-white/5 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-alpine-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <DynamicLogo className="h-8 mb-4 sm:mb-6" showText={true} />
                        <div className="flex items-center gap-3 sm:gap-4 relative z-10">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="Avatar" className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover shadow-lg border border-black/10 dark:border-white/10" />
                            ) : (
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-alpine-navy/10 dark:bg-alpine-navy/50 flex items-center justify-center text-base sm:text-lg font-bold border border-black/10 dark:border-white/10">
                                    {user?.name.charAt(0)}
                                </div>
                            )}
                            <div>
                                <h3 className="font-bold text-sm text-alpine-navy/90 dark:text-white/90 truncate w-32 sm:w-36">{user?.name}</h3>
                                <p className="text-xs sm:text-sm text-alpine-glacier font-medium tracking-wide uppercase mt-1">Explorer</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="flex-1 py-6 sm:py-8 px-3 sm:px-4 flex flex-col gap-1.5 sm:gap-2 relative z-10 overflow-y-auto">
                        <p className="px-4 text-xs font-bold tracking-[0.2em] text-alpine-navy/40 dark:text-white/30 uppercase mb-2">Portal Menu</p>
                        
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link key={item.id} to={item.path} className="relative block">
                                    <motion.div
                                        whileHover={{ x: 4 }}
                                        className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-300 ${
                                            isActive 
                                                ? 'bg-black/5 dark:bg-white/10 text-alpine-navy dark:text-white shadow-inner' 
                                                : 'text-alpine-navy/60 dark:text-white/50 hover:text-alpine-navy dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        {isActive && (
                                            <motion.div 
                                                layoutId="activeTabIndicator"
                                                className="absolute left-0 top-0 bottom-0 w-1 bg-alpine-glacier rounded-r-full"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        )}
                                        <item.icon size={18} className={isActive ? 'text-alpine-glacier' : ''} />
                                        <span className="font-semibold text-sm sm:text-base tracking-wide">{item.label}</span>
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom Actions */}
                    <div className="p-3 sm:p-4 border-t border-black/5 dark:border-white/5 flex flex-col gap-1.5 sm:gap-2 bg-white/80 dark:bg-[#0A0D14]/80 backdrop-blur-md relative z-10">
                        <Link to="/">
                            <motion.button 
                                whileHover={{ x: 4 }}
                                className="w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-alpine-navy/60 dark:text-white/50 hover:text-alpine-navy dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300"
                            >
                                <Home size={18} />
                                <span className="font-semibold text-sm sm:text-base tracking-wide">Return to Main Site</span>
                            </motion.button>
                        </Link>
                        <motion.button 
                            whileHover={{ x: 4 }}
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition-all duration-300"
                        >
                            <LogOut size={18} />
                            <span className="font-semibold text-sm sm:text-base tracking-wide">Secure Logout</span>
                        </motion.button>
                    </div>
                    
                    {/* Background ambient light */}
                    <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-alpine-blue/5 to-transparent pointer-events-none" />
                </motion.aside>

                {/* Main Content Area */}
                <main className="flex-1 relative h-screen overflow-y-auto custom-scrollbar bg-alpine-snow dark:bg-[#050505] pt-14 lg:pt-0">
                    {/* Premium Background Elements */}
                    <div className="fixed top-[-20%] right-[-10%] w-[60%] h-[60%] bg-alpine-blue/5 rounded-full blur-[120px] pointer-events-none" />
                    <div className="fixed bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-alpine-navy/5 dark:bg-alpine-navy/10 rounded-full blur-[100px] pointer-events-none" />
                    
                    <div className="relative z-10 p-4 sm:p-8 md:p-12 lg:p-16 max-w-7xl mx-auto min-h-full">
                        <AnimatePresence mode="wait">
                            <Routes location={location} key={location.pathname}>
                                <Route index element={<UserProfileTab />} />
                                <Route path="expeditions" element={<UserExpeditionsTab />} />
                                <Route path="communities" element={<UserCommunitiesTab />} />
                                <Route path="wishlist" element={<UserWishlistTab />} />
                                <Route path="write" element={<UserStoryEditorTab />} />
                                <Route path="upload" element={<UserMediaUploadTab />} />
                                <Route path="submissions" element={<UserSubmissionsTab />} />
                                <Route path="collections" element={<UserCollectionsTab />} />
                            </Routes>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </>
    );
};
