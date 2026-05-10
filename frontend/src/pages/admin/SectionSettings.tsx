import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layers, BookOpen, Calendar, Image as ImageIcon, Users, ShoppingBag, Star, UserCircle, Mail, Eye, EyeOff, Clock, Wrench, Save, Loader2, AlertTriangle, Shield } from 'lucide-react';
import { settingsApi } from '../../lib/api';
import { useSiteSettings, SectionStatus } from '../../store/useSiteSettings';
import { useAdminAction } from '../../store/useAdminAction';
import { useToast } from '../../components/ui/Toast';

const SECTION_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    stories:   { label: 'Stories',   icon: <BookOpen size={20} />,    color: 'from-blue-500 to-cyan-500' },
    events:    { label: 'Events',    icon: <Calendar size={20} />,    color: 'from-violet-500 to-purple-500' },
    gallery:   { label: 'Gallery',   icon: <ImageIcon size={20} />,   color: 'from-pink-500 to-rose-500' },
    community: { label: 'Community', icon: <Users size={20} />,       color: 'from-emerald-500 to-green-500' },
    shop:      { label: 'Merchandise', icon: <ShoppingBag size={20} />, color: 'from-amber-500 to-orange-500' },
    reviews:   { label: 'Reviews',   icon: <Star size={20} />,        color: 'from-yellow-500 to-amber-500' },
    team:      { label: 'Team',      icon: <UserCircle size={20} />,  color: 'from-teal-500 to-cyan-500' },
    contact:   { label: 'Contact',   icon: <Mail size={20} />,        color: 'from-indigo-500 to-blue-500' },
};

const STATUS_STYLES: Record<SectionStatus, { bg: string; dot: string; label: string }> = {
    visible:     { bg: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300', dot: 'bg-emerald-400', label: 'Visible' },
    coming_soon: { bg: 'bg-amber-500/20 border-amber-500/30 text-amber-300',      dot: 'bg-amber-400',   label: 'Coming Soon' },
    hidden:      { bg: 'bg-red-500/20 border-red-500/30 text-red-300',            dot: 'bg-red-400',     label: 'Hidden' },
};

const STATUSES: SectionStatus[] = ['visible', 'coming_soon', 'hidden'];

export const SectionSettings = () => {
    const { settings, fetchSettings } = useSiteSettings();
    const [sections, setSections] = useState<Record<string, SectionStatus>>({});
    const [maintenance, setMaintenance] = useState({ enabled: false, message: '', allowAdminAccess: true });
    const [saving, setSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const { showToast, ToastComponent } = useToast();
    const { requestAction } = useAdminAction();

    useEffect(() => {
        setSections(settings.sections as Record<string, SectionStatus>);
        setMaintenance(settings.maintenance);
    }, [settings]);

    const handleSectionChange = (key: string, status: SectionStatus) => {
        setSections(prev => ({ ...prev, [key]: status }));
    };

    const handleSave = () => {
        requestAction(
            'Save Site Settings',
            'Are you sure you want to push these visibility and maintenance settings live?',
            {
                execute: async () => {
                    await settingsApi.update({ sections, maintenance });
                    fetchSettings();
                },
                successMessage: 'Settings saved & pushed live.'
            },
            'info',
            'Save & Push Live'
        );
    };

    // Preview section order matching Home.tsx
    const previewOrder = ['stories', 'community', 'events', 'gallery', 'reviews', 'shop', 'contact'];

    return (
        <div className="space-y-8">
            {ToastComponent}

            <header className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Layers className="text-alpine-glacier" size={28} />
                        <h1 className="text-3xl font-bold font-serif tracking-wide text-gradient-glacier glow-text">Section Control</h1>
                    </div>
                    <p className="text-white/50 text-sm">Toggle section visibility, maintenance mode & preview changes live</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowPreview(prev => !prev)}
                        className={`py-2.5 px-5 flex items-center gap-2 font-bold rounded-xl transition-all ${showPreview ? 'bg-alpine-glacier/20 text-alpine-glacier border border-alpine-glacier/30' : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'}`}
                    >
                        {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
                        <span>{showPreview ? 'Hide' : 'Preview'}</span>
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="py-2.5 px-5 flex items-center gap-2 bg-alpine-glacier text-alpine-navy font-bold rounded-xl btn-premium"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        <span>Save & Push Live</span>
                    </button>
                </div>
            </header>

            <div className={`${showPreview ? 'flex gap-8' : ''}`}>
                {/* Left: Controls */}
                <div className={`${showPreview ? 'w-1/2' : 'w-full'} space-y-8`}>
                    {/* Section Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(SECTION_META).map(([key, meta], i) => {
                            const status = sections[key] as SectionStatus || 'visible';
                            const style = STATUS_STYLES[status];
                            return (
                                <motion.div
                                    key={key}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="premium-card rounded-2xl p-5 space-y-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${meta.color} text-white shadow-lg`}>
                                                {meta.icon}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-sm">{meta.label}</h3>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${style.dot} ${status === 'visible' ? 'animate-pulse' : ''}`} />
                                                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">{style.label}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Three-state segmented control */}
                                    <div className="flex rounded-xl overflow-hidden border border-white/10 bg-white/[0.03]">
                                        {STATUSES.map(s => {
                                            const st = STATUS_STYLES[s];
                                            const isActive = status === s;
                                            return (
                                                <button
                                                    key={s}
                                                    onClick={() => handleSectionChange(key, s)}
                                                    className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-wider transition-all ${isActive ? `${st.bg} border ${st.bg}` : 'text-white/30 hover:text-white/60 hover:bg-white/5'}`}
                                                >
                                                    {st.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Maintenance Mode Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="premium-card rounded-2xl p-6 space-y-5"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl ${maintenance.enabled ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-white/10'} text-white shadow-lg transition-colors`}>
                                    <Wrench size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">Maintenance Mode</h3>
                                    <p className="text-xs text-white/40">Display a site-wide maintenance banner</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setMaintenance(m => ({ ...m, enabled: !m.enabled }))}
                                className={`relative w-14 h-7 rounded-full transition-all ${maintenance.enabled ? 'bg-amber-500' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg transition-all ${maintenance.enabled ? 'left-8' : 'left-1'}`} />
                            </button>
                        </div>

                        {maintenance.enabled && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-4"
                            >
                                <textarea
                                    placeholder="Maintenance message shown to users..."
                                    value={maintenance.message}
                                    onChange={e => setMaintenance(m => ({ ...m, message: e.target.value }))}
                                    rows={2}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none text-sm"
                                />
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={maintenance.allowAdminAccess}
                                        onChange={e => setMaintenance(m => ({ ...m, allowAdminAccess: e.target.checked }))}
                                        className="w-4 h-4 rounded border-white/20 bg-white/5 accent-alpine-glacier"
                                    />
                                    <div className="flex items-center gap-2">
                                        <Shield size={14} className="text-alpine-glacier/60" />
                                        <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">Allow admins to browse normally during maintenance</span>
                                    </div>
                                </label>
                            </motion.div>
                        )}
                    </motion.div>
                </div>

                {/* Right: Live Preview */}
                {showPreview && (
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: 'spring', damping: 20 }}
                        className="w-1/2 border-l border-white/10 pl-8"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                            <span className="text-[11px] font-mono text-emerald-400/80 tracking-widest uppercase">Live Preview — Home Page</span>
                        </div>

                        {/* Mini home page mockup */}
                        <div className="rounded-2xl overflow-hidden border border-white/10 bg-black">
                            {/* Mini navbar */}
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-white/[0.02]">
                                <div className="w-16 h-3 rounded bg-white/10" />
                                <div className="flex gap-2">
                                    {Object.entries(SECTION_META).filter(([key]) => ['stories', 'events', 'gallery', 'community'].includes(key)).map(([key, meta]) => {
                                        const status = sections[key] as SectionStatus || 'visible';
                                        return (
                                            <div key={key} className={`flex items-center gap-1 px-2 py-1 rounded text-[8px] font-bold uppercase tracking-wider transition-all ${
                                                status === 'hidden' ? 'opacity-0 w-0 px-0 overflow-hidden' :
                                                status === 'coming_soon' ? 'text-amber-400/60' : 'text-white/40'
                                            }`}>
                                                {meta.label}
                                                {status === 'coming_soon' && <Clock size={6} className="text-amber-400" />}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="w-6 h-3 rounded bg-white/10" />
                            </div>

                            {/* Maintenance banner preview */}
                            {maintenance.enabled && (
                                <div className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-orange-500 flex items-center gap-2">
                                    <Wrench size={8} className="text-white/80" />
                                    <span className="text-[7px] text-white font-medium truncate">{maintenance.message || 'Under maintenance'}</span>
                                </div>
                            )}

                            {/* Hero placeholder */}
                            <div className="h-20 bg-gradient-to-b from-white/[0.03] to-transparent flex items-center justify-center">
                                <div className="text-[8px] font-mono text-white/15 uppercase tracking-widest">Hero Section</div>
                            </div>

                            {/* Section blocks */}
                            <div className="px-3 pb-3 space-y-1.5">
                                {previewOrder.map(key => {
                                    const meta = SECTION_META[key];
                                    if (!meta) return null;
                                    const status = sections[key] as SectionStatus || 'visible';

                                    if (status === 'hidden') return null;

                                    return (
                                        <motion.div
                                            key={key}
                                            layout
                                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
                                                status === 'coming_soon'
                                                    ? 'bg-amber-500/10 border border-amber-500/20 border-dashed'
                                                    : 'bg-white/[0.03] border border-white/5'
                                            }`}
                                        >
                                            <div className={`p-1 rounded-lg bg-gradient-to-br ${meta.color} text-white ${status === 'coming_soon' ? 'opacity-40' : ''}`}>
                                                {React.cloneElement(meta.icon as React.ReactElement<any>, { size: 10 })}
                                            </div>
                                            <span className={`text-[9px] font-bold uppercase tracking-widest ${
                                                status === 'coming_soon' ? 'text-amber-400/60' : 'text-white/40'
                                            }`}>
                                                {meta.label}
                                            </span>
                                            {status === 'coming_soon' && (
                                                <span className="ml-auto text-[7px] font-mono text-amber-400/50 uppercase">Coming Soon</span>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};
