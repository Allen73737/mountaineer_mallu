import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Send, Trash2, MessageCircle, Wand2, X, SmilePlus, Radio, ArrowUp } from 'lucide-react';
import { toast } from 'sonner';
import { communityApi, aiApi, type ReactionKey } from '../../lib/api';
import { useAuthStore } from '../../store/useAuthStore';
import { useSiteSettings } from '../../store/useSiteSettings';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Loader2 } from '../ui/BrandLoader';

export const REACTIONS: { key: ReactionKey; emoji: string; label: string }[] = [
    { key: 'summit', emoji: '🏔️', label: 'Summit' },
    { key: 'heart', emoji: '❤️', label: 'Love' },
    { key: 'fire', emoji: '🔥', label: 'Fire' },
    { key: 'clap', emoji: '👏', label: 'Applause' },
    { key: 'strong', emoji: '💪', label: 'Strong' },
];

type Member = { _id: string; name: string; avatar?: string };
type Post = any;

const idOf = (x: any) => (typeof x === 'string' ? x : x?._id);
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const timeAgo = (iso: string, locale: string) => {
    const diff = (Date.parse(iso) - Date.now()) / 1000;
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    for (const [unit, secs] of [['day', 86400], ['hour', 3600], ['minute', 60]] as const) {
        if (Math.abs(diff) >= secs) return Math.abs(diff) > 604800 ? new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short' }) : rtf.format(Math.round(diff / secs), unit);
    }
    return rtf.format(0, 'minute');
};

/** Renders text with @mentions of real members highlighted */
const RichText: React.FC<{ text: string; mentions?: any[] }> = ({ text, mentions = [] }) => {
    const names = mentions.map(m => m?.name).filter(Boolean) as string[];
    if (!names.length) return <>{text}</>;
    const re = new RegExp(`(@(?:${names.sort((a, b) => b.length - a.length).map(esc).join('|')}))`, 'g');
    const tags = new Set(names.map(n => `@${n}`));
    return <>{text.split(re).map((part, i) => (tags.has(part)
        ? <span key={i} className="text-[var(--mm-glacier)] font-medium">{part}</span>
        : <React.Fragment key={i}>{part}</React.Fragment>))}</>;
};

const Avatar: React.FC<{ person?: any; size?: number }> = ({ person, size = 40 }) => person?.avatar
    ? <img loading="lazy" decoding="async" src={person.avatar} alt="" className="rounded-full object-cover shrink-0 ring-1 ring-[var(--mm-line)]" style={{ width: size, height: size }} />
    : <span className="rounded-full shrink-0 grid place-items-center bg-gradient-to-br from-alpine-blue to-alpine-navy text-white font-serif" style={{ width: size, height: size, fontSize: size * 0.42 }}>{(person?.name || '?').charAt(0)}</span>;

/**
 * Textarea with @mention autocomplete. Mentions are tracked as ids (names can contain spaces),
 * and only ids whose "@Name" is still in the text are sent.
 */
const MentionInput: React.FC<{
    value: string; onChange: (v: string) => void; members: Member[];
    mentions: Member[]; setMentions: (m: Member[]) => void;
    onSubmit: () => void; placeholder: string; rows?: number; autoFocus?: boolean;
}> = ({ value, onChange, members, mentions, setMentions, onSubmit, placeholder, rows = 2, autoFocus }) => {
    const ref = useRef<HTMLTextAreaElement>(null);
    const [query, setQuery] = useState<string | null>(null);
    const [active, setActive] = useState(0);
    const me = useAuthStore(s => s.user?.id);

    const candidates = useMemo(() => {
        if (query === null) return [];
        const q = query.toLowerCase();
        return members.filter(m => m._id !== me && m.name.toLowerCase().includes(q)).slice(0, 6);
    }, [query, members, me]);

    const detect = (text: string, caret: number) => {
        const m = /(?:^|\s)@([^\s@]{0,30})$/.exec(text.slice(0, caret));
        setQuery(m ? m[1] : null);
        setActive(0);
    };

    const pick = (m: Member) => {
        const el = ref.current;
        if (!el) return;
        const caret = el.selectionStart;
        const before = value.slice(0, caret).replace(/@([^\s@]{0,30})$/, `@${m.name} `);
        const next = before + value.slice(caret);
        onChange(next);
        if (!mentions.some(x => x._id === m._id)) setMentions([...mentions, m]);
        setQuery(null);
        requestAnimationFrame(() => { el.focus(); el.setSelectionRange(before.length, before.length); });
    };

    return (
        <div className="relative flex-1">
            <textarea
                ref={ref}
                value={value}
                rows={rows}
                autoFocus={autoFocus}
                placeholder={placeholder}
                onChange={e => { onChange(e.target.value); detect(e.target.value, e.target.selectionStart); }}
                onKeyDown={e => {
                    if (candidates.length) {
                        if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => (a + 1) % candidates.length); return; }
                        if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => (a - 1 + candidates.length) % candidates.length); return; }
                        if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); pick(candidates[active]); return; }
                        if (e.key === 'Escape') { setQuery(null); return; }
                    }
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); onSubmit(); }
                }}
                className="w-full resize-none bg-white/[0.04] border border-[var(--mm-line)] rounded-2xl px-4 py-3 text-sm text-[var(--mm-ink)] placeholder:text-[var(--mm-ink-3)] outline-none leading-relaxed"
            />
            <AnimatePresence>
                {candidates.length > 0 && (
                    <motion.ul
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                        className="absolute left-2 bottom-full mb-2 z-30 w-64 rounded-xl border border-alpine-glacier/20 bg-[#0A111C]/95 backdrop-blur-xl p-1 shadow-2xl"
                        role="listbox"
                    >
                        {candidates.map((m, i) => (
                            <li key={m._id}>
                                <button type="button" onMouseDown={e => { e.preventDefault(); pick(m); }}
                                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-sm text-white ${i === active ? 'bg-white/[0.08]' : ''}`}>
                                    <Avatar person={m} size={24} /> <span className="truncate">{m.name}</span>
                                </button>
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
};

const ReactionBar: React.FC<{ post: Post; canReact: boolean; onReact: (k: ReactionKey) => void }> = ({ post, canReact, onReact }) => {
    const me = useAuthStore(s => s.user?.id);
    const [open, setOpen] = useState(false);
    const reactions: { user: any; emoji: ReactionKey }[] = post.reactions || [];
    const mine = reactions.find(r => idOf(r.user) === me)?.emoji;
    const counts = REACTIONS.map(r => ({ ...r, n: reactions.filter(x => x.emoji === r.key).length })).filter(r => r.n > 0);

    return (
        <div className="relative flex flex-wrap items-center gap-1.5">
            {counts.map(r => (
                <button key={r.key} type="button" disabled={!canReact} onClick={() => onReact(r.key)} title={r.label}
                    className={`h-8 px-2.5 rounded-full border text-xs flex items-center gap-1.5 transition-colors ${mine === r.key ? 'border-alpine-glacier/50 bg-alpine-glacier/15 text-[var(--mm-ink)]' : 'border-[var(--mm-line)] mm-muted hover:border-[var(--mm-line-strong)]'}`}>
                    <span className="text-sm leading-none">{r.emoji}</span><span className="tabular-nums">{r.n}</span>
                </button>
            ))}
            {canReact && (
                <div className="relative">
                    <button type="button" onClick={() => setOpen(o => !o)} aria-label="Add reaction" aria-expanded={open}
                        className="h-8 w-8 rounded-full border border-[var(--mm-line)] mm-faint hover:text-[var(--mm-ink)] grid place-items-center transition-colors">
                        <SmilePlus size={14} />
                    </button>
                    <AnimatePresence>
                        {open && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 4 }}
                                transition={{ type: 'spring', stiffness: 600, damping: 32 }}
                                className="absolute left-0 bottom-full mb-2 z-20 flex gap-0.5 p-1 rounded-full border border-alpine-glacier/20 bg-[#0A111C]/95 backdrop-blur-xl shadow-2xl"
                                onMouseLeave={() => setOpen(false)}
                            >
                                {REACTIONS.map(r => (
                                    <button key={r.key} type="button" title={r.label} onClick={() => { onReact(r.key); setOpen(false); }}
                                        className={`w-9 h-9 rounded-full grid place-items-center text-lg transition-transform hover:scale-125 ${mine === r.key ? 'bg-white/10' : ''}`}>
                                        {r.emoji}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

const CommentComposer: React.FC<{ members: Member[]; onSend: (text: string, mentions: string[]) => Promise<void> }> = ({ members, onSend }) => {
    const { t } = useTranslation();
    const [text, setText] = useState('');
    const [mentions, setMentions] = useState<Member[]>([]);
    const [sending, setSending] = useState(false);
    const submit = async () => {
        if (!text.trim() || sending) return;
        setSending(true);
        try {
            await onSend(text.trim(), mentions.filter(m => text.includes(`@${m.name}`)).map(m => m._id));
            setText(''); setMentions([]);
        } finally { setSending(false); }
    };
    return (
        <div className="flex gap-2 items-end">
            <MentionInput value={text} onChange={setText} members={members} mentions={mentions} setMentions={setMentions} onSubmit={submit} placeholder={`${t('app.community.reply')}…  ·  ${t('app.community.mentionHint')}`} rows={1} />
            <button type="button" onClick={submit} disabled={!text.trim() || sending} className="h-11 w-11 shrink-0 rounded-full grid place-items-center bg-alpine-glacier/15 text-[var(--mm-glacier)] disabled:opacity-40 hover:bg-alpine-glacier/25 transition-colors" aria-label={t('app.community.reply')}>
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
            </button>
        </div>
    );
};

/**
 * Live feed for one community group: compose (with @mentions and AI cover suggestions),
 * react, reply, delete — and see other members' posts arrive in real time.
 */
export const GroupFeed: React.FC<{ group: any; posts: Post[]; setPosts: React.Dispatch<React.SetStateAction<Post[]>>; isMember: boolean; isModerator?: boolean }> = ({ group, posts, setPosts, isMember, isModerator }) => {
    const { t, i18n } = useTranslation();
    const { user } = useAuthStore();
    const socket = useSiteSettings(s => s.socket);
    const [text, setText] = useState('');
    const [mentions, setMentions] = useState<Member[]>([]);
    const [posting, setPosting] = useState(false);
    const [cover, setCover] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [suggesting, setSuggesting] = useState(false);
    const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
    const [pending, setPending] = useState<Post[]>([]);
    const [confirm, setConfirm] = useState<null | { kind: 'post' | 'comment'; postId: string; commentId?: string }>(null);
    const [live, setLive] = useState(false);
    const topRef = useRef<HTMLDivElement>(null);
    const members: Member[] = (group?.members || []).filter((m: any) => m && typeof m === 'object');
    const groupId = group?._id;

    // Real-time: follow this group's room and merge events into the feed
    useEffect(() => {
        if (!socket || !groupId || !isMember) return;
        const follow = () => { socket.emit('group:follow', groupId); setLive(true); };
        if (socket.connected) follow();
        socket.on('connect', follow);
        const onPost = (p: { groupId: string; post: Post }) => {
            if (p.groupId !== groupId || idOf(p.post.author) === user?.id) return;
            // Near the top: show immediately. Scrolled down: queue behind a "new posts" pill so the page doesn't jump.
            const nearTop = (topRef.current?.getBoundingClientRect().top ?? 0) > -200;
            if (nearTop) setPosts(prev => prev.some(x => x._id === p.post._id) ? prev : [p.post, ...prev]);
            else setPending(prev => [p.post, ...prev]);
        };
        const onUpdated = (p: { groupId: string; post: Post }) => p.groupId === groupId && setPosts(prev => prev.map(x => x._id === p.post._id ? p.post : x));
        const onDeleted = (p: { groupId: string; postId: string }) => p.groupId === groupId && setPosts(prev => prev.filter(x => x._id !== p.postId));
        const onReactions = (p: { groupId: string; postId: string; reactions: any[] }) => p.groupId === groupId && setPosts(prev => prev.map(x => x._id === p.postId ? { ...x, reactions: p.reactions } : x));
        socket.on('community:post', onPost);
        socket.on('community:post-updated', onUpdated);
        socket.on('community:post-deleted', onDeleted);
        socket.on('community:reactions', onReactions);
        return () => {
            socket.emit('group:unfollow', groupId);
            socket.off('connect', follow);
            socket.off('community:post', onPost);
            socket.off('community:post-updated', onUpdated);
            socket.off('community:post-deleted', onDeleted);
            socket.off('community:reactions', onReactions);
            setLive(false);
        };
    }, [socket, groupId, isMember, user?.id, setPosts]);

    useEffect(() => { setPending([]); }, [groupId]);

    const showPending = () => {
        setPosts(prev => [...pending.filter(p => !prev.some(x => x._id === p._id)), ...prev]);
        setPending([]);
        topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const submit = async () => {
        if (!text.trim() && !cover) return;
        setPosting(true);
        try {
            const fd = new FormData();
            fd.append('content', text.trim());
            fd.append('mentions', JSON.stringify(mentions.filter(m => text.includes(`@${m.name}`)).map(m => m._id)));
            if (cover) fd.append('unsplashUrl', cover);
            const { post } = await communityApi.createPost(groupId, fd);
            setPosts(prev => [post, ...prev]);
            setText(''); setMentions([]); setCover(null);
        } catch (e: any) {
            toast.error(e.message || 'Could not post.');
        } finally { setPosting(false); }
    };

    const suggest = async () => {
        if (!text.trim()) { toast.message('Write something first — covers are suggested from your words.'); return; }
        setSuggesting(true);
        try {
            const data = await aiApi.suggestImages({ title: group?.name || 'Community post', content: text, type: 'community discussion' });
            setSuggestions(data.images || []);
        } catch (e: any) {
            toast.error(e.message || 'No suggestions right now.');
        } finally { setSuggesting(false); }
    };

    const react = useCallback(async (postId: string, key: ReactionKey) => {
        // Optimistic toggle, reconciled with the server's answer
        setPosts(prev => prev.map(p => {
            if (p._id !== postId) return p;
            const rs = (p.reactions || []).filter((r: any) => idOf(r.user) !== user?.id);
            const mine = (p.reactions || []).find((r: any) => idOf(r.user) === user?.id);
            return { ...p, reactions: mine?.emoji === key ? rs : [...rs, { user: user?.id, emoji: key }] };
        }));
        try {
            const { reactions } = await communityApi.react(groupId, postId, key);
            setPosts(prev => prev.map(p => p._id === postId ? { ...p, reactions } : p));
        } catch (e: any) {
            toast.error(e.message || 'Could not react.');
        }
    }, [groupId, user?.id, setPosts]);

    const comment = async (postId: string, content: string, ids: string[]) => {
        try {
            const { post } = await communityApi.addComment(groupId, postId, content, ids);
            setPosts(prev => prev.map(p => p._id === postId ? post : p));
        } catch (e: any) {
            toast.error(e.message || 'Could not reply.');
            throw e;
        }
    };

    const doDelete = async () => {
        if (!confirm) return;
        const c = confirm;
        setConfirm(null);
        try {
            if (c.kind === 'post') {
                await communityApi.deletePost(groupId, c.postId);
                setPosts(prev => prev.filter(p => p._id !== c.postId));
            } else {
                const { post } = await communityApi.deleteComment(groupId, c.postId, c.commentId!);
                setPosts(prev => prev.map(p => p._id === c.postId ? post : p));
            }
        } catch (e: any) {
            toast.error(e.message || 'Could not delete.');
        }
    };

    const canDelete = (author: any) => idOf(author) === user?.id || isModerator || user?.role === 'Admin' || user?.role === 'SuperAdmin';

    return (
        <div className="space-y-5">
            <div ref={topRef} />

            {isMember && (
                <div className="mm-panel p-4 sm:p-5">
                    <div className="flex gap-3 items-start">
                        <Avatar person={user} size={40} />
                        <MentionInput value={text} onChange={setText} members={members} mentions={mentions} setMentions={setMentions} onSubmit={submit} placeholder={`${t('app.community.mentionHint')} — share a route update, ask for a partner…`} rows={2} />
                    </div>
                    {cover && (
                        <div className="relative mt-3 ml-[52px] inline-block rounded-xl overflow-hidden border border-[var(--mm-line)]">
                            <img loading="lazy" decoding="async" src={cover} alt="Selected cover" className="h-28 w-auto object-cover" />
                            <button onClick={() => setCover(null)} className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white" aria-label="Remove cover"><X size={13} /></button>
                        </div>
                    )}
                    <div className="flex items-center justify-between gap-3 mt-3 ml-[52px]">
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={suggest} disabled={suggesting} className="h-9 px-3 rounded-full border border-[var(--mm-line)] text-xs mm-muted hover:text-[var(--mm-ink)] flex items-center gap-1.5 transition-colors">
                                {suggesting ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />} AI cover
                            </button>
                            {live && <span className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] uppercase text-emerald-300/80"><Radio size={12} /> {t('app.community.live')}</span>}
                        </div>
                        <button type="button" onClick={submit} disabled={posting || (!text.trim() && !cover)} className="mm-btn mm-btn--primary !h-9 disabled:opacity-40">
                            {posting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Post
                        </button>
                    </div>
                    <AnimatePresence>
                        {suggestions.length > 0 && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                <div className="flex gap-2 overflow-x-auto hide-scrollbar mt-4 ml-[52px] pb-1">
                                    {suggestions.map((img: any) => (
                                        <button key={img.id} onClick={() => { setCover(img.url); setSuggestions([]); }} className="shrink-0 w-28 h-20 rounded-lg overflow-hidden ring-1 ring-[var(--mm-line)] hover:ring-alpine-glacier/60 transition">
                                            <img decoding="async" src={img.thumb} alt={img.altText || ''} className="w-full h-full object-cover" loading="lazy" />
                                        </button>
                                    ))}
                                    <button onClick={() => setSuggestions([])} className="shrink-0 w-10 grid place-items-center mm-faint" aria-label="Dismiss suggestions"><X size={14} /></button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            <AnimatePresence>
                {pending.length > 0 && (
                    <motion.button
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        onClick={showPending}
                        className="sticky top-20 z-20 mx-auto flex items-center gap-2 h-10 px-5 rounded-full bg-alpine-snow text-alpine-navy text-sm font-semibold shadow-[0_12px_30px_-10px_rgba(0,0,0,0.6)]"
                    >
                        <ArrowUp size={14} /> {t('app.community.newPosts', { count: pending.length })}
                    </motion.button>
                )}
            </AnimatePresence>

            {posts.length === 0 ? (
                <div className="mm-panel p-10 text-center">
                    <MessageCircle size={22} className="mx-auto mb-3 mm-faint" />
                    <p className="text-sm mm-muted">{isMember ? 'No posts yet — start the conversation.' : 'Join this group to read and post.'}</p>
                </div>
            ) : (
                <AnimatePresence initial={false}>
                    {posts.map(post => {
                        const comments = post.comments || [];
                        const open = openComments[post._id];
                        return (
                            <motion.article
                                key={post._id}
                                layout="position"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                className="mm-panel list-item-contain p-5 sm:p-6"
                            >
                                <header className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Avatar person={post.author} size={40} />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-[var(--mm-ink)] truncate">{post.author?.name || 'Member'}</p>
                                            <p className="text-xs mm-faint">{timeAgo(post.createdAt, i18n.language)}</p>
                                        </div>
                                    </div>
                                    {canDelete(post.author) && (
                                        <button onClick={() => setConfirm({ kind: 'post', postId: post._id })} className="p-2 -mr-2 rounded-full mm-faint hover:text-red-300 hover:bg-red-400/10 transition-colors" aria-label={t('app.community.delete')} title={t('app.community.delete')}>
                                            <Trash2 size={15} />
                                        </button>
                                    )}
                                </header>

                                {post.content && <p className="text-[15px] leading-relaxed text-[var(--mm-ink)]/90 whitespace-pre-wrap break-words"><RichText text={post.content} mentions={post.mentions} /></p>}
                                {post.image && <img src={post.image} alt="" loading="lazy" decoding="async" className="mt-4 w-full max-h-[420px] object-cover rounded-2xl" />}

                                <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                                    <ReactionBar post={post} canReact={isMember} onReact={k => react(post._id, k)} />
                                    <button onClick={() => setOpenComments(s => ({ ...s, [post._id]: !s[post._id] }))} className="h-8 px-3 rounded-full text-xs mm-muted hover:text-[var(--mm-ink)] flex items-center gap-1.5 transition-colors">
                                        <MessageCircle size={14} /> {comments.length > 0 ? comments.length : ''} {t('app.community.reply')}
                                    </button>
                                </div>

                                <AnimatePresence initial={false}>
                                    {(open || (comments.length > 0 && comments.length <= 2)) && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                            <div className="mt-4 pt-4 border-t border-[var(--mm-line)] space-y-3.5">
                                                {comments.map((c: any) => (
                                                    <div key={c._id} className="group/c flex gap-3">
                                                        <Avatar person={c.author} size={28} />
                                                        <div className="flex-1 min-w-0 rounded-2xl bg-white/[0.03] px-3.5 py-2.5">
                                                            <div className="flex items-baseline justify-between gap-2">
                                                                <span className="text-xs font-semibold text-[var(--mm-ink)]">{c.author?.name || 'Member'}</span>
                                                                <span className="text-[10px] mm-faint shrink-0">{timeAgo(c.createdAt, i18n.language)}</span>
                                                            </div>
                                                            <p className="text-[13px] mm-muted leading-relaxed whitespace-pre-wrap break-words"><RichText text={c.content} mentions={members.filter(m => (c.mentions || []).map(idOf).includes(m._id))} /></p>
                                                        </div>
                                                        {canDelete(c.author) && (
                                                            <button onClick={() => setConfirm({ kind: 'comment', postId: post._id, commentId: c._id })} className="self-center p-1.5 rounded-full mm-faint opacity-0 group-hover/c:opacity-100 focus-visible:opacity-100 hover:text-red-300 transition" aria-label={t('app.community.delete')}>
                                                                <Trash2 size={13} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                {isMember && <CommentComposer members={members} onSend={(txt, ids) => comment(post._id, txt, ids)} />}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.article>
                        );
                    })}
                </AnimatePresence>
            )}

            <ConfirmDialog
                isOpen={!!confirm}
                title={confirm?.kind === 'comment' ? 'Delete this reply?' : 'Delete this post?'}
                description="This can't be undone."
                confirmText={t('app.community.delete')}
                cancelText="Cancel"
                icon="warning"
                onConfirm={doDelete}
                onCancel={() => setConfirm(null)}
            />
        </div>
    );
};
