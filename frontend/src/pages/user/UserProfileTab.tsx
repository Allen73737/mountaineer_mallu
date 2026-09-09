import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { usersApi, communityApi } from '../../lib/api';
import { Mail, MapPin, Phone, Shield, Loader, Layers, Edit2, X, Save, Mountain, Users, Heart, Calendar, ArrowRight, CheckCircle2, CloudSnow } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

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
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-7xl mx-auto"
        >
            <div className="mb-6 sm:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-alpine-navy dark:text-white mb-3 sm:mb-4 tracking-wide">Explorer Profile</h1>
                    <p className="text-alpine-navy/60 dark:text-white/60 text-base sm:text-lg font-light">Manage your personal expedition credentials.</p>
                </div>
            </div>

            {/* Basecamp Metrics Bar */}
            <div className="w-full bg-white/40 dark:bg-[#11141A]/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/20 dark:border-white/5 p-8 sm:p-10 mb-8 flex justify-between items-center overflow-hidden relative shadow-[0_30px_100px_rgba(163,201,226,0.15)] group">
                {/* Animated Background Mesh */}
                <div className="absolute inset-0 bg-gradient-to-r from-alpine-glacier/10 via-transparent to-alpine-sunrise/10 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-alpine-glacier/20 rounded-full blur-[100px] pointer-events-none group-hover:bg-alpine-glacier/30 transition-colors duration-1000" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-alpine-sunrise/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="flex flex-wrap gap-10 sm:gap-20 relative z-10 w-full justify-start items-center">
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-alpine-navy/50 dark:text-white/50 mb-2">Total Ascents</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl sm:text-6xl font-black font-serif text-transparent bg-clip-text bg-gradient-to-br from-alpine-navy to-alpine-navy/60 dark:from-white dark:to-white/60 drop-shadow-md">{expeditions.length}</span>
                            <span className="text-alpine-glacier font-bold text-xl">M</span>
                        </div>
                    </div>
                    <div className="w-px h-20 bg-gradient-to-b from-transparent via-black/10 dark:via-white/10 to-transparent hidden sm:block" />
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-alpine-navy/50 dark:text-white/50 mb-2">Elevation Climbed</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl sm:text-6xl font-black font-serif text-transparent bg-clip-text bg-gradient-to-br from-alpine-navy to-alpine-navy/60 dark:from-white dark:to-white/60 drop-shadow-md">{(expeditions.length * 3200).toLocaleString()}</span>
                            <span className="text-alpine-glacier font-bold text-xl">M</span>
                        </div>
                    </div>
                    <div className="w-px h-20 bg-gradient-to-b from-transparent via-black/10 dark:via-white/10 to-transparent hidden md:block" />
                    <div className="flex flex-col hidden md:flex">
                        <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-alpine-navy/50 dark:text-white/50 mb-2">Current Rank</span>
                        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-alpine-glacier to-blue-500 mt-1 uppercase tracking-widest drop-shadow-sm">
                            {expeditions.length > 15 ? 'Alpine Legend' : expeditions.length > 5 ? 'Summit Chaser' : 'Novice'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                {/* ═══ LEFT COLUMN (Profile, Security, Actions) ═══ */}
                <div className="lg:col-span-4 xl:col-span-3 space-y-6 sm:space-y-8">
                    
                    {/* ID Card */}
                    <div className="bg-white/60 dark:bg-[#11141A]/80 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/20 dark:border-white/5 relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] group">
                        {/* Elite Mesh Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-b from-alpine-glacier/5 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-700 transform group-hover:rotate-12 group-hover:scale-110">
                            <Shield size={140} className="text-alpine-glacier" />
                        </div>
                        <div className="absolute top-6 right-6 z-20">
                            <button onClick={() => setIsEditing(!isEditing)} className="p-3 bg-black/5 dark:bg-white/5 hover:bg-alpine-glacier hover:text-[#0A0D14] rounded-2xl text-alpine-navy/50 dark:text-white/50 transition-all shadow-md hover:shadow-xl hover:-translate-y-1" title="Edit Profile">
                                {isEditing ? <X size={18} /> : <Edit2 size={18} />}
                            </button>
                        </div>
                        <div className="relative z-10 flex flex-col items-center text-center">
                            
                            {/* Premium Avatar Container */}
                            <div className="relative mb-8 mt-4">
                                <div className="absolute inset-[-10px] rounded-full border border-alpine-glacier/30 border-dashed animate-[spin_20s_linear_infinite]" />
                                <div className="absolute inset-[-20px] rounded-full border border-alpine-glacier/10 border-solid animate-[spin_30s_linear_infinite_reverse]" />
                                
                                {profile?.avatar ? (
                                    <img src={profile.avatar} alt="Avatar" className="relative z-10 w-32 h-32 rounded-full object-cover shadow-[0_0_40px_rgba(163,201,226,0.3)] border-4 border-white dark:border-[#0A0D14]" />
                                ) : (
                                    <div className="relative z-10 w-32 h-32 rounded-full bg-gradient-to-br from-alpine-navy to-black flex items-center justify-center text-5xl font-black font-serif text-white shadow-[0_0_40px_rgba(163,201,226,0.3)] border-4 border-white dark:border-[#0A0D14]">
                                        {profile?.name.charAt(0)}
                                    </div>
                                )}
                            </div>
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
                                    <span className="px-3 sm:px-4 py-1.5 rounded-full bg-alpine-glacier/10 text-alpine-glacier text-xs font-bold tracking-widest uppercase border border-alpine-glacier/20 inline-block">
                                        {profile?.role}
                                    </span>
                                    
                                    {/* 3D Rank Badge */}
                                    <div className="relative mt-6 mb-2 perspective-1000">
                                        <motion.div 
                                            whileHover={{ rotateY: 15, rotateX: 5, scale: 1.05 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                            className={`w-28 h-28 mx-auto rounded-full bg-gradient-to-br ${expeditions.length > 15 ? 'from-alpine-gold to-yellow-600' : expeditions.length > 5 ? 'from-alpine-glacier to-blue-600' : 'from-slate-400 to-slate-600'} p-1 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative group cursor-pointer`}
                                        >
                                            <div className="w-full h-full bg-white dark:bg-[#11141A] rounded-full flex flex-col items-center justify-center relative overflow-hidden border-2 border-black/5 dark:border-white/10">
                                                <div className="absolute inset-0 bg-gradient-to-tr from-black/5 dark:from-white/5 to-transparent pointer-events-none" />
                                                <Mountain size={28} className="text-alpine-navy/80 dark:text-white/80 mb-1" />
                                                <span className="text-[9px] font-bold tracking-widest text-alpine-navy dark:text-white uppercase text-center leading-tight px-2">
                                                    {expeditions.length > 15 ? 'Alpine Legend' : expeditions.length > 5 ? 'Summit Chaser' : 'Novice'}
                                                </span>
                                            </div>
                                            
                                            {/* 3D Glow / Reflection */}
                                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none transform -skew-x-12 translate-x-full group-hover:-translate-x-full" style={{ transitionDuration: '1.5s' }} />
                                        </motion.div>
                                    </div>
                                </>
                            )}
                            <div className="w-full h-px bg-black/5 dark:bg-white/5 mt-4 mb-4 sm:mb-6" />
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

                    {/* Quick Action Links */}
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
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

                    {/* Change Password */}
                    <div className="bg-white/60 dark:bg-[#11141A] backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-black/5 dark:border-white/5 shadow-xl dark:shadow-2xl">
                        <h3 className="text-lg sm:text-xl font-bold text-alpine-navy dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
                            <Shield size={20} className="text-red-400" />
                            Security
                        </h3>
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
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

                </div>

                {/* ═══ RIGHT COLUMN (Stats, Monolith) ═══ */}
                <div className="lg:col-span-8 xl:col-span-9 space-y-6 sm:space-y-8">
                    
                    {/* Next Mission Monolith */}
                    {expeditions.filter(e => new Date(e.eventId?.date) >= new Date()).length > 0 && (
                        <div className="w-full bg-[#05080f] rounded-[2.5rem] overflow-hidden relative border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.5)] mb-8 group h-[350px]">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-1000 ease-out" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] via-[#0A0D14]/40 to-transparent" />
                            
                            {/* Sweeping Radar Effect */}
                            <motion.div 
                                className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                                animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, transparent 20%, rgba(163,201,226,0.1) 21%, transparent 22%)', backgroundSize: '40px 40px' }}
                            />

                            <div className="absolute top-8 left-8 flex items-center gap-3 z-10">
                                <div className="relative">
                                    <div className="w-3 h-3 rounded-full bg-red-500 absolute inset-0 animate-ping opacity-75" />
                                    <div className="w-3 h-3 rounded-full bg-red-500 relative shadow-[0_0_15px_rgba(239,68,68,1)]" />
                                </div>
                                <span className="text-[10px] sm:text-xs font-black tracking-[0.4em] uppercase text-white drop-shadow-md">Next Objective</span>
                            </div>

                            <div className="absolute top-8 right-8 flex items-center gap-4 z-10 bg-black/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-bold tracking-widest uppercase text-white/70">Live Feed</span>
                                    <span className="text-sm font-bold text-white">-12°C, Snow</span>
                                </div>
                                <CloudSnow size={24} className="text-alpine-snow" />
                            </div>

                            <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end z-10">
                                <div>
                                    <h3 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black text-white tracking-wide mb-3 drop-shadow-2xl group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-alpine-glacier transition-all duration-500">
                                        {expeditions.find(e => new Date(e.eventId?.date) >= new Date())?.eventId?.title || "Mont Blanc Summit"}
                                    </h3>
                                    <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm font-bold tracking-[0.2em] text-white/80 uppercase">
                                        <span className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10"><MapPin size={14} className="text-alpine-glacier"/> {expeditions.find(e => new Date(e.eventId?.date) >= new Date())?.eventId?.location || "French Alps"}</span>
                                        <span className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10"><Calendar size={14} className="text-alpine-glacier"/> {new Date(expeditions.find(e => new Date(e.eventId?.date) >= new Date())?.eventId?.date || Date.now()).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="text-right hidden md:block bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                                    <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/70 block mb-1">T-Minus</span>
                                    <span className="text-4xl font-serif font-black text-alpine-sunrise tabular-nums drop-shadow-[0_0_20px_rgba(226,160,113,0.5)]">14:02:44</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="bg-white/60 dark:bg-[#11141A]/80 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/20 dark:border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
                        <h3 className="text-xl font-bold text-alpine-navy dark:text-white mb-6 flex items-center gap-3 font-serif">
                            <Layers size={24} className="text-alpine-glacier" />
                            Command Stats
                        </h3>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                            {/* Expeditions Completed */}
                            <div className="bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent rounded-2xl p-6 border border-emerald-500/20 relative overflow-hidden group hover:border-emerald-500/50 transition-colors shadow-lg hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500 text-emerald-500"><CheckCircle2 size={60} /></div>
                                <p className="text-emerald-600/70 dark:text-emerald-400/70 text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase mb-3">Missions Complete</p>
                                <p className="text-4xl sm:text-5xl font-serif text-emerald-500 font-black drop-shadow-sm">{expeditions.filter(e => new Date(e.eventId?.date) < new Date()).length}</p>
                            </div>
                            {/* Upcoming Expeditions */}
                            <div className="bg-gradient-to-br from-alpine-sunrise/10 via-transparent to-transparent rounded-2xl p-6 border border-alpine-sunrise/20 relative overflow-hidden group hover:border-alpine-sunrise/50 transition-colors shadow-lg hover:shadow-[0_0_30px_rgba(226,160,113,0.2)]">
                                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500 text-alpine-sunrise"><Calendar size={60} /></div>
                                <p className="text-alpine-sunrise/70 text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase mb-3">Pending Ops</p>
                                <p className="text-4xl sm:text-5xl font-serif text-alpine-sunrise font-black drop-shadow-sm">{expeditions.filter(e => new Date(e.eventId?.date) >= new Date()).length}</p>
                            </div>
                            {/* Communities Joined */}
                            <div className="bg-gradient-to-br from-alpine-glacier/10 via-transparent to-transparent rounded-2xl p-6 border border-alpine-glacier/20 relative overflow-hidden group hover:border-alpine-glacier/50 transition-colors shadow-lg hover:shadow-[0_0_30px_rgba(163,201,226,0.2)]">
                                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500 text-alpine-glacier"><Users size={60} /></div>
                                <p className="text-alpine-glacier/70 text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase mb-3">Allied Factions</p>
                                <p className="text-4xl sm:text-5xl font-serif text-alpine-glacier font-black drop-shadow-sm">{myGroups.length}</p>
                            </div>
                            {/* Wishlisted Items */}
                            <div className="bg-gradient-to-br from-red-500/10 via-transparent to-transparent rounded-2xl p-6 border border-red-500/20 relative overflow-hidden group hover:border-red-500/50 transition-colors shadow-lg hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500 text-red-500"><Heart size={60} /></div>
                                <p className="text-red-500/70 text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase mb-3">Wishlisted</p>
                                <p className="text-4xl sm:text-5xl font-serif text-red-500 font-black drop-shadow-sm">{wishlistCount}</p>
                            </div>
                            {/* Saved Collections */}
                            <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-6 border border-black/5 dark:border-white/10 hover:border-alpine-navy/30 dark:hover:border-white/30 transition-colors shadow-lg">
                                <p className="text-alpine-navy/50 dark:text-white/50 text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase mb-3">Data Vault</p>
                                <p className="text-4xl sm:text-5xl font-serif text-alpine-navy dark:text-white font-black">{profile?.collections?.length || 0}</p>
                            </div>
                            {/* Downloaded Media */}
                            <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-6 border border-black/5 dark:border-white/10 hover:border-alpine-navy/30 dark:hover:border-white/30 transition-colors shadow-lg">
                                <p className="text-alpine-navy/50 dark:text-white/50 text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase mb-3">Local Assets</p>
                                <p className="text-4xl sm:text-5xl font-serif text-alpine-navy dark:text-white font-black">{profile?.downloads?.length || 0}</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </motion.div>
    );
};
