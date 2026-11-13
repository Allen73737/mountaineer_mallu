import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PenTool, Upload, Compass, Mountain, Award, MapPin, CalendarDays, ArrowUpRight, BookOpen, Image as ImageIcon, MessageCircle, TrendingUp, Route as RouteIcon, type LucideIcon } from 'lucide-react';
import { SummitHero } from '../../components/console/SummitHero';
import { Panel, PanelTitle, PanelLink, Meter } from '../../components/console/ConsoleKit';
import { passportApi, storiesApi, type Passport } from '../../lib/api';
import { useAuthStore } from '../../store/useAuthStore';
import { parseEventStart } from '../../lib/calendar';

const daysUntil = (iso: string) => Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));

const fmtDate = (iso: string) => {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

const STATUS_STYLE: Record<string, string> = {
    approved: 'text-emerald-300 border-emerald-300/25 bg-emerald-300/[0.07]',
    pending: 'text-[var(--mm-glacier)] border-[var(--mm-glacier)]/25 bg-alpine-glacier/[0.07]',
    rejected: 'text-[#E8A08C] border-[#E8A08C]/25 bg-[#E8A08C]/[0.07]',
};

const QuickAction: React.FC<{ to: string; icon: LucideIcon; title: string; hint: string; delay: number }> = ({ to, icon: Icon, title, hint, delay }) => (
    <Link to={to} className="group block h-full">
        <Panel interactive className="h-full p-5 flex flex-col gap-6 mm-rise" style={{ animationDelay: `${delay}ms` }}>
            <div className="flex items-start justify-between">
                <span className="grid place-items-center w-11 h-11 rounded-2xl bg-alpine-glacier/10 border border-alpine-glacier/20 text-[var(--mm-glacier)]">
                    <Icon size={19} strokeWidth={1.75} />
                </span>
                <ArrowUpRight size={16} className="mm-faint transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--mm-ink)]" />
            </div>
            <div>
                <p className="mm-title text-xl leading-tight">{title}</p>
                <p className="mm-faint text-xs mt-1">{hint}</p>
            </div>
        </Panel>
    </Link>
);

const Skel = ({ className = '' }: { className?: string }) => <div className={`rounded-xl bg-[var(--mm-line)] animate-pulse ${className}`} />;

/** Portal home: today's peak, the next ascent, passport progress, quick actions and recent activity. */
export const UserBasecampTab: React.FC = () => {
    const { user } = useAuthStore();
    const [passport, setPassport] = useState<Passport | null>(null);
    const [stories, setStories] = useState<any[] | null>(null);

    useEffect(() => {
        passportApi.get().then(setPassport).catch(() => setPassport(null));
        storiesApi.getMyStories().then(r => setStories(r.stories || [])).catch(() => setStories([]));
    }, []);

    const firstName = user?.name?.split(' ')[0] || 'Explorer';
    const next = passport?.upcoming?.[0];
    const days = next ? daysUntil(next.date) : null;
    const earned = passport?.badges.filter(b => b.earned) ?? [];
    const nextBadges = passport?.badges.filter(b => !b.earned).slice(0, 3) ?? [];
    const stats = passport?.stats;
    const loading = passport === null;

    return (
        <div className="space-y-5 md:space-y-6">
            <SummitHero
                eyebrow="Basecamp · Today's objective"
                name={firstName}
                subtitle={next
                    ? <>Your next ascent, <Link to={`/events/${next.id}`} className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">{next.title}</Link>, is {days === 0 ? 'today' : days === 1 ? 'tomorrow' : `${days} days away`}.</>
                    : <>No ascent on the calendar yet. <Link to="/events" className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">Find your next expedition</Link>.</>}
                stats={passport ? [
                    { label: 'Summits', value: stats?.summits ?? 0 },
                    { label: 'Badges', value: `${earned.length}/${passport.badges.length}` },
                    ...(days !== null ? [{ label: 'Days to go', value: days }] : []),
                ] : undefined}
            />

            {/* Next ascent + passport */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6">
                <Panel className="lg:col-span-7 p-6 md:p-7 relative overflow-hidden mm-rise">
                    <svg className="absolute -right-10 -bottom-6 w-[70%] h-auto opacity-[0.09] pointer-events-none" viewBox="0 0 400 160" aria-hidden="true">
                        <path d="M0 160 L70 80 L110 110 L180 30 L240 95 L290 60 L400 160 Z" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--mm-glacier)]" />
                    </svg>
                    <PanelTitle eyebrow="Next ascent" title={next ? 'On the calendar' : 'Nothing booked yet'} action={<PanelLink to="/portal/expeditions">All trips</PanelLink>} />
                    {loading ? (
                        <div className="space-y-3"><Skel className="h-10 w-3/4" /><Skel className="h-4 w-1/2" /></div>
                    ) : next ? (
                        <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                            <div className="min-w-0">
                                <Link to={`/events/${next.id}`} className="mm-title text-3xl md:text-4xl leading-tight hover:text-[var(--mm-glacier)] transition-colors line-clamp-2">{next.title}</Link>
                                <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-sm mm-muted">
                                    <span className="inline-flex items-center gap-1.5"><MapPin size={14} className="text-[var(--mm-glacier)]" />{next.location}</span>
                                    <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} className="text-[var(--mm-glacier)]" />{fmtDate(next.date)}</span>
                                </div>
                            </div>
                            <div className="shrink-0 text-left sm:text-right">
                                <p className="mm-num text-6xl md:text-7xl font-light leading-none">{days}</p>
                                <p className="mm-eyebrow mm-eyebrow--bare mt-2">{days === 1 ? 'day to go' : 'days to go'}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="relative">
                            <p className="mm-muted text-sm max-w-md">Pick an expedition and it will count down here, with calendar reminders and your route briefing.</p>
                            <Link to="/events" className="mm-btn mm-btn--primary mt-5 inline-flex"><Mountain size={15} /> Browse expeditions</Link>
                        </div>
                    )}
                </Panel>

                <Panel className="lg:col-span-5 p-6 md:p-7 mm-rise" style={{ animationDelay: '60ms' }}>
                    <PanelTitle eyebrow="Summit passport" title={loading ? '—' : `${earned.length} of ${passport?.badges.length ?? 0} badges`} action={<PanelLink to="/portal/passport">Passport</PanelLink>} />
                    {loading ? (
                        <div className="space-y-3"><Skel className="h-1.5" /><Skel className="h-12" /><Skel className="h-12" /></div>
                    ) : passport ? (
                        <>
                            <Meter value={earned.length} max={passport.badges.length} />
                            <p className="mm-eyebrow mm-eyebrow--bare mt-5 mb-2.5">{nextBadges.length ? 'Up next' : 'Every badge earned'}</p>
                            <ul className="space-y-2">
                                {nextBadges.map(b => (
                                    <li key={b.id} className="flex items-center gap-3 p-3 rounded-2xl border border-[var(--mm-line)]">
                                        <span className="grid place-items-center w-9 h-9 rounded-full border border-dashed border-[var(--mm-line-strong)] mm-faint shrink-0"><Award size={15} /></span>
                                        <span className="min-w-0">
                                            <span className="block text-sm font-medium truncate">{b.name}</span>
                                            <span className="block text-xs mm-faint truncate">{b.description}</span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : <p className="mm-faint text-sm">Your passport couldn't load. Try again in a moment.</p>}
                </Panel>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
                <QuickAction to="/portal/write" icon={PenTool} title="Write a story" hint="Share a route, a summit, a lesson" delay={80} />
                <QuickAction to="/portal/upload" icon={Upload} title="Upload media" hint="Photos and clips for the gallery" delay={120} />
                <QuickAction to="/events" icon={Mountain} title="Find a trip" hint="Upcoming expeditions" delay={160} />
                <QuickAction to="/portal/communities" icon={Compass} title="Your factions" hint="Groups, posts and mentions" delay={200} />
            </div>

            {/* Footprint + recent stories */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6">
                <Panel className="lg:col-span-5 p-6 md:p-7 mm-rise" style={{ animationDelay: '240ms' }}>
                    <PanelTitle eyebrow="Your footprint" title="On the mountain" />
                    <dl className="grid grid-cols-2 gap-px rounded-2xl overflow-hidden border border-[var(--mm-line)] bg-[var(--mm-line)]">
                        {([
                            ['Stories', stats?.stories, BookOpen],
                            ['Media', stats?.media, ImageIcon],
                            ['Posts', stats?.posts, MessageCircle],
                            ['Routes', stats?.routes, RouteIcon],
                            ['Distance', stats ? `${stats.distanceKm ?? 0} km` : undefined, TrendingUp],
                            ['Elevation', stats ? `${(stats.gainM ?? 0).toLocaleString()} m` : undefined, Mountain],
                        ] as [string, number | string | undefined, LucideIcon][]).map(([k, v, Icon]) => (
                            <div key={k} className="p-4 bg-[var(--mm-surface-solid)]">
                                <dt className="flex items-center gap-1.5 mm-eyebrow mm-eyebrow--bare"><Icon size={12} />{k}</dt>
                                <dd className="mm-num text-2xl md:text-3xl font-light mt-2">{loading ? <Skel className="h-7 w-12" /> : (v ?? 0)}</dd>
                            </div>
                        ))}
                    </dl>
                </Panel>

                <Panel className="lg:col-span-7 p-6 md:p-7 mm-rise" style={{ animationDelay: '280ms' }}>
                    <PanelTitle eyebrow="Recent writing" title="Your stories" action={<PanelLink to="/portal/submissions">All submissions</PanelLink>} />
                    {stories === null ? (
                        <div className="space-y-2.5">{[0, 1, 2].map(i => <Skel key={i} className="h-14" />)}</div>
                    ) : stories.length === 0 ? (
                        <div className="py-8 text-center">
                            <p className="mm-muted text-sm">You haven't written a story yet.</p>
                            <Link to="/portal/write" className="mm-btn mm-btn--ghost mt-4 inline-flex"><PenTool size={14} /> Start your first</Link>
                        </div>
                    ) : (
                        <ul className="divide-y divide-[var(--mm-line)]">
                            {stories.slice(0, 4).map((s: any) => (
                                <li key={s._id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                                    {s.coverImage || s.image
                                        ? <img decoding="async" src={s.coverImage || s.image} alt="" loading="lazy" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                                        : <span className="w-14 h-14 rounded-xl grid place-items-center bg-alpine-glacier/10 text-[var(--mm-glacier)] shrink-0"><BookOpen size={18} /></span>}
                                    <span className="min-w-0 flex-1">
                                        <span className="block font-medium truncate">{s.title}</span>
                                        <span className="block text-xs mm-faint mt-0.5">{s.createdAt ? fmtDate(s.createdAt) : ''}</span>
                                    </span>
                                    <span className={`shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full border ${STATUS_STYLE[s.status] || STATUS_STYLE.pending}`}>{s.status || 'pending'}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>
            </div>

            {/* Past summits */}
            {passport && passport.stamps.length > 0 && (
                <Panel className="p-6 md:p-7 mm-rise" style={{ animationDelay: '320ms' }}>
                    <PanelTitle eyebrow="Stamps" title="Summits you've reached" action={<PanelLink to="/portal/passport">Full passport</PanelLink>} />
                    <div className="flex gap-3 overflow-x-auto mm-scroll hide-scrollbar -mx-1 px-1 pb-1">
                        {passport.stamps.slice(0, 8).map(s => (
                            <Link key={s.id} to={`/events/${s.id}`} className="shrink-0 w-48 p-4 rounded-2xl border border-[var(--mm-line)] hover:border-[var(--mm-glacier)] transition-colors">
                                <p className="mm-eyebrow mm-eyebrow--bare">{fmtDate(parseEventStart(s.date)?.start.toISOString() ?? s.date)}</p>
                                <p className="mm-title text-lg leading-tight mt-2 line-clamp-2">{s.title}</p>
                                <p className="text-xs mm-faint mt-1 truncate">{s.location}</p>
                            </Link>
                        ))}
                    </div>
                </Panel>
            )}
        </div>
    );
};
