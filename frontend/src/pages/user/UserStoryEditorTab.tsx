import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { storiesApi } from '../../lib/api';
import { Upload, X, CheckCircle, SplitSquareVertical, Type, Send, Image as ImageIcon, Loader, Globe } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

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

    const handleSubmit = async () => {
        if (!title || !region || !content || !image) {
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
            formData.append('image', image);

            await storiesApi.submit(formData);
            
            setSuccess(true);
            setTitle('');
            setRegion('');
            setContent('');
            setImage(null);
            setImagePreview(null);
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
                        <label className="block text-xs font-bold tracking-widest text-alpine-navy/50 dark:text-white/50 uppercase mb-3">Cover Image</label>
                        <div 
                            className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-black/5 dark:bg-black/50 border border-black/10 dark:border-white/10 group cursor-pointer hover:border-alpine-glacier/50 transition-colors flex items-center justify-center"
                            onClick={() => document.getElementById('storyImage')?.click()}
                        >
                            {imagePreview ? (
                                <>
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
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

                    {/* Action Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="lg:mt-auto w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-alpine-glacier text-[#0A0D14] font-bold text-sm tracking-wide shadow-[0_0_30px_rgba(163,201,226,0.3)] hover:shadow-[0_0_40px_rgba(163,201,226,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
        </motion.div>
    );
};
