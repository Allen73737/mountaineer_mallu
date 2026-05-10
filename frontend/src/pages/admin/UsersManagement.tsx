import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Trash2, Loader2, Shield } from 'lucide-react';
import { usersApi } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { useAdminAction } from '../../store/useAdminAction';

export const UsersManagement = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<any>(null);
    const [changingRole, setChangingRole] = useState<string | null>(null);
    const { showToast, ToastComponent } = useToast();
    const { requestAction } = useAdminAction();

    useEffect(() => { fetchUsers(); }, [page, search]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await usersApi.list(page, 20, search);
            setUsers(data.users);
            setPagination(data.pagination);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleDelete = (user: any) => {
        requestAction(
            'Delete User',
            `Are you sure you want to permanently delete the account for ${user.name}?`,
            {
                execute: async () => { await usersApi.delete(user.id); fetchUsers(); },
                optimistic: () => setUsers(prev => prev.filter(u => u.id !== user.id)),
                revert: () => setUsers(prev => [...prev, user]), // simplified revert
                successMessage: 'User deleted.'
            },
            'danger',
            'Delete'
        );
    };

    const handleRoleChange = (userId: string, newRole: string) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;
        
        requestAction(
            'Change Role',
            `Are you sure you want to change ${user.name}'s role to ${newRole}?`,
            {
                execute: async () => {
                    const roleMap: Record<string, string> = { 'User': 'user', 'Admin': 'admin', 'SuperAdmin': 'superadmin' };
                    await usersApi.changeRole(userId, roleMap[newRole] || newRole);
                    fetchUsers();
                },
                optimistic: () => {
                    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
                },
                revert: () => {
                    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: user.role } : u));
                },
                successMessage: `Role changed to ${newRole}.`
            },
            'warning',
            'Change Role'
        );
    };

    const roleColors: Record<string, string> = {
        'User': 'bg-white/10 text-white/70',
        'Admin': 'bg-alpine-glacier/20 text-alpine-glacier',
        'SuperAdmin': 'bg-amber-500/20 text-amber-400'
    };

    return (
        <div className="space-y-8">
            {ToastComponent}

            <header>
                <div className="flex items-center gap-3 mb-2"><Users className="text-alpine-glacier" size={28} /><h1 className="text-3xl font-bold font-serif tracking-wide">Users Management</h1></div>
                <p className="text-white/50 text-sm">View, search, and manage all registered users</p>
            </header>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50"
                />
            </div>

            <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden glass-dark">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead><tr className="border-b border-white/10 bg-white/5 text-sm font-medium text-white/50 tracking-wider">
                            <th className="p-5 uppercase">User</th><th className="p-5 uppercase">Role</th><th className="p-5 uppercase">Profile</th><th className="p-5 uppercase">Joined</th><th className="p-5 uppercase text-right">Actions</th>
                        </tr></thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? [1,2,3,4,5].map(i => <TableRowSkeleton key={i} />) :
                            users.map(user => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-alpine-navy flex items-center justify-center font-bold text-alpine-glacier border border-white/10 shrink-0">
                                                {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" /> : user.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">{user.name}</p>
                                                <p className="text-xs text-white/40">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <select
                                            value={user.role}
                                            onChange={e => handleRoleChange(user.id, e.target.value)}
                                            disabled={user.role === 'SuperAdmin' || changingRole === user.id}
                                            className={`px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase border-none outline-none cursor-pointer transition-colors ${roleColors[user.role] || roleColors['User']}`}
                                        >
                                            <option value="User" className="bg-[#0A0D14] text-white">User</option>
                                            <option value="Admin" className="bg-[#0A0D14] text-white">Admin</option>
                                            <option value="SuperAdmin" className="bg-[#0A0D14] text-white">SuperAdmin</option>
                                        </select>
                                    </td>
                                    <td className="p-5">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${user.isProfileComplete ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/40'}`}>
                                            {user.isProfileComplete ? 'Complete' : 'Incomplete'}
                                        </span>
                                    </td>
                                    <td className="p-5 text-white/50 text-sm">{user.location || '—'}</td>
                                    <td className="p-5 text-right">
                                        {user.role !== 'SuperAdmin' && (
                                            <button onClick={() => handleDelete(user)} className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {!loading && users.length === 0 && <div className="p-12 text-center text-white/30 font-mono text-sm">[ NO_USERS_FOUND ]</div>}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
                <div className="flex justify-center gap-2">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${p === page ? 'bg-alpine-glacier text-alpine-navy' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>{p}</button>
                    ))}
                </div>
            )}
        </div>
    );
};
