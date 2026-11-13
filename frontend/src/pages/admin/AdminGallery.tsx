import React, { useState } from 'react';
import { Image as ImageIcon, CheckCircle, Settings2 } from 'lucide-react';
import { GalleryApprovals } from './GalleryApprovals';
import { GalleryManagement } from './GalleryManagement';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminGallery = () => {
    const [activeTab, setActiveTab] = useState<'manage' | 'approvals'>('manage');

    return (
        <div className="space-y-8">
            <header className="mm-rise flex flex-col gap-5 md:flex-row md:justify-between md:items-end">
                <div>
                    <p className="mm-eyebrow mb-3">Content · Visual vault</p>
                    <h1 className="mm-title text-[2.4rem] sm:text-5xl md:text-[3.5rem]">The <em>gallery</em></h1>
                    <p className="mm-muted text-sm md:text-base mt-3 max-w-2xl leading-relaxed">Manage the visual vault and review community submissions</p>
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
