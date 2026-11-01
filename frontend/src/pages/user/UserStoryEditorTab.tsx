import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { storiesApi, aiApi } from '../../lib/api';
import { Upload, X, CheckCircle, SplitSquareVertical, Type, Send, Image as ImageIcon, Loader, Globe, Sparkles, Wand2, BookOpen, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { UnsplashSearchPicker } from '../../components/ui/UnsplashSearchPicker';

export const UserStoryEditorTab = () => {
    const { user } = useAuthStore();
    const [editorMode, setEditorMode] = useState<'split' | 'wysiwyg'>('wysiwyg');
    const [title, setTitle] = useState('');
    const [region, setRegion] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [writingLang, setWritingLang] = useState('en');
    const [aiDraft, setAiDraft] = useState<any>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiPanelOpen, setAiPanelOpen] = useState(false);
    const [aiNotes, setAiNotes] = useState('');
    
    // AI Image Suggestion State
    const [unsplashUrl, setUnsplashUrl] = useState<string | null>(null);
    const [suggestedImages, setSuggestedImages] = useState<any[]>([]);
    const [imagesLoading, setImagesLoading] = useState(false);
    const [imageModalOpen, setImageModalOpen] = useState(false);

    const contentEditableRef = useRef<HTMLDivElement>(null);
    const inlineImageRef = useRef<HTMLInputElement>(null);

    const handleInlineImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                // Focus editor before inserting to maintain cursor position
                contentEditableRef.current?.focus();
                formatDoc('insertImage', reader.result as string);
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                contentEditableRef.current?.focus();
                formatDoc('insertImage', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setUnsplashUrl(null); // Clear any unsplash selection
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
        setContent(e.currentTarget.innerHTML);
    };

    const formatDoc = (cmd: string, value: string = '') => {
        document.execCommand(cmd, false, value);
        if (contentEditableRef.current) {
            setContent(contentEditableRef.current.innerHTML);
        }
    };

    const handleAiGenerate = async () => {
        if (!title || !region) {
            setError('Please enter a title and region before using AI Writer.');
            return;
        }
        setAiLoading(true);
        setError('');
        try {
            const data = await aiApi.getStoryDraft({ title, region, notes: aiNotes, language: writingLang });
            setAiDraft(data.draft);
            setAiPanelOpen(true);
        } catch (err: any) {
            setError(err.message || 'AI story generation failed.');
        } finally {
            setAiLoading(false);
        }
    };

    const handleSuggestImages = async () => {
        if (!title) {
            setError('Please enter a title to get image suggestions.');
            return;
        }
        setImagesLoading(true);
        setError('');
        try {
            const context = { title, region, notes: aiNotes, content: content.substring(0, 800) };
            const data = await aiApi.suggestImages(context);
            setSuggestedImages(data.images);
            setImageModalOpen(true);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch image suggestions.');
        } finally {
            setImagesLoading(false);
        }
    };

    const injectDraft = () => {
        if (aiDraft?.draftHtml) {
            setContent(aiDraft.draftHtml);
            if (contentEditableRef.current) {
                contentEditableRef.current.innerHTML = aiDraft.draftHtml;
            }
        }
    };

    const handleSubmit = async () => {
        if (!title || !region || !content || (!image && !unsplashUrl)) {
            setError('Please fill in all fields and upload a cover image.');
            return;
        }

        try {
            setSubmitting(true);
            setError('');
            
            // Create excerpt from content
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;
            const textContent = tempDiv.textContent || tempDiv.innerText || '';
            const excerpt = textContent.substring(0, 150) + (textContent.length > 150 ? '...' : '');

            const formData = new FormData();
            formData.append('title', title);
            formData.append('region', region);
            formData.append('content', content);
            formData.append('excerpt', excerpt);
            formData.append('author', user?.name || 'Anonymous');
            formData.append('date', new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
            formData.append('language', writingLang);
            
            if (image) {
                formData.append('image', image);
            } else if (unsplashUrl) {
                formData.append('unsplashUrl', unsplashUrl);
            }

            await storiesApi.submit(formData);
            
            setSuccess(true);
            setTitle('');
            setRegion('');
            setContent('');
            setImage(null);
            setImagePreview(null);
            setUnsplashUrl(null);
            if (contentEditableRef.current) {
                contentEditableRef.current.innerHTML = '';
            }
            
            setTimeout(() => setSuccess(false), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to submit story.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col h-auto lg:h-[calc(100vh-8rem)]"
        >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-8 gap-3">
                <div>
                    <h1 className="text-2xl sm:text-4xl font-serif text-alpine-navy dark:text-white tracking-wide">Draft New Log</h1>
                    <p className="text-alpine-navy/50 dark:text-white/50 text-xs sm:text-sm mt-1">Submit your expedition story to the community.</p>
                </div>

                {/* Editor Mode Toggle */}
                <div className="flex bg-black/5 dark:bg-white/5 backdrop-blur-xl border border-black/10 dark:border-white/10 p-1 rounded-xl sm:rounded-2xl shadow-xl">
                    <button
                        onClick={() => setEditorMode('wysiwyg')}
                        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                            editorMode === 'wysiwyg' ? 'bg-alpine-glacier text-[#0A0D14] shadow-lg' : 'text-alpine-navy/60 dark:text-white/60 hover:text-alpine-navy dark:hover:text-white'
                        }`}
                    >
                        <Type size={14} /> Rich Text
                    </button>
                    <button
                        onClick={() => setEditorMode('split')}
                        className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                            editorMode === 'split' ? 'bg-alpine-glacier text-[#0A0D14] shadow-lg' : 'text-alpine-navy/60 dark:text-white/60 hover:text-alpine-navy dark:hover:text-white'
                        }`}
                    >
                        <SplitSquareVertical size={16} /> Split Screen
                    </button>
                </div>
            </div>

            {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4 sm:mb-6 bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
                    {error}
                </motion.div>
            )}

            {success && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-4 sm:mb-6 bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                    <CheckCircle size={18} /> Story submitted successfully and is pending admin approval!
                </motion.div>
            )}

            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 flex-1 min-h-0">
                {/* Left Column: Metadata & Tools */}
                <div className="w-full lg:w-80 flex flex-col gap-4 sm:gap-6 overflow-y-auto lg:pr-2 custom-scrollbar">
                    {/* Cover Image */}
                    <div className="bg-white/60 dark:bg-[#11141A] backdrop-blur-md p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-black/5 dark:border-white/5 shadow-xl dark:shadow-2xl">
                        <label className="block text-xs font-bold tracking-widest text-alpine-navy/50 dark:text-white/50 uppercase mb-3 flex items-center justify-between">
                            <span>Cover Image</span>
                            <button
                                type="button"
                                onClick={handleSuggestImages}
                                disabled={imagesLoading}
                                className="flex items-center gap-1.5 text-alpine-glacier hover:text-alpine-navy dark:hover:text-white transition-colors"
                            >
                                {imagesLoading ? <Loader className="animate-spin" size={14} /> : <Wand2 size={14} />}
                                AI Suggest
                            </button>
                        </label>
                        <div 
                            className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-black/5 dark:bg-black/50 border border-black/10 dark:border-white/10 group cursor-pointer hover:border-alpine-glacier/50 transition-colors flex items-center justify-center mb-3"
                            onClick={() => document.getElementById('storyImage')?.click()}
                        >
                            {imagePreview || unsplashUrl ? (
                                <>
                                    <img src={imagePreview || unsplashUrl || ''} alt="Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ImageIcon className="text-white" />
                                    </div>
                                </>
                            ) : (
                                <div className="text-center text-alpine-navy/40 dark:text-white/40 group-hover:text-alpine-navy/70 dark:group-hover:text-white/70 transition-colors">
                                    <Upload className="mx-auto mb-2" size={24} />
                                    <span className="text-xs font-medium">Upload Hero Image</span>
                                </div>
                            )}
                            <input id="storyImage" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </div>
                        <UnsplashSearchPicker 
                            placeholder="Or search Unsplash directly..." 
                            onSelect={(url) => {
                                setUnsplashUrl(url);
                                setImage(null);
                                setImagePreview(null);
                            }} 
                        />
                    </div>

                    {/* Metadata */}
                    <div className="bg-white/60 dark:bg-[#11141A] backdrop-blur-md p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-black/5 dark:border-white/5 shadow-xl dark:shadow-2xl flex flex-col gap-3 sm:gap-4">
                        <div>
                            <label className="block text-xs font-bold tracking-widest text-alpine-navy/50 dark:text-white/50 uppercase mb-2">Title</label>
                            <input 
                                type="text" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="The Eiger North Face..."
                                className="w-full bg-black/5 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-alpine-navy dark:text-white placeholder-alpine-navy/20 dark:placeholder-white/20 focus:outline-none focus:border-alpine-glacier/50 transition-colors text-sm font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold tracking-widest text-alpine-navy/50 dark:text-white/50 uppercase mb-2">Region / Location</label>
                            <input 
                                type="text" 
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                                placeholder="Swiss Alps"
                                className="w-full bg-black/5 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-alpine-navy dark:text-white placeholder-alpine-navy/20 dark:placeholder-white/20 focus:outline-none focus:border-alpine-glacier/50 transition-colors text-sm font-medium"
                            />
                        </div>

                        {/* Writing Language */}
                        <div>
                            <label className="block text-xs font-bold tracking-widest text-alpine-navy/50 dark:text-white/50 uppercase mb-2 flex items-center gap-1.5">
                                <Globe size={12} /> Writing Language
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { code: 'en', label: 'English', flag: '🇬🇧' },
                                    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
                                    { code: 'ml', label: 'മലയാളം', flag: '🇮🇳' },
                                    { code: 'mg', label: 'Manglish', flag: '🗣️' },
                                ].map(lang => (
                                    <button
                                        key={lang.code}
                                        type="button"
                                        onClick={() => setWritingLang(lang.code)}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                                            writingLang === lang.code
                                                ? 'bg-alpine-glacier/20 border-alpine-glacier/50 text-alpine-blue dark:text-alpine-glacier shadow-md'
                                                : 'bg-black/5 dark:bg-black/30 border-black/10 dark:border-white/10 text-alpine-navy/60 dark:text-white/60 hover:border-alpine-glacier/30'
                                        }`}
                                    >
                                        <span>{lang.flag}</span>
                                        <span>{lang.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* AI Story Writer Panel */}
                    <div className="bg-white/60 dark:bg-[#11141A] backdrop-blur-md p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-alpine-glacier/20 shadow-xl dark:shadow-2xl">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Sparkles size={16} className="text-alpine-glacier" />
                                <span className="text-xs font-bold tracking-widest text-alpine-navy/50 dark:text-white/50 uppercase">AI Writer</span>
                            </div>
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-alpine-glacier/10 text-alpine-glacier border border-alpine-glacier/20">AI</span>
                        </div>

                        <textarea
                            value={aiNotes}
                            onChange={(e) => setAiNotes(e.target.value)}
                            placeholder="Optional: describe your experience, key moments, feelings..."
                            rows={2}
                            className="w-full bg-black/5 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-alpine-navy dark:text-white placeholder-alpine-navy/20 dark:placeholder-white/20 focus:outline-none focus:border-alpine-glacier/50 transition-colors text-xs resize-none mb-3"
                        />

                        <button
                            onClick={handleAiGenerate}
                            disabled={aiLoading || !title || !region}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-alpine-glacier/10 hover:bg-alpine-glacier/20 border border-alpine-glacier/30 text-alpine-glacier font-semibold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {aiLoading ? <Loader size={14} className="animate-spin" /> : <Wand2 size={14} />}
                            {aiLoading ? 'Writing...' : 'Generate Draft'}
                        </button>

                        {/* AI Draft Results */}
                        <AnimatePresence>
                            {aiDraft && aiPanelOpen && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-4 space-y-3 overflow-hidden"
                                >
                                    {/* Tone Note */}
                                    {aiDraft.toneNote && (
                                        <p className="text-[10px] italic text-alpine-navy/40 dark:text-white/30 flex items-center gap-1">
                                            <BookOpen size={10} /> {aiDraft.toneNote}
                                        </p>
                                    )}

                                    {/* Outline */}
                                    {aiDraft.outline && aiDraft.outline.length > 0 && (
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-alpine-navy/40 dark:text-white/30 mb-2">Suggested Outline</p>
                                            <div className="space-y-1.5">
                                                {aiDraft.outline.map((sec: any, idx: number) => (
                                                    <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                                                        <span className="w-4 h-4 rounded-full bg-alpine-glacier/20 text-alpine-glacier text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                                                        <div>
                                                            <p className="text-[11px] font-semibold text-alpine-navy/80 dark:text-white/70">{sec.section}</p>
                                                            <p className="text-[10px] text-alpine-navy/40 dark:text-white/30">{sec.hint}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Excerpt Preview */}
                                    {aiDraft.suggestedExcerpt && (
                                        <div className="p-2.5 rounded-lg bg-alpine-glacier/5 border border-alpine-glacier/10">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-alpine-navy/40 dark:text-white/30 mb-1">Excerpt Preview</p>
                                            <p className="text-[11px] italic text-alpine-navy/60 dark:text-white/50">"{aiDraft.suggestedExcerpt}"</p>
                                        </div>
                                    )}

                                    {/* Inject Button */}
                                    <button
                                        onClick={injectDraft}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-alpine-glacier text-[#0A0D14] font-bold text-xs transition-all hover:shadow-lg"
                                    >
                                        <FileText size={14} />
                                        Use This Draft
                                    </button>

                                    <button
                                        onClick={() => setAiPanelOpen(false)}
                                        className="w-full text-center text-[10px] text-alpine-navy/30 dark:text-white/20 hover:text-alpine-navy/60 dark:hover:text-white/40 transition-colors"
                                    >
                                        Dismiss
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Action Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="lg:mt-auto w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-alpine-glacier text-[#0A0D14] font-bold text-sm tracking-wide shadow-[0_0_30px_rgba(163,201,226,0.3)] hover:shadow-[0_0_40px_rgba(163,201,226,0.5)] transition-[color,background-color,border-color,box-shadow] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
                        {submitting ? 'Submitting...' : 'Submit to Editors'}
                    </motion.button>
                </div>

                {/* Right Column: Editor Workspace */}
                <div className="flex-1 bg-white/60 dark:bg-[#11141A] backdrop-blur-md rounded-2xl sm:rounded-3xl border border-black/5 dark:border-white/5 shadow-xl dark:shadow-2xl flex flex-col overflow-hidden min-h-[300px] sm:min-h-[400px]">
                    {/* Toolbar (WYSIWYG Mode only) */}
                    {editorMode === 'wysiwyg' && (
                        <div className="flex items-center gap-1 sm:gap-2 p-2 sm:p-3 border-b border-black/5 dark:border-white/5 bg-black/5 dark:bg-black/20 flex-wrap">
                            <button onClick={() => formatDoc('bold')} className="p-1.5 sm:p-2 rounded-lg text-alpine-navy/60 dark:text-white/60 hover:text-alpine-navy dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10" title="Bold"><b>B</b></button>
                            <button onClick={() => formatDoc('italic')} className="p-1.5 sm:p-2 rounded-lg text-alpine-navy/60 dark:text-white/60 hover:text-alpine-navy dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10" title="Italic"><i>I</i></button>
                            <button onClick={() => formatDoc('underline')} className="p-1.5 sm:p-2 rounded-lg text-alpine-navy/60 dark:text-white/60 hover:text-alpine-navy dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10" title="Underline"><u>U</u></button>
                            <div className="w-px h-5 sm:h-6 bg-black/10 dark:bg-white/10 mx-1 sm:mx-2" />
                            <button onClick={() => formatDoc('formatBlock', 'H2')} className="p-1.5 sm:p-2 rounded-lg text-alpine-navy/60 dark:text-white/60 hover:text-alpine-navy dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold">H2</button>
                            <button onClick={() => formatDoc('formatBlock', 'H3')} className="p-1.5 sm:p-2 rounded-lg text-alpine-navy/60 dark:text-white/60 hover:text-alpine-navy dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold">H3</button>
                            <div className="w-px h-5 sm:h-6 bg-black/10 dark:bg-white/10 mx-1 sm:mx-2 hidden sm:block" />
                            <button onClick={() => formatDoc('insertUnorderedList')} className="hidden sm:block p-2 rounded-lg text-alpine-navy/60 dark:text-white/60 hover:text-alpine-navy dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold">• List</button>
                            <button onClick={() => formatDoc('insertOrderedList')} className="hidden sm:block p-2 rounded-lg text-alpine-navy/60 dark:text-white/60 hover:text-alpine-navy dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold">1. List</button>
                            <div className="w-px h-5 sm:h-6 bg-black/10 dark:bg-white/10 mx-1 sm:mx-2" />
                            <button onClick={() => inlineImageRef.current?.click()} className="p-1.5 sm:p-2 rounded-lg text-alpine-navy/60 dark:text-white/60 hover:text-alpine-navy dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 flex items-center gap-1 text-xs font-bold" title="Insert Inline Image">
                                <ImageIcon size={14} /> Media
                            </button>
                            <input ref={inlineImageRef} type="file" accept="image/*" className="hidden" onChange={handleInlineImageSelect} />
                        </div>
                    )}

                    {/* Editor Area */}
                    <div className="flex-1 flex overflow-hidden">
                        {editorMode === 'wysiwyg' ? (
                            <div 
                                ref={contentEditableRef}
                                className="flex-1 p-4 sm:p-8 overflow-y-auto prose prose-stone dark:prose-invert max-w-none focus:outline-none custom-scrollbar prose-img:rounded-2xl prose-img:max-w-full prose-img:shadow-2xl prose-img:cursor-move prose-img:border prose-img:border-black/10 dark:prose-img:border-white/10"
                                contentEditable
                                onInput={handleContentChange}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                data-placeholder="Start writing your legendary expedition here... (Drag and drop images directly into the text!)"
                                dangerouslySetInnerHTML={{ __html: content }}
                            />
                        ) : (
                            <>
                                {/* Split Screen: Code */}
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="# The Eiger North Face..."
                                    className="flex-1 bg-black/5 dark:bg-black/40 p-4 sm:p-8 border-r border-black/5 dark:border-white/5 text-alpine-navy/80 dark:text-white/80 font-mono text-sm resize-none focus:outline-none custom-scrollbar placeholder-alpine-navy/20 dark:placeholder-white/20 leading-relaxed"
                                />
                                {/* Split Screen: Preview */}
                                <div 
                                    className="flex-1 bg-white/60 dark:bg-[#11141A] p-4 sm:p-8 overflow-y-auto prose prose-stone dark:prose-invert max-w-none custom-scrollbar"
                                    dangerouslySetInnerHTML={{ __html: content || '<p class="text-alpine-navy/20 dark:text-white/20 italic">Preview your markdown/HTML here...</p>' }}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* AI Image Suggestion Modal */}
            <AnimatePresence>
                {imageModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 40 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white/10 dark:bg-[#0A0D14]/60 backdrop-blur-3xl rounded-[2rem] w-full max-w-6xl shadow-[0_0_100px_rgba(163,201,226,0.15)] border border-white/20 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 sm:p-8 border-b border-black/10 dark:border-white/10 flex justify-between items-center bg-gradient-to-r from-alpine-glacier/10 to-transparent">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-alpine-glacier/20 rounded-2xl border border-alpine-glacier/30 text-alpine-glacier">
                                        <Wand2 size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl sm:text-3xl font-serif font-bold text-alpine-navy dark:text-white tracking-wide">AI Visual Intelligence</h3>
                                        <p className="text-sm text-alpine-navy/70 dark:text-white/60 font-medium">Curated premium assets based on your expedition narrative.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setImageModalOpen(false)}
                                    className="p-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors backdrop-blur-md border border-white/10"
                                >
                                    <X size={24} className="text-alpine-navy dark:text-white" />
                                </button>
                            </div>
                            
                            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar bg-black/5 dark:bg-transparent">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    {suggestedImages.map((img: any, idx: number) => (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                                            key={img.id} 
                                            className="group relative aspect-[4/3] rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-[0_20px_50px_rgba(163,201,226,0.3)] transition-[color,background-color,border-color,box-shadow] duration-500 border border-white/10 hover:border-alpine-glacier/50"
                                            onClick={() => {
                                                setUnsplashUrl(img.url);
                                                setImage(null); // Clear file upload if they choose unsplash
                                                setImagePreview(null);
                                                setImageModalOpen(false);
                                            }}
                                        >
                                            <img src={img.thumb} alt={img.altText} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5">
                                                <span className="text-white text-sm font-medium tracking-wide">Photo by {img.authorName}</span>
                                                <div className="mt-3 py-2 px-4 bg-alpine-glacier text-[#0A0D14] rounded-xl flex items-center justify-center gap-2 text-sm font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                                    <CheckCircle size={16} /> Select Asset
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
