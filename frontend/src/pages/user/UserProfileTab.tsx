import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { usersApi, communityApi } from '../../lib/api';
import { Mail, MapPin, Phone, Shield, Loader, Layers, Edit2, X, Save, Mountain, Users, Heart, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const UserProfileTab = () => {
    const { user } = useAuthStore();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', phone: '', location: '' });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [saving, setSaving] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [expeditions, setExpeditions] = useState<any[]>([]);
    const [myGroups, setMyGroups] = useState<any[]>([]);
    const [wishlistCount, setWishlistCount] = useState(0);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await usersApi.getMyProfile();
                setProfile(res.user);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
        // Fetch expedition stats
        usersApi.getMyExpeditions().then(data => setExpeditions(data.expeditions || [])).catch(() => {});
        // Fetch community stats
        communityApi.getMyGroups().then(data => setMyGroups(data.groups || [])).catch(() => {});
        // Fetch wishlist count
        usersApi.getWishlist().then(data => setWishlistCount((data.wishlist || []).length)).catch(() => {});
    }, []);

    useEffect(() => {
        if (profile) {
            setEditForm({ name: profile.name || '', phone: profile.phone || '', location: profile.location || '' });
        }
    }, [profile]);

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            const res = await usersApi.updateProfile(editForm);
            setProfile(res.user);
            setIsEditing(false);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return alert('New passwords do not match');
        }
        if (passwordForm.newPassword.length < 8) {
            return alert('Password must be at least 8 characters');
        }
        setSavingPassword(true);
        try {
            await usersApi.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            alert('Password changed successfully');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            alert(err.message || 'Failed to change password');
        } finally {
            setSavingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader className="w-8 h-8 text-alpine-glacier animate-spin" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl"
        >
            <div className="mb-6 sm:mb-10">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-alpine-navy dark:text-white mb-3 sm:mb-4 tracking-wide">Explorer Profile</h1>
                <p className="text-alpine-navy/60 dark:text-white/60 text-base sm:text-lg font-light">Manage your personal expedition credentials.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {/* ID Card */}
                <div className="md:col-span-1">
                    <div className="bg-white/60 dark:bg-[#11141A] backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-black/5 dark:border-white/5 relative overflow-hidden shadow-xl dark:shadow-2xl">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Shield size={100} />
                        </div>
                        <div className="absolute top-4 right-4 z-20">
                            <button onClick={() => setIsEditing(!isEditing)} className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl text-alpine-navy/50 dark:text-white/50 hover:text-alpine-navy dark:hover:text-white transition-colors" title="Edit Profile">
                                {isEditing ? <X size={16} /> : <Edit2 size={16} />}
                            </button>
                        </div>
                        <div className="relative z-10 flex flex-col items-center text-center">
                            {profile?.avatar ? (
                                <img src={profile.avatar} alt="Avatar" className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover shadow-[0_0_30px_rgba(163,201,226,0.15)] border-2 border-black/10 dark:border-white/10 mb-4 sm:mb-6" />
                            ) : (
                                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-alpine-navy to-alpine-navy/70 dark:to-black flex items-center justify-center text-3xl sm:text-4xl font-bold text-white shadow-[0_0_30px_rgba(163,201,226,0.15)] border-2 border-black/10 dark:border-white/10 mb-4 sm:mb-6">
                                    {profile?.name.charAt(0)}
                                </div>
                            )}
                            {isEditing ? (
                                <div className="w-full text-left space-y-3 sm:space-y-4 mb-4 sm:mb-6 mt-2">
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-alpine-navy/50 dark:text-white/50 mb-1 block font-bold">Full Name</label>
                                        <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-black/5 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-alpine-navy dark:text-white text-sm focus:outline-none focus:border-alpine-glacier/50 transition-colors" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-alpine-navy/50 dark:text-white/50 mb-1 block font-bold">Phone Number</label>
                                        <input type="text" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full bg-black/5 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-alpine-navy dark:text-white text-sm focus:outline-none focus:border-alpine-glacier/50 transition-colors" placeholder="+1 234 567 890" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-alpine-navy/50 dark:text-white/50 mb-1 block font-bold">Location</label>
                                        <input type="text" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} className="w-full bg-black/5 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-alpine-navy dark:text-white text-sm focus:outline-none focus:border-alpine-glacier/50 transition-colors" placeholder="e.g. Kathmandu, Nepal" />
                                    </div>
                                    <button onClick={handleSaveProfile} disabled={saving} className="w-full mt-2 py-2.5 bg-alpine-glacier text-[#0A0D14] font-bold text-sm rounded-lg flex justify-center items-center gap-2 hover:bg-alpine-glacier/90 transition-colors disabled:opacity-50">
                                        {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-xl sm:text-2xl font-bold text-alpine-navy dark:text-white mb-2">{profile?.name}</h2>
                                    <span className="px-3 sm:px-4 py-1.5 rounded-full bg-alpine-glacier/10 text-alpine-glacier text-xs font-bold tracking-widest uppercase mb-4 sm:mb-6 border border-alpine-glacier/20">
                                        {profile?.role}
                                    </span>
                                </>
                            )}
                            <div className="w-full h-px bg-black/5 dark:bg-white/5 mb-4 sm:mb-6" />
                            <div className="flex flex-col gap-3 sm:gap-4 w-full text-left">
                                <div className="flex items-center gap-3 text-alpine-navy/70 dark:text-white/70">
                                    <Mail size={16} className="text-alpine-glacier flex-shrink-0" />
                                    <span className="text-sm truncate">{profile?.email}</span>
                                </div>
                                {profile?.phone && (
                                    <div className="flex items-center gap-3 text-alpine-navy/70 dark:text-white/70">
                                        <Phone size={16} className="text-alpine-glacier flex-shrink-0" />
                                        <span className="text-sm">{profile?.phone}</span>
                                    </div>
                                )}
                                {profile?.location && (
                                    <div className="flex items-center gap-3 text-alpine-navy/70 dark:text-white/70">
                                        <MapPin size={16} className="text-alpine-glacier flex-shrink-0" />
                                        <span className="text-sm">{profile?.location}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats / Details */}
                <div className="md:col-span-2 space-y-6 sm:space-y-8">
                    <div className="bg-white/60 dark:bg-[#11141A] backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-black/5 dark:border-white/5 shadow-xl dark:shadow-2xl">
                        <h3 className="text-lg sm:text-xl font-bold text-alpine-navy dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
                            <Layers size={20} className="text-alpine-glacier" />
                            Explorer Stats
                        </h3>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {/* Expeditions Completed */}
                            <div className="bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-500/20 relative overflow-hidden group">
                                <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity"><CheckCircle2 size={40} /></div>
                                <p className="text-alpine-navy/50 dark:text-white/50 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-2">Completed</p>
                                <p className="text-3xl sm:text-4xl font-serif text-emerald-500 font-black">{expeditions.filter(e => new Date(e.eventId?.date) < new Date()).length}</p>
                            </div>
                            {/* Upcoming Expeditions */}
                            <div className="bg-gradient-to-br from-alpine-sunrise/10 to-transparent rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-alpine-sunrise/20 relative overflow-hidden group">
                                <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity"><Calendar size={40} /></div>
                                <p className="text-alpine-navy/50 dark:text-white/50 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-2">Upcoming</p>
                                <p className="text-3xl sm:text-4xl font-serif text-alpine-sunrise font-black">{expeditions.filter(e => new Date(e.eventId?.date) >= new Date()).length}</p>
                            </div>
                            {/* Communities Joined */}
                            <div className="bg-gradient-to-br from-alpine-glacier/10 to-transparent rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-alpine-glacier/20 relative overflow-hidden group">
                                <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity"><Users size={40} /></div>
                                <p className="text-alpine-navy/50 dark:text-white/50 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-2">Factions</p>
                                <p className="text-3xl sm:text-4xl font-serif text-alpine-glacier font-black">{myGroups.length}</p>
                            </div>
                            {/* Wishlisted Items */}
                            <div className="bg-gradient-to-br from-red-500/10 to-transparent rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-red-500/20 relative overflow-hidden group">
                                <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity"><Heart size={40} /></div>
                                <p className="text-alpine-navy/50 dark:text-white/50 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-2">Wishlisted</p>
                                <p className="text-3xl sm:text-4xl font-serif text-red-500 font-black">{wishlistCount}</p>
                            </div>
                            {/* Saved Collections */}
                            <div className="bg-black/5 dark:bg-black/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-black/5 dark:border-white/5">
                                <p className="text-alpine-navy/50 dark:text-white/50 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-2">Collections</p>
                                <p className="text-3xl sm:text-4xl font-serif text-alpine-navy dark:text-white">{profile?.collections?.length || 0}</p>
                            </div>
                            {/* Downloaded Media */}
                            <div className="bg-black/5 dark:bg-black/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-black/5 dark:border-white/5">
                                <p className="text-alpine-navy/50 dark:text-white/50 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-2">Downloads</p>
                                <p className="text-3xl sm:text-4xl font-serif text-alpine-navy dark:text-white">{profile?.downloads?.length || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Change Password */}
                    <div className="bg-white/60 dark:bg-[#11141A] backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-black/5 dark:border-white/5 shadow-xl dark:shadow-2xl">
                        <h3 className="text-lg sm:text-xl font-bold text-alpine-navy dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
                            <Shield size={20} className="text-red-400" />
                            Security
                        </h3>
                        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-sm">
                            <div>
                                <label className="text-[10px] uppercase tracking-widest text-alpine-navy/50 dark:text-white/50 mb-1 block font-bold">Current Password</label>
                                <input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} className="w-full bg-black/5 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-alpine-navy dark:text-white text-sm focus:outline-none focus:border-red-400/50 transition-colors" required />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-widest text-alpine-navy/50 dark:text-white/50 mb-1 block font-bold">New Password</label>
                                <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="w-full bg-black/5 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-alpine-navy dark:text-white text-sm focus:outline-none focus:border-red-400/50 transition-colors" required minLength={8} />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-widest text-alpine-navy/50 dark:text-white/50 mb-1 block font-bold">Confirm New Password</label>
                                <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} className="w-full bg-black/5 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-alpine-navy dark:text-white text-sm focus:outline-none focus:border-red-400/50 transition-colors" required minLength={8} />
                            </div>
                            <button type="submit" disabled={savingPassword} className="w-full mt-2 py-2.5 bg-red-500/10 text-red-500 font-bold text-sm rounded-lg flex justify-center items-center gap-2 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-red-500 transition-all disabled:opacity-50">
                                {savingPassword ? <Loader size={16} className="animate-spin" /> : <Shield size={16} />} Update Password
                            </button>
                        </form>
                    </div>

                    {/* Quick Action Links */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <Link to="/portal/expeditions" className="group">
                            <div className="bg-white/60 dark:bg-[#11141A] backdrop-blur-md rounded-2xl p-5 border border-black/5 dark:border-white/5 shadow-lg flex items-center justify-between hover:border-alpine-glacier/30 transition-all">
                                <div className="flex items-center gap-3">
                                    <Mountain size={20} className="text-alpine-glacier" />
                                    <span className="font-semibold text-sm text-alpine-navy dark:text-white">My Expeditions</span>
                                </div>
                                <ArrowRight size={16} className="text-alpine-navy/30 dark:text-white/30 group-hover:translate-x-1 group-hover:text-alpine-glacier transition-all" />
                            </div>
                        </Link>
                        <Link to="/portal/communities" className="group">
                            <div className="bg-white/60 dark:bg-[#11141A] backdrop-blur-md rounded-2xl p-5 border border-black/5 dark:border-white/5 shadow-lg flex items-center justify-between hover:border-alpine-glacier/30 transition-all">
                                <div className="flex items-center gap-3">
                                    <Users size={20} className="text-alpine-glacier" />
                                    <span className="font-semibold text-sm text-alpine-navy dark:text-white">My Factions</span>
                                </div>
                                <ArrowRight size={16} className="text-alpine-navy/30 dark:text-white/30 group-hover:translate-x-1 group-hover:text-alpine-glacier transition-all" />
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
