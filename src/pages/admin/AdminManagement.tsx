import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldAlert, Check, X, UserPlus, Save, Loader2 } from 'lucide-react';
import { Role, Permissions, mockAdmin, mockUser } from '../../store/useAuthStore';

// Mock data for UI demonstration
const mockAdmins = [
    mockAdmin,
    { ...mockUser, id: '4', name: 'Mike Moderator', role: 'Admin' as Role, permissions: { manageCommunity: true, manageUsers: true, manageEvents: false, manageGallery: false, manageStories: false } }
];

export const AdminManagement = () => {
    const [admins, setAdmins] = useState(mockAdmins);
    const [savingId, setSavingId] = useState<string | null>(null);

    const handlePermissionToggle = (adminId: string, perm: keyof Permissions) => {
        setAdmins(admins.map(a => {
            if (a.id === adminId) {
                return { ...a, permissions: { ...a.permissions, [perm]: !a.permissions[perm] } };
            }
            return a;
        }));
    };

    const handleSave = (adminId: string) => {
        setSavingId(adminId);
        setTimeout(() => {
            setSavingId(null);
        }, 1000); // Simulate network request
    };

    const permissionLabels: Record<keyof Permissions, string> = {
        manageStories: 'Stories',
        manageEvents: 'Events',
        manageGallery: 'Gallery',
        manageCommunity: 'Community',
        manageUsers: 'Users'
    };

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <ShieldAlert className="text-alpine-glacier" size={28} />
                        <h1 className="text-3xl font-bold font-serif tracking-wide">Admin Management</h1>
                    </div>
                    <p className="text-white/50 text-sm">Super Admin Level Clearance Required</p>
                </div>
                <button className="py-2.5 px-5 flex items-center gap-2 bg-alpine-glacier hover:bg-white text-alpine-navy font-bold rounded-xl transition-all">
                    <UserPlus size={18} />
                    <span>New Admin</span>
                </button>
            </header>

            <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden glass-dark">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5 text-sm font-medium text-white/50 tracking-wider">
                                <th className="p-5 uppercase">Admin Personnel</th>
                                <th className="p-5 uppercase">Clearance Level</th>
                                <th className="p-5 uppercase text-center">Permissions</th>
                                <th className="p-5 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {admins.map((admin) => (
                                <tr key={admin.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-alpine-navy flex items-center justify-center font-bold text-alpine-glacier border border-white/10">
                                                {admin.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white tracking-wide">{admin.name}</div>
                                                <div className="text-xs text-white/40">{admin.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className="px-3 py-1 rounded-full bg-alpine-glacier/20 text-alpine-glacier border border-alpine-glacier/30 text-xs font-bold tracking-widest uppercase">
                                            {admin.role}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex flex-wrap items-center justify-center gap-2 max-w-sm mx-auto">
                                            {(Object.keys(admin.permissions) as Array<keyof Permissions>).map(perm => (
                                                <button
                                                    key={perm}
                                                    onClick={() => handlePermissionToggle(admin.id, perm)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${admin.permissions[perm]
                                                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                                                            : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'
                                                        }`}
                                                >
                                                    {admin.permissions[perm] ? <Check size={12} /> : <X size={12} />}
                                                    {permissionLabels[perm]}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="flex justify-end items-center gap-3">
                                            <AnimatePresence mode="wait">
                                                {savingId === admin.id ? (
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-emerald-400 font-medium text-sm flex items-center gap-2">
                                                        <Check size={16} /> Saved
                                                    </motion.div>
                                                ) : (
                                                    <motion.button
                                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                        onClick={() => handleSave(admin.id)}
                                                        className="p-2 text-alpine-glacier hover:text-white bg-alpine-glacier/10 hover:bg-alpine-glacier/20 rounded-lg transition-colors"
                                                        title="Save Configuration"
                                                    >
                                                        <Save size={18} />
                                                    </motion.button>
                                                )}
                                            </AnimatePresence>
                                            <button className="p-2 text-white/40 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition-colors" title="Revoke Clearance">
                                                <ShieldAlert size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
