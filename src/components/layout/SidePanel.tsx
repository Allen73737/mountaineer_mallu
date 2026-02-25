import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, UserPlus, Settings, LogOut, UploadCloud, Moon, Sun, Monitor, ShieldAlert } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/useAuthStore';
import { DynamicLogo } from '../ui/DynamicLogo';

export const SidePanel = () => {
    const { isSidebarOpen, setSidebarOpen, theme, setTheme } = useStore();
    const { isLoggedIn, user, logout } = useAuthStore();
    const navigate = useNavigate();

    const containerVars = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVars = {
        hidden: { opacity: 0, x: 20 },
        show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
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
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 z-50 bg-alpine-navy/40 backdrop-blur-sm"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm glass-dark border-l border-white/10 p-6 flex flex-col"
                    >
                        {/* Header */}
                        <motion.div variants={itemVars} initial="hidden" animate="show" className="flex items-center justify-between mb-10">
                            <div className="bg-white/90 p-2 rounded-2xl shadow-inner inline-flex">
                                <DynamicLogo className="h-10" showText={true} />
                            </div>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="p-3 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                            >
                                <X size={28} />
                            </button>
                        </motion.div>

                        {/* Profile Content */}
                        <motion.div
                            variants={containerVars}
                            initial="hidden"
                            animate="show"
                            className="flex-1 overflow-y-auto pr-2 custom-scrollbar"
                        >
                            {isLoggedIn && user ? (
                                <motion.div variants={itemVars} className="space-y-6">
                                    <div className="flex items-center gap-5 mb-10">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt="Profile" className="w-16 h-16 rounded-full border border-white/20" />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-alpine-blue animate-pulse flex items-center justify-center text-xl font-bold text-white shadow-inner">
                                                {user.name.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-bold text-xl text-white tracking-wide">{user.name}</h3>
                                            <p className="text-sm text-white/50">{user.email}</p>
                                            <div className="inline-flex mt-2 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/5 text-xs font-medium text-white/70 shadow-sm">
                                                {user.role}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <ActionButton icon={<Settings size={18} />} label="Edit Profile" />
                                        <ActionButton icon={<UploadCloud size={18} />} label="Upload Media" />
                                        {(user.role === 'Admin' || user.role === 'SuperAdmin') && (
                                            <Link
                                                to="/summit-control-panel"
                                                onClick={() => setSidebarOpen(false)}
                                                className="w-full flex items-center gap-3 p-3 rounded-lg bg-alpine-glacier/10 hover:bg-alpine-glacier/20 border border-alpine-glacier/20 text-alpine-glacier transition-colors text-left font-medium"
                                            >
                                                <ShieldAlert size={18} />
                                                <span>Mission Control</span>
                                            </Link>
                                        )}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div variants={itemVars} className="space-y-4">
                                    <p className="text-white/70 text-lg mb-8 leading-relaxed">
                                        Join the premier Malayalee hiking community in Europe. Connect, share, and discover.
                                    </p>
                                    <Link to="/login" onClick={() => setSidebarOpen(false)} className="w-full py-4 px-6 rounded-xl bg-alpine-blue hover:bg-alpine-blue/80 text-white font-bold text-lg flex items-center justify-center gap-3 transition-colors hover:scale-[1.02]">
                                        <LogIn size={24} /> Login
                                    </Link>
                                    <Link to="/signup" onClick={() => setSidebarOpen(false)} className="w-full py-4 px-6 rounded-xl border-2 border-white/20 hover:bg-white/5 text-white font-bold text-lg flex items-center justify-center gap-3 transition-colors hover:scale-[1.02]">
                                        <UserPlus size={24} /> Sign Up
                                    </Link>
                                </motion.div>
                            )}

                            {/* Theme Settings */}
                            <motion.div variants={itemVars} className="mt-12 pt-8 border-t border-white/10">
                                <h4 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">Appearance</h4>
                                <div className="grid grid-cols-3 gap-4 bg-alpine-blue/20 p-2 rounded-2xl">
                                    <ThemeButton active={theme === 'light'} onClick={() => setTheme('light')} icon={<Sun size={32} />} label="Light" />
                                    <ThemeButton active={theme === 'dark'} onClick={() => setTheme('dark')} icon={<Moon size={32} />} label="Dark" />
                                    <ThemeButton active={theme === 'system'} onClick={() => setTheme('system')} icon={<Monitor size={32} />} label="System" />
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Footer */}
                        {isLoggedIn && (
                            <motion.div variants={itemVars} initial="hidden" animate="show" className="mt-auto pt-6 border-t border-white/10">
                                <button
                                    onClick={logout}
                                    className="w-full py-3 px-4 rounded-lg text-red-400 hover:bg-red-500/10 font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    <LogOut size={18} /> Logout
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
const ActionButton = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
    <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-white/80 hover:text-white transition-colors text-left">
        {icon}
        <span className="font-medium">{label}</span>
    </button>
);

const ThemeButton = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center py-6 px-2 rounded-xl transition-all duration-300 ${active ? 'bg-alpine-glacier text-alpine-navy shadow-lg scale-[1.05]' : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
    >
        <div className="mb-3">{icon}</div>
        <span className="text-base font-bold tracking-wide">{label}</span>
    </button>
);
