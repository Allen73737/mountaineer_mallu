import React from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Image as ImageIcon, Activity } from 'lucide-react';

export const AdminOverview = () => {
    const stats = [
        { title: 'Total Users', value: '2,451', change: '+12%', icon: <Users size={24} />, trend: 'up' },
        { title: 'Active Events', value: '14', change: 'Stable', icon: <Calendar size={24} />, trend: 'neutral' },
        { title: 'Pending Media', value: '87', change: '-5%', icon: <ImageIcon size={24} />, trend: 'down' },
        { title: 'System Status', value: 'Optimal', change: '99.9% Uptime', icon: <Activity size={24} />, trend: 'up' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold font-serif mb-2 tracking-wide">Command Center</h1>
                <p className="text-white/50 text-sm">System operational. Awaiting orders.</p>
            </header>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        variants={itemVariants}
                        className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-alpine-glacier/5 rounded-full blur-[50px] group-hover:bg-alpine-glacier/10 transition-colors" />
                        <div className="flex items-start justify-between mb-4 relative z-10">
                            <div className="p-3 bg-black/40 rounded-xl text-alpine-glacier ring-1 ring-white/10">
                                {stat.icon}
                            </div>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${stat.trend === 'up' ? 'bg-emerald-500/20 text-emerald-400' :
                                    stat.trend === 'down' ? 'bg-red-500/20 text-red-400' :
                                        'bg-white/10 text-white/70'
                                }`}>
                                {stat.change}
                            </span>
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-4xl font-light tracking-tight mb-1">{stat.value}</h3>
                            <p className="text-sm font-medium text-white/50 tracking-wider uppercase">{stat.title}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Placeholder for charts or recent activity */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
                <div className="lg:col-span-2 h-96 bg-white/5 rounded-2xl border border-white/10 p-6 flex items-center justify-center">
                    <p className="text-white/30 font-mono text-sm tracking-widest">[ ACTIVITY_CHART_OFFLINE ]</p>
                </div>
                <div className="h-96 bg-white/5 rounded-2xl border border-white/10 p-6">
                    <h3 className="text-lg font-bold mb-4">Recent Comm Logs</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex gap-4 items-start pb-4 border-b border-white/5">
                                <div className="w-2 h-2 rounded-full bg-alpine-glacier mt-1.5 shrink-0" />
                                <div>
                                    <p className="text-sm text-white/80">User <span className="text-alpine-glacier">@alex_{i}</span> joined sector {i}A</p>
                                    <p className="text-xs text-white/40 font-mono mt-1">T-{i * 12}M</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
