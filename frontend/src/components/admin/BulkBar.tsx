import React, { useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { Loader2 } from '../ui/BrandLoader';

/** Checkbox selection for admin tables. `ids` is the set the "select all" box covers. */
export const useSelection = (ids: string[]) => {
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const visible = useMemo(() => new Set(ids), [ids]);
    // Drop selections that scrolled out of the current list (filter changed, item deleted)
    const effective = useMemo(() => new Set([...selected].filter(id => visible.has(id))), [selected, visible]);
    const toggle = useCallback((id: string) => setSelected(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
    }), []);
    const allSelected = ids.length > 0 && ids.every(id => effective.has(id));
    const toggleAll = useCallback(() => setSelected(allSelected ? new Set() : new Set(ids)), [allSelected, ids]);
    const clear = useCallback(() => setSelected(new Set()), []);
    return { selected: effective, count: effective.size, toggle, toggleAll, allSelected, clear, has: (id: string) => effective.has(id) };
};

export const SelectBox: React.FC<{ checked: boolean; onChange: () => void; label: string; indeterminate?: boolean }> = ({ checked, onChange, label, indeterminate }) => (
    <input
        type="checkbox"
        aria-label={label}
        checked={checked}
        ref={el => { if (el) el.indeterminate = !!indeterminate && !checked; }}
        onChange={onChange}
        onClick={e => e.stopPropagation()}
        className="w-4 h-4 rounded border-white/30 bg-transparent accent-[#A3C9E2] cursor-pointer"
    />
);

/** Floating action bar shown while rows are selected. */
export const BulkBar: React.FC<{
    count: number;
    noun: string;
    onApprove: () => Promise<void> | void;
    onReject: () => Promise<void> | void;
    onClear: () => void;
}> = ({ count, noun, onApprove, onReject, onClear }) => {
    const [busy, setBusy] = useState<null | 'approve' | 'reject'>(null);
    const run = async (kind: 'approve' | 'reject', fn: () => Promise<void> | void) => {
        setBusy(kind);
        try { await fn(); } finally { setBusy(null); }
    };
    return createPortal(
        <AnimatePresence>
            {count > 0 && (
                <motion.div
                    initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                    className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[150] max-w-[calc(100vw-1.5rem)]"
                    role="toolbar"
                    aria-label="Bulk actions"
                >
                    <div className="flex items-center gap-2 pl-5 pr-2 py-2 rounded-full border border-alpine-glacier/20 bg-[#0A111C]/95 backdrop-blur-xl shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] text-white">
                        <span className="text-sm whitespace-nowrap mr-2"><span className="font-semibold tabular-nums">{count}</span> {noun}{count === 1 ? '' : 's'} selected</span>
                        <button onClick={() => run('approve', onApprove)} disabled={!!busy} className="h-9 px-4 rounded-full bg-emerald-400/15 text-emerald-300 hover:bg-emerald-400/25 text-xs font-semibold flex items-center gap-1.5 transition-colors">
                            {busy === 'approve' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} Approve
                        </button>
                        <button onClick={() => run('reject', onReject)} disabled={!!busy} className="h-9 px-4 rounded-full bg-red-400/15 text-red-300 hover:bg-red-400/25 text-xs font-semibold flex items-center gap-1.5 transition-colors">
                            {busy === 'reject' ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />} Reject
                        </button>
                        <button onClick={onClear} className="h-9 w-9 grid place-items-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors" aria-label="Clear selection"><X size={15} /></button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};
