import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Calendar, Image as ImageIcon, Compass, BookOpen, Star, ShieldAlert, ShieldCheck, ChevronDown, RefreshCw, Sparkles, MapPin, ArrowUpRight, Shield } from 'lucide-react';
import { adminApi } from '../../lib/api';
import { StatSkeleton } from '../../components/ui/Skeleton';
import { API_URL } from '../../lib/constants';
import { useAuthStore } from '../../store/useAuthStore';
import { SummitHero } from '../../components/console/SummitHero';
import { Panel, PanelTitle, PanelLink, StatTile, Sparkline, Meter } from '../../components/console/ConsoleKit';
import { ErrorState } from '../../components/ui/ErrorState';

const severityStyle = (severity: string) => {
    switch (severity) {
        case 'critical': return 'text-red-300 border-red-400/25 bg-red-400/[0.06]';
        case 'warning': return 'text-[#E8B48E] border-[#E2A071]/25 bg-[#E2A071]/[0.06]';
        default: return 'text-alpine-glacier border-alpine-glacier/20 bg-alpine-glacier/[0.05]';
    }
};

const statusMeta = (status: string) => {
    switch (status) {
        case 'critical': return { icon: <ShieldAlert size={18} className="text-red-300" />, label: 'Critical', tone: 'text-red-300' };
        case 'elevated': return { icon: <ShieldAlert size={18} className="text-[#E2A071]" />, label: 'Elevated', tone: 'text-[#E2A071]' };
        default: return { icon: <ShieldCheck size={18} className="text-emerald-300" />, label: 'All clear', tone: 'text-emerald-300' };
    }
};

const relativeDay = (iso: string) => {
    const days = Math.round((new Date(iso).getTime() - Date.now()) / 86400000);
    if (days <= 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `In ${days} days`;
    return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
};

export const AdminOverview = () => {
    const { user } = useAuthStore();
    const [data, setData] = useState<Awaited<ReturnType<typeof adminApi.getOverview>> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [digest, setDigest] = useState<any>(null);
    const [digestLoading, setDigestLoading] = useState(false);
    const [digestExpanded, setDigestExpanded] = useState(false);

    const fetchOverview = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setData(await adminApi.getOverview());
        } catch (err: any) {
            setError(err?.message || 'Could not reach the server.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchSecurityDigest = useCallback(async () => {
        setDigestLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/security-digest`, { credentials: 'include' });
            if (res.ok) setDigest(await res.json());
        } catch (err) {
            console.error('Failed to load security digest:', err);
        } finally {
            setDigestLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOverview();
        fetchSecurityDigest();
    }, [fetchOverview, fetchSecurityDigest]);

    const stats = data?.stats;
    const trend = data?.signupTrend?.map(d => d.count) || [];
    const weekDelta = stats && typeof stats.usersThisWeek === 'number'
        ? (stats.usersLastWeek > 0 ? Math.round(((stats.usersThisWeek - stats.usersLastWeek) / stats.usersLastWeek) * 100) : (stats.usersThisWeek > 0 ? 100 : 0))
        : null;
    const moderation = data?.moderation;
    const queueTotal = moderation ? moderation.stories + moderation.media + moderation.reviews : 0;
    const firstName = user?.name?.split(' ')[0] || 'Admin';
    const status = statusMeta(digest?.aiDigest?.overallStatus);

    return (
        <div className="space-y-6 md:space-y-8">
            <SummitHero
                eyebrow={`Summit Control · ${new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}`}
                name={firstName}
                subtitle={queueTotal > 0
                    ? <>There {queueTotal === 1 ? 'is' : 'are'} <span className="text-white font-medium">{queueTotal} item{queueTotal === 1 ? '' : 's'}</span> waiting for review. Here is the state of the mountain.</>
                    : 'Everything is moderated. Here is the state of the mountain.'}
                actions={
                    <button onClick={() => { fetchOverview(); fetchSecurityDigest(); }} className="h-9 px-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md text-xs font-semibold flex items-center gap-2 transition-colors" disabled={loading}>
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                    </button>
                }
                stats={stats ? [
                    { label: 'Explorers', value: stats.totalUsers },
                    { label: 'This week', value: `+${stats.usersThisWeek ?? 0}` },
                    { label: 'In queue', value: queueTotal },
                ] : undefined}
            />

            {error && !data ? (
                <ErrorState title="Overview unavailable" message={error} onRetry={fetchOverview} />
            ) : (
                <>
                    {/* KPI tiles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
                        {loading && !stats ? [1, 2, 3, 4].map(i => <StatSkeleton key={i} />) : stats && (
                            <>
                                <StatTile label="Explorers" value={stats.totalUsers} icon={Users} trend={trend} delta={weekDelta}
                                    caption={`${stats.usersThisWeek ?? 0} joined in the last 7 days`} to="/summit-control-panel/users" />
                                <StatTile label="Expeditions" value={stats.totalEvents} icon={Calendar} delay={60}
                                    caption={`${data?.upcomingEvents?.length ?? 0} upcoming on the calendar`} to="/summit-control-panel/events" />
                                <StatTile label="Published stories" value={stats.publishedStories ?? 0} icon={BookOpen} delay={120}
                                    caption={`${moderation?.stories ?? 0} awaiting an editor`} to="/summit-control-panel/stories" />
                                <StatTile label="Community groups" value={stats.activeGroups} icon={Compass} delay={180}
                                    caption="Factions active on the platform" to="/summit-control-panel/community" />
                            </>
                        )}
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-5">
                        {/* Signups chart */}
                        <Panel className="xl:col-span-2 p-5 md:p-7 mm-rise" style={{ animationDelay: '120ms' }}>
                            <PanelTitle eyebrow="Last 14 days" title={<>New <em>explorers</em></>} action={<PanelLink to="/summit-control-panel/users">All explorers</PanelLink>} />
                            {trend.length > 1 && trend.every(n => n === 0) ? (
                                <div className="h-40 md:h-52 rounded-xl border border-dashed border-[var(--mm-line)] grid place-items-center text-center px-6">
                                    <div>
                                        <p className="mm-title text-2xl">No sign-ups in the last two weeks</p>
                                        <p className="text-sm mm-faint mt-2">Share an upcoming expedition — new explorers will show up here day by day.</p>
                                        <Link to="/summit-control-panel/events" className="mm-btn mm-btn--ghost !h-9 mt-4">Open expeditions</Link>
                                    </div>
                                </div>
                            ) : trend.length > 1 ? (
                                <>
                                    <Sparkline data={trend} className="h-40 md:h-52" />
                                    <div className="flex justify-between mt-3 font-mono text-[10px] tracking-[0.2em] uppercase mm-faint">
                                        {data?.signupTrend?.filter((_, i, a) => i === 0 || i === Math.floor(a.length / 2) || i === a.length - 1).map(d => (
                                            <span key={d.date}>{new Date(d.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="h-40 md:h-52 rounded-xl bg-white/[0.02] animate-pulse" />
                            )}
                        </Panel>

                        {/* Moderation queue */}
                        <Panel className="p-5 md:p-7 mm-rise" style={{ animationDelay: '180ms' }}>
                            <PanelTitle eyebrow="Needs you" title={<>Review <em>queue</em></>} />
                            <div className="space-y-2">
                                {[
                                    { label: 'Stories', count: moderation?.stories ?? 0, icon: BookOpen, to: '/summit-control-panel/stories' },
                                    { label: 'Media submissions', count: moderation?.media ?? stats?.pendingMedia ?? 0, icon: ImageIcon, to: '/summit-control-panel/gallery' },
                                    { label: 'Reviews', count: moderation?.reviews ?? 0, icon: Star, to: '/summit-control-panel/reviews' },
                                ].map(row => (
                                    <Link key={row.label} to={row.to} className="group flex items-center gap-4 p-3 -mx-1 rounded-xl hover:bg-white/[0.04] transition-colors">
                                        <span className="grid place-items-center w-10 h-10 rounded-full border border-[var(--mm-line)] mm-muted group-hover:text-[var(--mm-glacier)] transition-colors">
                                            <row.icon size={16} strokeWidth={1.75} />
                                        </span>
                                        <span className="flex-1 text-sm mm-muted group-hover:text-[var(--mm-ink)] transition-colors">{row.label}</span>
                                        <span className={`mm-num text-2xl font-light ${row.count === 0 ? 'opacity-30' : ''}`}>{row.count}</span>
                                        <ArrowUpRight size={15} className="mm-faint opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                    </Link>
                                ))}
                            </div>
                            <div className="mt-5 pt-5 border-t border-[var(--mm-line)] flex items-center gap-2 text-xs mm-faint">
                                {queueTotal === 0 ? <><ShieldCheck size={14} className="text-emerald-300" /> Inbox zero — nicely done.</> : <><span className="mm-live !bg-[#E2A071] after:!border-[#E2A071]" /> {queueTotal} pending across the platform</>}
                            </div>
                        </Panel>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-5">
                        {/* Upcoming expeditions */}
                        <Panel className="p-5 md:p-7 mm-rise" style={{ animationDelay: '220ms' }}>
                            <PanelTitle eyebrow="On the calendar" title={<>Next <em>ascents</em></>} action={<PanelLink to="/summit-control-panel/events">Manage</PanelLink>} />
                            {loading && !data ? (
                                <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-14 rounded-xl bg-white/[0.03] animate-pulse" />)}</div>
                            ) : data?.upcomingEvents?.length ? (
                                <ul className="space-y-5">
                                    {data.upcomingEvents.map(ev => (
                                        <li key={ev.id}>
                                            <div className="flex items-baseline justify-between gap-3">
                                                <p className="text-sm font-medium text-[var(--mm-ink)] truncate">{ev.title}</p>
                                                <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--mm-glacier)] shrink-0">{relativeDay(ev.date)}</span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3 mt-1 mb-2 text-xs mm-faint">
                                                <span className="flex items-center gap-1 truncate"><MapPin size={11} /> {ev.location}</span>
                                                <span className="tabular-nums shrink-0">{ev.filled}/{ev.totalSlots} roped in</span>
                                            </div>
                                            <Meter value={ev.filled} max={ev.totalSlots} />
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm mm-faint py-6">No expeditions scheduled. <Link to="/summit-control-panel/events" className="text-[var(--mm-glacier)] hover:underline">Plan one →</Link></p>
                            )}
                        </Panel>

                        {/* AI security digest */}
                        <Panel className="xl:col-span-2 p-5 md:p-7 mm-rise overflow-hidden" style={{ animationDelay: '260ms' }}>
                            <PanelTitle
                                eyebrow="AI-analysed · last 24 hours"
                                title={<>Security <em>digest</em></>}
                                action={
                                    <button onClick={fetchSecurityDigest} disabled={digestLoading} className="p-2 rounded-full border border-[var(--mm-line)] mm-faint hover:text-[var(--mm-ink)] transition-colors" aria-label="Refresh digest">
                                        <RefreshCw size={14} className={digestLoading ? 'animate-spin' : ''} />
                                    </button>
                                }
                            />
                            {digestLoading && !digest ? (
                                <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-4 bg-white/[0.04] rounded-full animate-pulse" style={{ width: `${90 - i * 18}%` }} />)}</div>
                            ) : digest?.aiDigest ? (
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <span className="grid place-items-center w-11 h-11 rounded-full border border-[var(--mm-line)] shrink-0">{status.icon}</span>
                                        <div className="min-w-0">
                                            <p className={`font-mono text-[10.5px] tracking-[0.24em] uppercase ${status.tone}`}>{status.label}</p>
                                            <p className="text-sm mm-muted mt-1 leading-relaxed">{digest.aiDigest.summary}</p>
                                        </div>
                                    </div>

                                    {digest.aiDigest.alerts?.length > 0 && (
                                        <div className="space-y-2">
                                            {digest.aiDigest.alerts.map((alert: any, idx: number) => (
                                                <div key={idx} className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${severityStyle(alert.severity)}`}>
                                                    <Sparkles size={14} className="shrink-0 mt-0.5" />
                                                    <div className="flex-1 min-w-0">
                                                        <p>{alert.message}</p>
                                                        {alert.metric && <span className="text-xs opacity-70 font-mono">{alert.metric}</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {digest.aiDigest.recommendation && (
                                        <p className="flex items-start gap-2 text-xs text-alpine-glacier/80 leading-relaxed">
                                            <Shield size={13} className="shrink-0 mt-0.5" /> {digest.aiDigest.recommendation}
                                        </p>
                                    )}

                                    {digest.rawMetrics && (
                                        <>
                                            <button onClick={() => setDigestExpanded(v => !v)} className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] uppercase mm-faint hover:text-[var(--mm-ink)] transition-colors">
                                                <ChevronDown size={13} className={`transition-transform duration-300 ${digestExpanded ? 'rotate-180' : ''}`} />
                                                {digestExpanded ? 'Hide' : 'Show'} raw metrics
                                            </button>
                                            <AnimatePresence initial={false}>
                                                {digestExpanded && (
                                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-xl overflow-hidden border border-[var(--mm-line)] bg-[var(--mm-line)]">
                                                            {[
                                                                { label: 'Successful logins', value: digest.rawMetrics.successfulLogins, tone: 'text-emerald-300' },
                                                                { label: 'Failed logins', value: digest.rawMetrics.failedLogins, tone: 'text-red-300' },
                                                                { label: 'Admin actions', value: digest.rawMetrics.recentAdminActions, tone: 'text-[var(--mm-ink)]' },
                                                                {
                                                                    label: 'Success rate',
                                                                    value: `${digest.rawMetrics.successfulLogins + digest.rawMetrics.failedLogins > 0
                                                                        ? Math.round((digest.rawMetrics.successfulLogins / (digest.rawMetrics.successfulLogins + digest.rawMetrics.failedLogins)) * 100)
                                                                        : 100}%`,
                                                                    tone: 'text-alpine-glacier'
                                                                },
                                                            ].map(m => (
                                                                <div key={m.label} className="p-4 bg-[#070B12]">
                                                                    <p className={`mm-num text-2xl font-light ${m.tone}`}>{m.value}</p>
                                                                    <p className="font-mono text-[9.5px] tracking-[0.2em] uppercase mm-faint mt-1">{m.label}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm mm-faint">The security digest is unavailable right now.</p>
                            )}
                        </Panel>
                    </div>

                    {/* Recent recruits */}
                    <Panel className="p-5 md:p-7 mm-rise" style={{ animationDelay: '300ms' }}>
                        <PanelTitle eyebrow="Fresh on the rope" title={<>Recent <em>recruits</em></>} action={<PanelLink to="/summit-control-panel/users">View all</PanelLink>} />
                        {loading && !data ? (
                            <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-12 bg-white/[0.03] rounded-xl animate-pulse" />)}</div>
                        ) : !data?.recentUsers?.length ? (
                            <p className="text-sm mm-faint">No one new yet.</p>
                        ) : (
                            <ul className="divide-y divide-[var(--mm-line)]">
                                {data.recentUsers.map(u => (
                                    <li key={u.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                                        {u.avatar
                                            ? <img decoding="async" src={u.avatar} alt="" loading="lazy" className="w-10 h-10 rounded-full object-cover ring-1 ring-[var(--mm-line)]" />
                                            : <span className="w-10 h-10 rounded-full grid place-items-center bg-alpine-glacier/10 text-alpine-glacier font-serif text-lg">{u.name?.charAt(0)}</span>}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-[var(--mm-ink)] truncate">{u.name}</p>
                                            <p className="text-xs mm-faint truncate">{u.email}</p>
                                        </div>
                                        <span className="font-mono text-[10px] tracking-[0.18em] uppercase mm-faint shrink-0">
                                            {new Date(u.joinedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Panel>
                </>
            )}
        </div>
    );
};
