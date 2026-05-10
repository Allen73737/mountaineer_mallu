import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Plus, UserX, Settings, Loader2, Check, X, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { adminApi } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { useAdminAction } from '../../store/useAdminAction';

const PERMISSION_KEYS = [
    { key: 'manageStories', label: 'Stories', desc: 'Create, edit, delete expedition chronicles' },
    { key: 'manageEvents', label: 'Events', desc: 'Manage expeditions and registrations' },
    { key: 'manageGallery', label: 'Gallery', desc: 'Approve/reject media uploads' },
    { key: 'manageCommunity', label: 'Community', desc: 'Manage factions and members' },
    { key: 'manageUsers', label: 'Users', desc: 'View and manage user accounts' },
];

export const AdminManagement = () => {
    const [admins, setAdmins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [createForm, setCreateForm] = useState({ name: '', email: '', password: '' });
    const [createPerms, setCreatePerms] = useState<Record<string, boolean>>({ manageStories: true, manageEvents: true, manageGallery: false, manageCommunity: false, manageUsers: false });
    const [saving, setSaving] = useState(false);
    const [updatingPerms, setUpdatingPerms] = useState<string | null>(null);
    const { user } = useAuthStore();
    const { showToast, ToastComponent } = useToast();
    const { requestAction } = useAdminAction();

    useEffect(() => { fetchAdmins(); }, []);

    const fetchAdmins = async () => {
        try {
            const data = await adminApi.listAdmins();
            setAdmins(data.admins);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleCreate = () => {
        requestAction(
            'Create Admin',
            `Are you sure you want to grant admin access to ${createForm.name}?`,
            {
                execute: async () => { await adminApi.createAdmin({ ...createForm, permissions: createPerms }); fetchAdmins(); },
                optimistic: () => { setShowCreate(false); setCreateForm({ name: '', email: '', password: '' }); },
                successMessage: 'Admin created.'
            },
            'info',
            'Create'
        );
    };

    const handleRevoke = (id: string) => {
        const adminToRevoke = admins.find(a => a.id === id);
        if (!adminToRevoke) return;

        requestAction(
            'Revoke Admin',
            `Are you sure you want to demote ${adminToRevoke.name} to a regular user?`,
            {
                execute: async () => { await adminApi.revokeAdmin(id); fetchAdmins(); },
                optimistic: () => setAdmins(prev => prev.filter(a => a.id !== id)),
                revert: () => setAdmins(prev => [...prev, adminToRevoke]),
                successMessage: 'Admin access revoked.'
            },
            'danger',
            'Revoke Clearance'
        );
    };

    const togglePermission = (adminId: string, permKey: string, currentVal: boolean) => {
        requestAction(
            'Update Permission',
            `Are you sure you want to ${currentVal ? 'revoke' : 'grant'} ${permKey} access?`,
            {
                execute: async () => { await adminApi.updatePermissions(adminId, { [permKey]: !currentVal }); },
                optimistic: () => setAdmins(prev => prev.map(a => a.id === adminId ? { ...a, permissions: { ...a.permissions, [permKey]: !currentVal } } : a)),
                revert: () => setAdmins(prev => prev.map(a => a.id === adminId ? { ...a, permissions: { ...a.permissions, [permKey]: currentVal } } : a)),
                successMessage: 'Permission updated.'
            },
            currentVal ? 'warning' : 'info',
            'Update'
        );
    };

    return (
        <div className="space-y-8">
            {ToastComponent}

            <header className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="text-alpine-glacier" size={28} />
                        <h1 className="text-3xl font-serif font-bold tracking-wide text-gradient-glacier glow-text">Admin Management</h1>
                    </div>
                    <p className="text-white/50 text-sm">Manage administrator accounts and their access permissions</p>
                </div>
                {user?.role === 'SuperAdmin' && (
                    <button onClick={() => setShowCreate(true)} className="py-2.5 px-5 flex items-center gap-2 bg-alpine-glacier text-alpine-navy font-bold rounded-xl btn-premium">
                        <Plus size={18} /><span>New Admin</span>
                    </button>
                )}
            </header>

            {/* Admin Table */}
            <div className="rounded-2xl overflow-hidden premium-card">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5 text-sm font-medium text-white/50 tracking-wider">
                                <th className="p-5 uppercase">Admin</th>
                                <th className="p-5 uppercase">Role</th>
                                {PERMISSION_KEYS.map(p => <th key={p.key} className="p-5 uppercase text-center text-xs">{p.label}</th>)}
                                <th className="p-5 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                [1,2].map(i => (
                                    <tr key={i}><td colSpan={8} className="p-5"><div className="h-12 bg-white/5 rounded-xl animate-pulse" /></td></tr>
                                ))
                            ) : admins.map(admin => (
                                <tr key={admin.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-alpine-navy flex items-center justify-center font-bold text-alpine-glacier border border-white/10 shrink-0">
                                                {admin.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white whitespace-nowrap">{admin.name}</p>
                                                <p className="text-xs text-white/40">{admin.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase ${admin.role === 'SuperAdmin' ? 'bg-amber-500/20 text-amber-400' : 'bg-alpine-glacier/20 text-alpine-glacier'}`}>
                                            {admin.role}
                                        </span>
                                    </td>
                                    {PERMISSION_KEYS.map(p => (
                                        <td key={p.key} className="p-5 text-center">
                                            {admin.role === 'SuperAdmin' ? (
                                                <Check size={18} className="text-amber-400 mx-auto" />
                                            ) : (
                                                <button
                                                    onClick={() => togglePermission(admin.id, p.key, admin.permissions?.[p.key])}
                                                    disabled={updatingPerms === admin.id + p.key}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all mx-auto ${admin.permissions?.[p.key]
                                                        ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                                        : 'bg-white/5 text-white/20 hover:bg-white/10 hover:text-white/50'
                                                    }`}
                                                >
                                                    {updatingPerms === admin.id + p.key ? <Loader2 className="animate-spin" size={14} /> :
                                                     admin.permissions?.[p.key] ? <Check size={14} /> : <X size={14} />}
                                                </button>
                                            )}
                                        </td>
                                    ))}
                                    <td className="p-5 text-right">
                                        {admin.role !== 'SuperAdmin' && (
                                            <button onClick={() => handleRevoke(admin.id)} className="px-4 py-2 bg-red-500/10 text-red-400 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-all flex items-center gap-1 ml-auto">
                                                <UserX size={14} /> Revoke
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {!loading && admins.length === 0 && (
                    <div className="p-12 text-center text-white/30 font-mono text-sm">[ NO_ADMINS_FOUND ]</div>
                )}
            </div>

            {/* Create Admin Modal */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-y-0 right-0 left-[var(--sidebar-width,0px)] z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowCreate(false)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="premium-card rounded-3xl p-8 max-w-md w-full" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                            <h2 className="text-2xl font-bold text-white mb-6 font-serif">New Admin</h2>
                            <div className="space-y-4">
                                <input placeholder="Name" value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50" />
                                <input placeholder="Email" value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50" />
                                <input type="password" placeholder="Password" value={createForm.password} onChange={e => setCreateForm({...createForm, password: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50" />
                                <div>
                                    <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">Permissions</label>
                                    {PERMISSION_KEYS.map(p => (
                                        <label key={p.key} className="flex items-center gap-3 py-2 cursor-pointer group">
                                            <input type="checkbox" checked={createPerms[p.key]} onChange={e => setCreatePerms({...createPerms, [p.key]: e.target.checked})} className="appearance-none w-5 h-5 border-2 border-white/20 rounded bg-black/20 checked:bg-alpine-glacier checked:border-alpine-glacier transition-all cursor-pointer" />
                                            <span className="text-sm text-white/70 group-hover:text-white transition-colors">{p.desc}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowCreate(false)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all">Cancel</button>
                                <button onClick={handleCreate} disabled={saving} className="flex-1 py-3 rounded-xl bg-alpine-glacier text-alpine-navy font-bold btn-premium flex items-center justify-center gap-2">{saving ? <Loader2 className="animate-spin" size={18} /> : 'Create Admin'}</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
