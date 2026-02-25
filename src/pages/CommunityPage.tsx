import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Users, MessageSquare, Map, Star, ShieldCheck, ArrowRight, Lock, MapPin, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const TABS = [
    { id: 'groups', label: 'Factions & Groups', icon: Users },
    { id: 'discussions', label: 'Global Comms', icon: MessageSquare },
    { id: 'trails', label: 'Trail Logistics', icon: Map },
    { id: 'spotlight', label: 'Vanguard Spotlight', icon: Star }
];

export const CommunityPage = () => {
    const [activeTab, setActiveTab] = useState('groups');

    return (
        <main className="min-h-screen bg-white dark:bg-[#0B0C10] text-alpine-navy dark:text-white pt-28 pb-20 relative overflow-hidden transition-colors duration-500">
            {/* Ambient Background */}
            <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none transition-opacity duration-500">
                <div className="absolute top-0 right-1/4 w-[60vw] h-[60vw] bg-alpine-glacier/40 dark:bg-alpine-navy/40 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-screen transition-colors duration-500" />
                <div className="absolute bottom-1/4 left-1/4 w-[40vw] h-[40vw] bg-alpine-blue/20 dark:bg-alpine-glacier/20 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen transition-colors duration-500" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* Header Actions */}
                <div className="flex items-center justify-between mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 text-alpine-navy/50 dark:text-white/50 hover:text-alpine-navy dark:hover:text-white transition-colors group">
                        <div className="p-2 rounded-full bg-black/5 dark:bg-white/5 group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-colors">
                            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        </div>
                        <span className="font-medium tracking-wide uppercase text-sm">Return to Base</span>
                    </Link>
                </div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="mb-12"
                >
                    <h1 className="font-serif text-5xl md:text-7xl font-bold mb-4 drop-shadow-sm dark:drop-shadow-md text-alpine-navy dark:text-white">Community Terminal</h1>
                    <p className="text-xl text-alpine-navy/70 dark:text-white/60 font-light max-w-2xl">
                        Secure coordination for dedicated high-altitude climbers and Alpine enthusiasts. Connect with established factions or plan future logistics.
                    </p>
                </motion.div>

                {/* Tab Navigation */}
                <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-12 border-b border-black/10 dark:border-white/10 pb-4 transition-colors duration-500">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative px-6 py-3 rounded-xl flex items-center gap-2 font-medium tracking-wide whitespace-nowrap transition-all duration-300 ${activeTab === tab.id ? 'text-alpine-navy dark:text-white' : 'text-alpine-navy/50 dark:text-white/40 hover:text-alpine-navy dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="community-tab-indicator"
                                    className="absolute inset-0 bg-black/5 dark:bg-white/10 shadow-sm border border-black/5 dark:border-white/10 rounded-xl z-[-1]"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="min-h-[50vh]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'groups' && (
                            <motion.div
                                key="groups"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                                className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                            >
                                {/* Left Panel: Active Group Focus */}
                                <div className="lg:col-span-3 space-y-6">
                                    <div className="bg-black/5 dark:bg-[#0B0C10]/40 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-3xl p-6 shadow-sm dark:shadow-none transition-colors duration-500">
                                        <div className="w-12 h-12 rounded-2xl bg-alpine-navy dark:bg-alpine-navy/80 flex items-center justify-center mb-6 border border-white/10 shadow-md">
                                            <ShieldCheck size={24} className="text-white" />
                                        </div>
                                        <h2 className="font-serif text-2xl font-bold mb-2 text-alpine-navy dark:text-white">Alpine Vanguards</h2>
                                        <p className="text-alpine-navy/70 dark:text-white/50 text-sm mb-6 leading-relaxed">
                                            Elite group focusing on technical ascents and mixed climbing across the French Alps. High altitude experience required.
                                        </p>

                                        <div className="space-y-4 pt-6 border-t border-black/10 dark:border-white/10 transition-colors duration-500">
                                            <div>
                                                <span className="text-alpine-navy/50 dark:text-white/40 text-xs tracking-widest uppercase block mb-2">Moderators</span>
                                                <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 p-2 rounded-xl border border-black/5 dark:border-white/5 transition-colors duration-500">
                                                    <div className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/20" />
                                                    <span className="text-sm font-bold dark:font-medium text-alpine-navy dark:text-white">Elena R. (Admin)</span>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-alpine-navy/50 dark:text-white/40 text-xs tracking-widest uppercase block mb-2">Members (128)</span>
                                                <div className="flex -space-x-2">
                                                    {[1, 2, 3, 4, 5].map(i => (
                                                        <div key={i} className="w-8 h-8 rounded-full bg-alpine-navy border-2 border-white/80 dark:border-[#0B0C10]" />
                                                    ))}
                                                    <div className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 border-2 border-white/80 dark:border-[#0B0C10] flex items-center justify-center text-[10px] font-bold text-alpine-navy dark:text-white">+123</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Admin Control Rule Reminder */}
                                    <div className="bg-amber-500/10 dark:bg-transparent border border-amber-500/20 rounded-3xl p-6 flex items-start gap-4 shadow-sm dark:shadow-none">
                                        <Lock size={20} className="text-amber-600 dark:text-amber-500/70 shrink-0 mt-1" />
                                        <div>
                                            <h4 className="text-sm font-semibold text-amber-900 dark:text-white/90 mb-1">Architecture Locked</h4>
                                            <p className="text-xs text-amber-900/70 dark:text-white/50 leading-relaxed">System groups are administered strictly by approved Mountain Guides. Users may only request to join existing factions.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Center Panel: Feed */}
                                <div className="lg:col-span-6 space-y-6">
                                    <div className="bg-black/5 dark:bg-[#0B0C10]/40 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-3xl p-6 flex gap-4 items-center shadow-sm dark:shadow-none transition-colors duration-500">
                                        <div className="w-10 h-10 rounded-full bg-black/10 dark:bg-white/10 shrink-0" />
                                        <div className="flex-1 bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl px-4 py-3 placeholder:text-alpine-navy/40 dark:placeholder:text-white/30 text-alpine-navy/60 dark:text-white/50 cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 transition-colors shadow-inner dark:shadow-none">
                                            Post field report or intelligence...
                                        </div>
                                    </div>

                                    {[1, 2].map((post) => (
                                        <div key={post} className="bg-black/5 dark:bg-[#0B0C10]/40 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-3xl p-6 shadow-sm dark:shadow-none transition-colors duration-500">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-alpine-glacier/40 dark:bg-alpine-glacier/20" />
                                                    <div>
                                                        <p className="font-bold dark:font-medium text-sm text-alpine-navy dark:text-white">Marcus V.</p>
                                                        <p className="text-xs text-alpine-navy/50 dark:text-white/40">2 hours ago • Field Report</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-alpine-navy/80 dark:text-white/80 leading-relaxed text-sm mb-4">
                                                Just descended from the Aiguille du Midi. Conditions are holding, but the upper seracs are looking unstable. Recommend avoiding the North face approach until temperatures drop further tonight. Coordinates logged securely.
                                            </p>
                                            <div className="h-48 rounded-xl bg-black/10 dark:bg-white/5 border border-black/5 dark:border-white/5 mb-4 transition-colors duration-500" />
                                        </div>
                                    ))}
                                </div>

                                {/* Right Panel: Logistics */}
                                <div className="lg:col-span-3 space-y-6">
                                    <button className="w-full bg-alpine-navy dark:bg-alpine-glacier/10 text-white font-bold py-4 rounded-2xl flex justify-center items-center gap-2 hover:bg-alpine-navy/90 dark:hover:bg-alpine-glacier/20 border border-transparent dark:border-alpine-glacier/30 transition-all group shadow-md dark:shadow-none hover:shadow-lg hover:-translate-y-0.5 dark:hover:-translate-y-0">
                                        Request Deployment (Join) <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </button>

                                    <div className="bg-black/5 dark:bg-[#0B0C10]/40 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-3xl p-6 shadow-sm dark:shadow-none transition-colors duration-500">
                                        <h3 className="font-serif text-xl font-bold mb-4 text-alpine-navy dark:text-white">Upcoming Logistics</h3>
                                        <div className="space-y-4">
                                            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-alpine-glacier/50 dark:hover:border-alpine-glacier/30 transition-colors cursor-pointer group shadow-sm dark:shadow-none">
                                                <h4 className="font-bold dark:font-semibold text-sm mb-2 group-hover:text-alpine-navy dark:group-hover:text-alpine-glacier transition-colors text-alpine-navy dark:text-white">Winter Traverse: Chamonix</h4>
                                                <div className="flex items-center gap-2 text-xs text-alpine-navy/60 dark:text-white/50 mb-1 transition-colors duration-500">
                                                    <Calendar size={14} /> Feb 28 - Mar 02
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-alpine-navy/60 dark:text-white/50 transition-colors duration-500">
                                                    <MapPin size={14} /> Briefing at Basecamp Alpha
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-black/5 dark:bg-[#0B0C10]/40 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-3xl p-6 shadow-sm dark:shadow-none transition-colors duration-500">
                                        <h3 className="font-serif text-xl font-bold mb-4 text-alpine-forest dark:text-alpine-sunrise">Pinned Comm</h3>
                                        <p className="text-sm text-alpine-navy/70 dark:text-white/70 leading-relaxed transition-colors duration-500">
                                            Ensure all avalanche beacons have updated firmware before next week's group ascent. Check-ins mandatory.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab !== 'groups' && (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center h-[40vh] text-center"
                            >
                                <div className="w-20 h-20 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-6 transition-colors duration-500">
                                    <Lock size={32} className="text-alpine-navy/30 dark:text-white/20" />
                                </div>
                                <h2 className="font-serif text-3xl font-bold mb-2 text-alpine-navy dark:text-white">Sector Restricted</h2>
                                <p className="text-alpine-navy/60 dark:text-white/40 max-w-md">This communications channel requires verified Vanguard clearance. Access denied.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </main>
    );
};
