import React, { useCallback, useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, Wrench, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { auditApi, type AuditEntry } from '../../lib/api';
import { Panel } from '../../components/console/ConsoleKit';
import { ErrorState } from '../../components/ui/ErrorState';

const FILTERS = [
    { key: '', label: 'Everything' },
    { key: 'admin_action', label: 'Admin actions' },
    { key: 'login_failure', label: 'Failed logins' },
    { key: 'login_success', label: 'Sign-ins' },
];

const TYPE_META: Record<AuditEntry['type'], { icon: typeof Wrench; tone: string; label: string }> = {
    admin_action: { icon: Wrench, tone: 'text-alpine-glacier border-alpine-glacier/25 bg-alpine-glacier/[0.06]', label: 'Admin' },
    login_failure: { icon: ShieldAlert, tone: 'text-red-300 border-red-400/25 bg-red-400/[0.06]', label: 'Failed' },
    login_success: { icon: ShieldCheck, tone: 'text-emerald-300 border-emerald-300/20 bg-emerald-300/[0.05]', label: 'Sign-in' },
};

const dayLabel = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    const yest = new Date(Date.now() - 86400000);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yest.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
};

/** Who did what, when — admin writes plus sign-in activity from the last 30 days. */
export const AuditLog = () => {
    const [type, setType] = useState('');
    const [page, setPage] = useState(1);
    const [logs, setLogs] = useState<AuditEntry[]>([]);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await auditApi.list({ type, page });
            setLogs(res.logs);
            setPages(Math.max(1, res.pagination.pages));
            setTotal(res.pagination.total);
        } catch (e: any) {
            setError(e.message || 'Could not load the audit log.');
        } finally {
            setLoading(false);
        }
    }, [type, page]);

    useEffect(() => { load(); }, [load]);

    // Group rows under day headings
    const groups: { day: string; rows: AuditEntry[] }[] = [];
    logs.forEach(l => {
        const day = dayLabel(l.at);
        const g = groups[groups.length - 1];
        if (g && g.day === day) g.rows.push(l); else groups.push({ day, rows: [l] });
    });

    return (
        <div className="space-y-6">
            <header className="mm-rise flex flex-col gap-5 md:flex-row md:justify-between md:items-end">
                <div>
                    <p className="mm-eyebrow mb-3">Platform · Accountability</p>
                    <h1 className="mm-title text-[2.4rem] sm:text-5xl md:text-[3.5rem]">Audit <em>log</em></h1>
                    <p className="mm-muted text-sm md:text-base mt-3 max-w-2xl leading-relaxed">Every change made by an administrator and every sign-in attempt from the last 30 days.</p>
                </div>
                <button onClick={load} className="mm-btn mm-btn--ghost" disabled={loading}>
                    <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </header>

            <div className="flex flex-wrap items-center gap-2">
                {FILTERS.map(f => (
                    <button
                        key={f.key}
                        onClick={() => { setType(f.key); setPage(1); }}
                        className={`h-9 px-4 rounded-full text-xs font-medium border transition-colors ${type === f.key ? 'bg-alpine-snow text-alpine-navy border-transparent' : 'border-[var(--mm-line-strong)] mm-muted hover:text-[var(--mm-ink)]'}`}
                    >
                        {f.label}
                    </button>
                ))}
                <span className="ml-auto font-mono text-[10px] tracking-[0.2em] uppercase mm-faint">{total.toLocaleString()} entries</span>
            </div>

            {error ? <ErrorState title="Audit log unavailable" message={error} onRetry={load} /> : (
                <Panel className="p-2 md:p-3">
                    {loading && !logs.length ? (
                        <div className="p-3 space-y-3">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 rounded-xl bg-white/[0.03] animate-pulse" />)}</div>
                    ) : logs.length === 0 ? (
                        <p className="p-10 text-center text-sm mm-faint">Nothing recorded for this filter yet.</p>
                    ) : groups.map(g => (
                        <section key={g.day} className="mb-2 last:mb-0">
                            <p className="px-3 pt-3 pb-2 font-mono text-[10px] tracking-[0.24em] uppercase mm-faint">{g.day}</p>
                            <ul>
                                {g.rows.map(l => {
                                    const meta = TYPE_META[l.type];
                                    return (
                                        <li key={l.id} className="flex items-center gap-3 md:gap-4 px-3 py-3 rounded-xl hover:bg-white/[0.03] transition-colors">
                                            <span className={`grid place-items-center w-9 h-9 rounded-full border shrink-0 ${meta.tone}`}><meta.icon size={15} /></span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-[var(--mm-ink)] truncate">
                                                    <span className="font-medium">{l.user?.name || l.email || 'Unknown'}</span>
                                                    <span className="mm-muted"> — {l.details || meta.label}</span>
                                                </p>
                                                <p className="text-xs mm-faint truncate">{[l.user?.role, l.email, l.ip].filter(Boolean).join(' · ')}</p>
                                            </div>
                                            <span className="font-mono text-[11px] mm-faint tabular-nums shrink-0">{new Date(l.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    ))}
                </Panel>
            )}

            {pages > 1 && (
                <div className="flex items-center justify-center gap-3">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="mm-btn mm-btn--ghost !w-10 !px-0 disabled:opacity-30" aria-label="Previous page"><ChevronLeft size={16} /></button>
                    <span className="font-mono text-xs mm-muted tabular-nums">{page} / {pages}</span>
                    <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages} className="mm-btn mm-btn--ghost !w-10 !px-0 disabled:opacity-30" aria-label="Next page"><ChevronRight size={16} /></button>
                </div>
            )}
        </div>
    );
};
