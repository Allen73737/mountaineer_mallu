import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, ShieldCheck, ArrowRight, MapPin, Calendar, LogOut, Clock, Pin, LogIn } from 'lucide-react';
import { Loader2 } from '../components/ui/BrandLoader';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { communityApi, eventsApi } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { useToast } from '../components/ui/Toast';
import { BackButton } from '../components/ui/BackButton';
import { CommunitySkeleton } from '../components/ui/Skeleton';
import { CreditTitle } from '../components/ui/CreditTitle';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { GroupFeed } from '../components/community/GroupFeed';
import { parseEventStart } from '../lib/calendar';
import { usePageMeta } from '../lib/usePageMeta';

const idOf = (x: any) => (typeof x === 'string' ? x : x?._id);

export const CommunityPage = () => {
    usePageMeta({ title: 'Community', description: 'Find your rope team. Join regional groups of Malayalee hikers and climbers across Europe.' });
    const { t, i18n } = useTranslation();
    const [groups, setGroups] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [joiningId, setJoiningId] = useState<string | null>(null);
    const [confirmLeave, setConfirmLeave] = useState(false);
    const [upcoming, setUpcoming] = useState<any[]>([]);
    const { user, isLoggedIn } = useAuthStore();
    const { showToast, ToastComponent } = useToast();

    const [loadError, setLoadError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setLoadError(null);
        communityApi.listGroups()
            .then(data => {
                if (cancelled) return;
                setGroups(data.groups);
                setSelectedId(id => id ?? data.groups[0]?._id ?? null);
            })
            .catch((err: any) => !cancelled && setLoadError(err?.message || 'We could not reach the community right now.'))
            .finally(() => !cancelled && setLoading(false));
        return () => { cancelled = true; };
    }, [reloadKey]);

    // Real upcoming expeditions for the side panel
    useEffect(() => {
        eventsApi.list(1, 30).then(d => {
            const now = Date.now();
            setUpcoming((d.events || [])
                .map((e: any) => ({ ...e, start: parseEventStart(e.date, e.time)?.start }))
                .filter((e: any) => e.start && e.start.getTime() >= now)
                .sort((a: any, b: any) => a.start - b.start)
                .slice(0, 3));
        }).catch(() => {});
    }, []);

    // Load the selected group's detail + feed (members only see posts; visitors see the summary)
    useEffect(() => {
        if (!selectedId) return;
        const summary = groups.find(g => g._id === selectedId);
        if (!isLoggedIn) { setSelectedGroup(summary); setPosts([]); return; }
        let cancelled = false;
        setDetailLoading(true);
        communityApi.getGroup(selectedId)
            .then(data => { if (!cancelled) { setSelectedGroup(data.group); setPosts(data.posts || []); } })
            .catch(() => { if (!cancelled) { setSelectedGroup(summary); setPosts([]); } })
            .finally(() => !cancelled && setDetailLoading(false));
        return () => { cancelled = true; };
    }, [selectedId, isLoggedIn, groups]);

    const isMember = !!selectedGroup?.members?.some?.((m: any) => idOf(m) === user?.id);
    const isPending = !!selectedGroup?.pendingRequests?.some?.((m: any) => idOf(m) === user?.id);
    const isModerator = !!selectedGroup?.moderators?.some?.((m: any) => idOf(m) === user?.id);
    const memberCount = selectedGroup?.memberCount ?? selectedGroup?.members?.length ?? 0;

    const handleJoin = async () => {
        if (!selectedGroup) return;
        setJoiningId(selectedGroup._id);
        try {
            await communityApi.requestJoin(selectedGroup._id);
            setSelectedGroup((g: any) => ({ ...g, pendingRequests: [...(g.pendingRequests || []), user?.id] }));
            showToast('Request sent — a moderator will approve you shortly.', 'success');
        } catch (err: any) {
            showToast(err.message || 'Failed to request join.', 'error');
        } finally {
            setJoiningId(null);
        }
    };

    const handleLeave = async () => {
        if (!selectedGroup) return;
        setConfirmLeave(false);
        try {
            await communityApi.leaveGroup(selectedGroup._id);
            setSelectedGroup((g: any) => ({ ...g, members: (g.members || []).filter((m: any) => idOf(m) !== user?.id) }));
            setPosts([]);
            showToast('You left the group.', 'info');
        } catch (err: any) {
            showToast(err.message || 'Could not leave the group.', 'error');
        }
    };

    const sortedGroups = useMemo(() => [...groups].sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0)), [groups]);

    return (
        <main className="min-h-svh bg-alpine-navy dark:bg-[#0B0C10] text-white pt-28 pb-24 relative overflow-hidden transition-colors duration-500">
            {ToastComponent}

            <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none">
                <div className="absolute top-0 right-1/4 w-[60vw] h-[60vw] bg-alpine-glacier/40 dark:bg-alpine-navy/40 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
                <div className="absolute bottom-1/4 left-1/4 w-[40vw] h-[40vw] bg-alpine-blue/20 dark:bg-alpine-glacier/20 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                <div className="dark"><BackButton /></div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="mb-12">
                    <CreditTitle lines={['Community']} creditClassName="text-alpine-glacier" className="font-serif text-5xl md:text-7xl font-normal text-white" />
                    <p className="text-lg md:text-xl text-white/60 font-light max-w-2xl">
                        Find your people. Join a regional group, swap route advice, and plan your next trip together.
                    </p>
                </motion.div>

                {loading && groups.length === 0 ? (
                    <CommunitySkeleton />
                ) : loadError && groups.length === 0 ? (
                    <div className="max-w-md mx-auto py-16">
                        <ErrorState title="Community signal lost" message={loadError} onRetry={() => setReloadKey(k => k + 1)} backLink="/" backText="Back to base camp" />
                    </div>
                ) : groups.length === 0 ? (
                    <EmptyState icon={Users} title="No community groups yet" description="Groups for regions, skill levels and upcoming trips will appear here as soon as they're created." actionText="See upcoming expeditions" actionLink="/events" />
                ) : (
                    <div className="mm-console dark grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                        {/* Groups */}
                        <aside className="lg:col-span-3 space-y-3">
                            <p className="mm-eyebrow mb-1">Groups · {groups.length}</p>
                            <div className="flex lg:flex-col gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 pb-1">
                                {sortedGroups.map(g => (
                                    <button
                                        key={g._id}
                                        onClick={() => setSelectedId(g._id)}
                                        aria-current={selectedId === g._id}
                                        className={`shrink-0 lg:shrink text-left px-4 py-3.5 rounded-2xl border transition-colors min-w-[200px] lg:min-w-0 ${selectedId === g._id
                                            ? 'bg-alpine-glacier/10 border-alpine-glacier/30'
                                            : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]'}`}
                                    >
                                        <span className="block text-sm font-medium text-white truncate">{g.name}</span>
                                        <span className="flex items-center gap-1.5 text-xs text-white/45 mt-0.5"><Users size={11} /> {g.memberCount || 0}</span>
                                    </button>
                                ))}
                            </div>
                        </aside>

                        {/* Feed */}
                        <section className="lg:col-span-6 space-y-5 min-w-0">
                            {selectedGroup && (
                                <div className="mm-panel p-5 sm:p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <h2 className="mm-title text-3xl sm:text-4xl">{selectedGroup.name}</h2>
                                            <p className="text-sm text-white/55 mt-2 leading-relaxed">{selectedGroup.description}</p>
                                        </div>
                                        <span className="grid place-items-center w-11 h-11 rounded-full border border-white/10 text-alpine-glacier shrink-0"><ShieldCheck size={18} /></span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 mt-5">
                                        <div className="flex -space-x-2">
                                            {(selectedGroup.members || []).filter((m: any) => typeof m === 'object').slice(0, 6).map((m: any) => (
                                                m.avatar
                                                    ? <img loading="lazy" decoding="async" key={m._id} src={m.avatar} alt={m.name} title={m.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-[#0B0C10]" />
                                                    : <span key={m._id} title={m.name} className="w-8 h-8 rounded-full grid place-items-center bg-alpine-blue ring-2 ring-[#0B0C10] text-[11px] font-semibold">{m.name?.charAt(0)}</span>
                                            ))}
                                        </div>
                                        <span className="text-xs text-white/50">{memberCount} members</span>
                                        <div className="ml-auto">
                                            {!isLoggedIn ? (
                                                <Link to="/login" className="mm-btn mm-btn--primary"><LogIn size={15} /> Sign in to join</Link>
                                            ) : isMember ? (
                                                <button onClick={() => setConfirmLeave(true)} className="mm-btn mm-btn--ghost"><LogOut size={14} /> {t('app.community.leave')}</button>
                                            ) : isPending ? (
                                                <span className="mm-btn mm-btn--ghost cursor-default"><Clock size={14} /> Request pending</span>
                                            ) : (
                                                <button onClick={handleJoin} disabled={joiningId === selectedGroup._id} className="mm-btn mm-btn--primary">
                                                    {joiningId === selectedGroup._id ? <Loader2 size={15} className="animate-spin" /> : <>Request to join <ArrowRight size={15} /></>}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {selectedGroup.pinnedMessage && (
                                        <div className="mt-5 p-4 rounded-2xl bg-alpine-glacier/[0.06] border border-alpine-glacier/15 flex gap-3">
                                            <Pin size={15} className="text-alpine-glacier shrink-0 mt-0.5" />
                                            <p className="text-sm text-white/75 leading-relaxed">{selectedGroup.pinnedMessage}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {detailLoading ? (
                                <div className="space-y-4">{[1, 2].map(i => <div key={i} className="mm-panel h-40 animate-pulse" />)}</div>
                            ) : selectedGroup && (isLoggedIn ? (
                                <GroupFeed group={selectedGroup} posts={posts} setPosts={setPosts} isMember={isMember} isModerator={isModerator} />
                            ) : (
                                <div className="mm-panel p-10 text-center">
                                    <p className="mm-title text-2xl mb-2">Members talk here</p>
                                    <p className="text-sm text-white/50 mb-6">Sign in or create a free account to read posts and join the conversation.</p>
                                    <Link to="/signup" className="mm-btn mm-btn--primary">Create a free account</Link>
                                </div>
                            ))}
                        </section>

                        {/* Context */}
                        <aside className="lg:col-span-3 space-y-5">
                            <div className="mm-panel p-5">
                                <p className="mm-eyebrow mm-eyebrow--bare mb-1.5">On the calendar</p>
                                <h3 className="mm-title text-2xl mb-4">Next <em>ascents</em></h3>
                                {upcoming.length === 0 ? (
                                    <p className="text-sm text-white/45">No trips scheduled yet. <Link to="/events" className="text-alpine-glacier hover:underline">See all</Link></p>
                                ) : (
                                    <ul className="space-y-3">
                                        {upcoming.map(e => (
                                            <li key={e._id}>
                                                <Link to={`/events/${e._id}`} className="block p-3.5 -mx-1 rounded-xl hover:bg-white/[0.04] transition-colors group">
                                                    <p className="text-sm font-medium text-white group-hover:text-alpine-glacier transition-colors line-clamp-2">{e.title}</p>
                                                    <p className="flex items-center gap-1.5 text-xs text-white/45 mt-1.5"><Calendar size={12} /> {e.start.toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' })}</p>
                                                    <p className="flex items-center gap-1.5 text-xs text-white/45 mt-0.5 truncate"><MapPin size={12} /> {e.location}</p>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="mm-panel p-5">
                                <h3 className="mm-title text-xl mb-3">How groups work</h3>
                                <ul className="space-y-2.5 text-sm text-white/55 leading-relaxed">
                                    <li>Request to join — a moderator approves new members.</li>
                                    <li>Type <span className="text-alpine-glacier">@</span> to mention someone; they'll get a notification.</li>
                                    <li>Posts and reactions appear live for everyone in the group.</li>
                                </ul>
                            </div>
                        </aside>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={confirmLeave}
                title={`Leave ${selectedGroup?.name || 'this group'}?`}
                description="You'll stop seeing posts. You can request to join again later."
                confirmText={t('app.community.leave')}
                cancelText="Stay"
                icon="warning"
                onConfirm={handleLeave}
                onCancel={() => setConfirmLeave(false)}
            />
        </main>
    );
};
