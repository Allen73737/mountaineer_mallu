import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Trash2, ShieldCheck, UserPlus, UserMinus } from 'lucide-react';
import { Loader2 } from '../../components/ui/BrandLoader';
import { communityApi } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { useAdminAction } from '../../store/useAdminAction';

export const CommunityManagement = () => {
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const [groupDetail, setGroupDetail] = useState<any>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [createForm, setCreateForm] = useState({ name: '', description: '' });
    const { showToast, ToastComponent } = useToast();
    const { requestAction } = useAdminAction();

    useEffect(() => { fetchGroups(); }, []);

    const fetchGroups = async () => {
        try { const data = await communityApi.listGroups(); setGroups(data.groups); }
        catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const loadDetail = async (groupId: string) => {
        try {
            const data = await communityApi.getGroup(groupId);
            setGroupDetail(data.group);
            setSelectedGroup(groupId);
        } catch (err: any) { showToast(err.message, 'error'); }
    };

    const handleCreate = () => {
        requestAction(
            'Create Faction',
            `Are you sure you want to create faction "${createForm.name}"?`,
            {
                execute: async () => { await communityApi.createGroup(createForm); fetchGroups(); },
                optimistic: () => { setShowCreate(false); setCreateForm({ name: '', description: '' }); },
                successMessage: 'Group created.'
            },
            'info',
            'Create'
        );
    };

    const handleDelete = (id: string) => {
        const group = groups.find(g => g._id === id);
        if (!group) return;

        requestAction(
            'Delete Faction',
            `Are you sure you want to permanently delete "${group.name}"?`,
            {
                execute: async () => { await communityApi.deleteGroup(id); fetchGroups(); },
                optimistic: () => {
                    setGroups(prev => prev.filter(g => g._id !== id));
                    if (selectedGroup === id) { setSelectedGroup(null); setGroupDetail(null); }
                },
                revert: () => setGroups(prev => [...prev, group]),
                successMessage: 'Group deleted.'
            },
            'danger',
            'Delete'
        );
    };

    const handleApproveJoin = (userId: string, userName: string) => {
        if (!selectedGroup) return;
        requestAction(
            'Approve Member',
            `Are you sure you want to approve ${userName}?`,
            { execute: async () => { await communityApi.approveJoin(selectedGroup, userId); loadDetail(selectedGroup); }, successMessage: 'Member approved.' },
            'info', 'Approve'
        );
    };

    const handleRemoveMember = (userId: string, userName: string) => {
        if (!selectedGroup) return;
        requestAction(
            'Remove Member',
            `Are you sure you want to remove ${userName}?`,
            { execute: async () => { await communityApi.removeMember(selectedGroup, userId); loadDetail(selectedGroup); }, successMessage: 'Member removed.' },
            'danger', 'Remove'
        );
    };

    return (
        <div className="space-y-8">
            {ToastComponent}

            <header className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2"><Users className="text-alpine-glacier" size={28} /><h1 className="text-3xl font-bold font-serif tracking-wide text-gradient-glacier glow-text">Community Groups</h1></div>
                    <p className="text-white/50 text-sm">Manage factions, approve members, assign moderators</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="py-2.5 px-5 flex items-center gap-2 bg-alpine-glacier text-alpine-navy font-bold rounded-xl btn-premium"><Plus size={18} /><span>New Group</span></button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Groups List */}
                <div className="space-y-3">
                    {loading ? [1,2,3].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />) :
                    groups.map(g => (
                        <button key={g._id} onClick={() => loadDetail(g._id)} className={`w-full text-left p-5 rounded-2xl border transition-all ${selectedGroup === g._id ? 'bg-white/10 border-alpine-glacier/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-white">{g.name}</h3>
                                <button onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDelete(g._id); }} className="p-1 text-white/30 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                            </div>
                            <div className="flex gap-4 text-xs text-white/50">
                                <span>{g.memberCount || 0} members</span>
                                <span>{g.pendingCount || 0} pending</span>
                            </div>
                        </button>
                    ))}
                    {!loading && groups.length === 0 && <p className="text-white/30 text-center p-8 font-mono text-sm">[ NO_FACTIONS ]</p>}
                </div>

                {/* Group Detail */}
                <div className="lg:col-span-2">
                    {groupDetail ? (
                        <div className="space-y-6">
                            <div className="premium-card rounded-2xl p-6">
                                <h2 className="text-2xl font-bold text-white mb-2 font-serif">{groupDetail.name}</h2>
                                <p className="text-white/60 text-sm">{groupDetail.description}</p>
                            </div>

                            {/* Pending Requests */}
                            {groupDetail.pendingRequests?.length > 0 && (
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
                                    <h3 className="font-bold text-amber-300 mb-4">Pending Join Requests ({groupDetail.pendingRequests.length})</h3>
                                    <div className="space-y-2">
                                        {groupDetail.pendingRequests.map((u: any) => (
                                            <div key={u._id} className="flex items-center justify-between bg-black/20 rounded-xl p-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-300 font-bold text-xs">{u.name?.charAt(0)}</div>
                                                    <div><p className="text-sm font-medium text-white">{u.name}</p><p className="text-xs text-white/40">{u.email}</p></div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleApproveJoin(u._id, u.name)} className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-medium hover:bg-emerald-500/30 transition-all"><UserPlus size={12} /></button>
                                                    <button onClick={() => handleRemoveMember(u._id, u.name)} className="px-3 py-1.5 bg-red-500/20 text-red-300 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-all"><UserMinus size={12} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Members */}
                            <div className="premium-card rounded-2xl p-6">
                                <h3 className="font-bold text-white mb-4">Members ({groupDetail.members?.length || 0})</h3>
                                <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                                    {groupDetail.members?.map((m: any) => {
                                        const isMod = groupDetail.moderators?.some((mod: any) => mod._id === m._id);
                                        return (
                                            <div key={m._id} className="flex items-center justify-between bg-black/20 rounded-xl p-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-alpine-glacier/20 flex items-center justify-center text-alpine-glacier font-bold text-xs">{m.name?.charAt(0)}</div>
                                                    <div><p className="text-sm font-medium text-white">{m.name}</p><p className="text-xs text-white/40">{m.email}</p></div>
                                                    {isMod && <span className="px-2 py-0.5 bg-alpine-glacier/20 text-alpine-glacier text-[10px] font-bold rounded-full uppercase">Mod</span>}
                                                </div>
                                                <button onClick={() => handleRemoveMember(m._id, m.name)} className="p-1.5 text-white/30 hover:text-red-400 transition-colors"><UserMinus size={14} /></button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-white/30 font-mono text-sm bg-white/5 rounded-2xl border border-white/10">
                            [ SELECT_A_FACTION ]
                        </div>
                    )}
                </div>
            </div>

            {/* Create Group Modal */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-y-0 right-0 left-[var(--sidebar-width,0px)] z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowCreate(false)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="premium-card rounded-3xl p-8 max-w-md w-full" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                            <h2 className="text-2xl font-bold text-white mb-6 font-serif">New Faction</h2>
                            <div className="space-y-4">
                                <input placeholder="Group Name" value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50" />
                                <textarea placeholder="Description" value={createForm.description} onChange={e => setCreateForm({...createForm, description: e.target.value})} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50 resize-none" />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowCreate(false)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all">Cancel</button>
                                <button onClick={handleCreate} className="flex-1 py-3 rounded-xl bg-alpine-glacier text-alpine-navy font-bold btn-premium flex items-center justify-center gap-2">Create Faction</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
