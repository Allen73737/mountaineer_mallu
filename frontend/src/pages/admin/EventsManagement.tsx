import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Plus, Edit2, Trash2, Save, Loader2, Users, MapPin, Maximize2, X, Minimize2, Eye, EyeOff, Clock, Mountain, AlertTriangle, ArrowRight, UploadCloud } from 'lucide-react';
import { eventsApi } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { useAdminAction } from '../../store/useAdminAction';
import { Image as ImageIcon } from 'lucide-react';

/* ─── Inline Live Preview Card (mirrors Events.tsx public page timeline card) ─── */
const EventPreviewCard = ({ form, imageFile }: { form: any; imageFile: File | null }) => {
    const previewUrl = useMemo(() => {
        if (imageFile) return URL.createObjectURL(imageFile);
        return form.image || '';
    }, [imageFile, form.image]);

    const slotsLeft = Number(form.totalSlots) || 0;

    return (
        <div className="w-full h-full flex flex-col">
            {/* Preview Header */}
            <div className="flex items-center gap-2 mb-4 px-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                <span className="text-[11px] font-mono text-emerald-400/80 tracking-widest uppercase">Live Preview</span>
                <div className="flex-1 border-t border-white/5 ml-2" />
            </div>

            {/* Simulated Public Page */}
            <div className="flex-1 rounded-2xl overflow-hidden bg-alpine-snow dark:bg-black p-6 border border-white/10">
                <p className="text-[10px] font-mono text-white/20 tracking-widest uppercase mb-4">↓ How it appears on the Events page</p>

                {/* Timeline card — matching Events.tsx lines 107-187 */}
                <div className="relative group">
                    {/* Timeline marker */}
                    <div className="absolute -left-[14px] top-6 w-4 h-4 rounded-full bg-alpine-blue dark:bg-alpine-sunrise border-4 border-alpine-snow dark:border-black z-10 shadow-xl" />

                    <div className="flex flex-col gap-6 bg-white/50 dark:bg-black/30 glass-dark rounded-3xl p-6 border border-black/5 dark:border-white/10 shadow-2xl ml-4">
                        {/* Image */}
                        <div className="w-full aspect-video rounded-2xl overflow-hidden relative">
                            {previewUrl ? (
                                <img src={previewUrl} className="w-full h-full object-cover filter brightness-75" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-alpine-navy/80 to-black flex items-center justify-center">
                                    <ImageIcon size={48} className="text-white/10" />
                                </div>
                            )}
                            {form.type && (
                                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-widest border border-white/20">
                                    {form.type}
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="flex flex-col">
                            <div className="flex flex-wrap items-center gap-4 mb-4 text-xs font-semibold tracking-wider text-alpine-navy/80 dark:text-alpine-snow/80 uppercase">
                                {form.date && (
                                    <span className="flex items-center gap-1.5">
                                        <CalendarIcon size={14} className="text-alpine-blue dark:text-alpine-sunrise" /> {form.date}
                                    </span>
                                )}
                                {form.time && (
                                    <span className="flex items-center gap-1.5">
                                        <Clock size={14} className="text-alpine-blue dark:text-alpine-sunrise" /> {form.time}
                                    </span>
                                )}
                                {form.location && (
                                    <span className="flex items-center gap-1.5">
                                        <MapPin size={14} className="text-alpine-forest dark:text-alpine-glacier" /> {form.location}
                                    </span>
                                )}
                            </div>

                            <h2 className="text-2xl xl:text-3xl font-serif text-alpine-navy dark:text-alpine-snow mb-4 drop-shadow-sm">
                                {form.title || <span className="text-white/20 italic">Untitled Event</span>}
                            </h2>

                            <div className="flex items-center gap-6 mb-6">
                                <div className="flex items-center gap-2 text-alpine-navy/60 dark:text-alpine-snow/60">
                                    <Mountain size={16} className={form.difficulty === 'Expert' ? 'text-red-500' : 'text-alpine-navy/40 dark:text-alpine-snow/40'} />
                                    <span className="font-medium text-sm border-b border-dashed border-black/20 dark:border-white/20 pb-0.5">
                                        {form.difficulty} Route
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-alpine-navy/60 dark:text-alpine-snow/60">
                                    <AlertTriangle size={16} className="text-alpine-sunrise" />
                                    <span className="font-medium text-sm border-b border-dashed border-black/20 dark:border-white/20 pb-0.5">
                                        {slotsLeft} Slots Left
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <span className="px-6 py-3 bg-alpine-blue dark:bg-alpine-sunrise text-white font-medium rounded-full text-sm text-center">
                                    Apply for Roster
                                </span>
                                <span className="px-6 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-alpine-navy dark:text-alpine-snow font-medium rounded-full text-sm flex items-center gap-2">
                                    View Briefing <ArrowRight size={14} />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ─── Events Management Page ─── */
export const EventsManagement = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [isModalFullscreen, setIsModalFullscreen] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [form, setForm] = useState({ title: '', date: '', time: '', location: '', difficulty: 'Beginner', totalSlots: '10', type: '', description: '', image: '', whatsappGroupUrl: '', ticketUrl: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const { showToast, ToastComponent } = useToast();
    const { requestAction } = useAdminAction();

    useEffect(() => { fetchEvents(); }, []);

    const fetchEvents = async () => {
        try { const data = await eventsApi.list(1, 50); setEvents(data.events); }
        catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const openCreate = () => {
        setEditing(null);
        setForm({ title: '', date: '', time: '', location: '', difficulty: 'Beginner', totalSlots: '10', type: '', description: '', image: '', whatsappGroupUrl: '', ticketUrl: '' });
        setImageFile(null);
        setShowPreview(false);
        setShowForm(true);
    };

    const openEdit = (evt: any) => {
        setEditing(evt);
        setForm({ title: evt.title, date: evt.date, time: evt.time, location: evt.location, difficulty: evt.difficulty, totalSlots: String(evt.totalSlots), type: evt.type, description: evt.description || '', image: evt.image, whatsappGroupUrl: evt.whatsappGroupUrl || '', ticketUrl: evt.ticketUrl || '' });
        setImageFile(null);
        setShowPreview(false);
        setShowForm(true);
    };

    const handleSave = () => {
        const isUpdate = !!editing;
        const actionName = isUpdate ? 'Update Event' : 'Create Event';
        const actionDesc = isUpdate ? 'Are you sure you want to update this event?' : 'Are you sure you want to create this event?';

        requestAction(
            actionName,
            actionDesc,
            {
                execute: async () => {
                    const formData = new FormData();
                    Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });
                    if (imageFile) formData.append('image', imageFile);
                    if (isUpdate) await eventsApi.update(editing._id, formData);
                    else await eventsApi.create(formData);
                    fetchEvents();
                },
                optimistic: () => setShowForm(false),
                successMessage: `Event ${isUpdate ? 'updated' : 'created'}.`
            },
            'info',
            'Save'
        );
    };

    const handleDelete = (id: string) => {
        const evt = events.find(e => e._id === id);
        if (!evt) return;

        requestAction(
            'Delete Event',
            `Are you sure you want to permanently delete "${evt.title}" and all its registrations?`,
            {
                execute: async () => { await eventsApi.delete(id); fetchEvents(); },
                optimistic: () => setEvents(prev => prev.filter(e => e._id !== id)),
                revert: () => setEvents(prev => [...prev, evt]),
                successMessage: 'Event deleted.'
            },
            'danger',
            'Delete'
        );
    };

    const togglePreview = () => {
        setShowPreview(prev => {
            const next = !prev;
            if (next) setIsModalFullscreen(true);
            return next;
        });
    };

    return (
        <div className="space-y-8">
            {ToastComponent}

            <header className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2"><CalendarIcon className="text-alpine-glacier" size={28} /><h1 className="text-3xl font-bold font-serif tracking-wide text-gradient-glacier glow-text">Events Management</h1></div>
                    <p className="text-white/50 text-sm">Create and manage expeditions</p>
                </div>
                <button onClick={openCreate} className="py-2.5 px-5 flex items-center gap-2 bg-alpine-glacier text-alpine-navy font-bold rounded-xl btn-premium"><Plus size={18} /><span>New Event</span></button>
            </header>

            <div className="rounded-2xl overflow-hidden premium-card">
                <table className="w-full text-left border-collapse">
                    <thead><tr className="border-b border-white/10 bg-white/5 text-sm font-medium text-white/50 tracking-wider">
                        <th className="p-5 uppercase">Event</th><th className="p-5 uppercase">Date</th><th className="p-5 uppercase">Location</th><th className="p-5 uppercase">Difficulty</th><th className="p-5 uppercase">Roster</th><th className="p-5 uppercase text-right">Actions</th>
                    </tr></thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? [1,2,3].map(i => <TableRowSkeleton key={i} />) : events.map(evt => (
                            <tr key={evt._id} className="hover:bg-white/5 transition-colors">
                                <td className="p-5"><div className="flex items-center gap-4"><div className="relative group cursor-pointer" onClick={() => setSelectedImage(evt.image)}><img src={evt.image} className="w-12 h-12 rounded-lg object-cover" /><div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"><Maximize2 size={12} className="text-white" /></div></div><div><span className="font-bold text-white">{evt.title}</span><p className="text-xs text-white/40">{evt.type}</p></div></div></td>
                                <td className="p-5 text-white/70 text-sm">{evt.date} {evt.time}</td>
                                <td className="p-5 text-white/60 text-sm flex items-center gap-1"><MapPin size={14} /> {evt.location}</td>
                                <td className="p-5"><span className={`px-3 py-1 rounded-full text-xs font-bold ${evt.difficulty === 'Expert' ? 'bg-red-500/20 text-red-400' : evt.difficulty === 'Advanced' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{evt.difficulty}</span></td>
                                <td className="p-5"><span className="flex items-center gap-1 text-white/60 text-sm"><Users size={14} /> {evt.participants?.length || 0}/{evt.totalSlots}</span></td>
                                <td className="p-5 text-right"><div className="flex justify-end gap-2">
                                    <button onClick={() => openEdit(evt)} className="p-2 text-alpine-glacier hover:bg-alpine-glacier/10 rounded-lg transition-colors"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(evt._id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                </div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && events.length === 0 && <div className="p-12 text-center text-white/30 font-mono text-sm">[ NO_EXPEDITIONS ]</div>}
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-y-0 right-0 left-[var(--sidebar-width,0px)] z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-all duration-300" onClick={() => setShowForm(false)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className={`premium-card p-8 overflow-y-auto transition-all duration-300 ${isModalFullscreen ? 'w-full h-full max-w-none max-h-none min-h-0 relative rounded-[2rem]' : 'relative max-w-lg w-full max-h-[90vh] rounded-3xl'}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                            {/* Modal Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white font-serif">{editing ? 'Edit Event' : 'New Event'}</h2>
                                <div className="flex items-center gap-2">
                                    <button type="button" onClick={(e) => { e.stopPropagation(); togglePreview(); }} className={`transition-colors rounded-lg p-2 flex items-center gap-2 text-sm font-medium ${showPreview ? 'bg-alpine-glacier/20 text-alpine-glacier border border-alpine-glacier/30' : 'text-white/50 hover:text-white bg-white/5 hover:bg-white/10'}`} title="Toggle Live Preview">
                                        {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
                                        <span className="hidden sm:inline">{showPreview ? 'Hide Preview' : 'Live Preview'}</span>
                                    </button>
                                    <button type="button" onClick={(e) => { e.stopPropagation(); setIsModalFullscreen(prev => !prev); }} className="text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-lg p-2" title="Toggle Fullscreen">
                                        {isModalFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                                    </button>
                                    <button type="button" onClick={() => setShowForm(false)} className="text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-lg p-2" title="Close Modal">
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body — split when preview is active */}
                            <div className={`${showPreview ? 'flex gap-8 h-[calc(100%-8rem)]' : ''}`}>
                                {/* Editor Form */}
                                <div className={`${showPreview ? 'w-1/2 overflow-y-auto pr-4 custom-scrollbar' : 'w-full'}`}>
                                    <div className="space-y-4">
                                        <input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input placeholder="Date (e.g. Dec 15, 2025)" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50" />
                                            <input placeholder="Time (e.g. 08:00 AM)" value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50" />
                                        </div>
                                        <input placeholder="Location" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50" />
                                        <div className="grid grid-cols-3 gap-4">
                                            <select value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50">
                                                <option value="Beginner" className="bg-[#0A0D14] text-white">Beginner</option>
                                                <option value="Intermediate" className="bg-[#0A0D14] text-white">Intermediate</option>
                                                <option value="Advanced" className="bg-[#0A0D14] text-white">Advanced</option>
                                                <option value="Expert" className="bg-[#0A0D14] text-white">Expert</option>
                                            </select>
                                            <input placeholder="Total Slots" type="number" value={form.totalSlots} onChange={e => setForm({...form, totalSlots: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50" />
                                            <input placeholder="Type" value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50" />
                                        </div>
                                        <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={showPreview ? 4 : 3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50 resize-none" />
                                        <input placeholder="WhatsApp Group Link (Optional)" value={form.whatsappGroupUrl} onChange={e => setForm({...form, whatsappGroupUrl: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50" />
                                        <input placeholder="Ticket URL (Optional)" value={form.ticketUrl} onChange={e => setForm({...form, ticketUrl: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50" />
                                        <div className="space-y-1.5 mt-2">
                                            <label className="text-xs font-medium text-white/60">Event Cover Image</label>
                                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                                <div className="w-full sm:flex-1 relative">
                                                    <input
                                                        type="url"
                                                        value={form.image || ''}
                                                        onChange={e => setForm({ ...form, image: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50"
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
                                                    <div className={`w-full bg-white/5 border ${imageFile ? 'border-alpine-glacier/50 text-alpine-glacier' : 'border-white/10 text-white/60'} group-hover:border-alpine-glacier/50 group-hover:text-alpine-glacier rounded-xl px-4 py-3 flex items-center justify-center gap-2 transition-all`}>
                                                        <UploadCloud size={16} />
                                                        <span className="text-sm font-medium truncate">{imageFile ? imageFile.name : 'Upload from Device'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-6">
                                        <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all">Cancel</button>
                                        <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-xl bg-alpine-glacier text-alpine-navy font-bold btn-premium flex items-center justify-center gap-2">{saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={16} /> Save</>}</button>
                                    </div>
                                </div>

                                {/* Live Preview Panel */}
                                {showPreview && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 40 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ type: 'spring', damping: 20 }}
                                        className="w-1/2 border-l border-white/10 pl-8 overflow-y-auto custom-scrollbar"
                                    >
                                        <EventPreviewCard form={form} imageFile={imageFile} />
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Fullscreen Image Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
                        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        className="fixed inset-y-0 right-0 left-[var(--sidebar-width,0px)] z-[100] flex items-center justify-center bg-black/90 p-4 md:p-12 cursor-pointer transition-all duration-300"
                        onClick={() => setSelectedImage(null)}
                    >
                        <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-4 backdrop-blur-lg" onClick={() => setSelectedImage(null)}>
                            <X size={32} />
                        </button>

                        <motion.div
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 20 }}
                            className="relative w-full max-w-6xl aspect-video rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.1)] cursor-default flex items-center justify-center bg-black"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                            <img src={selectedImage} className="max-w-full max-h-full object-contain" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
