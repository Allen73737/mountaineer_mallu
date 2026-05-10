import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Image as ImageIcon, MessageSquare, Clock, TrendingUp, ArrowUp, Activity } from 'lucide-react';
import { adminApi } from '../../lib/api';
import { StatSkeleton } from '../../components/ui/Skeleton';

export const AdminOverview = () => {
    const [stats, setStats] = useState<any>(null);
    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOverview = async () => {
            try {
                const data = await adminApi.getOverview();
                setStats(data.stats);
                setRecentUsers(data.recentUsers);
            } catch (err) {
                console.error('Failed to load overview:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOverview();
    }, []);

    const statCards = stats ? [
        { label: 'Total Personnel', value: stats.totalUsers, icon: Users, color: 'from-blue-500 to-cyan-500' },
        { label: 'Active Expeditions', value: stats.totalEvents, icon: Calendar, color: 'from-amber-500 to-orange-500' },
        { label: 'Pending Intel', value: stats.pendingMedia, icon: ImageIcon, color: 'from-purple-500 to-pink-500' },
        { label: 'Active Factions', value: stats.activeGroups, icon: MessageSquare, color: 'from-emerald-500 to-teal-500' }
    ] : [];

    return (
        <div className="space-y-6 md:space-y-10">
            <div>
                <h1 className="text-3xl font-serif font-bold text-white tracking-wide mb-2 flex items-center gap-3">
                    <Activity className="text-alpine-glacier" size={28} />
                    Command Center
                </h1>
                <p className="text-white/50 text-sm">Real-time overview of the Mountaineer Mallu platform</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                {loading ? [1,2,3,4].map(i => <StatSkeleton key={i} />) :
                statCards.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, type: 'spring', damping: 15 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 group hover:bg-white/10 transition-all relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-10 rounded-bl-full" style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-20`}>
                                <stat.icon size={24} className="text-white" />
                            </div>
                            <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold"><ArrowUp size={12} /> Live</span>
                        </div>
                        <h3 className="text-4xl font-bold text-white mb-1">{stat.value}</h3>
                        <p className="text-white/50 text-sm uppercase tracking-wider">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6">
                <h2 className="font-bold text-white text-base md:text-lg mb-4 md:mb-6 flex items-center gap-2"><Clock className="text-alpine-glacier" size={20} /> Recent Recruits</h2>
                {loading ? (
                    <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />)}</div>
                ) : recentUsers.length === 0 ? (
                    <p className="text-white/30 text-sm font-mono">[ NO_RECENT_ACTIVITY ]</p>
                ) : (
                    <div className="space-y-3">
                        {recentUsers.map((user) => (
                            <div key={user.id} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-alpine-glacier/20 flex items-center justify-center font-bold text-alpine-glacier text-sm">{user.name?.charAt(0)}</div>
                                    <div>
                                        <p className="font-medium text-white">{user.name}</p>
                                        <p className="text-xs text-white/40">{user.email}</p>
                                    </div>
                                </div>
                                <span className="text-xs text-white/40">{new Date(user.joinedAt).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
