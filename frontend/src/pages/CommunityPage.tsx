import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Users, MessageSquare, Map, Star, ShieldCheck, ArrowRight, Lock, MapPin, Calendar, Loader2, Send, Wand2, X, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { communityApi, aiApi } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { useToast } from '../components/ui/Toast';
import { BackButton } from '../components/ui/BackButton';

const TABS = [
    { id: 'groups', label: 'Factions & Groups', icon: Users },
    { id: 'discussions', label: 'Global Comms', icon: MessageSquare },
    { id: 'trails', label: 'Trail Logistics', icon: Map },
    { id: 'spotlight', label: 'Vanguard Spotlight', icon: Star }
];

export const CommunityPage = () => {
    const [activeTab, setActiveTab] = useState('groups');
    const [groups, setGroups] = useState<any[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [postContent, setPostContent] = useState('');
    const [posting, setPosting] = useState(false);
    
    // AI Image Suggestion State
    const [unsplashUrl, setUnsplashUrl] = useState<string | null>(null);
    const [suggestedImages, setSuggestedImages] = useState<any[]>([]);
    const [imagesLoading, setImagesLoading] = useState(false);
    const [imageModalOpen, setImageModalOpen] = useState(false);

    const [joiningId, setJoiningId] = useState<string | null>(null);
    const { user, isLoggedIn } = useAuthStore();
    const { showToast, ToastComponent } = useToast();

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const data = await communityApi.listGroups();
                setGroups(data.groups);
                if (data.groups.length > 0) {
                    loadGroupDetail(data.groups[0]._id);
                }
            } catch (err) {
                console.error('Failed to load groups:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchGroups();
    }, []);

    const loadGroupDetail = async (groupId: string) => {
        if (!isLoggedIn) {
            // Show basic info for non-auth users
            const group = groups.find(g => g._id === groupId);
            setSelectedGroup(group);
            return;
        }
        try {
            const data = await communityApi.getGroup(groupId);
            setSelectedGroup(data.group);
            setPosts(data.posts || []);
        } catch (err: any) {
            // If unauthorized, just show basic group info
            const group = groups.find(g => g._id === groupId);
            setSelectedGroup(group);
        }
    };

    const handleJoin = async (groupId: string) => {
        if (!isLoggedIn) {
            showToast('Please log in to join groups.', 'error');
            return;
        }
        setJoiningId(groupId);
        try {
            await communityApi.requestJoin(groupId);
            showToast('Join request submitted! Awaiting moderator approval.', 'success');
        } catch (err: any) {
            showToast(err.message || 'Failed to request join.', 'error');
        } finally {
            setJoiningId(null);
        }
    };

    const handleSuggestImages = async () => {
        if (!postContent.trim()) {
            showToast('Please type some content first to get AI suggestions.', 'error');
            return;
        }
        setImagesLoading(true);
        try {
            const context = { title: selectedGroup?.name || 'Community Post', content: postContent, type: 'community discussion' };
            const data = await aiApi.suggestImages(context);
            setSuggestedImages(data.images);
            setImageModalOpen(true);
        } catch (err: any) {
            showToast(err.message || 'Failed to fetch image suggestions.', 'error');
        } finally {
            setImagesLoading(false);
        }
    };

    const handlePost = async () => {
        if (!selectedGroup || (!postContent.trim() && !unsplashUrl)) return;
        setPosting(true);
        try {
            const formData = new FormData();
            formData.append('content', postContent);
            if (unsplashUrl) formData.append('unsplashUrl', unsplashUrl);

            const data = await communityApi.createPost(selectedGroup._id, formData);
            setPosts([data.post, ...posts]);
            setPostContent('');
            setUnsplashUrl(null);
            showToast('Field report posted.', 'success');
        } catch (err: any) {
            showToast(err.message || 'Failed to post.', 'error');
        } finally {
            setPosting(false);
        }
    };

    const isMember = selectedGroup?.members?.some?.((m: any) => m._id === user?.id || m === user?.id);

    return (
        <main className="min-h-screen bg-alpine-navy dark:bg-[#0B0C10] text-white pt-28 pb-20 relative overflow-hidden transition-colors duration-500">
            {ToastComponent}

            {/* Ambient Background */}
            <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none transition-opacity duration-500">
                <div className="absolute top-0 right-1/4 w-[60vw] h-[60vw] bg-alpine-glacier/40 dark:bg-alpine-navy/40 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-screen transition-colors duration-500" />
                <div className="absolute bottom-1/4 left-1/4 w-[40vw] h-[40vw] bg-alpine-blue/20 dark:bg-alpine-glacier/20 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen transition-colors duration-500" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-50">
                <BackButton />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="font-serif text-5xl md:text-7xl font-bold mb-4 drop-shadow-sm dark:drop-shadow-md text-white">Community Terminal</h1>
                        <p className="text-xl text-white/60 font-light max-w-2xl">
                            Secure coordination for dedicated high-altitude climbers and Alpine enthusiasts. Connect with established factions or plan future logistics.
                        </p>
                    </motion.div>
                </div>

                {/* Tab Navigation */}
                <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-12 border-b border-white/10 pb-4 transition-colors duration-500">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative px-6 py-3 rounded-xl flex items-center gap-2 font-medium tracking-wide whitespace-nowrap transition-all duration-300 ${activeTab === tab.id ? 'text-white' : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="community-tab-indicator"
                                    className="absolute inset-0 bg-white/10 shadow-sm border border-white/10 rounded-xl z-[-1]"
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
                                    {loading ? (
                                        <div className="bg-white/5 dark:bg-[#0B0C10]/40 rounded-3xl p-6 animate-pulse h-64" />
                                    ) : selectedGroup ? (
                                        <div className="bg-white/5 dark:bg-[#0B0C10]/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-sm dark:shadow-none transition-colors duration-500">
                                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 border border-white/10 shadow-md">
                                                <ShieldCheck size={24} className="text-white" />
                                            </div>
                                            <h2 className="font-serif text-2xl font-bold mb-2 text-white">{selectedGroup.name}</h2>
                                            <p className="text-white/50 text-sm mb-6 leading-relaxed">
                                                {selectedGroup.description}
                                            </p>

                                            <div className="space-y-4 pt-6 border-t border-white/10 transition-colors duration-500">
                                                <div>
                                                    <span className="text-white/40 text-xs tracking-widest uppercase block mb-2">Moderators</span>
                                                    {selectedGroup.moderators?.map((mod: any) => (
                                                        <div key={mod._id || mod} className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5 transition-colors duration-500 mb-1">
                                                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">{(mod.name || 'M').charAt(0)}</div>
                                                            <span className="text-sm font-medium text-white">{mod.name || 'Moderator'}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div>
                                                    <span className="text-white/40 text-xs tracking-widest uppercase block mb-2">Members ({selectedGroup.memberCount || selectedGroup.members?.length || 0})</span>
                                                    <div className="flex -space-x-2">
                                                        {(selectedGroup.members || []).slice(0, 5).map((m: any, i: number) => (
                                                            <div key={i} className="w-8 h-8 rounded-full bg-alpine-navy border-2 border-white/80 dark:border-[#0B0C10] flex items-center justify-center text-[10px] text-white font-bold">{(m.name || 'U').charAt(0)}</div>
                                                        ))}
                                                        {(selectedGroup.memberCount || selectedGroup.members?.length || 0) > 5 && (
                                                            <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-white/80 dark:border-[#0B0C10] flex items-center justify-center text-[10px] font-bold text-white">+{(selectedGroup.memberCount || selectedGroup.members?.length) - 5}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}

                                    {/* Group selector */}
                                    {groups.length > 1 && (
                                        <div className="space-y-2">
                                            {groups.map(g => (
                                                <button
                                                    key={g._id}
                                                    onClick={() => loadGroupDetail(g._id)}
                                                    className={`w-full text-left p-3 rounded-xl border transition-all text-sm font-medium ${selectedGroup?._id === g._id
                                                        ? 'bg-alpine-glacier/10 border-alpine-glacier/30 text-white'
                                                        : 'bg-white/5 border-transparent hover:bg-white/10 text-white/50'
                                                    }`}
                                                >
                                                    {g.name} ({g.memberCount || 0})
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Admin Control Rule Reminder */}
                                    <div className="bg-white/5 dark:bg-transparent border border-white/10 dark:border-white/5 rounded-3xl p-6 flex items-start gap-4 shadow-sm dark:shadow-none">
                                        <Lock size={20} className="text-amber-400 shrink-0 mt-1" />
                                        <div>
                                            <h4 className="text-sm font-semibold text-white/90 mb-1">Architecture Locked</h4>
                                            <p className="text-xs text-white/50 leading-relaxed">System groups are administered strictly by approved Mountain Guides. Users may only request to join existing factions.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Center Panel: Feed */}
                                <div className="lg:col-span-6 space-y-6">
                                    {isMember && (
                                        <div className="bg-white/5 dark:bg-[#0B0C10]/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-sm dark:shadow-none transition-colors duration-500">
                                            <div className="flex gap-4 items-start">
                                                <div className="w-10 h-10 rounded-full bg-alpine-glacier/30 shrink-0 flex items-center justify-center text-sm font-bold text-white">{user?.name?.charAt(0)}</div>
                                                <div className="flex-1 flex flex-col gap-2">
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={postContent}
                                                            onChange={e => setPostContent(e.target.value)}
                                                            onKeyDown={e => e.key === 'Enter' && handlePost()}
                                                            placeholder="Post field report or intelligence..."
                                                            className="flex-1 bg-white/5 border border-white/5 rounded-2xl px-4 py-3 text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-alpine-glacier/30"
                                                        />
                                                        <button 
                                                            onClick={handleSuggestImages} 
                                                            disabled={imagesLoading || posting} 
                                                            className="p-3 bg-white/5 rounded-xl text-white/60 hover:text-alpine-glacier hover:bg-white/10 transition-all flex items-center justify-center"
                                                            title="AI Suggest Cover Image"
                                                        >
                                                            {imagesLoading ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
                                                        </button>
                                                        <button onClick={handlePost} disabled={posting} className="p-3 bg-alpine-glacier/20 rounded-xl text-alpine-glacier hover:bg-alpine-glacier/30 transition-all flex items-center justify-center">
                                                            {posting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                                        </button>
                                                    </div>
                                                    
                                                    {unsplashUrl && (
                                                        <div className="relative inline-block mt-2 self-start rounded-xl overflow-hidden border border-white/10">
                                                            <img src={unsplashUrl} className="h-32 w-auto object-cover opacity-90" alt="Selected cover" />
                                                            <button 
                                                                onClick={() => setUnsplashUrl(null)}
                                                                className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {!isMember && isLoggedIn && (
                                        <div className="bg-white/5 dark:bg-[#0B0C10]/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 text-center text-white/40 text-sm">
                                            Join this faction to post and participate in discussions.
                                        </div>
                                    )}

                                    {posts.length > 0 ? posts.map((post) => (
                                        <div key={post._id} className="bg-white/5 dark:bg-[#0B0C10]/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-sm dark:shadow-none transition-colors duration-500">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-alpine-glacier/20 flex items-center justify-center text-sm font-bold text-white">{post.author?.name?.charAt(0) || 'U'}</div>
                                                    <div>
                                                        <p className="font-medium text-sm text-white">{post.author?.name || 'Member'}</p>
                                                        <p className="text-xs text-white/40">{new Date(post.createdAt).toLocaleString()} • Field Report</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-white/80 leading-relaxed text-sm mb-4">
                                                {post.content}
                                            </p>
                                            {post.image && (
                                                <img src={post.image} className="w-full h-48 object-cover rounded-xl mb-4" />
                                            )}
                                            {post.comments?.length > 0 && (
                                                <div className="border-t border-white/5 pt-4 space-y-3">
                                                    {post.comments.map((c: any, ci: number) => (
                                                        <div key={ci} className="flex gap-3">
                                                            <div className="w-6 h-6 rounded-full bg-white/10 shrink-0 flex items-center justify-center text-[10px] font-bold text-white">{c.author?.name?.charAt(0) || 'U'}</div>
                                                            <div>
                                                                <span className="text-xs font-bold text-white">{c.author?.name || 'Member'}</span>
                                                                <p className="text-xs text-white/60">{c.content}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )) : (
                                        <div className="bg-white/5 dark:bg-[#0B0C10]/40 backdrop-blur-md border border-white/10 rounded-3xl p-12 text-center">
                                            <p className="text-white/30 font-mono text-sm">[ NO_FIELD_REPORTS ]</p>
                                        </div>
                                    )}
                                </div>

                                {/* Right Panel: Logistics */}
                                <div className="lg:col-span-3 space-y-6">
                                    {selectedGroup && (
                                        <button
                                            onClick={() => handleJoin(selectedGroup._id)}
                                            disabled={isMember || joiningId === selectedGroup._id}
                                            className={`w-full font-bold py-4 rounded-2xl flex justify-center items-center gap-2 border transition-all group shadow-md dark:shadow-none hover:shadow-lg hover:-translate-y-0.5 dark:hover:-translate-y-0 ${isMember
                                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default'
                                                : 'bg-white/10 text-white hover:bg-white/20 border-transparent'
                                            }`}
                                        >
                                            {isMember ? (
                                                'Already Deployed ✓'
                                            ) : joiningId === selectedGroup._id ? (
                                                <Loader2 className="animate-spin" size={18} />
                                            ) : (
                                                <>Request Deployment (Join) <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                                            )}
                                        </button>
                                    )}

                                    <div className="bg-white/5 dark:bg-[#0B0C10]/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-sm dark:shadow-none transition-colors duration-500">
                                        <h3 className="font-serif text-xl font-bold mb-4 text-white">Upcoming Logistics</h3>
                                        <div className="space-y-4">
                                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-alpine-glacier/30 transition-colors cursor-pointer group shadow-sm dark:shadow-none">
                                                <h4 className="font-semibold text-sm mb-2 group-hover:text-alpine-glacier transition-colors text-white">Winter Traverse: Chamonix</h4>
                                                <div className="flex items-center gap-2 text-xs text-white/50 mb-1 transition-colors duration-500">
                                                    <Calendar size={14} /> Feb 28 - Mar 02
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-white/50 transition-colors duration-500">
                                                    <MapPin size={14} /> Briefing at Basecamp Alpha
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedGroup?.pinnedMessage && (
                                        <div className="bg-white/5 dark:bg-[#0B0C10]/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-sm dark:shadow-none transition-colors duration-500">
                                            <h3 className="font-serif text-xl font-bold mb-4 text-alpine-glacier dark:text-alpine-sunrise">Pinned Comm</h3>
                                            <p className="text-sm text-white/70 leading-relaxed transition-colors duration-500">
                                                {selectedGroup.pinnedMessage}
                                            </p>
                                        </div>
                                    )}
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
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 transition-colors duration-500">
                                    <Lock size={32} className="text-white/20" />
                                </div>
                                <h2 className="font-serif text-3xl font-bold mb-2 text-white">Sector Restricted</h2>
                                <p className="text-white/40 max-w-md">This communications channel requires verified Vanguard clearance. Access denied.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>

            {/* AI Image Suggestion Modal */}
            <AnimatePresence>
                {imageModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-alpine-navy dark:bg-[#0A0D14] rounded-3xl w-full max-w-4xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-4 sm:p-6 border-b border-white/5 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg sm:text-xl font-serif text-white">AI Cover Suggestions</h3>
                                    <p className="text-xs sm:text-sm text-white/60">Images sourced from Unsplash based on your post.</p>
                                </div>
                                <button
                                    onClick={() => setImageModalOpen(false)}
                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-white" />
                                </button>
                            </div>
                            
                            <div className="p-4 sm:p-6 overflow-y-auto">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {suggestedImages.map((img: any) => (
                                        <div 
                                            key={img.id} 
                                            className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-black/5"
                                            onClick={() => {
                                                setUnsplashUrl(img.url);
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
        </main>
    );
};
