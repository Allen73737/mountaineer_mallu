import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { X, LogIn, UserPlus, Settings, LogOut, Moon, Sun, Monitor, ShieldAlert, Mountain, BookOpen, Calendar, Image, Users, CloudSnow } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/useAuthStore';
import { DynamicLogo } from '../ui/DynamicLogo';
import { ConfirmDialog } from '../ui/ConfirmDialog';

const sideNavLinks = [
    { name: 'Mission', href: '#mission', icon: Mountain },
    { name: 'Stories', href: '/stories', icon: BookOpen },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Gallery', href: '/gallery', icon: Image },
    { name: 'Community', href: '/community', icon: Users },
];

export const SidePanel = () => {
    const { isSidebarOpen, setSidebarOpen, theme, setTheme, isSnowEffectEnabled, toggleSnowEffect } = useStore();
    const { isLoggedIn, user, logoutAsync } = useAuthStore();
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const containerVars: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05, delayChildren: 0.1 }
        }
    };

    const itemVars: Variants = {
        hidden: { opacity: 0, x: 20 },
        show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 250, damping: 25 } }
    };

    const ThemeButton = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
        <button
            onClick={onClick}
            className={`flex items-center justify-center gap-1.5 p-2 rounded-xl transition-all duration-300 ${active ? 'bg-white/80 dark:bg-white/20 shadow-md text-alpine-navy dark:text-white' : 'text-alpine-navy/50 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/10'}`}
            title={label}
        >
            {icon}
        </button>
    );

    return (
        <>
        <AnimatePresence>
            {isSidebarOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        onClick={() => requestAnimationFrame(() => setSidebarOpen(false))}
                        className="fixed inset-0 z-50 bg-black/30 dark:bg-black/60 backdrop-blur-md transition-all duration-500"
                    />

                    {/* Ultra Liquid Glass Floating Panel (Colorless crystal that refracts the background color!) */}
                    <motion.div
                        initial={{ x: '105%', opacity: 0, scale: 0.95 }}
                        animate={{ x: 0, opacity: 1, scale: 1 }}
                        exit={{ x: '105%', opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                        className="fixed top-2 sm:top-4 right-2 sm:right-4 bottom-2 sm:bottom-4 z-50 w-[50vw] min-w-[240px] sm:w-[380px] sm:min-w-0 rounded-3xl sm:rounded-[40px] bg-white/40 dark:bg-white/[0.08] backdrop-blur-[50px] backdrop-saturate-[250%] border border-white/60 dark:border-white/20 p-3 sm:p-7 pb-3 sm:pb-7 flex flex-col shadow-[0_30px_80px_-15px_rgba(0,0,0,0.25),inset_0_1px_3px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(255,255,255,0.3)] dark:shadow-[0_30px_80px_-15px_rgba(0,0,0,0.6),inset_0_1px_3px_rgba(255,255,255,0.4),inset_0_-1px_2px_rgba(255,255,255,0.1)] overflow-hidden transition-all duration-500"
                    >
                        {/* Ultra Liquid Glass Top Arc Specular Reflection */}
                        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white/40 dark:from-white/20 via-white/10 to-transparent pointer-events-none rounded-t-[40px]" />
                        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/90 to-transparent shadow-[0_0_20px_rgba(255,255,255,0.9)]" />
                        {/* Liquid Caustic Sheen sweep */}
                        <div className="absolute -top-48 -right-48 w-96 h-96 bg-gradient-to-br from-white/30 dark:from-alpine-glacier/20 to-transparent rounded-full blur-3xl pointer-events-none" />

                        {/* Header */}
                        <motion.div variants={itemVars} initial="hidden" animate="show" className="flex items-center justify-between mb-3 sm:mb-8 shrink-0 relative z-10">
                            <div className="p-1.5 sm:p-2 rounded-2xl inline-flex bg-white/20 dark:bg-white/10 border border-white/40 dark:border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] backdrop-blur-xl">
                                <DynamicLogo className="h-5 sm:h-7" showText={true} forceWhiteText={false} />
                            </div>
                            <button
                                onClick={() => requestAnimationFrame(() => setSidebarOpen(false))}
                                className="p-2 sm:p-2.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/25 border border-black/10 dark:border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] text-alpine-navy dark:text-white hover:scale-110 hover:rotate-90 transition-all duration-300 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </motion.div>

                        {/* Navigation Links */}
                        <motion.nav variants={containerVars} initial="hidden" animate="show" className="mb-3 sm:mb-8 shrink-0 relative z-10">
                            <h4 className="text-[9px] sm:text-[10px] font-bold text-alpine-navy/60 dark:text-white/50 uppercase tracking-[0.25em] mb-1.5 sm:mb-2 px-2 flex items-center gap-2">
                                <span>Navigate</span>
                                <div className="h-[1px] flex-1 bg-alpine-navy/15 dark:bg-white/15" />
                            </h4>
                            <div className="space-y-1">
                                {sideNavLinks.map((link) => {
                                    const Icon = link.icon;
                                    const isRoute = link.href.startsWith('/');
                                    
                                    const LinkContent = (
                                        <motion.div
                                            variants={itemVars}
                                            whileHover={{ x: 6 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="flex items-center gap-2.5 sm:gap-3 px-2.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-alpine-navy/80 dark:text-white/70 hover:text-alpine-navy dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/15 transition-all duration-300 group cursor-pointer border border-transparent hover:border-black/10 dark:hover:border-white/20 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]"
                                        >
                                            <div className="p-1.5 sm:p-2 rounded-xl bg-black/5 dark:bg-white/5 group-hover:bg-black/10 dark:group-hover:bg-white/20 border border-black/5 dark:border-white/5 group-hover:border-black/15 dark:group-hover:border-white/20 transition-all duration-300 shadow-sm">
                                                <Icon size={15} className="text-alpine-navy/70 dark:text-white/60 group-hover:text-alpine-navy dark:group-hover:text-white group-hover:scale-110 transition-transform duration-300" />
                                            </div>
                                            <span className="font-semibold text-[13px] sm:text-sm tracking-wide">{link.name}</span>
                                            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-alpine-navy dark:text-white">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </div>
                                        </motion.div>
                                    );

                                    return isRoute ? (
                                        <Link key={link.name} to={link.href} onClick={() => requestAnimationFrame(() => setSidebarOpen(false))}>
                                            {LinkContent}
                                        </Link>
                                    ) : (
                                        <a key={link.name} href={link.href} onClick={() => requestAnimationFrame(() => setSidebarOpen(false))}>
                                            {LinkContent}
                                        </a>
                                    );
                                })}
                            </div>
                        </motion.nav>

                        <div className="border-t border-white/[0.06] mb-3 sm:mb-8 shrink-0 relative z-10" />

                        {/* Profile Content */}
                        <motion.div
                            variants={containerVars}
                            initial="hidden"
                            animate="show"
                            className="flex-1 flex flex-col min-h-0 relative z-10"
                        >
                            {isLoggedIn && user ? (
                                <motion.div variants={itemVars} className="space-y-2 sm:space-y-5">
                                    <div className="flex items-center gap-2.5 sm:gap-3 mb-1.5 sm:mb-2 p-2.5 sm:p-3.5 rounded-2xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 shadow-[0_8px_20px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.5)] backdrop-blur-xl hover:bg-black/10 dark:hover:bg-white/15 transition-all duration-300">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt="Profile" className="w-9 h-9 sm:w-12 sm:h-12 rounded-full border-2 border-black/10 dark:border-white/30 object-cover shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
                                        ) : (
                                            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-alpine-navy to-alpine-blue flex items-center justify-center text-sm sm:text-lg font-bold text-white shadow-[0_0_15px_rgba(0,0,0,0.1)] border-2 border-white/20">
                                                {user.name.charAt(0)}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-[13px] sm:text-base text-alpine-navy dark:text-white tracking-wide leading-tight truncate">{user.name}</h3>
                                            <p className="text-[10px] sm:text-xs text-alpine-navy/60 dark:text-white/60 truncate mt-0.5">{user.email}</p>
                                            <div className="inline-flex mt-0.5 sm:mt-1.5 px-1.5 sm:px-2.5 py-0.5 rounded-full bg-alpine-navy/10 dark:bg-white/15 border border-alpine-navy/20 dark:border-white/30 text-[8px] sm:text-[10px] font-bold tracking-wider text-alpine-navy dark:text-white shadow-sm uppercase">
                                                {user.role}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1 sm:space-y-2">
                                        <Link
                                            to="/portal"
                                            onClick={() => setSidebarOpen(false)}
                                            className="w-full relative overflow-hidden group flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3.5 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/10 dark:border-white/15 hover:border-black/20 dark:hover:border-white/30 text-alpine-navy dark:text-white transition-all duration-300 text-left shadow-[0_4px_15px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.4)]"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                            <Settings size={15} className="group-hover:rotate-90 transition-transform duration-500 relative z-10 text-alpine-navy dark:text-alpine-glacier" />
                                            <span className="font-semibold text-[13px] sm:text-sm relative z-10 tracking-wide">Go to Portal</span>
                                        </Link>
                                        {(user.role === 'Admin' || user.role === 'SuperAdmin') && (
                                            <Link
                                                to="/summit-control-panel"
                                                onClick={() => setSidebarOpen(false)}
                                                className="w-full relative overflow-hidden group flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3.5 rounded-2xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 hover:border-red-500/50 text-red-600 dark:text-red-300 transition-all duration-300 text-left shadow-[0_4px_15px_rgba(239,68,68,0.15),inset_0_1px_1px_rgba(255,255,255,0.3)]"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                                <ShieldAlert size={15} className="group-hover:scale-110 transition-transform duration-300 relative z-10 text-red-600 dark:text-red-400" />
                                                <span className="font-semibold text-[13px] sm:text-sm relative z-10 tracking-wide">Mission Control</span>
                                            </Link>
                                        )}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div variants={itemVars} className="space-y-2 sm:space-y-4">
                                    <p className="text-alpine-navy/80 dark:text-white/70 text-[12px] sm:text-sm mb-3 sm:mb-6 leading-relaxed font-medium">
                                        Join the premier Malayalee hiking community in Europe. Connect, explore, and conquer.
                                    </p>
                                    <Link to="/login" onClick={() => setSidebarOpen(false)} className="w-full py-2.5 sm:py-3.5 px-4 sm:px-5 rounded-2xl bg-gradient-to-r from-alpine-navy via-blue-600 to-blue-500 dark:from-alpine-blue dark:via-blue-500 dark:to-blue-600 hover:opacity-95 text-white font-bold text-[13px] sm:text-sm flex items-center justify-center gap-2 transition-all shadow-[0_8px_25px_rgba(59,130,246,0.3),inset_0_1px_1px_rgba(255,255,255,0.5)] hover:-translate-y-0.5 duration-300">
                                        <LogIn size={16} /> Login to Access
                                    </Link>
                                    <Link to="/signup" onClick={() => setSidebarOpen(false)} className="w-full py-2.5 sm:py-3.5 px-4 sm:px-5 rounded-2xl border border-black/20 dark:border-white/30 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-alpine-navy dark:text-white font-bold text-[13px] sm:text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                                        <UserPlus size={16} /> Create Account
                                    </Link>
                                </motion.div>
                            )}

                            <div className="flex-1" />

                            {/* Theme Settings */}
                            <motion.div variants={itemVars} className="pt-3 sm:pt-6 border-t border-black/10 dark:border-white/15 shrink-0 mt-2">
                                <h4 className="text-[10px] sm:text-[11px] font-bold text-alpine-navy/50 dark:text-white/50 uppercase tracking-[0.2em] mb-2 sm:mb-3.5 px-1">Appearance</h4>
                                <div className="grid grid-cols-2 gap-2 bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 p-1.5 sm:p-2.5 rounded-2xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.08),0_4px_10px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),0_4px_10px_rgba(0,0,0,0.1)] backdrop-blur-xl">
                                    <ThemeButton active={theme === 'light'} onClick={() => setTheme('light')} icon={<Sun size={16} />} label="Light" />
                                    <ThemeButton active={theme === 'dark'} onClick={() => setTheme('dark')} icon={<Moon size={16} />} label="Dark" />
                                    <ThemeButton active={theme === 'system'} onClick={() => setTheme('system')} icon={<Monitor size={16} />} label="System" />
                                    <ThemeButton active={isSnowEffectEnabled} onClick={() => toggleSnowEffect()} icon={<CloudSnow size={16} />} label="Snow" />
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Footer — Logout */}
                        {isLoggedIn && (
                            <motion.div variants={itemVars} initial="hidden" animate="show" className="pt-2 sm:pt-4 border-t border-black/10 dark:border-white/15 shrink-0 mt-2 sm:mt-4 relative z-10">
                                <button
                                    onClick={() => setShowLogoutConfirm(true)}
                                    className="w-full py-2 sm:py-3 px-3 sm:px-4 rounded-2xl text-red-500 dark:text-red-300 hover:text-white bg-red-500/10 hover:bg-red-500/25 font-bold tracking-wide text-[13px] sm:text-sm flex items-center justify-center gap-2 transition-all duration-300 group border border-red-500/20 hover:border-red-500/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                                >
                                    <LogOut size={15} className="group-hover:-translate-x-1 transition-transform" /> Sign Out
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
        <ConfirmDialog 
            isOpen={showLogoutConfirm}
            title="Secure Sign Out"
            description="Are you sure you want to end your current session?"
            confirmText="Sign Out"
            cancelText="Cancel"
            icon="logout"
            onConfirm={async () => {
                await logoutAsync();
                setShowLogoutConfirm(false);
                setSidebarOpen(false);
                navigate('/');
            }}
            onCancel={() => setShowLogoutConfirm(false)}
        />
        </>
    );
};

// Sub-components
const ThemeButton = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
    <button
        onClick={onClick}
        className={`w-full flex flex-col items-center justify-center py-2.5 sm:py-3.5 px-2 rounded-xl transition-all duration-300 relative ${
            active 
                ? 'bg-alpine-navy dark:bg-gradient-to-br dark:from-white dark:via-white/90 dark:to-white/70 text-white dark:text-alpine-navy shadow-[0_4px_15px_rgba(0,0,0,0.2)] dark:shadow-[0_4px_15px_rgba(255,255,255,0.4),inset_0_1px_1px_rgba(255,255,255,0.9)] scale-[1.03] border border-transparent dark:border-white font-bold' 
                : 'text-alpine-navy/70 dark:text-white/70 hover:text-alpine-navy dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/15 border border-transparent hover:border-black/10 dark:hover:border-white/20'
            }`}
    >
        <div className={`mb-1 sm:mb-1.5 transition-transform duration-300 ${active ? 'scale-110' : ''}`}>{icon}</div>
        <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.15em] uppercase">{label}</span>
    </button>
);
