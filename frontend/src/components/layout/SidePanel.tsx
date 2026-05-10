import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, UserPlus, Settings, LogOut, Moon, Sun, Monitor, ShieldAlert, Mountain, BookOpen, Calendar, Image, Users } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/useAuthStore';
import { DynamicLogo } from '../ui/DynamicLogo';

const sideNavLinks = [
    { name: 'Mission', href: '#mission', icon: Mountain },
    { name: 'Stories', href: '/stories', icon: BookOpen },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Gallery', href: '/gallery', icon: Image },
    { name: 'Community', href: '/community', icon: Users },
];

export const SidePanel = () => {
    const { isSidebarOpen, setSidebarOpen, theme, setTheme } = useStore();
    const { isLoggedIn, user, logoutAsync } = useAuthStore();
    const navigate = useNavigate();

    const containerVars = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05, delayChildren: 0.1 }
        }
    };

    const itemVars = {
        hidden: { opacity: 0, x: 20 },
        show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 250, damping: 25 } }
    };

    return (
        <AnimatePresence>
            {isSidebarOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%', opacity: 0, scale: 0.98 }}
                        animate={{ x: 0, opacity: 1, scale: 1 }}
                        exit={{ x: '100%', opacity: 0, scale: 0.98 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 bottom-0 z-50 w-[85vw] max-w-[360px] bg-gradient-to-b from-black/80 via-black/70 to-[#0a1128]/80 backdrop-blur-2xl backdrop-saturate-200 border-l border-white/[0.08] p-3 sm:p-7 pb-3 sm:pb-7 flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.5)] h-[100dvh]"
                    >
                        {/* Elegant Top Glow */}
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                        {/* Header */}
                        <motion.div variants={itemVars} initial="hidden" animate="show" className="flex items-center justify-between mb-3 sm:mb-8 shrink-0 relative z-10">
                            <div className="p-1 sm:p-1.5 rounded-2xl inline-flex bg-white/[0.03] border border-white/[0.05] shadow-sm backdrop-blur-md">
                                <DynamicLogo className="h-5 sm:h-7" showText={true} forceWhiteText={true} />
                            </div>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="p-1.5 sm:p-2.5 rounded-full bg-white/[0.03] hover:bg-white/10 border border-white/[0.05] transition-all text-white/70 hover:text-white hover:scale-105 hover:rotate-90 duration-300"
                            >
                                <X size={18} />
                            </button>
                        </motion.div>

                        {/* Navigation Links */}
                        <motion.nav variants={containerVars} initial="hidden" animate="show" className="mb-3 sm:mb-8 shrink-0 relative z-10">
                            <h4 className="text-[9px] sm:text-[10px] font-bold text-white/40 uppercase tracking-[0.25em] mb-1.5 sm:mb-2 px-2 flex items-center gap-2">
                                <span>Navigate</span>
                                <div className="h-[1px] flex-1 bg-white/10" />
                            </h4>
                            <div className="space-y-0.5">
                                {sideNavLinks.map((link) => {
                                    const Icon = link.icon;
                                    const isRoute = link.href.startsWith('/');
                                    
                                    const LinkContent = (
                                        <motion.div
                                            variants={itemVars}
                                            whileHover={{ x: 4, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                                            whileTap={{ scale: 0.98 }}
                                            className="flex items-center gap-2.5 sm:gap-3 px-2 py-1.5 sm:px-4 sm:py-2.5 rounded-xl text-white/60 hover:text-white transition-colors group cursor-pointer border border-transparent hover:border-white/[0.08]"
                                        >
                                            <div className="p-1 sm:p-1.5 rounded-lg bg-white/[0.03] group-hover:bg-alpine-glacier/20 transition-colors duration-300">
                                                <Icon size={14} className="text-white/50 group-hover:text-alpine-glacier group-hover:scale-110 transition-transform duration-300" />
                                            </div>
                                            <span className="font-semibold text-[12px] sm:text-sm tracking-wide">{link.name}</span>
                                            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-alpine-glacier">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </div>
                                        </motion.div>
                                    );

                                    return isRoute ? (
                                        <Link key={link.name} to={link.href} onClick={() => setSidebarOpen(false)}>
                                            {LinkContent}
                                        </Link>
                                    ) : (
                                        <a key={link.name} href={link.href} onClick={() => setSidebarOpen(false)}>
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
                                    <div className="flex items-center gap-2.5 sm:gap-3 mb-1.5 sm:mb-2 p-2 sm:p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-md hover:bg-white/[0.04] transition-colors">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt="Profile" className="w-9 h-9 sm:w-12 sm:h-12 rounded-full border-2 border-white/20 object-cover shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
                                        ) : (
                                            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-alpine-navy to-alpine-blue flex items-center justify-center text-sm sm:text-lg font-bold text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] border-2 border-white/10">
                                                {user.name.charAt(0)}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-[13px] sm:text-base text-white tracking-wide leading-tight truncate">{user.name}</h3>
                                            <p className="text-[10px] sm:text-xs text-white/50 truncate mt-0.5">{user.email}</p>
                                            <div className="inline-flex mt-0.5 sm:mt-1.5 px-1.5 sm:px-2.5 py-0.5 rounded-full bg-alpine-glacier/10 border border-alpine-glacier/30 text-[8px] sm:text-[10px] font-bold tracking-wider text-alpine-glacier shadow-sm uppercase">
                                                {user.role}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1 sm:space-y-2">
                                        <Link
                                            to="/portal"
                                            onClick={() => setSidebarOpen(false)}
                                            className="w-full relative overflow-hidden group flex items-center gap-2.5 sm:gap-3 p-2 sm:p-3.5 rounded-xl bg-gradient-to-r from-alpine-glacier/10 to-transparent hover:from-alpine-glacier/20 hover:to-alpine-glacier/5 border border-alpine-glacier/20 text-alpine-glacier transition-all duration-300 text-left shadow-sm"
                                        >
                                            <div className="absolute inset-0 bg-alpine-glacier/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <Settings size={14} className="group-hover:rotate-90 transition-transform duration-500 relative z-10" />
                                            <span className="font-semibold text-[12px] sm:text-sm relative z-10 tracking-wide">Go to Portal</span>
                                        </Link>
                                        {(user.role === 'Admin' || user.role === 'SuperAdmin') && (
                                            <Link
                                                to="/summit-control-panel"
                                                onClick={() => setSidebarOpen(false)}
                                                className="w-full relative overflow-hidden group flex items-center gap-2.5 sm:gap-3 p-2 sm:p-3.5 rounded-xl bg-gradient-to-r from-red-500/10 to-transparent hover:from-red-500/20 hover:to-red-500/5 border border-red-500/20 text-red-400 transition-all duration-300 text-left shadow-sm"
                                            >
                                                <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <ShieldAlert size={14} className="group-hover:scale-110 transition-transform duration-300 relative z-10" />
                                                <span className="font-semibold text-[12px] sm:text-sm relative z-10 tracking-wide">Mission Control</span>
                                            </Link>
                                        )}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div variants={itemVars} className="space-y-2 sm:space-y-4">
                                    <p className="text-white/60 text-[11px] sm:text-sm mb-3 sm:mb-6 leading-relaxed font-medium">
                                        Join the premier Malayalee hiking community in Europe. Connect, explore, and conquer.
                                    </p>
                                    <Link to="/login" onClick={() => setSidebarOpen(false)} className="w-full py-2 sm:py-3.5 px-4 sm:px-5 rounded-xl bg-gradient-to-r from-alpine-blue to-blue-600 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-[12px] sm:text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] hover:-translate-y-0.5 duration-300">
                                        <LogIn size={16} /> Login to Access
                                    </Link>
                                    <Link to="/signup" onClick={() => setSidebarOpen(false)} className="w-full py-2 sm:py-3.5 px-4 sm:px-5 rounded-xl border border-white/20 bg-white/[0.02] hover:bg-white/[0.08] hover:border-white/40 text-white font-bold text-[12px] sm:text-sm flex items-center justify-center gap-2 transition-all duration-300">
                                        <UserPlus size={16} /> Create Account
                                    </Link>
                                </motion.div>
                            )}

                            <div className="flex-1" />

                            {/* Theme Settings */}
                            <motion.div variants={itemVars} className="pt-2 sm:pt-6 border-t border-white/10 shrink-0 mt-2">
                                <h4 className="text-[9px] sm:text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1.5 sm:mb-3 px-1">Appearance</h4>
                                <div className="flex gap-1 sm:gap-1.5 bg-black/40 border border-white/[0.05] p-1 sm:p-1.5 rounded-2xl shadow-inner backdrop-blur-sm">
                                    <ThemeButton active={theme === 'light'} onClick={() => setTheme('light')} icon={<Sun size={12} />} label="Light" />
                                    <ThemeButton active={theme === 'dark'} onClick={() => setTheme('dark')} icon={<Moon size={12} />} label="Dark" />
                                    <ThemeButton active={theme === 'system'} onClick={() => setTheme('system')} icon={<Monitor size={12} />} label="System" />
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Footer — Logout */}
                        {isLoggedIn && (
                            <motion.div variants={itemVars} initial="hidden" animate="show" className="pt-2 sm:pt-4 border-t border-white/10 shrink-0 mt-2 sm:mt-4 relative z-10">
                                <button
                                    onClick={async () => { await logoutAsync(); setSidebarOpen(false); }}
                                    className="w-full py-1.5 sm:py-3 px-3 sm:px-4 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/10 font-bold tracking-wide text-[12px] sm:text-sm flex items-center justify-center gap-2 transition-all duration-300 group border border-transparent hover:border-red-500/20"
                                >
                                    <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" /> Sign Out
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// Sub-components
const ThemeButton = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex flex-col items-center justify-center py-1 sm:py-2.5 px-1 rounded-xl transition-all duration-300 relative ${
            active 
                ? 'bg-gradient-to-br from-alpine-glacier to-white text-alpine-navy shadow-[0_4px_10px_rgba(0,0,0,0.3)] scale-[1.02] border border-transparent' 
                : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'
            }`}
    >
        <div className={`mb-0.5 sm:mb-1 transition-transform duration-300 ${active ? 'scale-110' : ''}`}>{icon}</div>
        <span className="text-[7px] sm:text-[9px] font-bold tracking-[0.15em] uppercase">{label}</span>
    </button>
);
