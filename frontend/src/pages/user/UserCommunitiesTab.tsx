import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, ArrowRight, Compass, Pin } from 'lucide-react';
import { communityApi } from '../../lib/api';
import { useAuthStore } from '../../store/useAuthStore';
import { CommunitiesTabSkeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { GroupFeed } from '../../components/community/GroupFeed';

const idOf = (x: any) => (typeof x === 'string' ? x : x?._id);

export const UserCommunitiesTab = () => {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [group, setGroup] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [feedLoading, setFeedLoading] = useState(false);

    // Only the groups this explorer actually belongs to
    useEffect(() => {
        setLoading(true);
        setLoadError(false);
        communityApi.getMyGroups()
            .then(data => {
                setGroups(data.groups || []);
                setSelectedId(id => id ?? data.groups?.[0]?._id ?? null);
            })
            .catch(() => setLoadError(true))
            .finally(() => setLoading(false));
    }, [reloadKey]);

    useEffect(() => {
        if (!selectedId) return;
        let cancelled = false;
        setFeedLoading(true);
        communityApi.getGroup(selectedId)
            .then(d => { if (!cancelled) { setGroup(d.group); setPosts(d.posts || []); } })
            .catch(() => {})
            .finally(() => !cancelled && setFeedLoading(false));
        return () => { cancelled = true; };
    }, [selectedId]);

    if (loading) return <CommunitiesTabSkeleton />;

    if (loadError) {
        return (
            <ErrorState
                title="Your communities didn't load"
                message="We couldn't reach the server to fetch the groups you belong to. Nothing has been lost — try again in a moment."
                onRetry={() => setReloadKey(k => k + 1)}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-5 mb-2">
                <div className="min-w-0">
                    <p className="mm-eyebrow mb-3">Basecamp · Factions</p>
                    <h1 className="mm-title text-[2.4rem] sm:text-5xl md:text-[3.5rem]">My <em>factions</em></h1>
                    <p className="mm-muted text-sm md:text-base mt-3 max-w-2xl leading-relaxed">Talk with your rope teams — posts, replies and reactions arrive live.</p>
                </div>
                <Link to="/community" className="mm-btn mm-btn--ghost shrink-0">
                    Explore groups <ArrowRight size={15} />
                </Link>
            </div>

            {groups.length === 0 ? (
                <div className="mm-panel p-10 md:p-14 text-center">
                    <span className="mx-auto mb-5 grid place-items-center w-14 h-14 rounded-full border border-[var(--mm-line)] text-[var(--mm-glacier)]"><Compass size={22} /></span>
                    <h3 className="mm-title text-3xl mb-2">No factions yet</h3>
                    <p className="mm-muted text-sm mb-7 max-w-md mx-auto">Join a regional or skill-level group to find climbing partners and plan trips together.</p>
                    <Link to="/community" className="mm-btn mm-btn--primary">Find your rope team <ArrowRight size={15} /></Link>
                </div>
            ) : (
                <>
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0" role="tablist" aria-label="Your groups">
                        {groups.map(g => (
                            <button
                                key={g._id}
                                role="tab"
                                aria-selected={selectedId === g._id}
                                onClick={() => setSelectedId(g._id)}
                                className={`shrink-0 h-11 pl-4 pr-3 rounded-full border text-sm flex items-center gap-2.5 transition-colors ${selectedId === g._id
                                    ? 'border-alpine-glacier/40 bg-alpine-glacier/12 text-[var(--mm-ink)]'
                                    : 'border-[var(--mm-line)] mm-muted hover:text-[var(--mm-ink)]'}`}
                            >
                                {g.name}
                                <span className="flex items-center gap-1 text-xs mm-faint"><Users size={11} /> {g.memberCount}</span>
                            </button>
                        ))}
                    </div>

                    {group?.pinnedMessage && (
                        <div className="mm-panel p-4 flex gap-3">
                            <Pin size={15} className="text-[var(--mm-glacier)] shrink-0 mt-0.5" />
                            <p className="text-sm mm-muted leading-relaxed">{group.pinnedMessage}</p>
                        </div>
                    )}

                    <div className="max-w-3xl">
                        {feedLoading && !group ? (
                            <div className="space-y-4">{[1, 2].map(i => <div key={i} className="mm-panel h-40 animate-pulse" />)}</div>
                        ) : group && (
                            <GroupFeed
                                group={group}
                                posts={posts}
                                setPosts={setPosts}
                                isMember={group.members?.some((m: any) => idOf(m) === user?.id)}
                                isModerator={group.moderators?.some((m: any) => idOf(m) === user?.id)}
                            />
                        )}
                    </div>
                </>
            )}
            <span className="sr-only">{t('app.community.live')}</span>
        </div>
    );
};
