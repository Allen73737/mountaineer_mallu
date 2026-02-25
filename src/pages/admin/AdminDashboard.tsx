import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, BookOpen, Calendar, Image as ImageIcon,
    Users, Settings, Menu, X, Shield, LogOut
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { DynamicLogo } from '../../components/ui/DynamicLogo';

export const AdminDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { user, logout } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();

    if (!user) return null;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { path: '', name: 'Overview', icon: <LayoutDashboard size={20} />, alwaysVisible: true },
        { path: 'stories', name: 'Stories Management', icon: <BookOpen size={20} />, permission: 'manageStories' },
        { path: 'events', name: 'Events Management', icon: <Calendar size={20} />, permission: 'manageEvents' },
        { path: 'gallery', name: 'Gallery Approvals', icon: <ImageIcon size={20} />, permission: 'manageGallery' },
        { path: 'community', name: 'Community Groups', icon: <Users size={20} />, permission: 'manageCommunity' },
        { path: 'users', name: 'Users', icon: <UserCircle size={20} />, permission: 'manageUsers' },
        { path: 'management', name: 'Admin Management', icon: <Shield size={20} />, role: 'SuperAdmin' },
    ];

    const visibleItems = navItems.filter(item => {
        if (item.alwaysVisible) return true;
        if (item.role && user.role !== item.role) return false;
        if (item.permission && user.role === 'Admin' && !(user.permissions as any)[item.permission]) return false;
        return true;
    });

    return (
        <div className="min-h-screen bg-black text-white flex overflow-hidden selection:bg-alpine-glacier/30">
            {/* Dark glass background with subtle gradient */}
            <div className="fixed inset-0 z-0 bg-gradient-to-br from-black via-alpine-navy/40 to-black pointer-events-none" />

            {/* Sidebar */}
            <motion.aside
                initial={{ width: 280 }}
                animate={{ width: isSidebarOpen ? 280 : 80 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="h-screen z-20 flex-shrink-0 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col relative"
            >
                {/* Header */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
                    <AnimatePresence mode="wait">
                        {isSidebarOpen && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-hidden whitespace-nowrap">
                                <span className="font-serif text-lg font-bold tracking-widest text-alpine-glacier uppercase">Summit Control</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="text-white/50 hover:text-white transition-colors"
                    >
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
                    {visibleItems.map((item) => {
                        const isExact = item.path === '';
                        const isActive = isExact
                            ? location.pathname === '/summit-control-panel'
                            : location.pathname.includes(`/summit-control-panel/${item.path}`);

                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-300 relative group overflow-hidden ${isActive
                                        ? 'bg-white/10 text-white shadow-inner border border-white/10'
                                        : 'text-white/50 hover:bg-white/5 hover:text-white border border-transparent'
                                    }`}
                            >
                                {isActive && (
                                    <motion.div layoutId="active-nav" className="absolute left-0 top-0 bottom-0 w-1 bg-alpine-glacier rounded-r-full" />
                                )}
                                <div className={`shrink-0 ${isActive ? 'text-alpine-glacier' : 'group-hover:text-alpine-glacier'}`}>
                                    {item.icon}
                                </div>
                                <AnimatePresence>
                                    {isSidebarOpen && (
                                        <motion.span
                                            initial={{ opacity: 0, w: 0 }}
                                            animate={{ opacity: 1, w: 'auto' }}
                                            exit={{ opacity: 0, w: 0 }}
                                            className="font-medium tracking-wide whitespace-nowrap"
                                        >
                                            {item.name}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </Link>
                        );
                    })}
                </div>

                {/* Footer User Info */}
                <div className="p-4 border-t border-white/10 shrink-0">
                    <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'} px-2 py-3 rounded-xl bg-white/5 border border-white/5`}>
                        <div className="w-10 h-10 rounded-full bg-alpine-navy flex items-center justify-center font-bold text-alpine-glacier shrink-0 shadow-inner ring-1 ring-white/10">
                            {user.name.charAt(0)}
                        </div>
                        {isSidebarOpen && (
                            <div className="flex-1 min-w-0 pr-2">
                                <p className="text-sm font-bold truncate tracking-wide">{user.name}</p>
                                <p className="text-xs text-white/40 uppercase tracking-widest">{user.role}</p>
                            </div>
                        )}
                        {isSidebarOpen && (
                            <button onClick={handleLogout} className="p-2 text-white/40 hover:text-red-400 transition-colors" title="Logout">
                                <LogOut size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <main className="flex-1 z-10 relative flex flex-col overflow-hidden">
                <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-black/20 backdrop-blur-md shrink-0">
                    <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <DynamicLogo className="h-6" showText={false} />
                        <span className="text-sm font-medium text-white/70 tracking-wide uppercase">Main Site</span>
                    </Link>
                    <div className="text-sm text-white/40 font-mono tracking-widest">
                        SYS.ONLINE // {new Date().toLocaleDateString('en-GB')}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="max-w-7xl mx-auto"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

// Helper component since UserCircle isn't imported from lucide-react initially
const UserCircle = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg>
);
