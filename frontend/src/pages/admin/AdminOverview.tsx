import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Calendar, Image as ImageIcon, MessageSquare, Clock, TrendingUp, ArrowUp, Activity, Shield, ShieldAlert, ShieldCheck, ChevronDown, ChevronUp, RefreshCw, Sparkles } from 'lucide-react';
import { adminApi } from '../../lib/api';
import { StatSkeleton } from '../../components/ui/Skeleton';
import { API_URL } from '../../lib/constants';

// Severity badge helper
const severityColor = (severity: string) => {
    switch(severity) {
        case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 'warning': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        default: return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
    }
};

const statusIcon = (status: string) => {
    switch(status) {
        case 'critical': return <ShieldAlert size={20} className="text-red-400" />;
        case 'elevated': return <ShieldAlert size={20} className="text-amber-400" />;
        default: return <ShieldCheck size={20} className="text-emerald-400" />;
    }
};

const statusGlow = (status: string) => {
    switch(status) {
        case 'critical': return 'from-red-500/20 to-transparent border-red-500/20';
        case 'elevated': return 'from-amber-500/20 to-transparent border-amber-500/20';
        default: return 'from-emerald-500/20 to-transparent border-emerald-500/20';
    }
};

export const AdminOverview = () => {
    const [stats, setStats] = useState<any>(null);
    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [digest, setDigest] = useState<any>(null);
    const [digestLoading, setDigestLoading] = useState(false);
    const [digestExpanded, setDigestExpanded] = useState(false);

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
        fetchSecurityDigest();
    }, []);

    const fetchSecurityDigest = async () => {
        setDigestLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/security-digest`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setDigest(data);
            }
        } catch (err) {
            console.error('Failed to load security digest:', err);
        } finally {
            setDigestLoading(false);
        }
    };

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
                        className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 group hover:bg-white/10 transition-[color,background-color,border-color,box-shadow] relative overflow-hidden"
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

            {/* AI Security Digest */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${digest?.aiDigest ? statusGlow(digest.aiDigest.overallStatus) : 'from-white/5 to-transparent border-white/10'}`}
            >
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10 p-4 md:p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                                    <Shield size={22} className="text-alpine-glacier" />
                                </div>
                                <motion.div
                                    className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-alpine-glacier"
                                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            </div>
                            <div>
                                <h2 className="font-bold text-white text-base md:text-lg flex items-center gap-2">
                                    AI Security Digest
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-alpine-glacier/10 text-alpine-glacier border border-alpine-glacier/20">AI-ANALYZED</span>
                                </h2>
                                <p className="text-white/40 text-xs">Last 24 hours • Powered by Groq</p>
                            </div>
                        </div>
                        <button
                            onClick={fetchSecurityDigest}
                            disabled={digestLoading}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                        >
                            <RefreshCw size={16} className={`text-white/50 ${digestLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {digestLoading && !digest ? (
                        <div className="space-y-3">
                            {[1,2,3].map(i => <div key={i} className="h-5 bg-white/5 rounded-lg animate-pulse" style={{ width: `${90 - i * 20}%` }} />)}
                        </div>
                    ) : digest?.aiDigest ? (
                        <div className="space-y-4">
                            {/* Overall Status */}
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-black/20 border border-white/5">
                                {statusIcon(digest.aiDigest.overallStatus)}
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-white capitalize">{digest.aiDigest.overallStatus} Status</p>
                                    <p className="text-xs text-white/50 mt-0.5">{digest.aiDigest.summary}</p>
                                </div>
                            </div>

                            {/* Alerts */}
                            {digest.aiDigest.alerts && digest.aiDigest.alerts.length > 0 && (
                                <div className="space-y-2">
                                    {digest.aiDigest.alerts.map((alert: any, idx: number) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className={`flex items-start gap-3 p-3 rounded-xl border ${severityColor(alert.severity)}`}
                                        >
                                            <Sparkles size={14} className="shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-sm">{alert.message}</p>
                                                {alert.metric && <span className="text-xs opacity-70 font-mono">{alert.metric}</span>}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {/* Recommendation */}
                            {digest.aiDigest.recommendation && (
                                <div className="flex items-start gap-2 p-3 rounded-xl bg-alpine-glacier/5 border border-alpine-glacier/10">
                                    <Shield size={14} className="text-alpine-glacier shrink-0 mt-0.5" />
                                    <p className="text-xs text-alpine-glacier/80">{digest.aiDigest.recommendation}</p>
                                </div>
                            )}

                            {/* Expandable Raw Metrics */}
                            <button
                                onClick={() => setDigestExpanded(!digestExpanded)}
                                className="flex items-center gap-2 text-xs text-white/30 hover:text-white/50 transition-colors"
                            >
                                {digestExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                {digestExpanded ? 'Hide' : 'Show'} Raw Metrics
                            </button>

                            <AnimatePresence>
                                {digestExpanded && digest.rawMetrics && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                                            <div className="p-3 rounded-xl bg-black/20 border border-white/5 text-center">
                                                <p className="text-2xl font-bold text-emerald-400">{digest.rawMetrics.successfulLogins}</p>
                                                <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Successful Logins</p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-black/20 border border-white/5 text-center">
                                                <p className="text-2xl font-bold text-red-400">{digest.rawMetrics.failedLogins}</p>
                                                <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Failed Logins</p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-black/20 border border-white/5 text-center">
                                                <p className="text-2xl font-bold text-amber-400">{digest.rawMetrics.recentAdminActions}</p>
                                                <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Admin Actions</p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-black/20 border border-white/5 text-center">
                                                <p className="text-2xl font-bold text-alpine-glacier">
                                                    {digest.rawMetrics.successfulLogins + digest.rawMetrics.failedLogins > 0
                                                        ? Math.round((digest.rawMetrics.successfulLogins / (digest.rawMetrics.successfulLogins + digest.rawMetrics.failedLogins)) * 100)
                                                        : 100}%
                                                </p>
                                                <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Success Rate</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <p className="text-sm text-white/30">Security digest unavailable.</p>
                    )}
                </div>
            </motion.div>

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
