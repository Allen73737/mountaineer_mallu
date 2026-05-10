import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Shield, Save, Key, User, Mail, Camera, Phone, MapPin, Loader, Lock } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { usersApi } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';

export const AdminProfile = () => {
    const { user, checkAuth } = useAuthStore();
    const { showToast, ToastComponent } = useToast();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // Form states
    const [profileForm, setProfileForm] = useState({ name: '', phone: '', location: '' });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    
    // Status states
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await usersApi.getMyProfile();
                setProfile(res.user);
                setProfileForm({
                    name: res.user.name || '',
                    phone: res.user.phone || '',
                    location: res.user.location || ''
                });
            } catch (err) {
                showToast('Failed to load profile details', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const res = await usersApi.updateProfile(profileForm);
            setProfile(res.user);
            showToast('Profile updated successfully', 'success');
            checkAuth(); // Refresh global user state
        } catch (err: any) {
            showToast(err.message || 'Failed to update profile', 'error');
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return showToast('New passwords do not match', 'error');
        }
        if (passwordForm.newPassword.length < 8) {
            return showToast('Password must be at least 8 characters', 'error');
        }
        
        setSavingPassword(true);
        try {
            await usersApi.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            showToast('Password changed successfully', 'success');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            showToast(err.message || 'Failed to change password', 'error');
        } finally {
            setSavingPassword(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingAvatar(true);
        try {
            const res = await usersApi.uploadAvatar(file);
            setProfile(res.user);
            showToast('Avatar updated successfully', 'success');
            checkAuth(); // Refresh global user state
        } catch (err: any) {
            showToast(err.message || 'Failed to upload avatar', 'error');
        } finally {
            setUploadingAvatar(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
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
            className="max-w-6xl mx-auto space-y-8"
        >
            {ToastComponent}
            <div>
                <h1 className="text-3xl font-serif text-alpine-navy dark:text-white mb-2">Profile & Security</h1>
                <p className="text-alpine-navy/60 dark:text-white/60">Manage your administrative identity and credentials.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ─── Profile Card ────────────────────────────────────── */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white/60 dark:bg-[#11141A] backdrop-blur-md rounded-3xl p-8 border border-black/5 dark:border-white/5 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                            <Shield size={120} />
                        </div>
                        
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="relative group mb-6">
                                {profile?.avatar ? (
                                    <img src={profile.avatar} alt="Avatar" className="w-32 h-32 rounded-full object-cover shadow-2xl border-4 border-alpine-glacier/20" />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-alpine-navy to-[#0A0D14] flex items-center justify-center text-4xl font-bold text-white shadow-2xl border-4 border-alpine-glacier/20">
                                        {profile?.name.charAt(0)}
                                    </div>
                                )}
                                
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingAvatar}
                                    className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white cursor-pointer"
                                >
                                    {uploadingAvatar ? <Loader size={24} className="animate-spin" /> : <Camera size={24} />}
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
                            </div>

                            <h2 className="text-2xl font-bold text-alpine-navy dark:text-white mb-1">{profile?.name}</h2>
                            <p className="text-sm text-alpine-navy/60 dark:text-white/60 mb-4">{profile?.email}</p>
                            
                            <div className="inline-flex px-4 py-1.5 rounded-full bg-alpine-glacier/10 border border-alpine-glacier/20 text-alpine-glacier text-xs font-bold tracking-widest uppercase">
                                {profile?.role}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Edit Forms ──────────────────────────────────────── */}
                <div className="lg:col-span-2 space-y-8">
                    {/* General Information */}
                    <div className="bg-white/60 dark:bg-[#11141A] backdrop-blur-md rounded-3xl p-8 border border-black/5 dark:border-white/5 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <User size={24} className="text-alpine-glacier" />
                            <h3 className="text-xl font-bold text-alpine-navy dark:text-white">General Information</h3>
                        </div>

                        <form onSubmit={handleProfileSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs uppercase tracking-widest text-alpine-navy/60 dark:text-white/60 mb-2 block font-bold">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User size={16} className="text-alpine-navy/40 dark:text-white/40" />
                                        </div>
                                        <input 
                                            type="text" 
                                            value={profileForm.name} 
                                            onChange={e => setProfileForm({...profileForm, name: e.target.value})} 
                                            className="w-full bg-black/5 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-alpine-navy dark:text-white text-sm focus:outline-none focus:border-alpine-glacier/50 transition-colors" 
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs uppercase tracking-widest text-alpine-navy/60 dark:text-white/60 mb-2 block font-bold">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail size={16} className="text-alpine-navy/40 dark:text-white/40" />
                                        </div>
                                        <input 
                                            type="email" 
                                            value={profile?.email} 
                                            disabled 
                                            className="w-full bg-black/5 dark:bg-black/30 border border-black/5 dark:border-white/5 rounded-xl pl-10 pr-4 py-3 text-alpine-navy/50 dark:text-white/50 text-sm cursor-not-allowed" 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs uppercase tracking-widest text-alpine-navy/60 dark:text-white/60 mb-2 block font-bold">Phone Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone size={16} className="text-alpine-navy/40 dark:text-white/40" />
                                        </div>
                                        <input 
                                            type="text" 
                                            value={profileForm.phone} 
                                            onChange={e => setProfileForm({...profileForm, phone: e.target.value})} 
                                            className="w-full bg-black/5 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-alpine-navy dark:text-white text-sm focus:outline-none focus:border-alpine-glacier/50 transition-colors" 
                                            placeholder="+1 234 567 890"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs uppercase tracking-widest text-alpine-navy/60 dark:text-white/60 mb-2 block font-bold">Location</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MapPin size={16} className="text-alpine-navy/40 dark:text-white/40" />
                                        </div>
                                        <input 
                                            type="text" 
                                            value={profileForm.location} 
                                            onChange={e => setProfileForm({...profileForm, location: e.target.value})} 
                                            className="w-full bg-black/5 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-alpine-navy dark:text-white text-sm focus:outline-none focus:border-alpine-glacier/50 transition-colors" 
                                            placeholder="City, Country"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-end">
                                <button 
                                    type="submit" 
                                    disabled={savingProfile} 
                                    className="px-6 py-3 bg-alpine-glacier text-[#0A0D14] font-bold text-sm rounded-xl flex items-center gap-2 hover:bg-white transition-colors disabled:opacity-50"
                                >
                                    {savingProfile ? <Loader size={16} className="animate-spin" /> : <Save size={16} />} 
                                    Save Profile
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Security & Password */}
                    <div className="bg-white/60 dark:bg-[#11141A] backdrop-blur-md rounded-3xl p-8 border border-black/5 dark:border-white/5 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <Key size={24} className="text-red-400" />
                            <h3 className="text-xl font-bold text-alpine-navy dark:text-white">Security & Password</h3>
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            <div className="space-y-4 max-w-md">
                                <div>
                                    <label className="text-xs uppercase tracking-widest text-alpine-navy/60 dark:text-white/60 mb-2 block font-bold">Current Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock size={16} className="text-alpine-navy/40 dark:text-white/40" />
                                        </div>
                                        <input 
                                            type="password" 
                                            value={passwordForm.currentPassword} 
                                            onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} 
                                            className="w-full bg-black/5 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-alpine-navy dark:text-white text-sm focus:outline-none focus:border-red-400/50 transition-colors" 
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs uppercase tracking-widest text-alpine-navy/60 dark:text-white/60 mb-2 block font-bold">New Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Key size={16} className="text-alpine-navy/40 dark:text-white/40" />
                                        </div>
                                        <input 
                                            type="password" 
                                            value={passwordForm.newPassword} 
                                            onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} 
                                            className="w-full bg-black/5 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-alpine-navy dark:text-white text-sm focus:outline-none focus:border-red-400/50 transition-colors" 
                                            required
                                            minLength={8}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs uppercase tracking-widest text-alpine-navy/60 dark:text-white/60 mb-2 block font-bold">Confirm New Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Key size={16} className="text-alpine-navy/40 dark:text-white/40" />
                                        </div>
                                        <input 
                                            type="password" 
                                            value={passwordForm.confirmPassword} 
                                            onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} 
                                            className="w-full bg-black/5 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-alpine-navy dark:text-white text-sm focus:outline-none focus:border-red-400/50 transition-colors" 
                                            required
                                            minLength={8}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-start">
                                <button 
                                    type="submit" 
                                    disabled={savingPassword} 
                                    className="px-6 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-red-500 font-bold text-sm rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
                                >
                                    {savingPassword ? <Loader size={16} className="animate-spin" /> : <Shield size={16} />} 
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
