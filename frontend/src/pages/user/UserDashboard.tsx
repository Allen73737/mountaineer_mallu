import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { Home, LogOut, User, PenTool, Layers, Archive, Upload, Menu, X, Calendar, Compass, Heart, Backpack } from 'lucide-react';
import { DynamicLogo } from '../../components/ui/DynamicLogo';
import { useSiteSettings } from '../../store/useSiteSettings';
import { useAdaptiveTheme } from '../../store/useAdaptiveTheme';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

import { UserProfileTab } from './UserProfileTab';
import { UserStoryEditorTab } from './UserStoryEditorTab';
import { UserSubmissionsTab } from './UserSubmissionsTab';
import { UserCollectionsTab } from './UserCollectionsTab';
import { UserMediaUploadTab } from './UserMediaUploadTab';
import { UserExpeditionsTab } from './UserExpeditionsTab';
import { UserCommunitiesTab } from './UserCommunitiesTab';
import { UserWishlistTab } from './UserWishlistTab';
import { UserGearVaultTab } from './UserGearVaultTab';

const RouteWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-full h-full"
        >
            {children}
        </motion.div>
    );
};

/**
 * Each nav item can optionally declare a `sectionKey`.
 * If the admin sets that section to 'hidden' or 'coming_soon',
 * the tab is automatically removed from the user portal.
 */
const allNavItems = [
    { id: 'profile', path: '/portal', label: 'My Profile', icon: User },
    { id: 'expeditions', path: '/portal/expeditions', label: 'My Expeditions', icon: Calendar, sectionKey: 'events' },
    { id: 'communities', path: '/portal/communities', label: 'My Factions', icon: Compass, sectionKey: 'community' },
    { id: 'gear', path: '/portal/gear', label: 'Gear Vault', icon: Backpack },
    { id: 'wishlist', path: '/portal/wishlist', label: 'My Wishlist', icon: Heart, sectionKey: 'shop' },
    { id: 'write', path: '/portal/write', label: 'Write Story', icon: PenTool, sectionKey: 'stories' },
    { id: 'upload', path: '/portal/upload', label: 'Upload Media', icon: Upload },
    { id: 'submissions', path: '/portal/submissions', label: 'My Submissions', icon: Layers },
    { id: 'collections', path: '/portal/collections', label: 'Collections & Downloads', icon: Archive },
];

const InteractiveBackground = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const updateMousePosition = (ev: MouseEvent) => {
            setMousePosition({ x: ev.clientX, y: ev.clientY });
        };
        window.addEventListener('mousemove', updateMousePosition);
        return () => window.removeEventListener('mousemove', updateMousePosition);
    }, []);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-transparent dark:bg-transparent">
            <motion.div 
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                    background: `radial-gradient(circle 800px at ${mousePosition.x}px ${mousePosition.y}px, rgba(67,176,241,0.08), transparent 80%)`
                }}
            />
            {/* Subtle topographic / tactical grid pattern */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#43B0F1 1px, transparent 1px), linear-gradient(90deg, #43B0F1 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>
    );
};

export const UserDashboard = () => {
    const { user, logoutAsync } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const [showIntro, setShowIntro] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const { settings } = useSiteSettings();
    const { theme } = useAdaptiveTheme();

    const themeStyle = theme ? {
        '--adaptive-primary': theme.primary,
        '--adaptive-glow': theme.glow,
        '--adaptive-accent': theme.accent,
        '--adaptive-bg-from': theme.bgGradientFrom,
        '--adaptive-bg-to': theme.bgGradientTo,
    } as React.CSSProperties : {};

    // Filter nav items based on admin section visibility
    const navItems = useMemo(() => {
        return allNavItems.filter(item => {
            if (!item.sectionKey) return true; // Always show tabs without a section key (Profile, Upload, etc.)
            const config = settings.sections[item.sectionKey];
            return config && config.status === 'visible';
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

    const handleLogoutClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowLogoutConfirm(true);
    };

    const confirmLogout = async () => {
        await logoutAsync();
        setShowLogoutConfirm(false);
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

            <div 
                className="min-h-screen bg-transparent text-alpine-navy dark:text-white flex overflow-hidden font-sans selection:bg-alpine-glacier/30 relative"
                style={themeStyle}
            >
                <InteractiveBackground />

                {/* Mobile Header Bar */}
                <div className="fixed top-0 left-0 right-0 h-14 bg-white/80 dark:bg-[#0A0D14]/90 backdrop-blur-xl border-b border-black/5 dark:border-white/5 flex items-center justify-between px-4 z-30 lg:hidden">
                    <DynamicLogo className="h-7" showText={true} />
                    <button
                        onClick={handleLogoutClick}
                        className="p-2 rounded-xl bg-red-400/10 text-red-500 hover:bg-red-400/20 transition-colors"
                    >
                        <LogOut size={18} />
                    </button>
                </div>

                {/* Sidebar - Tactical Glass Dock (Desktop Only) */}
                <motion.aside 
                    id="tour-sidebar"
                    className="hidden lg:flex relative top-0 left-0 h-[calc(100vh-2rem)] w-80 bg-white/60 dark:bg-[#0A0D14]/60 m-4 rounded-3xl border border-black/5 dark:border-white/10 flex-col z-40 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                >
                    {/* Brand Area */}
                    <div id="tour-user-info" className="p-6 sm:p-8 border-b border-black/5 dark:border-white/5 relative overflow-hidden group">
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
                            onClick={handleLogoutClick}
                            className="relative z-[70] w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition-all duration-300"
                        >
                            <LogOut size={18} />
                            <span className="font-semibold text-sm sm:text-base tracking-wide">Secure Logout</span>
                        </motion.button>
                    </div>
                    
                    {/* Background ambient light */}
                    <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-alpine-blue/5 to-transparent pointer-events-none lg:rounded-b-3xl" />
                </motion.aside>

                {/* Main Content Area */}
                <main id="tour-main-content" className="flex-1 relative h-screen overflow-y-auto custom-scrollbar pt-14 pb-24 lg:pt-0 lg:pb-0 z-10 lg:pl-4">
                    {/* Premium Background Elements */}
                    <div 
                        className="fixed top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] pointer-events-none transition-colors duration-1000 ease-in-out" 
                        style={{ backgroundColor: theme ? 'var(--adaptive-glow)' : 'rgba(100, 190, 255, 0.05)', opacity: theme ? 0.3 : 1 }}
                    />
                    <div 
                        className="fixed bottom-[-20%] left-[20%] w-[50%] h-[50%] rounded-full blur-[100px] pointer-events-none transition-colors duration-1000 ease-in-out"
                        style={{ backgroundColor: theme ? 'var(--adaptive-primary)' : 'rgba(8, 16, 28, 0.05)', opacity: theme ? 0.2 : 1 }}
                    />
                    
                    <div className="relative z-10 p-4 sm:p-8 md:p-12 lg:py-16 lg:px-12 max-w-[1600px] mx-auto min-h-full">
                        <AnimatePresence mode="wait">
                            <Routes location={location} key={location.pathname}>
                                <Route index element={<RouteWrapper><UserProfileTab /></RouteWrapper>} />
                                <Route path="expeditions" element={<RouteWrapper><UserExpeditionsTab /></RouteWrapper>} />
                                <Route path="gear" element={<RouteWrapper><UserGearVaultTab /></RouteWrapper>} />
                                <Route path="communities" element={<RouteWrapper><UserCommunitiesTab /></RouteWrapper>} />
                                <Route path="wishlist" element={<RouteWrapper><UserWishlistTab /></RouteWrapper>} />
                                <Route path="write" element={<RouteWrapper><UserStoryEditorTab /></RouteWrapper>} />
                                <Route path="upload" element={<RouteWrapper><UserMediaUploadTab /></RouteWrapper>} />
                                <Route path="submissions" element={<RouteWrapper><UserSubmissionsTab /></RouteWrapper>} />
                                <Route path="collections" element={<RouteWrapper><UserCollectionsTab /></RouteWrapper>} />
                            </Routes>
                        </AnimatePresence>
                    </div>
                </main>

                {/* Mobile Bottom Dock */}
                <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#0A0D14]/90 backdrop-blur-2xl border-t border-black/5 dark:border-white/5 flex lg:hidden items-center px-4 py-3 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] overflow-x-auto hide-scrollbar gap-6" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link key={item.id} to={item.path} className="flex flex-col items-center gap-1 min-w-[3.5rem] shrink-0">
                                <motion.div
                                    whileTap={{ scale: 0.9 }}
                                    className={`p-2.5 rounded-2xl transition-colors ${
                                        isActive ? 'bg-alpine-glacier text-alpine-navy shadow-[0_0_15px_rgba(163,201,226,0.4)]' : 'text-alpine-navy/50 dark:text-white/40 hover:text-alpine-navy dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                                    }`}
                                >
                                    <item.icon size={20} />
                                </motion.div>
                                <span className={`text-[9px] font-bold tracking-wider uppercase text-center truncate w-full ${isActive ? 'text-alpine-glacier' : 'text-alpine-navy/50 dark:text-white/40'}`}>
                                    {item.label.split(' ')[0]}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            <ConfirmDialog 
                isOpen={showLogoutConfirm}
                title="Disconnect from Basecamp"
                description="Are you sure you want to end your active session? Your progress is saved."
                confirmText="Log Out"
                cancelText="Cancel"
                icon="logout"
                onConfirm={confirmLogout}
                onCancel={() => setShowLogoutConfirm(false)}
            />
        </>
    );
};
