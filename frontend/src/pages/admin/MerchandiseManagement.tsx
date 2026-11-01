import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Plus, Edit2, Trash2, Save, X, Tag, IndianRupee, UploadCloud } from 'lucide-react';
import { Loader2 } from '../../components/ui/BrandLoader';
import { merchandiseApi } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { useAdminAction } from '../../store/useAdminAction';

interface Merchandise {
    _id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    currency: string;
    image: string;
    category: string;
    inStock: boolean;
    badge?: string;
    order: number;
}

export const MerchandiseManagement = () => {
    const [items, setItems] = useState<Merchandise[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<Merchandise>>({ currency: '₹', inStock: true });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const { showToast, ToastComponent } = useToast();

    // Tilt effect state for the live preview
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    const { requestAction } = useAdminAction();

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const data = await merchandiseApi.list();
            setItems(data);
        } catch (err: any) {
            showToast(err.message || 'Failed to fetch merchandise', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const isUpdate = !!currentItem._id;
        const actionName = isUpdate ? 'Update Merchandise' : 'Create Merchandise';
        const actionDesc = isUpdate ? 'Are you sure you want to update this item?' : 'Are you sure you want to create this item?';
        const payload = { ...currentItem };

        requestAction(
            actionName,
            actionDesc,
            {
                execute: async () => {
                    let payload: any = { ...currentItem };
                    if (imageFile) {
                        const formData = new FormData();
                        Object.keys(payload).forEach(key => {
                            if (payload[key] !== undefined) formData.append(key, String(payload[key]));
                        });
                        formData.append('image', imageFile);
                        payload = formData;
                    }

                    if (isUpdate) await merchandiseApi.update(currentItem._id as string, payload);
                    else await merchandiseApi.create(payload);
                    fetchItems();
                },
                optimistic: () => {
                    setIsEditing(false);
                    setCurrentItem({ currency: '₹', inStock: true });
                    setImageFile(null);
                },
                successMessage: `Merchandise ${isUpdate ? 'updated' : 'added'} successfully.`
            },
            'info',
            'Save'
        );
    };

    const handleDelete = (id: string) => {
        const itemToDelete = items.find(i => i._id === id);
        if (!itemToDelete) return;

        requestAction(
            'Remove Merchandise',
            `Are you sure you want to remove "${itemToDelete.name}"?`,
            {
                execute: async () => { await merchandiseApi.delete(id); fetchItems(); },
                optimistic: () => setItems(prev => prev.filter(i => i._id !== id)),
                revert: () => setItems(prev => [...prev, itemToDelete]),
                successMessage: 'Merchandise removed.'
            },
            'danger',
            'Remove'
        );
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setMousePos({ x, y });
    };

    return (
        <div className="space-y-8">
            {ToastComponent}

            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <ShoppingBag className="text-alpine-glacier" size={28} />
                        <h1 className="text-3xl font-bold font-serif tracking-wide text-gradient-glacier glow-text">Merchandise</h1>
                    </div>
                    <p className="text-white/50 text-sm">Manage the expedition gear and merchandise shown in the shop.</p>
                </div>
                <button
                    onClick={() => { setCurrentItem({ currency: '₹', inStock: true, order: items.length }); setImageFile(null); setIsEditing(true); }}
                    className="py-2 px-4 flex items-center gap-2 bg-alpine-glacier text-alpine-navy font-bold rounded-xl btn-premium"
                >
                    <Plus size={18} />
                    <span>Add Item</span>
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left: Grid View */}
                <div className="w-full lg:w-2/3 space-y-4">
                    {loading ? (
                        <div className="h-64 flex items-center justify-center">
                            <Loader2 className="animate-spin text-alpine-glacier" size={32} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {items.map((item) => (
                                <motion.div
                                    key={item._id}
                                    layoutId={item._id}
                                    className="premium-card rounded-2xl p-4 flex gap-4 group relative overflow-hidden"
                                >
                                    {!item.inStock && (
                                        <div className="absolute top-2 right-2 bg-red-500/80 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow z-10">
                                            Out of Stock
                                        </div>
                                    )}
                                    <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 relative bg-black/40">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-screen" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                                            <button onClick={() => { setCurrentItem(item); setImageFile(null); setIsEditing(true); }} className="p-1.5 bg-white/20 rounded hover:bg-white/40 text-white transition-colors">
                                                <Edit2 size={12} />
                                            </button>
                                            <button onClick={() => handleDelete(item._id)} className="p-1.5 bg-red-500/80 rounded hover:bg-red-500 text-white transition-colors">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1 flex flex-col justify-center">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-white font-bold text-sm truncate mb-1 pr-2">{item.name}</h3>
                                        </div>
                                        <p className="text-alpine-glacier text-[10px] uppercase tracking-widest font-semibold mb-2 flex items-center gap-1"><Tag size={10} /> {item.category}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white text-sm font-bold">{item.currency}{item.price}</span>
                                            {item.originalPrice && item.originalPrice > item.price && (
                                                <span className="text-white/40 text-xs line-through">{item.currency}{item.originalPrice}</span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {items.length === 0 && (
                                <div className="col-span-1 md:col-span-2 py-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                                    <ShoppingBag className="mx-auto text-white/20 mb-3" size={32} />
                                    <p className="text-white/40 text-sm">No merchandise added yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Live Interactive Premium Card Preview */}
                <div className="w-full lg:w-1/3">
                    <div className="sticky top-8 bg-black/40 border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center overflow-hidden perspective-[1200px] min-h-[500px]">
                        <div className="absolute top-4 left-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                            <span className="text-[10px] font-mono text-emerald-400/80 uppercase tracking-widest">Live Store Preview</span>
                        </div>
                        
                        <p className="text-white/40 text-xs text-center mb-8 mt-4">Hover to interact with the 3D showcase card</p>

                        <motion.div 
                            className="relative w-full max-w-[260px] aspect-[4/5] rounded-3xl"
                            onMouseMove={handleMouseMove}
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => { setIsHovering(false); setMousePos({ x: 0, y: 0 }); }}
                            animate={{
                                rotateY: isHovering ? mousePos.x * 20 : 0,
                                rotateX: isHovering ? mousePos.y * -20 : 0,
                                scale: isHovering ? 1.05 : 1,
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            {/* Card Background Layer */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md overflow-hidden">
                                {/* Glassmorphism shine */}
                                <motion.div 
                                    className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2"
                                    animate={{
                                        x: isHovering ? mousePos.x * 200 + '%' : '-50%',
                                        y: isHovering ? mousePos.y * 200 + '%' : '-50%'
                                    }}
                                    transition={{ type: "tween", ease: "linear", duration: 0.1 }}
                                />
                            </div>

                            {/* Badge */}
                            {(currentItem.badge || !currentItem.inStock) && (
                                <div className="absolute top-4 left-4 z-20" style={{ transform: 'translateZ(40px)' }}>
                                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg ${!currentItem.inStock ? 'bg-red-500 text-white' : 'bg-alpine-glacier text-alpine-navy'}`}>
                                        {!currentItem.inStock ? 'Sold Out' : currentItem.badge}
                                    </span>
                                </div>
                            )}

                            {/* Image Layer (Floating) */}
                            <div className="absolute inset-x-4 top-12 bottom-32 flex items-center justify-center z-10" style={{ transform: 'translateZ(60px)' }}>
                                {currentItem.image || imageFile ? (
                                    <img 
                                        src={imageFile ? URL.createObjectURL(imageFile) : currentItem.image} 
                                        alt="Preview" 
                                        className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] mix-blend-screen" 
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                                        <ShoppingBag size={32} className="text-white/20" />
                                    </div>
                                )}
                            </div>

                            {/* Content Layer */}
                            <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-b-3xl z-20" style={{ transform: 'translateZ(30px)' }}>
                                <p className="text-alpine-glacier text-[9px] uppercase tracking-widest font-bold mb-1">{currentItem.category || 'Category'}</p>
                                <h3 className="text-white font-serif text-lg font-bold leading-tight mb-2 line-clamp-2">{currentItem.name || 'Merchandise Item Name'}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-white text-lg font-bold tracking-tight">{currentItem.currency || '₹'}{currentItem.price || '0.00'}</span>
                                    {currentItem.originalPrice && currentItem.originalPrice > (currentItem.price || 0) && (
                                        <span className="text-white/40 text-xs line-through">{currentItem.currency}{currentItem.originalPrice}</span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Editor Modal */}
            <AnimatePresence>
                {isEditing && (
                    <div className="fixed inset-y-0 right-0 left-[var(--sidebar-width,0px)] z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-2xl bg-alpine-navy border border-white/10 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/[0.02] shrink-0">
                                <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                                    <ShoppingBag size={20} className="text-alpine-glacier" />
                                    {currentItem._id ? 'Edit Merchandise' : 'Add Merchandise'}
                                </h2>
                                <button onClick={() => setIsEditing(false)} className="text-white/50 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1.5 col-span-2 md:col-span-1">
                                        <label className="text-xs font-medium text-white/60">Product Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={currentItem.name || ''}
                                            onChange={e => setCurrentItem({ ...currentItem, name: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50 text-sm"
                                            placeholder="e.g. Alpine Pro Jacket"
                                        />
                                    </div>
                                    <div className="space-y-1.5 col-span-2 md:col-span-1">
                                        <label className="text-xs font-medium text-white/60">Category</label>
                                        <input
                                            type="text"
                                            required
                                            value={currentItem.category || ''}
                                            onChange={e => setCurrentItem({ ...currentItem, category: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50 text-sm"
                                            placeholder="e.g. Apparel, Equipment"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-white/60 flex items-center gap-1"><IndianRupee size={12} /> Price</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-white/40 text-sm">{currentItem.currency}</span>
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                step="0.01"
                                                value={currentItem.price || ''}
                                                onChange={e => setCurrentItem({ ...currentItem, price: parseFloat(e.target.value) })}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50 text-sm"
                                                placeholder="999.00"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-white/60">Original Price (Strike)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-white/40 text-sm">{currentItem.currency}</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={currentItem.originalPrice || ''}
                                                onChange={e => setCurrentItem({ ...currentItem, originalPrice: parseFloat(e.target.value) })}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50 text-sm"
                                                placeholder="1299.00"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-white/60">Badge Text</label>
                                        <input
                                            type="text"
                                            value={currentItem.badge || ''}
                                            onChange={e => setCurrentItem({ ...currentItem, badge: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50 text-sm"
                                            placeholder="e.g. New Arrival"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-white/60">Description</label>
                                    <textarea
                                        required
                                        value={currentItem.description || ''}
                                        onChange={e => setCurrentItem({ ...currentItem, description: e.target.value })}
                                        rows={3}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50 text-sm resize-none custom-scrollbar"
                                        placeholder="Detailed description of the product..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-5 mt-5">
                                    <div className="space-y-1.5 col-span-2">
                                        <label className="text-xs font-medium text-white/60">Product Image</label>
                                        <div className="flex flex-col sm:flex-row items-center gap-4">
                                            <div className="w-full sm:flex-1 relative">
                                                <input
                                                    type="url"
                                                    value={currentItem.image || ''}
                                                    onChange={e => setCurrentItem({ ...currentItem, image: e.target.value })}
                                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-alpine-glacier/50 text-sm"
                                                    placeholder="Enter image URL..."
                                                />
                                            </div>
                                            <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest shrink-0">OR</div>
                                            <div className="w-full sm:flex-1 relative group">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={e => setImageFile(e.target.files?.[0] || null)}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <div className={`w-full bg-black/20 border ${imageFile ? 'border-alpine-glacier/50 text-alpine-glacier' : 'border-white/10 text-white/60'} group-hover:border-alpine-glacier/50 group-hover:text-alpine-glacier rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 transition-all`}>
                                                    <UploadCloud size={16} />
                                                    <span className="text-sm font-medium truncate">{imageFile ? imageFile.name : 'Upload from Device'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-2 flex items-center mt-2">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={currentItem.inStock}
                                                onChange={e => setCurrentItem({ ...currentItem, inStock: e.target.checked })}
                                                className="w-5 h-5 rounded border-white/20 bg-black/20 text-alpine-glacier focus:ring-alpine-glacier/50 focus:ring-offset-0 transition-colors cursor-pointer"
                                            />
                                            <span className="text-sm font-medium text-white">Item in Stock</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/10 flex justify-end gap-3 mt-4 shrink-0">
                                    <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2.5 rounded-xl text-white/60 hover:text-white text-sm font-medium transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-alpine-glacier text-alpine-navy text-sm font-bold flex items-center gap-2 btn-premium">
                                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        {saving ? 'Saving...' : 'Save Product'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
