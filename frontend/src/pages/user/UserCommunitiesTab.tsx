import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, MapPin, Users, ArrowRight, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { communityApi } from '../../lib/api';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export const UserCommunitiesTab = () => {
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const data = await communityApi.listGroups();
                setGroups(data.groups || []);
            } catch (error) {
                console.error('Failed to fetch groups:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchGroups();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
        >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-alpine-glacier/20 text-alpine-glacier rounded-2xl">
                        <Compass size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-serif font-bold tracking-wide">My Factions</h2>
                        <p className="text-alpine-navy/60 dark:text-white/50 mt-1">Communicate with your joined expedition groups and factions.</p>
                    </div>
                </div>
                <Link to="/community" className="group shrink-0">
                    <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-alpine-glacier/10 hover:bg-alpine-glacier/20 border border-alpine-glacier/20 text-alpine-glacier font-semibold text-sm transition-all">
                        Explore Communities
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>
            </div>

            {groups.length === 0 ? (
                <div className="p-12 text-center bg-black/5 dark:bg-white/5 rounded-3xl border border-black/10 dark:border-white/10">
                    <ShieldCheck size={48} className="mx-auto text-alpine-navy/30 dark:text-white/30 mb-4" />
                    <h3 className="text-xl font-serif font-bold mb-2">No Factions Joined</h3>
                    <p className="text-alpine-navy/60 dark:text-white/60 mb-6">You are operating solo. Join a faction to coordinate with other climbers.</p>
                    <Link to="/community">
                        <button className="px-6 py-3 bg-alpine-navy dark:bg-alpine-glacier/20 text-white dark:text-alpine-glacier font-bold rounded-xl hover:bg-alpine-navy/90 dark:hover:bg-alpine-glacier/30 transition-all border border-transparent dark:border-alpine-glacier/30">
                            Explore Communities
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {groups.map((group, idx) => (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            key={group._id}
                            className="premium-card-light dark:premium-card p-6 md:p-8 rounded-3xl flex flex-col justify-between border border-black/5 dark:border-white/[0.06] shadow-lg group hover:shadow-2xl hover:border-alpine-glacier/30 transition-all duration-500"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-5">
                                    <div className="bg-alpine-navy dark:bg-white/10 p-2.5 rounded-2xl shrink-0">
                                        <ShieldCheck size={24} className="text-white" />
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/10 px-3 py-1.5 rounded-full shrink-0">
                                        <Users size={13} className="text-alpine-navy/60 dark:text-white/60" />
                                        <span className="text-xs font-bold text-alpine-navy/80 dark:text-white/80">{group.memberCount}</span>
                                    </div>
                                </div>
                                <h3 className="font-serif text-2xl font-bold text-alpine-navy dark:text-white mb-2 leading-tight">{group.name}</h3>
                                <p className="text-alpine-navy/70 dark:text-white/60 text-sm leading-relaxed mb-6">
                                    {group.description}
                                </p>
                            </div>
                            
                            <Link to="/community" className="w-full mt-auto">
                                <button className="w-full py-3 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] hover:bg-alpine-navy hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 font-semibold tracking-wide text-sm flex items-center justify-center gap-2 group-hover:shadow-lg btn-premium">
                                    Access Terminal <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};
