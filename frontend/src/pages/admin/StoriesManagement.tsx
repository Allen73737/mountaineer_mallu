import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Edit2, Trash2, Save, X, Loader2, Image as ImageIcon, Maximize2, Minimize2, Eye, EyeOff, MapPin, Calendar, User, ArrowLeft, UploadCloud, Wand2 } from 'lucide-react';
import { storiesApi, aiApi } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { LanguageInput } from '../../components/ui/LanguageInput';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { useAdminAction } from '../../store/useAdminAction';
import { CheckCircle, XCircle, Type, SplitSquareVertical } from 'lucide-react';
import { UnsplashSearchPicker } from '../../components/ui/UnsplashSearchPicker';

/* ─── Full Article Preview (editorial reading view) ─── */
const StoryPreviewFull = ({ form, imageFile, unsplashUrl }: { form: any; imageFile: File | null; unsplashUrl?: string | null }) => {
    const previewUrl = useMemo(() => {
        if (imageFile) return URL.createObjectURL(imageFile);
        if (unsplashUrl) return unsplashUrl;
        return form.image || '';
    }, [imageFile, form.image, unsplashUrl]);

    // Split content into paragraphs for rendering
    const paragraphs = (form.content || '').split(/\n\n+/).filter((p: string) => p.trim());

    return (
        <div className="w-full h-full flex flex-col">
            {/* Preview Header */}
            <div className="flex items-center gap-2 mb-4 px-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                <span className="text-[11px] font-mono text-emerald-400/80 tracking-widest uppercase">Live Preview — Full Article</span>
                <div className="flex-1 border-t border-white/5 ml-2" />
            </div>

            {/* Simulated Full Story Page */}
            <div className="flex-1 rounded-2xl overflow-y-auto bg-black border border-white/10 custom-scrollbar">
                {/* Hero Image */}
                <div className="relative w-full aspect-[21/9] overflow-hidden">
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            className="w-full h-full object-cover filter brightness-60"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-alpine-navy/80 to-black flex items-center justify-center">
                            <ImageIcon size={64} className="text-white/10" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                    {/* Back button mock */}
                    <div className="absolute top-6 left-6 flex items-center gap-2 text-white/50 text-sm">
                        <ArrowLeft size={16} />
                        <span className="font-medium tracking-wide">Back to Chronicles</span>
                    </div>

                    {/* Hero Text Overlay */}
                    <div className="absolute bottom-0 inset-x-0 p-8 md:p-12">
                        <div className="flex flex-wrap gap-3 mb-4">
                            {form.region && (
                                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-alpine-glacier bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                    <MapPin size={12} /> {form.region}
                                </span>
                            )}
                            {form.date && (
                                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-alpine-sunrise bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                    <Calendar size={12} /> {form.date}
                                </span>
                            )}
                        </div>
                        <h1 className="font-serif text-white text-3xl xl:text-5xl mb-4 drop-shadow-lg leading-tight">
                            {form.title || <span className="text-white/20 italic">Untitled Story</span>}
                        </h1>
                        <div className="flex items-center gap-3 text-white/50">
                            <div className="w-8 h-8 rounded-full bg-alpine-glacier/30 flex items-center justify-center">
                                <User size={14} className="text-alpine-glacier" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white/80">{form.author || <span className="italic text-white/20">Author</span>}</p>
                                <p className="text-xs text-white/40">Mountaineer Mallu · Field Report</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Article Body */}
                <div className="max-w-3xl mx-auto px-8 py-12">
                    {/* Excerpt / Lead */}
                    {form.excerpt && (
                        <p className="text-xl font-light text-white/70 leading-relaxed mb-10 border-l-2 border-alpine-glacier/40 pl-6 italic">
                            {form.excerpt}
                        </p>
                    )}

                    {/* Content Paragraphs */}
                    {paragraphs.length > 0 ? (
                        <div className="space-y-6">
                            {paragraphs.map((p: string, i: number) => (
                                <p key={i} className="text-base text-white/60 leading-[1.9] font-light tracking-wide">
                                    {/* First paragraph gets a drop cap */}
                                    {i === 0 && p.length > 1 ? (
                                        <>
                                            <span className="float-left text-6xl font-serif font-bold text-alpine-glacier mr-3 mt-1 leading-[0.8]">{p[0]}</span>
                                            {p.slice(1)}
                                        </>
                                    ) : p}
                                </p>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed border-white/10 rounded-2xl">
                            <BookOpen size={32} className="text-white/10 mx-auto mb-3" />
                            <p className="text-white/20 font-mono text-sm">Write your story content to see it here...</p>
                            <p className="text-white/10 text-xs mt-1">Use double line breaks to create paragraphs</p>
                        </div>
                    )}

                    {/* Image placement within article */}
                    {previewUrl && paragraphs.length > 1 && (
                        <div className="my-10 rounded-2xl overflow-hidden border border-white/10">
                            <img src={previewUrl} className="w-full object-cover max-h-[400px]" />
                            <div className="px-4 py-3 bg-white/[0.03] border-t border-white/5">
                                <p className="text-xs text-white/30 italic">{form.title || 'Story image'} — {form.region || 'Location'}</p>
                            </div>
                        </div>
                    )}

                    {/* Article Footer */}
                    <div className="mt-16 pt-8 border-t border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-alpine-glacier/20 flex items-center justify-center">
                                <User size={16} className="text-alpine-glacier" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white/80">{form.author || 'Author'}</p>
                                <p className="text-xs text-white/30">Mountaineer Mallu Community</p>
                            </div>
                        </div>
                        <span className="text-xs text-white/20 font-mono uppercase tracking-widest">{form.date || 'Date'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ─── Stories Management Page ─── */
export const StoriesManagement = () => {
    const [stories, setStories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [isModalFullscreen, setIsModalFullscreen] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [form, setForm] = useState({ title: '', excerpt: '', content: '', author: '', date: '', region: '', image: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [editorMode, setEditorMode] = useState<'split' | 'wysiwyg'>('wysiwyg');
    const contentEditableRef = React.useRef<HTMLDivElement>(null);
    
    // AI Image Suggestion State
    const [unsplashUrl, setUnsplashUrl] = useState<string | null>(null);
    const [suggestedImages, setSuggestedImages] = useState<any[]>([]);
    const [imagesLoading, setImagesLoading] = useState(false);
    const [imageModalOpen, setImageModalOpen] = useState(false);

    const { showToast, ToastComponent } = useToast();
    const { requestAction } = useAdminAction();

    const handleSuggestImages = async () => {
        if (!form.title) {
            showToast('Please enter a story title to get image suggestions.', 'error');
            return;
        }
        setImagesLoading(true);
        try {
            const context = { title: form.title, region: form.region, description: form.excerpt, content: (form.content || '').substring(0, 800) };
            const data = await aiApi.suggestImages(context);
            setSuggestedImages(data.images);
            setImageModalOpen(true);
        } catch (err: any) {
            showToast(err.message || 'Failed to fetch image suggestions.', 'error');
        } finally {
            setImagesLoading(false);
        }
    };

    useEffect(() => { fetchStories(); }, []);

    const fetchStories = async () => {
        try {
            const data = await storiesApi.list(1, 50);
            setStories(data.stories);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const openCreate = () => {
        setEditing(null);
        setForm({ title: '', excerpt: '', content: '', author: '', date: '', region: '', image: '' });
        setImageFile(null);
        setUnsplashUrl(null);
        setShowPreview(false);
        setShowForm(true);
    };

    const openEdit = (story: any) => {
        setEditing(story);
        setForm({ title: story.title, excerpt: story.excerpt, content: story.content || '', author: story.author, date: story.date, region: story.region, image: story.image });
        setImageFile(null);
        setUnsplashUrl(null);
        setShowPreview(false);
        setShowForm(true);
    };

    const handleSave = () => {
        const isUpdate = !!editing;
        const actionName = isUpdate ? 'Update Story' : 'Create Story';
        const actionDesc = isUpdate ? 'Are you sure you want to update this story?' : 'Are you sure you want to create this story?';

        requestAction(
            actionName,
            actionDesc,
            {
                execute: async () => {
                    const formData = new FormData();
                    Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v as string); });
                    if (imageFile) formData.append('image', imageFile);
                    else if (unsplashUrl) formData.append('unsplashUrl', unsplashUrl);

                    if (isUpdate) await storiesApi.update(editing._id, formData);
                    else await storiesApi.create(formData);
                    fetchStories();
                },
                optimistic: () => setShowForm(false),
                successMessage: `Story ${isUpdate ? 'updated' : 'created'}.`
            },
            'info',
            'Save'
        );
    };

    const handleUpdateStatus = (id: string, status: 'approved' | 'rejected') => {
        const story = stories.find(s => s._id === id);
        if (!story) return;

        requestAction(
            `${status === 'approved' ? 'Approve' : 'Reject'} Story`,
            `Are you sure you want to ${status} this story?`,
            {
                execute: async () => { await storiesApi.updateStatus(id, status); },
                optimistic: () => setStories(prev => prev.map(s => s._id === id ? { ...s, status } : s)),
                revert: () => setStories(prev => prev.map(s => s._id === id ? { ...s, status: story.status } : s)),
                successMessage: `Story ${status}.`
            },
            status === 'approved' ? 'info' : 'warning',
            status === 'approved' ? 'Approve' : 'Reject'
        );
    };

    const formatDoc = (cmd: string, value: string = '') => {
        document.execCommand(cmd, false, value);
        if (contentEditableRef.current) {
            setForm({...form, content: contentEditableRef.current.innerHTML});
        }
    };

    const handleDelete = (id: string) => {
        const story = stories.find(s => s._id === id);
        if (!story) return;

        requestAction(
            'Delete Story',
            `Are you sure you want to permanently delete "${story.title}"?`,
            {
                execute: async () => { await storiesApi.delete(id); fetchStories(); },
                optimistic: () => setStories(prev => prev.filter(s => s._id !== id)),
                revert: () => setStories(prev => [...prev, story]),
                successMessage: 'Story deleted.'
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
                    <div className="flex items-center gap-3 mb-2"><BookOpen className="text-alpine-glacier" size={28} /><h1 className="text-3xl font-bold font-serif tracking-wide text-gradient-glacier glow-text">Stories Management</h1></div>
                    <p className="text-white/50 text-sm">Create, edit, and manage expedition chronicles</p>
                </div>
                <button onClick={openCreate} className="py-2.5 px-5 flex items-center gap-2 bg-alpine-glacier text-alpine-navy font-bold rounded-xl btn-premium">
                    <Plus size={18} /><span>New Story</span>
                </button>
            </header>

            <div className="rounded-2xl overflow-hidden premium-card">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/5 text-sm font-medium text-white/50 tracking-wider">
                            <th className="p-5 uppercase">Story</th>
                            <th className="p-5 uppercase">Author</th>
                            <th className="p-5 uppercase">Region</th>
                            <th className="p-5 uppercase">Date</th>
                            <th className="p-5 uppercase">Status</th>
                            <th className="p-5 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? [1,2,3].map(i => <TableRowSkeleton key={i} />) :
                        stories.map(story => (
                            <tr key={story._id} className="hover:bg-white/5 transition-colors">
                                <td className="p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="relative group cursor-pointer" onClick={() => setSelectedImage(story.image)}>
                                            <img src={story.image} className="w-12 h-12 rounded-lg object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                                <Maximize2 size={12} className="text-white" />
                                            </div>
                                        </div>
                                        <span className="font-bold text-white tracking-wide">{story.title}</span>
                                    </div>
                                </td>
                                <td className="p-5 text-white/70">{story.author}</td>
                                <td className="p-5"><span className="px-3 py-1 rounded-full bg-alpine-glacier/20 text-alpine-glacier text-xs font-bold">{story.region}</span></td>
                                <td className="p-5 text-white/50 text-sm">{story.date}</td>
                                <td className="p-5">
                                    {story.status === 'approved' ? <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Approved</span> :
                                     story.status === 'rejected' ? <span className="text-red-400 text-xs font-bold uppercase tracking-wider">Rejected</span> :
                                     <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Pending</span>}
                                </td>
                                <td className="p-5 text-right">
                                    <div className="flex justify-end gap-2 items-center">
                                        {story.status === 'pending' && (
                                            <>
                                                <button onClick={() => handleUpdateStatus(story._id, 'approved')} className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors" title="Approve"><CheckCircle size={16} /></button>
                                                <button onClick={() => handleUpdateStatus(story._id, 'rejected')} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Reject"><XCircle size={16} /></button>
                                            </>
                                        )}
                                        <button onClick={() => openEdit(story)} className="p-2 text-alpine-glacier hover:bg-alpine-glacier/10 rounded-lg transition-colors"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(story._id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && stories.length === 0 && <div className="p-12 text-center text-white/30 font-mono text-sm">[ NO_CHRONICLES ]</div>}
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-y-0 right-0 left-[var(--sidebar-width,0px)] z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-all duration-300" onClick={() => setShowForm(false)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className={`premium-card p-8 overflow-hidden transition-all duration-300 ${isModalFullscreen ? 'w-full h-full max-w-none max-h-none min-h-0 relative rounded-[2rem]' : 'relative max-w-lg w-full max-h-[90vh] rounded-3xl overflow-y-auto'}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                            {/* Modal Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white font-serif">{editing ? 'Edit Story' : 'New Story'}</h2>
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
                            <div className={`${showPreview ? 'flex gap-8 h-[calc(100%-5rem)]' : ''}`}>
                                {/* Editor Form */}
                                <div className={`${showPreview ? 'w-1/2 overflow-y-auto pr-4 custom-scrollbar' : 'w-full'}`}>
                                    <div className="space-y-4">
                                        <LanguageInput
                                            value={form.title}
                                            onChange={val => setForm({...form, title: val})}
                                            placeholder="Title"
                                            className="mb-4"
                                        />
                                        <LanguageInput
                                            value={form.excerpt}
                                            onChange={val => setForm({...form, excerpt: val})}
                                            placeholder="Excerpt — a short teaser shown on the stories listing card"
                                            isTextarea={true}
                                            rows={3}
                                            className="mb-4"
                                        />
                                        
                                        {/* Full Content Editor */}
                                        <div className="bg-[#11141A] rounded-2xl border border-white/5 overflow-hidden">
                                            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-black/20">
                                                <label className="text-white/50 text-xs uppercase tracking-wider font-bold">Story Content</label>
                                                <div className="flex bg-white/5 rounded-lg p-1">
                                                    <button onClick={() => setEditorMode('wysiwyg')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${editorMode === 'wysiwyg' ? 'bg-alpine-glacier text-[#0A0D14]' : 'text-white/50 hover:text-white'}`}><Type size={12}/> Rich Text</button>
                                                    <button onClick={() => setEditorMode('split')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${editorMode === 'split' ? 'bg-alpine-glacier text-[#0A0D14]' : 'text-white/50 hover:text-white'}`}><SplitSquareVertical size={12}/> Markdown</button>
                                                </div>
                                            </div>

                                            {editorMode === 'wysiwyg' && (
                                                <div className="flex items-center gap-2 p-2 border-b border-white/5 bg-black/20">
                                                    <button type="button" onClick={() => formatDoc('bold')} className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10" title="Bold"><b>B</b></button>
                                                    <button type="button" onClick={() => formatDoc('italic')} className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10" title="Italic"><i>I</i></button>
                                                    <div className="w-px h-4 bg-white/10 mx-1" />
                                                    <button type="button" onClick={() => formatDoc('formatBlock', 'H2')} className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 text-xs font-bold">H2</button>
                                                    <button type="button" onClick={() => formatDoc('formatBlock', 'H3')} className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 text-xs font-bold">H3</button>
                                                    <div className="w-px h-4 bg-white/10 mx-1" />
                                                    <button type="button" onClick={() => formatDoc('insertUnorderedList')} className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 text-xs font-bold">• List</button>
                                                </div>
                                            )}

                                            {editorMode === 'wysiwyg' ? (
                                                <div 
                                                    ref={contentEditableRef}
                                                    className="p-4 min-h-[200px] max-h-[400px] overflow-y-auto prose prose-invert max-w-none focus:outline-none custom-scrollbar"
                                                    contentEditable
                                                    onInput={(e) => setForm({...form, content: e.currentTarget.innerHTML})}
                                                    dangerouslySetInnerHTML={{ __html: form.content }}
                                                />
                                            ) : (
                                                <LanguageInput
                                                    value={form.content}
                                                    onChange={val => setForm({...form, content: val})}
                                                    placeholder="Write your full story here... Use double line breaks to create paragraphs."
                                                    isTextarea={true}
                                                    rows={showPreview ? 14 : 8}
                                                />
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <input placeholder="Author" value={form.author} onChange={e => setForm({...form, author: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50" />
                                            <input placeholder="Date (e.g. Oct 2025)" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50" />
                                        </div>
                                        <input placeholder="Region" value={form.region} onChange={e => setForm({...form, region: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50" />
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="block text-white/50 text-xs uppercase tracking-wider">Cover Image</label>
                                                <button
                                                    type="button"
                                                    onClick={handleSuggestImages}
                                                    disabled={imagesLoading}
                                                    className="flex items-center gap-1.5 text-alpine-glacier hover:text-white transition-colors text-xs font-medium"
                                                >
                                                    {imagesLoading ? <Loader2 className="animate-spin" size={14} /> : <Wand2 size={14} />}
                                                    AI Suggest
                                                </button>
                                            </div>
                                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                                <div className="w-full sm:flex-1 relative">
                                                    <input
                                                        type="url"
                                                        value={unsplashUrl || form.image || ''}
                                                        onChange={e => {
                                                            setUnsplashUrl(null);
                                                            setForm({ ...form, image: e.target.value });
                                                        }}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50"
                                                        placeholder="Enter image URL..."
                                                    />
                                                </div>
                                                <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest shrink-0">OR</div>
                                                <div className="w-full sm:flex-1 relative group">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={e => {
                                                            setImageFile(e.target.files?.[0] || null);
                                                            setUnsplashUrl(null);
                                                        }}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    />
                                                    <div className={`w-full bg-white/5 border ${imageFile ? 'border-alpine-glacier/50 text-alpine-glacier' : 'border-white/10 text-white/60'} group-hover:border-alpine-glacier/50 group-hover:text-alpine-glacier rounded-xl px-4 py-3 flex items-center justify-center gap-2 transition-all`}>
                                                        <UploadCloud size={16} />
                                                        <span className="text-sm font-medium truncate">{imageFile ? imageFile.name : 'Upload from Device'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {(unsplashUrl || form.image) && !imageFile && <img src={unsplashUrl || form.image} className="mt-2 h-20 rounded-lg object-cover" />}
                                            <div className="mt-4">
                                                <UnsplashSearchPicker 
                                                    placeholder="Or search Unsplash directly for a cover image..." 
                                                    onSelect={(url) => {
                                                        setUnsplashUrl(url);
                                                        setForm({ ...form, image: url });
                                                        setImageFile(null);
                                                    }} 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-6">
                                        <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all">Cancel</button>
                                        <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-xl bg-alpine-glacier text-alpine-navy font-bold btn-premium flex items-center justify-center gap-2">
                                            {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={16} /> Save</>}
                                        </button>
                                    </div>
                                </div>

                                {/* Live Preview Panel */}
                                {showPreview && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 40 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ type: 'spring', damping: 20 }}
                                        className="w-1/2 border-l border-white/10 pl-8 overflow-hidden"
                                    >
                                        <StoryPreviewFull form={form} imageFile={imageFile} unsplashUrl={unsplashUrl} />
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

            {/* AI Image Suggestion Modal */}
            <AnimatePresence>
                {imageModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#0A0D14] rounded-3xl w-full max-w-4xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-4 sm:p-6 border-b border-white/10 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg sm:text-xl font-serif text-white">AI Cover Suggestions</h3>
                                    <p className="text-xs sm:text-sm text-white/50">Images sourced from Unsplash based on your story.</p>
                                </div>
                                <button
                                    onClick={() => setImageModalOpen(false)}
                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {suggestedImages.map((img: any) => (
                                        <div 
                                            key={img.id} 
                                            className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer bg-black/5"
                                            onClick={() => {
                                                setUnsplashUrl(img.url);
                                                setImageFile(null);
                                                setImageModalOpen(false);
                                            }}
                                        >
                                            <img src={img.thumb} alt={img.altText} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                                <span className="text-white text-xs font-medium truncate">Photo by {img.authorName}</span>
                                                <div className="mt-2 text-alpine-glacier flex items-center gap-1 text-sm font-semibold">
                                                    <CheckCircle size={14} /> Select
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
