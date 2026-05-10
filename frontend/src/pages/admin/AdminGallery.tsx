import React, { useState } from 'react';
import { Image as ImageIcon, CheckCircle, Settings2 } from 'lucide-react';
import { GalleryApprovals } from './GalleryApprovals';
import { GalleryManagement } from './GalleryManagement';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminGallery = () => {
    const [activeTab, setActiveTab] = useState<'manage' | 'approvals'>('manage');

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <ImageIcon className="text-alpine-glacier" size={28} />
                        <h1 className="text-3xl font-bold font-serif tracking-wide text-gradient-glacier glow-text">Gallery</h1>
                    </div>
                    <p className="text-white/50 text-sm">Manage the visual vault and review community submissions</p>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="flex gap-2 p-1 bg-black/20 rounded-xl border border-white/5 w-fit">
                <button
                    onClick={() => setActiveTab('manage')}
                    className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                        activeTab === 'manage'
                            ? 'bg-alpine-glacier text-alpine-navy shadow-lg'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <Settings2 size={16} /> Manage Gallery
                </button>
                <button
                    onClick={() => setActiveTab('approvals')}
                    className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                        activeTab === 'approvals'
                            ? 'bg-alpine-glacier text-alpine-navy shadow-lg'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <CheckCircle size={16} /> Gallery Approvals
                </button>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'manage' ? <GalleryManagement /> : <GalleryApprovals />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
