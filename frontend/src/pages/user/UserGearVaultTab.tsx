import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Backpack, Shield, Plus, Sparkles, Check, Trash2, Layers, Compass, Wind } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { usersApi } from '../../lib/api';

type GearItem = {
    id: string;
    name: string;
    category: 'Essential' | 'Clothing' | 'Hardware' | 'Survival';
    packed: boolean;
};

export const UserGearVaultTab = () => {
    const { user } = useAuthStore();
    const [gear, setGear] = useState<GearItem[]>([]);
    const [newItemName, setNewItemName] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [upcomingExpedition, setUpcomingExpedition] = useState<any>(null);

    useEffect(() => {
        // Load gear from local storage for MVP
        const savedGear = localStorage.getItem('mountaineer_gear_vault');
        if (savedGear) {
            setGear(JSON.parse(savedGear));
        } else {
            // Default starter gear
            setGear([
                { id: '1', name: 'Mountaineering Boots', category: 'Clothing', packed: false },
                { id: '2', name: 'Ice Axe', category: 'Hardware', packed: false },
                { id: '3', name: 'First Aid Kit', category: 'Survival', packed: true },
            ]);
        }

        // Fetch upcoming expedition to give AI context
        usersApi.getMyExpeditions().then((res: any) => {
            const upcoming = res.expeditions.filter((e: any) => new Date(e.eventId.date) >= new Date());
            if (upcoming.length > 0) setUpcomingExpedition(upcoming[0].eventId);
        }).catch(() => {});
    }, []);

    useEffect(() => {
        localStorage.setItem('mountaineer_gear_vault', JSON.stringify(gear));
    }, [gear]);

    const handleAddItem = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newItemName.trim()) return;

        const newItem: GearItem = {
            id: Date.now().toString(),
            name: newItemName.trim(),
            category: 'Essential',
            packed: false
        };
        setGear(prev => [newItem, ...prev]);
        setNewItemName('');
    };

    const togglePacked = (id: string) => {
        setGear(prev => prev.map(item => item.id === id ? { ...item, packed: !item.packed } : item));
    };

    const removeItem = (id: string) => {
        setGear(prev => prev.filter(item => item.id !== id));
    };

    const generateAIRecommendations = () => {
        setIsGenerating(true);
        setTimeout(() => {
            const newItems: GearItem[] = [
                { id: Date.now() + '1', name: 'Crampons', category: 'Hardware', packed: false },
                { id: Date.now() + '2', name: 'GORE-TEX Hardshell', category: 'Clothing', packed: false },
                { id: Date.now() + '3', name: 'Emergency Bivy', category: 'Survival', packed: false },
                { id: Date.now() + '4', name: 'Headlamp w/ Extra Batteries', category: 'Essential', packed: false },
            ];
            
            // Only add items that don't exist
            setGear(prev => {
                const existingNames = prev.map(p => p.name.toLowerCase());
                const toAdd = newItems.filter(n => !existingNames.includes(n.name.toLowerCase()));
                return [...toAdd, ...prev];
            });
            setIsGenerating(false);
        }, 2000);
    };

    const categories = ['All', 'Essential', 'Clothing', 'Hardware', 'Survival'];
    const filteredGear = activeCategory === 'All' ? gear : gear.filter(g => g.category === activeCategory);

    const packedCount = gear.filter(g => g.packed).length;
    const totalCount = gear.length;
    const progress = totalCount === 0 ? 0 : (packedCount / totalCount) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
        >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/20 text-amber-500 rounded-2xl border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                        <Backpack size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-serif font-bold tracking-wide text-alpine-navy dark:text-white">Gear & Loadout Vault</h2>
                        <p className="text-alpine-navy/60 dark:text-white/50 mt-1">Manage your expedition inventory and packing lists.</p>
                    </div>
                </div>
                
                <button
                    onClick={generateAIRecommendations}
                    disabled={isGenerating}
                    className="group relative flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20 border border-purple-500/20 text-purple-500 font-bold text-sm transition-all overflow-hidden disabled:opacity-50"
                >
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    {isGenerating ? (
                        <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                    )}
                    {isGenerating ? 'Analyzing Route...' : 'AI Loadout Suggestion'}
                </button>
            </div>

            {/* Top Dashboard Panels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Readiness Status */}
                <div className="p-6 rounded-[2rem] bg-white/60 dark:bg-[#11141A]/60 border border-black/5 dark:border-white/5 backdrop-blur-xl shadow-xl flex flex-col justify-between group overflow-hidden relative">
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors" />
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                        <Shield className="text-amber-500" size={24} />
                        <h3 className="font-bold text-alpine-navy dark:text-white uppercase tracking-wider text-sm">Readiness</h3>
                    </div>
                    <div className="relative z-10">
                        <h1 className="text-5xl font-black font-serif text-alpine-navy dark:text-white drop-shadow-sm mb-2">{Math.round(progress)}%</h1>
                        <div className="h-2 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-gradient-to-r from-amber-500 to-amber-300"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                </div>

                {/* Next Expedition Context */}
                <div className="md:col-span-2 p-6 rounded-[2rem] bg-gradient-to-br from-alpine-glacier/10 to-transparent border border-alpine-glacier/20 backdrop-blur-xl shadow-xl relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-64 h-full bg-alpine-glacier/5 group-hover:bg-alpine-glacier/10 skew-x-[-20deg] transform origin-bottom transition-colors pointer-events-none" />
                    
                    {upcomingExpedition ? (
                        <div className="flex flex-col md:flex-row gap-6 relative z-10">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-lg border border-white/10">
                                <img src={upcomingExpedition.image} alt="Expedition" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-alpine-navy/50 dark:text-white/50 mb-1 flex items-center gap-1">
                                    <Compass size={12} /> Target Operation
                                </p>
                                <h3 className="text-2xl font-serif font-bold text-alpine-navy dark:text-white mb-2">{upcomingExpedition.title}</h3>
                                <div className="flex items-center gap-4 text-sm font-semibold text-alpine-navy/70 dark:text-white/70">
                                    <span className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 px-3 py-1 rounded-lg border border-black/5 dark:border-white/5"><Wind size={14} className="text-alpine-glacier"/> Weather Analysis Active</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full relative z-10 opacity-60">
                            <Compass size={32} className="mb-2 text-alpine-navy dark:text-white" />
                            <p className="font-serif font-bold text-lg">No Active Operations</p>
                            <p className="text-sm">Add a trip to receive targeted gear recommendations.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Inventory Section */}
            <div className="bg-white/40 dark:bg-[#11141A]/60 border border-black/5 dark:border-white/5 rounded-[2rem] p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/5 dark:from-white/5 to-transparent pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-center mb-8 border-b border-black/5 dark:border-white/5 pb-6">
                    {/* Categories */}
                    <div className="flex overflow-x-auto hide-scrollbar gap-2 w-full md:w-auto">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                                    activeCategory === cat 
                                        ? 'bg-alpine-navy text-white dark:bg-white dark:text-alpine-navy shadow-lg scale-105'
                                        : 'bg-black/5 dark:bg-white/5 text-alpine-navy/60 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/10'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Add Item Form */}
                    <form onSubmit={handleAddItem} className="flex gap-2 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Add new gear..."
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-alpine-navy dark:text-white focus:outline-none focus:border-alpine-glacier transition-colors w-full md:w-64"
                        />
                        <button 
                            type="submit"
                            disabled={!newItemName.trim()}
                            className="p-2 rounded-xl bg-alpine-glacier text-alpine-navy disabled:opacity-50 transition-colors"
                        >
                            <Plus size={20} />
                        </button>
                    </form>
                </div>

                {/* Gear List */}
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {filteredGear.map(item => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`group flex items-center justify-between p-4 rounded-2xl border transition-[color,background-color,border-color,box-shadow] duration-300 backdrop-blur-md cursor-pointer ${
                                    item.packed 
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                                        : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10'
                                }`}
                                onClick={() => togglePacked(item.id)}
                            >
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                        item.packed 
                                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                                            : 'border-alpine-navy/20 dark:border-white/20'
                                    }`}>
                                        {item.packed && <Check size={14} strokeWidth={3} />}
                                    </div>
                                    <div className="truncate">
                                        <h4 className={`font-semibold text-sm truncate transition-colors ${item.packed ? 'opacity-70 line-through' : 'text-alpine-navy dark:text-white'}`}>
                                            {item.name}
                                        </h4>
                                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mt-0.5 flex items-center gap-1">
                                            <Layers size={10} /> {item.category}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                                    className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    
                    {filteredGear.length === 0 && (
                        <div className="col-span-full py-12 text-center text-alpine-navy/40 dark:text-white/40 font-bold uppercase tracking-widest text-sm">
                            Vault is Empty
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
