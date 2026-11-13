import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Award, Footprints, Users, Mountain, Flame, BookOpen, Feather, Camera, Route, MessageCircle, Compass, Home, TrendingUp,
    Download, Share2, Lock, MapPin, ArrowUpRight, type LucideIcon
} from 'lucide-react';
import { passportApi, type Passport } from '../../lib/api';
import { useAuthStore } from '../../store/useAuthStore';
import { Panel, PanelTitle, StatTile } from '../../components/console/ConsoleKit';
import { ErrorState } from '../../components/ui/ErrorState';
import { toast } from 'sonner';

const BADGE_ICON: Record<string, LucideIcon> = {
    'first-steps': Footprints, 'rope-team': Users, 'high-altitude': Mountain, 'expert-line': Flame,
    storyteller: BookOpen, chronicler: Feather, lens: Camera, trailblazer: Route, campfire: MessageCircle,
    faction: Compass, onam: Home, thousand: TrendingUp,
};

// Stamps get a slight, stable tilt so the page looks hand-stamped rather than gridded
const tilt = (id: string) => ((id.charCodeAt(id.length - 1) + id.charCodeAt(id.length - 2)) % 9) - 4;

/** Draws the shareable 1080×1350 "year in the Alps" card. */
const drawYearCard = async (p: Passport, name: string): Promise<Blob | null> => {
    await document.fonts?.ready;
    const W = 1080, H = 1350;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    if (!ctx) return null;

    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0C1A2E'); bg.addColorStop(1, '#04070C');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(W * 0.85, 0, 0, W * 0.85, 0, 900);
    glow.addColorStop(0, 'rgba(74,106,140,0.55)'); glow.addColorStop(1, 'rgba(74,106,140,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

    // Contour lines
    ctx.strokeStyle = 'rgba(163,201,226,0.09)'; ctx.lineWidth = 2;
    for (let i = 0; i < 14; i++) {
        ctx.beginPath();
        for (let x = -20; x <= W + 20; x += 20) {
            const y = 760 + i * 38 + Math.sin(x / 140 + i * 0.6) * (40 + i * 3) - Math.max(0, 260 - Math.abs(x - 620) * 0.7);
            x === -20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    // Ridge silhouette
    ctx.beginPath(); ctx.moveTo(0, H);
    [[0, 1120], [160, 1010], [300, 1060], [470, 880], [620, 980], [760, 820], [900, 960], [1080, 900], [1080, H]].forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.closePath();
    const ridge = ctx.createLinearGradient(0, 820, 0, H);
    ridge.addColorStop(0, 'rgba(163,201,226,0.22)'); ridge.addColorStop(1, 'rgba(8,40,76,0.0)');
    ctx.fillStyle = ridge; ctx.fill();

    const y = p.yearInReview;
    ctx.fillStyle = 'rgba(248,250,249,0.5)';
    ctx.font = '500 26px "JetBrains Mono Variable", monospace';
    ctx.fillText('MOUNTAINEER MALLU · YEAR IN REVIEW', 80, 120);

    ctx.fillStyle = '#F8FAF9';
    ctx.font = '400 150px "Instrument Serif", "Noto Serif Malayalam Variable", serif';
    ctx.fillText(String(y.year), 76, 290);
    ctx.font = 'italic 400 76px "Instrument Serif", serif';
    ctx.fillStyle = '#A3C9E2';
    ctx.fillText('in the Alps', 80, 380);
    ctx.font = '400 40px "Inter Variable", "Manjari", sans-serif';
    ctx.fillStyle = 'rgba(248,250,249,0.75)';
    ctx.fillText(name, 80, 450);

    const stats: [string, string][] = [
        [String(y.summits), 'expeditions'],
        [y.gainM ? y.gainM.toLocaleString('en-US') : String(p.stats.places || 0), y.gainM ? 'metres climbed' : 'places'],
        [String(y.stories), 'stories'],
        [String(y.posts), 'community posts'],
    ];
    stats.forEach(([n, l], i) => {
        const x = 80 + (i % 2) * 470, top = 560 + Math.floor(i / 2) * 190;
        ctx.fillStyle = '#F8FAF9';
        ctx.font = '300 110px "Space Grotesk Variable", sans-serif';
        ctx.fillText(n, x, top + 90);
        ctx.fillStyle = 'rgba(248,250,249,0.5)';
        ctx.font = '500 24px "JetBrains Mono Variable", monospace';
        ctx.fillText(l.toUpperCase(), x + 4, top + 135);
    });

    if (y.highlight) {
        ctx.fillStyle = 'rgba(226,160,113,0.95)';
        ctx.font = '500 24px "JetBrains Mono Variable", monospace';
        ctx.fillText('HIGHLIGHT', 80, 1000);
        ctx.fillStyle = '#F8FAF9';
        ctx.font = '400 54px "Instrument Serif", serif';
        ctx.fillText(y.highlight.length > 34 ? `${y.highlight.slice(0, 33)}…` : y.highlight, 80, 1066);
    }
    if (y.places.length) {
        ctx.fillStyle = 'rgba(248,250,249,0.6)';
        ctx.font = '400 30px "Inter Variable", sans-serif';
        ctx.fillText(y.places.slice(0, 3).join('  ·  ').slice(0, 60), 80, 1150);
    }
    ctx.fillStyle = 'rgba(248,250,249,0.4)';
    ctx.font = '500 22px "JetBrains Mono Variable", monospace';
    ctx.fillText('MOUNTAINEERMALLU.COM', 80, H - 80);

    return new Promise(res => c.toBlob(res, 'image/png'));
};

export const UserPassportTab = () => {
    const { t, i18n } = useTranslation();
    const { user } = useAuthStore();
    const [data, setData] = useState<Passport | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const load = useCallback(() => {
        setError(null);
        passportApi.get().then(setData).catch(e => setError(e.message || 'Could not load your passport.'));
    }, []);
    useEffect(load, [load]);

    const fileName = `mountaineer-mallu-${data?.yearInReview.year}.png`;

    const download = async () => {
        if (!data) return;
        setBusy(true);
        const blob = await drawYearCard(data, user?.name || 'Explorer');
        setBusy(false);
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement('a'), { href: url, download: fileName });
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
    };

    const share = async () => {
        if (!data) return;
        setBusy(true);
        const blob = await drawYearCard(data, user?.name || 'Explorer');
        setBusy(false);
        if (!blob) return;
        const file = new File([blob], fileName, { type: 'image/png' });
        if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title: `${data.yearInReview.year} in the Alps`, text: 'My year with Mountaineer Mallu 🏔️' }).catch(() => {});
        } else {
            toast.message('Sharing isn’t supported in this browser — the card has been downloaded instead.');
            download();
        }
    };

    if (error) return <ErrorState title="Passport unavailable" message={error} onRetry={load} />;

    const s = data?.stats;
    const earned = data?.badges.filter(b => b.earned).length ?? 0;

    return (
        <div className="space-y-6 md:space-y-8">
            <header className="mm-rise flex flex-col md:flex-row md:items-end md:justify-between gap-5">
                <div className="min-w-0">
                    <p className="mm-eyebrow mb-3">{t('app.passport.eyebrow')}</p>
                    <h1 className="mm-title text-[2.4rem] sm:text-5xl md:text-[3.5rem]">{t('app.passport.titleA')} <em>{t('app.passport.titleB')}</em></h1>
                    <p className="mm-muted text-sm md:text-base mt-3 max-w-2xl leading-relaxed">{t('app.passport.desc')}</p>
                </div>
                <div className="flex gap-2.5">
                    <button onClick={share} disabled={!data || busy} className="mm-btn mm-btn--ghost"><Share2 size={15} /> {t('app.passport.share')}</button>
                    <button onClick={download} disabled={!data || busy} className="mm-btn mm-btn--primary"><Download size={15} /> {t('app.passport.download')}</button>
                </div>
            </header>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {!s ? [1, 2, 3, 4].map(i => <div key={i} className="mm-panel h-44 animate-pulse" />) : (
                    <>
                        <StatTile label={t('app.passport.stats.summits')} value={s.summits} icon={Mountain} caption={s.upcoming ? `+${s.upcoming} ${t('app.passport.upcoming').toLowerCase()}` : undefined} />
                        <StatTile label={t('app.passport.stats.climbed')} value={s.gainM} icon={TrendingUp} delay={60} caption={s.distanceKm ? `${s.distanceKm} km` : undefined} />
                        <StatTile label={t('app.passport.stats.stories')} value={s.stories} icon={BookOpen} delay={120} />
                        <StatTile label={t('app.passport.stats.reactions')} value={s.reactionsReceived} icon={Flame} delay={180} caption={`${s.posts} ${t('app.passport.stats.posts').toLowerCase()}`} />
                    </>
                )}
            </div>

            {/* Stamps */}
            <Panel className="p-5 md:p-7 mm-rise">
                <PanelTitle eyebrow={`${data?.stamps.length ?? 0}`} title={t('app.passport.stamps')} />
                {data && data.stamps.length === 0 ? (
                    <div className="py-10 text-center">
                        <p className="mm-muted text-sm mb-5">{t('app.passport.noStamps')}</p>
                        <Link to="/events" className="mm-btn mm-btn--primary">{t('app.passport.browse')} <ArrowUpRight size={15} /></Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-7 py-2">
                        {data?.stamps.map(st => (
                            <Link
                                key={st.id}
                                to={`/events/${st.id}`}
                                className="group relative aspect-square rounded-full grid place-items-center text-center p-5 border-2 border-dashed transition-transform duration-500 hover:rotate-0 hover:scale-[1.03]"
                                style={{ transform: `rotate(${tilt(st.id)}deg)`, borderColor: st.category === 'cultural' ? 'rgba(226,160,113,0.55)' : 'rgba(163,201,226,0.4)' }}
                            >
                                <span className="absolute inset-2 rounded-full border border-[var(--mm-line)]" />
                                <span className="relative">
                                    <span className="block font-mono text-[9px] tracking-[0.24em] uppercase mm-faint">{new Date(st.date).toLocaleDateString(i18n.language, { month: 'short', year: 'numeric' })}</span>
                                    <span className="block mm-title text-base sm:text-lg leading-tight my-1.5 line-clamp-3">{st.title}</span>
                                    <span className="flex items-center justify-center gap-1 text-[10px] mm-faint truncate"><MapPin size={9} /> {st.location}</span>
                                    <span className={`block font-mono text-[9px] tracking-[0.2em] uppercase mt-1.5 ${st.category === 'cultural' ? 'text-[#E2A071]' : 'text-[var(--mm-glacier)]'}`}>{st.difficulty}</span>
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </Panel>

            {/* Badges */}
            <Panel className="p-5 md:p-7 mm-rise">
                <PanelTitle eyebrow={data ? `${earned} / ${data.badges.length} · ${t('app.passport.earned')}` : ''} title={t('app.passport.badges')} />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {data?.badges.map(b => {
                        const Icon = BADGE_ICON[b.id] || Award;
                        return (
                            <div key={b.id} className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-colors ${b.earned ? 'border-alpine-glacier/25 bg-alpine-glacier/[0.06]' : 'border-[var(--mm-line)] opacity-55'}`}>
                                <span className={`grid place-items-center w-11 h-11 rounded-full shrink-0 ${b.earned ? 'bg-gradient-to-br from-alpine-glacier to-alpine-blue text-alpine-navy shadow-[0_8px_24px_-8px_rgba(163,201,226,0.7)]' : 'border border-[var(--mm-line)] mm-faint'}`}>
                                    {b.earned ? <Icon size={18} strokeWidth={1.75} /> : <Lock size={15} />}
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-sm font-medium text-[var(--mm-ink)]">{b.name}</span>
                                    <span className="block text-xs mm-faint mt-0.5 leading-snug">{b.description}</span>
                                </span>
                            </div>
                        );
                    })}
                </div>
            </Panel>

            {data?.upcoming?.length ? (
                <Panel className="p-5 md:p-7 mm-rise">
                    <PanelTitle title={t('app.passport.upcoming')} />
                    <ul className="divide-y divide-[var(--mm-line)]">
                        {data.upcoming.map(u => (
                            <li key={u.id}>
                                <Link to={`/events/${u.id}`} className="flex items-center justify-between gap-4 py-3 group">
                                    <span className="min-w-0">
                                        <span className="block text-sm text-[var(--mm-ink)] truncate group-hover:text-[var(--mm-glacier)] transition-colors">{u.title}</span>
                                        <span className="block text-xs mm-faint truncate">{u.location}</span>
                                    </span>
                                    <span className="font-mono text-[10px] tracking-[0.18em] uppercase mm-faint shrink-0">{new Date(u.date).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' })}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Panel>
            ) : null}
        </div>
    );
};
