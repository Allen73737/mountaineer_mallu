import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, BookOpen, Calendar, Image as ImageIcon,
    Users, Settings, Menu, X, Shield, LogOut,
    Clock, Globe, Layers, UserCircle, Star, ShoppingBag, ExternalLink, Sparkles
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { DynamicLogo } from '../../components/ui/DynamicLogo';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useAdminAction } from '../../store/useAdminAction';

const GlobalAdminUI = () => {
    const { confirmDialog, closeDialog, undoQueue, redoQueue, triggerUndo, triggerRedo } = useAdminAction();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+Z for Undo
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                triggerUndo();
            }
            // Ctrl+Y or Ctrl+Shift+Z for Redo
            if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
                e.preventDefault();
                triggerRedo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [triggerUndo, triggerRedo]);

    return (
        <>
            <ConfirmDialog
                isOpen={confirmDialog?.isOpen || false}
                title={confirmDialog?.title || ''}
                message={confirmDialog?.message || ''}
                confirmLabel={confirmDialog?.confirmLabel || 'Confirm'}
                variant={confirmDialog?.variant || 'warning'}
                onConfirm={confirmDialog?.onConfirm || (() => {})}
                onCancel={closeDialog}
            />
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {undoQueue.map(item => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            className="bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl flex items-center gap-4 pointer-events-auto"
                        >
                            <span className="text-sm font-medium text-white">{item.message}</span>
                            <button
                                onClick={() => triggerUndo(item.id)}
                                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                            >
                                Undo
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </>
    );
};

/** Live clock hook – updates every second */
const useLiveClock = () => {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    return now;
};

export const AdminDashboard = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
    const { user, logoutAsync } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const now = useLiveClock();

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) setIsSidebarOpen(true);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!user) return null;

    const handleLogoutClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowLogoutConfirm(true);
    };

    const confirmLogout = async () => {
        await logoutAsync();
        setShowLogoutConfirm(false);
        navigate('/');
    };

    const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const formattedDate = now.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone?.split('/').pop()?.replace(/_/g, ' ') || '';
    const tzAbbr = now.toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop() || '';

    const navItems = [
        { path: '', name: 'Overview', icon: <LayoutDashboard size={20} />, alwaysVisible: true },
        { path: 'stories', name: 'Stories Management', icon: <BookOpen size={20} />, permission: 'manageStories', publicPath: '/#stories' },
        { path: 'events', name: 'Events Management', icon: <Calendar size={20} />, permission: 'manageEvents', publicPath: '/#events' },
        { path: 'gallery', name: 'Gallery', icon: <ImageIcon size={20} />, permission: 'manageGallery', publicPath: '/#gallery' },
        { path: 'reviews', name: 'Review Moderation', icon: <Star size={20} />, permission: 'manageUsers', publicPath: '/#reviews' },
        { path: 'community', name: 'Community Groups', icon: <Users size={20} />, permission: 'manageCommunity', publicPath: '/#community' },
        { path: 'pillars', name: 'Team Members', icon: <Users size={20} />, permission: 'manageUsers', publicPath: '/#team' },
        { path: 'merchandise', name: 'Merchandise', icon: <ShoppingBag size={20} />, role: 'SuperAdmin', publicPath: '/#shop' },
        { path: 'users', name: 'Users', icon: <UserCircle size={20} />, permission: 'manageUsers' },
        { path: 'sections', name: 'Section Control', icon: <Layers size={20} />, role: 'SuperAdmin' },
        { path: 'management', name: 'Admin Management', icon: <Shield size={20} />, role: 'SuperAdmin' },
        { path: 'campaigns', name: 'Campaign Autopilot', icon: <Sparkles size={20} />, role: 'SuperAdmin' },
        { path: 'profile', name: 'Profile & Security', icon: <Settings size={20} />, alwaysVisible: true },
    ];

    const visibleItems = navItems.filter(item => {
        if (item.alwaysVisible) return true;
        if (item.role && user.role !== item.role) return false;
        if (item.permission && user.role === 'Admin' && !(user.permissions as any)[item.permission]) return false;
        return true;
    });

    return (
        <div 
            className="dark min-h-screen bg-black text-white flex overflow-hidden selection:bg-alpine-glacier/30 film-grain transition-colors duration-500"
            style={{ '--sidebar-width': isMobile ? '0px' : (isSidebarOpen ? '280px' : '80px') } as React.CSSProperties}
        >
            {/* Rich layered background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-white dark:from-black via-alpine-navy/5 dark:via-alpine-navy/40 to-white dark:to-black" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-alpine-glacier/[0.03] rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/[0.02] rounded-full blur-[100px]" />
            </div>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobile && isSidebarOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 z-30 backdrop-blur-sm md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ 
                    width: isMobile ? 280 : (isSidebarOpen ? 280 : 80),
                    x: isMobile ? (isSidebarOpen ? 0 : -280) : 0
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed md:relative top-0 left-0 h-screen z-40 md:z-20 flex-shrink-0 bg-white/95 dark:bg-black/90 md:bg-white/50 md:dark:bg-black/50 backdrop-blur-xl md:backdrop-blur-md border-r border-black/10 dark:border-white/10 flex flex-col"
            >
                {/* Header */}
                <div className="h-16 md:h-20 flex items-center justify-between px-4 md:px-6 border-b border-black/10 dark:border-white/10 shrink-0">
                    <AnimatePresence mode="wait">
                        {(isSidebarOpen || isMobile) && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-hidden whitespace-nowrap">
                                <span className="font-serif text-lg font-bold tracking-widest text-gradient-glacier uppercase glow-text">Summit Control</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button
                        onClick={() => requestAnimationFrame(() => setIsSidebarOpen(!isSidebarOpen))}
                        className="text-alpine-navy/50 dark:text-white/50 hover:text-alpine-navy dark:hover:text-white transition-colors cursor-pointer"
                    >
                        {isMobile ? <X size={24} /> : (isSidebarOpen ? <X size={24} /> : <Menu size={24} />)}
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-4 md:py-6 px-3 md:px-4 space-y-1 md:space-y-2 custom-scrollbar">
                    {visibleItems.map((item) => {
                        const isExact = item.path === '';
                        const isActive = isExact
                            ? location.pathname === '/summit-control-panel'
                            : location.pathname.includes(`/summit-control-panel/${item.path}`);

                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={() => isMobile && setIsSidebarOpen(false)}
                                className={`flex items-center gap-3 md:gap-4 px-3 py-2.5 md:py-3 rounded-xl transition-all duration-300 relative group overflow-hidden ${isActive
                                        ? 'bg-alpine-glacier/20 text-alpine-navy dark:text-white shadow-inner border border-alpine-glacier/30'
                                        : 'text-alpine-navy/60 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5 hover:text-alpine-navy dark:hover:text-white border border-transparent'
                                    }`}
                            >
                                {isActive && (
                                    <motion.div layoutId="active-nav" className="absolute left-0 top-0 bottom-0 w-1 bg-alpine-glacier rounded-r-full" />
                                )}
                                <div className={`shrink-0 ${isActive ? 'text-alpine-glacier' : 'group-hover:text-alpine-glacier'}`}>
                                    {React.cloneElement(item.icon as React.ReactElement<any>, { size: isMobile ? 18 : 20 })}
                                </div>
                                <AnimatePresence>
                                    {(isSidebarOpen || isMobile) && (
                                        <>
                                            <motion.span
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: 'auto' }}
                                                exit={{ opacity: 0, width: 0 }}
                                                className="font-medium text-[13px] md:text-sm tracking-wide whitespace-nowrap flex-1"
                                            >
                                                {item.name}
                                            </motion.span>
                                            {item.publicPath && (
                                                <a 
                                                    href={item.publicPath} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    title={`View live ${item.name} page`}
                                                    className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg text-alpine-navy/40 dark:text-white/40 hover:text-alpine-glacier transition-all"
                                                >
                                                    <ExternalLink size={14} />
                                                </a>
                                            )}
                                        </>
                                    )}
                                </AnimatePresence>
                            </Link>
                        );
                    })}
                </div>

                {/* Footer User Info */}
                <div className="p-3 md:p-4 border-t border-black/10 dark:border-white/10 shrink-0">
                    <div className={`flex items-center gap-2 md:gap-3 ${(!isSidebarOpen && !isMobile) && 'justify-center'} px-2 py-2 md:py-3 rounded-xl bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/10 shadow-inner`}>
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-alpine-glacier/80 to-alpine-navy flex items-center justify-center font-bold text-white shrink-0 shadow-lg ring-2 ring-alpine-glacier/20 text-xs md:text-sm">
                            {user.name.charAt(0)}
                        </div>
                        {(isSidebarOpen || isMobile) && (
                            <div className="flex-1 min-w-0 pr-2">
                                <p className="text-[13px] md:text-sm font-bold truncate tracking-wide">{user.name}</p>
                                <p className="text-[10px] md:text-[11px] text-alpine-glacier/60 uppercase tracking-widest">{user.role}</p>
                            </div>
                        )}
                        {(isSidebarOpen || isMobile) && (
                            <button onClick={handleLogoutClick} className="p-2 text-white/40 hover:text-red-400 transition-colors" title="Logout">
                                <LogOut size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <main className="flex-1 z-10 relative flex flex-col overflow-hidden w-full">
                <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 border-b border-black/[0.06] dark:border-white/[0.06] bg-white/30 dark:bg-black/30 backdrop-blur-xl shrink-0">
                    <div className="flex items-center gap-3">
                        <button 
                            className="md:hidden p-2 text-alpine-navy/80 dark:text-white/80 hover:text-alpine-navy dark:hover:text-white transition-colors"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
                            <DynamicLogo className="h-6" showText={false} />
                            <span className="hidden sm:inline-block text-base font-medium text-alpine-navy/50 dark:text-white/50 group-hover:text-alpine-navy/80 dark:group-hover:text-white/80 tracking-wide uppercase transition-colors">Main Site</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-3 md:gap-5">
                        {/* Live Clock & Date */}
                        <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06]">
                            <Clock size={14} className="text-alpine-glacier/70" />
                            <div className="flex flex-col items-end leading-tight">
                                <span className="text-sm md:text-base font-mono font-semibold text-alpine-navy/80 dark:text-white/80 tracking-wider">{formattedTime} <span className="hidden md:inline text-alpine-glacier/60 text-sm">{tzAbbr}</span></span>
                                <span className="hidden md:block text-xs font-mono text-alpine-navy/40 dark:text-white/35 tracking-widest uppercase">{formattedDate}</span>
                            </div>
                        </div>

                        {/* System Status Indicator */}
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/[0.12]">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                            <span className="text-[10px] md:text-xs font-mono text-emerald-400/80 tracking-widest uppercase">Online</span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-3 md:p-8 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="max-w-[1800px] w-full mx-auto"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
            <GlobalAdminUI />
            <ConfirmDialog 
                isOpen={showLogoutConfirm}
                title="Disconnect from Mission Control"
                description="Are you sure you want to log out of the admin panel?"
                confirmText="Log Out"
                cancelText="Cancel"
                icon="logout"
                onConfirm={confirmLogout}
                onCancel={() => setShowLogoutConfirm(false)}
            />
        </div>
    );
};


