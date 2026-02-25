import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogIn, UserPlus, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/useAuthStore';
import { DynamicLogo } from '../ui/DynamicLogo';

const navLinks = [
    { name: 'Mission', href: '#mission' },
    { name: 'Stories', href: '#stories' },
    { name: 'Events', href: '#events' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Community', href: '#community' },
];

export const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [hoveredLink, setHoveredLink] = useState<string | null>(null);
    const { toggleSidebar } = useStore();
    const { isLoggedIn, user } = useAuthStore();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${scrolled ? 'py-5' : 'py-10'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6">
                <div className={`flex items-center justify-between rounded-full px-6 py-3 transition-all duration-500 ${scrolled ? 'glass' : 'bg-transparent'}`}>

                    {/* Logo Area */}
                    <div
                        className="flex items-center gap-2 relative z-50 cursor-pointer bg-white/90 px-3 py-1.5 rounded-full shadow-sm backdrop-blur-md transition-transform hover:scale-105"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        <DynamicLogo className="h-8 md:h-9" showText={true} />
                    </div>

                    {/* Center Links */}
                    <nav className="hidden md:flex items-center gap-2 bg-black/5 dark:bg-white/5 p-1.5 rounded-full backdrop-blur-md border border-black/5 dark:border-white/5 shadow-sm">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                onMouseEnter={() => setHoveredLink(link.name)}
                                onMouseLeave={() => setHoveredLink(null)}
                                className="relative px-6 py-3 text-lg font-bold tracking-wide text-[#0B0C10]/80 dark:text-white/80 hover:text-[#0B0C10] dark:hover:text-white transition-all duration-300 hover:scale-105 z-10"
                            >
                                {hoveredLink === link.name && (
                                    <motion.div
                                        layoutId="nav-hover"
                                        className="absolute inset-0 bg-white dark:bg-white/10 rounded-full shadow-md z-[-1]"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                {link.name}
                            </a>
                        ))}
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3 md:gap-4 relative z-50">
                        {isLoggedIn ? (
                            <button
                                onClick={toggleSidebar}
                                className="p-2 md:p-3 rounded-full hover:bg-[#0B0C10]/10 dark:hover:bg-white/10 transition-colors duration-300 group flex items-center gap-2"
                            >
                                <span className="hidden md:inline-block font-bold text-sm text-[#0B0C10]/80 dark:text-white/80 group-hover:text-[#0B0C10] dark:group-hover:text-white">
                                    {user?.name.split(' ')[0]}
                                </span>
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full border-2 border-transparent group-hover:border-alpine-glacier transition-all" />
                                ) : (
                                    <User size={24} className="text-[#0B0C10]/80 dark:text-white/80 group-hover:text-[#0B0C10] dark:group-hover:text-white transition-all transform group-hover:scale-110" />
                                )}
                            </button>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm text-[#0B0C10]/80 dark:text-white/80 hover:text-[#0B0C10] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="px-5 py-2 rounded-full bg-alpine-navy dark:bg-white text-alpine-snow dark:text-alpine-navy font-bold text-sm hover:scale-105 transition-all shadow-md flex items-center gap-2"
                                >
                                    Join
                                </Link>
                                <button
                                    onClick={toggleSidebar}
                                    className="p-2 md:p-3 rounded-full hover:bg-[#0B0C10]/10 dark:hover:bg-white/10 transition-colors duration-300 text-[#0B0C10]/80 dark:text-white/80"
                                >
                                    <Menu size={24} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </motion.header>
    );
};
