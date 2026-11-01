import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Edit2, Trash2, Save, X, Image as ImageIcon, Quote, UploadCloud } from 'lucide-react';
import { Loader2 } from '../../components/ui/BrandLoader';
import { pillarsApi } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { LanguageInput } from '../../components/ui/LanguageInput';
import { useAdminAction } from '../../store/useAdminAction';

interface Pillar {
    _id: string;
    name: string;
    role: string;
    quote: string;
    image: string;
    order: number;
}

export const PillarsManagement = () => {
    const [pillars, setPillars] = useState<Pillar[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPillar, setCurrentPillar] = useState<Partial<Pillar>>({});
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const { showToast, ToastComponent } = useToast();
    const { requestAction } = useAdminAction();

    // Stack preview state
    const [topIndex, setTopIndex] = useState(0);

    useEffect(() => {
        fetchPillars();
    }, []);

    // Cycle preview stack
    useEffect(() => {
        if (pillars.length === 0) return;
        const timer = setInterval(() => {
            setTopIndex((prev) => (prev + 1) % pillars.length);
        }, 3500);
        return () => clearInterval(timer);
    }, [pillars.length]);

    const fetchPillars = async () => {
        try {
            const data = await pillarsApi.list();
            setPillars(data);
        } catch (err: any) {
            showToast(err.message || 'Failed to fetch pillars', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const isUpdate = !!currentPillar._id;
        const actionName = isUpdate ? 'Update Leader' : 'Create Leader';
        const actionDesc = isUpdate ? 'Are you sure you want to update this team member?' : 'Are you sure you want to add this team member?';
        const payload = { ...currentPillar } as any;

        requestAction(
            actionName,
            actionDesc,
            {
                execute: async () => {
                    let finalPayload: any = { ...payload };
                    if (imageFile) {
                        const formData = new FormData();
                        Object.keys(payload).forEach(key => {
                            if (payload[key] !== undefined) formData.append(key, String(payload[key]));
                        });
                        formData.append('image', imageFile);
                        finalPayload = formData;
                    }

                    if (isUpdate) await pillarsApi.update(payload._id, finalPayload);
                    else await pillarsApi.create(finalPayload);
                    fetchPillars();
                },
                optimistic: () => {
                    setIsEditing(false);
                    setCurrentPillar({});
                    setImageFile(null);
                },
                successMessage: `Leader ${isUpdate ? 'updated' : 'added'} successfully.`
            },
            'info',
            'Save'
        );
    };

    const handleDelete = (id: string) => {
        const pillarToDelete = pillars.find(p => p._id === id);
        if (!pillarToDelete) return;

        requestAction(
            'Remove Leader',
            `Are you sure you want to remove "${pillarToDelete.name}"?`,
            {
                execute: async () => { await pillarsApi.delete(id); fetchPillars(); },
                optimistic: () => setPillars(prev => prev.filter(p => p._id !== id)),
                revert: () => setPillars(prev => [...prev, pillarToDelete]),
                successMessage: 'Leader removed.'
            },
            'danger',
            'Remove'
        );
    };

    return (
        <div className="space-y-8">
            {ToastComponent}

            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="text-alpine-glacier" size={28} />
                        <h1 className="text-3xl font-bold font-serif tracking-wide text-gradient-glacier glow-text">Team Members</h1>
                    </div>
                    <p className="text-white/50 text-sm">Manage the core team members displayed on the platform.</p>
                </div>
                <button
                    onClick={() => { setCurrentPillar({ order: pillars.length }); setImageFile(null); setIsEditing(true); }}
                    className="py-2 px-4 flex items-center gap-2 bg-alpine-glacier text-alpine-navy font-bold rounded-xl btn-premium"
                >
                    <Plus size={18} />
                    <span>Add Leader</span>
                </button>
            </div>

            <div className="flex gap-8">
                {/* Left: Grid View */}
                <div className="w-2/3 space-y-4">
                    {loading ? (
                        <div className="h-64 flex items-center justify-center">
                            <Loader2 className="animate-spin text-alpine-glacier" size={32} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {pillars.map((pillar) => (
                                <motion.div
                                    key={pillar._id}
                                    layoutId={pillar._id}
                                    className="premium-card rounded-2xl p-4 flex gap-4 group"
                                >
                                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative">
                                        <img src={pillar.image} alt={pillar.name} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button onClick={() => { setCurrentPillar(pillar); setImageFile(null); setIsEditing(true); }} className="p-1.5 bg-white/20 rounded hover:bg-white/40 text-white transition-colors">
                                                <Edit2 size={12} />
                                            </button>
                                            <button onClick={() => handleDelete(pillar._id)} className="p-1.5 bg-red-500/80 rounded hover:bg-red-500 text-white transition-colors">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-white font-bold text-sm truncate">{pillar.name}</h3>
                                        <p className="text-alpine-glacier text-[10px] uppercase tracking-widest font-semibold mb-2 truncate">{pillar.role}</p>
                                        <p className="text-white/40 text-xs italic line-clamp-2 leading-relaxed">"{pillar.quote}"</p>
                                    </div>
                                </motion.div>
                            ))}
                            {pillars.length === 0 && (
                                <div className="col-span-2 py-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                                    <Users className="mx-auto text-white/20 mb-3" size={32} />
                                    <p className="text-white/40 text-sm">No community leaders added yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Live Spring Stack Preview */}
                <div className="w-1/3">
                    <div className="sticky top-8 bg-black/40 border border-white/10 rounded-3xl p-6 h-[480px] flex flex-col items-center justify-center overflow-hidden perspective-[1000px]">
                        <div className="absolute top-4 left-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-mono text-emerald-400/80 uppercase tracking-widest">Live Component Preview</span>
                        </div>
                        
                        {pillars.length > 0 ? (
                            <div className="relative w-48 h-[280px] mt-8">
                                <AnimatePresence>
                                    {pillars.map((leader, i) => {
                                        let relativeIndex = (i - topIndex + pillars.length) % pillars.length;
                                        return (
                                            <motion.div
                                                key={leader._id}
                                                animate={{
                                                    scale: 1 - relativeIndex * 0.08,
                                                    y: relativeIndex === 0 ? 0 : relativeIndex * -25,
                                                    zIndex: pillars.length - relativeIndex,
                                                    opacity: 1 - relativeIndex * 0.2,
                                                    rotateX: relativeIndex * 4,
                                                }}
                                                transition={{ type: 'spring', stiffness: 100, damping: 14 }}
                                                className="absolute inset-0 rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
                                            >
                                                <img src={leader.image} alt={leader.name} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
                                                <div className="absolute inset-0 p-4 flex flex-col justify-end">
                                                    <Quote size={12} className="text-white/30 mb-2" />
                                                    <p className="font-serif italic text-xs mb-3 text-alpine-glacier drop-shadow leading-snug">"{leader.quote}"</p>
                                                    <h3 className="text-sm font-serif font-medium text-white">{leader.name}</h3>
                                                    <p className="text-[9px] tracking-widest uppercase text-alpine-sunrise">{leader.role}</p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="text-white/20 text-sm italic">Add leaders to see preview</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Editor Modal */}
            <AnimatePresence>
                {isEditing && (
                    <div className="fixed inset-y-0 right-0 left-[var(--sidebar-width,0px)] z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-xl bg-alpine-navy border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/[0.02]">
                                <h2 className="text-xl font-serif font-bold text-white">{currentPillar._id ? 'Edit Leader' : 'Add New Leader'}</h2>
                                <button onClick={() => setIsEditing(false)} className="text-white/50 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSave} className="p-6 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-white/60">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={currentPillar.name || ''}
                                            onChange={e => setCurrentPillar({ ...currentPillar, name: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50 text-sm"
                                            placeholder="e.g. Arjun M."
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-white/60">Role / Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={currentPillar.role || ''}
                                            onChange={e => setCurrentPillar({ ...currentPillar, role: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50 text-sm"
                                            placeholder="e.g. Founder & Chief Guide"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-white/60">Signature Quote</label>
                                    <div className="relative">
                                        <LanguageInput
                                            value={currentPillar.quote || ''}
                                            onChange={val => setCurrentPillar({ ...currentPillar, quote: val })}
                                            placeholder="Every mountain teaches us something pure..."
                                            isTextarea={true}
                                            rows={2}
                                        />
                                        <div className="absolute bottom-2 right-4 text-[10px] text-white/30 pointer-events-none">
                                            {currentPillar.quote?.length || 0}/200
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-white/60">Portrait Image</label>
                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                        <div className="w-full sm:flex-1 relative">
                                            <input
                                                type="url"
                                                value={currentPillar.image || ''}
                                                onChange={e => setCurrentPillar({ ...currentPillar, image: e.target.value })}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50 text-sm"
                                                placeholder="Enter image URL..."
                                            />
                                        </div>
                                        <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest shrink-0">OR</div>
                                        <div className="w-full sm:flex-1 relative group">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={e => setImageFile(e.target.files?.[0] || null)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className={`w-full bg-black/20 border ${imageFile ? 'border-alpine-glacier/50 text-alpine-glacier' : 'border-white/10 text-white/60'} group-hover:border-alpine-glacier/50 group-hover:text-alpine-glacier rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 transition-all`}>
                                                <UploadCloud size={16} />
                                                <span className="text-sm font-medium truncate">{imageFile ? imageFile.name : 'Upload from Device'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {(currentPillar.image || imageFile) && (
                                        <div className="mt-2">
                                            <img src={imageFile ? URL.createObjectURL(imageFile) : currentPillar.image} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-white/20" />
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2.5 rounded-xl text-white/60 hover:text-white text-sm font-medium transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-alpine-glacier text-alpine-navy text-sm font-bold flex items-center gap-2 btn-premium">
                                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        {saving ? 'Saving...' : 'Save Leader'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
