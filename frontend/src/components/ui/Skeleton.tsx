import { srcSetFor } from '../../lib/img';
import React from 'react';
import { useLocation } from 'react-router-dom';

interface SkeletonProps {
    className?: string;
    style?: React.CSSProperties;
}

/** Base Shimmer Skeleton with GPU-accelerated wave animation */
export const Skeleton: React.FC<SkeletonProps> = ({ className = '', style }) => (
    <div
        style={style}
        className={`skeleton-shimmer bg-black/[0.07] dark:bg-white/[0.08] rounded-2xl relative overflow-hidden transform-gpu ${className}`}
    />
);

/** Card Skeleton for Stories, Chronicles, and Articles */
export const CardSkeleton = () => (
    <div className="skeleton-delay rounded-3xl overflow-hidden glass-dark bg-white/40 dark:bg-black/30 border border-black/5 dark:border-white/10 p-6 md:p-8 flex flex-col justify-between h-full shadow-lg">
        <div>
            <Skeleton className="w-full aspect-[16/10] md:aspect-video rounded-2xl mb-5" />
            <div className="flex gap-3 mb-4">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-7 w-5/6 mb-3 rounded-xl" />
            <Skeleton className="h-4 w-full mb-2 rounded-lg" />
            <Skeleton className="h-4 w-4/5 rounded-lg" />
        </div>
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-black/5 dark:border-white/10">
            <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-4 w-24 rounded-md" />
            </div>
            <Skeleton className="h-4 w-16 rounded-md" />
        </div>
    </div>
);

/** Expedition / Event Card Skeleton */
export const EventSkeleton = () => (
    <div className="skeleton-delay flex flex-col lg:flex-row gap-8 lg:gap-12 bg-white/40 dark:bg-black/30 rounded-3xl p-6 md:p-10 border border-black/5 dark:border-white/10 shadow-xl backdrop-blur-md">
        <Skeleton className="w-full lg:w-2/5 aspect-video md:aspect-[16/10] rounded-2xl" />
        <div className="w-full lg:w-3/5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                    <Skeleton className="h-6 w-32 rounded-full" />
                    <Skeleton className="h-6 w-28 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <Skeleton className="h-10 w-4/5 rounded-xl" />
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4 rounded-lg" />
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-black/5 dark:border-white/10">
                <Skeleton className="h-12 w-44 rounded-full" />
                <Skeleton className="h-12 w-36 rounded-full" />
            </div>
        </div>
    </div>
);

/** Responsive Gallery Mosaic Skeleton */
export const GallerySkeleton = () => (
    <div className="skeleton-delay max-w-7xl mx-auto px-4 md:px-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div className="space-y-4">
                <Skeleton className="h-12 md:h-16 w-64 md:w-96 rounded-2xl" />
                <Skeleton className="h-5 w-80 max-w-full rounded-xl" />
            </div>
            <div className="flex gap-4">
                <Skeleton className="h-12 w-32 rounded-full" />
                <Skeleton className="h-12 w-40 rounded-full" />
            </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[220px] gap-4 md:gap-6">
            <Skeleton className="col-span-2 row-span-2 rounded-3xl" />
            <Skeleton className="col-span-1 row-span-1 rounded-3xl" />
            <Skeleton className="col-span-1 row-span-2 rounded-3xl" />
            <Skeleton className="col-span-1 row-span-1 rounded-3xl" />
            <Skeleton className="col-span-1 row-span-2 rounded-3xl" />
            <Skeleton className="col-span-2 row-span-1 rounded-3xl" />
            <Skeleton className="col-span-1 row-span-1 rounded-3xl" />
        </div>
    </div>
);

/** Story / Article Detail Page Skeleton */
export const DetailSkeleton = () => (
    <div className="skeleton-delay min-h-svh bg-alpine-snow dark:bg-[#0B0C10] text-alpine-navy dark:text-white pt-28 pb-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center gap-4 mb-4">
                <Skeleton className="h-10 w-28 rounded-full" />
            </div>
            
            {/* Cinematic Hero Image Shimmer */}
            <Skeleton className="w-full aspect-[21/9] md:aspect-[21/9] min-h-[300px] md:min-h-[440px] rounded-3xl shadow-2xl" />

            {/* Badges & Meta */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
                <Skeleton className="h-6 w-28 rounded-full" />
                <Skeleton className="h-6 w-36 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
            </div>

            {/* Title */}
            <Skeleton className="h-12 md:h-16 w-4/5 rounded-2xl" />
            <Skeleton className="h-8 md:h-10 w-2/3 rounded-xl" />

            {/* Author Chip */}
            <div className="flex items-center gap-4 py-4 border-y border-black/10 dark:border-white/10">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-36 rounded-md" />
                    <Skeleton className="h-3 w-24 rounded-md" />
                </div>
            </div>

            {/* Paragraph Blocks */}
            <div className="space-y-5 pt-4">
                <Skeleton className="h-5 w-full rounded-lg" />
                <Skeleton className="h-5 w-11/12 rounded-lg" />
                <Skeleton className="h-5 w-4/5 rounded-lg" />
                <div className="py-2" />
                <Skeleton className="h-5 w-full rounded-lg" />
                <Skeleton className="h-5 w-10/12 rounded-lg" />
                <Skeleton className="h-5 w-3/4 rounded-lg" />
            </div>
        </div>
    </div>
);

/** Event Detail Page Skeleton */
export const EventDetailSkeleton = () => (
    <div className="skeleton-delay min-h-svh bg-alpine-snow dark:bg-black text-alpine-navy dark:text-alpine-snow pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-10">
            <Skeleton className="h-10 w-28 rounded-full mb-6" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 space-y-8">
                    <Skeleton className="w-full aspect-video rounded-3xl shadow-2xl" />
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <Skeleton className="h-6 w-28 rounded-full" />
                            <Skeleton className="h-6 w-32 rounded-full" />
                        </div>
                        <Skeleton className="h-12 w-4/5 rounded-2xl" />
                        <Skeleton className="h-5 w-full rounded-lg" />
                        <Skeleton className="h-5 w-3/4 rounded-lg" />
                    </div>
                </div>

                {/* Sidebar CTA Card */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-dark bg-white/40 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-3xl p-8 space-y-6">
                        <Skeleton className="h-8 w-44 rounded-xl" />
                        <Skeleton className="h-14 w-full rounded-2xl" />
                        <div className="space-y-3 pt-4 border-t border-black/10 dark:border-white/10">
                            <Skeleton className="h-5 w-full rounded-lg" />
                            <Skeleton className="h-5 w-4/5 rounded-lg" />
                            <Skeleton className="h-5 w-3/5 rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

/** Community Hub Skeleton */
export const CommunitySkeleton = () => (
    <div className="skeleton-delay grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        {/* Left Sidebar */}
        <div className="lg:col-span-3 space-y-6">
            <div className="glass-dark bg-white/40 dark:bg-[#0B0C10]/40 border border-black/5 dark:border-white/10 rounded-3xl p-6 space-y-4">
                <Skeleton className="w-12 h-12 rounded-2xl mb-4" />
                <Skeleton className="h-6 w-40 rounded-lg" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-4/5 rounded-md" />
                <div className="pt-4 border-t border-black/5 dark:border-white/10 space-y-2">
                    <Skeleton className="h-4 w-28 rounded-md" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                </div>
            </div>
            <div className="space-y-2">
                {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-12 w-full rounded-xl" />
                ))}
            </div>
        </div>

        {/* Center Feed */}
        <div className="lg:col-span-6 space-y-6">
            <Skeleton className="h-36 w-full rounded-3xl" />
            {[1, 2, 3].map(i => (
                <div key={i} className="glass-dark bg-white/40 dark:bg-[#0B0C10]/40 border border-black/5 dark:border-white/10 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32 rounded-md" />
                            <Skeleton className="h-3 w-20 rounded-md" />
                        </div>
                    </div>
                    <Skeleton className="h-4 w-full rounded-md" />
                    <Skeleton className="h-4 w-5/6 rounded-md" />
                    <Skeleton className="w-full aspect-[16/9] rounded-2xl" />
                </div>
            ))}
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-3 space-y-6 hidden lg:block">
            <div className="glass-dark bg-white/40 dark:bg-[#0B0C10]/40 border border-black/5 dark:border-white/10 rounded-3xl p-6 space-y-4">
                <Skeleton className="h-6 w-32 rounded-lg" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-4/5 rounded-md" />
            </div>
        </div>
    </div>
);

/** Shop / Provisions Skeleton */
export const ProductSkeleton = () => (
    <div className="skeleton-delay space-y-4">
        <div className="aspect-[3/4] w-full rounded-[2rem] overflow-hidden relative bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
            <Skeleton className="w-full h-full rounded-[2rem]" />
        </div>
        <div className="flex justify-between items-start px-2">
            <div className="space-y-2">
                <Skeleton className="h-6 w-36 rounded-lg" />
                <Skeleton className="h-4 w-20 rounded-md" />
            </div>
            <Skeleton className="h-6 w-16 rounded-lg" />
        </div>
    </div>
);

export const ShopSkeleton = () => (
    <div className="skeleton-delay max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b border-black/10 dark:border-white/10">
            <div className="space-y-4">
                <Skeleton className="h-14 md:h-20 w-72 md:w-96 rounded-2xl" />
                <Skeleton className="h-5 w-80 max-w-full rounded-lg" />
            </div>
            <div className="flex gap-4">
                <Skeleton className="h-12 w-28 rounded-full" />
                <Skeleton className="h-12 w-36 rounded-full" />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-16">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <ProductSkeleton key={i} />
            ))}
        </div>
    </div>
);

/** Team / Vanguard Command Skeleton */
export const TeamSkeleton = () => (
    <div className="skeleton-delay max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b border-black/10 dark:border-white/10">
            <div className="space-y-4">
                <Skeleton className="h-14 md:h-20 w-72 md:w-96 rounded-2xl" />
                <Skeleton className="h-5 w-80 max-w-full rounded-lg" />
            </div>
            <Skeleton className="w-24 h-24 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 gap-y-20">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="space-y-6">
                    <Skeleton className="aspect-[3/4] w-full rounded-[2.5rem] shadow-xl" />
                    <div className="px-4 space-y-3">
                        <Skeleton className="h-4 w-28 rounded-md" />
                        <Skeleton className="h-8 w-44 rounded-xl" />
                        <Skeleton className="h-4 w-full rounded-md" />
                        <Skeleton className="h-4 w-4/5 rounded-md" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

/** Reviews / Testimonials Skeleton */
export const ReviewSkeleton = () => (
    <div className="skeleton-delay max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b border-black/10 dark:border-white/10">
            <div className="space-y-4">
                <Skeleton className="h-14 md:h-20 w-72 md:w-96 rounded-2xl" />
                <Skeleton className="h-5 w-80 max-w-full rounded-lg" />
            </div>
            <div className="flex gap-8">
                <Skeleton className="h-16 w-28 rounded-2xl" />
                <Skeleton className="h-16 w-28 rounded-2xl" />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="glass-dark bg-white/40 dark:bg-black/20 p-8 rounded-3xl border border-black/5 dark:border-white/10 space-y-6">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-5 w-24 rounded-md" />
                        <Skeleton className="h-5 w-28 rounded-full" />
                    </div>
                    <Skeleton className="h-6 w-full rounded-lg" />
                    <Skeleton className="h-6 w-4/5 rounded-lg" />
                    <Skeleton className="h-6 w-2/3 rounded-lg" />
                    <div className="pt-6 border-t border-black/5 dark:border-white/10 flex justify-between items-center">
                        <Skeleton className="h-5 w-24 rounded-md" />
                        <Skeleton className="h-4 w-32 rounded-md" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

/** Table Row Skeleton for Admin Dashboards */
export const TableRowSkeleton = () => (
    <tr className="border-b border-black/5 dark:border-white/5">
        <td className="p-5"><Skeleton className="h-10 w-48 rounded-xl" /></td>
        <td className="p-5"><Skeleton className="h-6 w-20 rounded-full" /></td>
        <td className="p-5"><Skeleton className="h-6 w-full rounded-lg" /></td>
        <td className="p-5"><Skeleton className="h-8 w-16 rounded-xl" /></td>
    </tr>
);

/** Admin management cards (merchandise, pillars, reviews): thumbnail, title and two lines each */
export const AdminCardGridSkeleton: React.FC<{ count?: number; className?: string }> = ({ count = 4, className = 'grid grid-cols-1 md:grid-cols-2 gap-4' }) => (
    <div className={className} aria-busy="true" aria-label="Loading">
        {Array.from({ length: count }, (_, i) => (
            <div key={i} className="skeleton-delay p-4 rounded-2xl border border-white/10 bg-white/[0.03] flex gap-4">
                <Skeleton className="w-20 h-20 shrink-0 rounded-xl" />
                <div className="flex-1 min-w-0 pt-1">
                    <Skeleton className="h-5 w-3/4 mb-3 rounded-lg" />
                    <Skeleton className="h-3.5 w-full mb-2 rounded-md" />
                    <Skeleton className="h-3.5 w-2/3 rounded-md" />
                </div>
            </div>
        ))}
    </div>
);

/** Metric / Stat Card Skeleton */
export const StatSkeleton = () => (
    <div className="skeleton-delay bg-white/40 dark:bg-white/5 p-6 rounded-2xl border border-black/5 dark:border-white/10 shadow-md">
        <div className="flex items-start justify-between mb-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-10 w-20 mb-2 rounded-lg" />
        <Skeleton className="h-4 w-28 rounded-md" />
    </div>
);

/**
 * Sign-in / sign-up placeholder: mirrors AuthHub exactly — photo panel with quote and ascent meter on the
 * left and the form column on the right (desktop), or a photo header with a rising sheet (phones).
 */
export const AuthSkeleton: React.FC = () => (
    <div className="skeleton-delay min-h-svh w-full bg-[#F7F4EF] dark:bg-[#070B12]" aria-busy="true" aria-label="Loading sign-in">
        {/* Desktop */}
        <div className="hidden lg:grid grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] min-h-svh">
            <div className="sticky top-0 h-svh p-3">
                <div className="relative h-full rounded-[1.75rem] overflow-hidden bg-gradient-to-b from-[#1A2B40] to-[#0B121C]">
                    <div className="absolute inset-0 skeleton-shimmer !bg-transparent !rounded-none" />
                    <div className="relative h-full flex flex-col justify-between p-10 xl:p-12">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-10 w-40 rounded-xl !bg-white/10" />
                            <Skeleton className="h-7 w-28 rounded-full !bg-white/10" />
                        </div>
                        <div className="max-w-xl space-y-4">
                            <Skeleton className="h-3 w-64 rounded-full !bg-white/10" />
                            <Skeleton className="h-10 w-full rounded-xl !bg-white/10" />
                            <Skeleton className="h-10 w-4/5 rounded-xl !bg-white/10" />
                            <Skeleton className="h-4 w-32 rounded-full !bg-white/10" />
                            <Skeleton className="h-2 w-full rounded-full !bg-white/10 mt-10" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col px-10 xl:px-16 py-8">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-28 rounded-full" />
                    <Skeleton className="h-3 w-36 rounded-full" />
                </div>
                <div className="flex-1 flex items-center">
                    <div className="w-full max-w-md mx-auto space-y-5">
                        <Skeleton className="h-3 w-40 rounded-full" />
                        <Skeleton className="h-12 w-72 rounded-xl" />
                        <Skeleton className="h-4 w-60 rounded-full" />
                        <div className="pt-4 space-y-6">
                            <Skeleton className="h-12 w-full rounded-full" />
                            <Skeleton className="h-px w-full rounded-none" />
                            <Skeleton className="h-11 w-full rounded-xl" />
                            <Skeleton className="h-11 w-full rounded-xl" />
                        </div>
                        <Skeleton className="h-14 w-full rounded-full mt-2" />
                        <Skeleton className="h-3 w-48 rounded-full mx-auto" />
                    </div>
                </div>
            </div>
        </div>
        {/* Phones & tablets */}
        <div className="lg:hidden relative min-h-svh">
            <div className="relative h-[34vh] min-h-[240px] sm:h-[38vh] bg-gradient-to-b from-[#1A2B40] to-[#0B121C] overflow-hidden">
                <div className="absolute inset-0 skeleton-shimmer !bg-transparent !rounded-none" />
                <div className="absolute left-5 right-5 top-5 flex justify-between">
                    <Skeleton className="h-9 w-9 rounded-full !bg-white/10" />
                    <Skeleton className="h-9 w-32 rounded-xl !bg-white/10" />
                </div>
            </div>
            <div className="relative -mt-8 rounded-t-[2rem] bg-[#F7F4EF] dark:bg-[#070B12] px-6 pt-8 pb-12 space-y-5">
                <Skeleton className="h-10 w-56 rounded-xl" />
                <Skeleton className="h-4 w-64 rounded-full" />
                <Skeleton className="h-12 w-full rounded-full mt-4" />
                <Skeleton className="h-11 w-full rounded-xl" />
                <Skeleton className="h-11 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-full" />
            </div>
        </div>
    </div>
);

/** Explorer portal / Summit Control placeholder: the console's rail, header and first row of tiles. */
export const ConsoleSkeleton: React.FC<{ admin?: boolean }> = ({ admin }) => (
    <div className={`skeleton-delay mm-console ${admin ? 'dark' : ''} min-h-svh flex text-[var(--mm-ink)]`} aria-busy="true" aria-label="Loading dashboard">
        <div className="mm-backdrop" aria-hidden="true" />
        <div className={`hidden lg:flex relative z-10 flex-col shrink-0 ${admin ? 'w-[264px] border-r border-[var(--mm-line)] p-5' : 'w-[272px] m-4 mr-0 mm-panel !rounded-[1.75rem] p-6'}`}>
            <Skeleton className="h-9 w-40 rounded-xl mb-8" />
            {!admin && <div className="flex items-center gap-3 mb-8"><Skeleton className="h-12 w-12 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-28 rounded-full" /><Skeleton className="h-2.5 w-16 rounded-full" /></div></div>}
            <div className="space-y-2.5">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-xl" />)}</div>
        </div>
        <div className="relative z-10 flex-1 min-w-0 px-4 sm:px-8 lg:px-12 pt-20 lg:pt-12">
            {admin && <Skeleton className="h-4 w-56 rounded-full mb-10" />}
            <Skeleton className="h-3 w-40 rounded-full mb-4" />
            <Skeleton className="h-14 w-80 max-w-full rounded-2xl mb-3" />
            <Skeleton className="h-4 w-96 max-w-full rounded-full mb-10" />
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-44 rounded-[1.25rem]" />)}</div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-5"><Skeleton className="h-72 xl:col-span-2 rounded-[1.25rem]" /><Skeleton className="h-72 rounded-[1.25rem]" /></div>
        </div>
    </div>
);

/** Smart Route Suspense Skeleton that dynamically adapts to target path */
export const RouteSuspenseSkeleton: React.FC = () => {
    const location = useLocation();
    const path = location.pathname;

    if (path === '/login' || path === '/signup' || path === '/profile-complete') return <AuthSkeleton />;
    if (path.startsWith('/portal') || path === '/dashboard') return <ConsoleSkeleton />;
    if (path.startsWith('/summit-control-panel')) return <ConsoleSkeleton admin />;

    if (path.startsWith('/stories/') && path !== '/stories') {
        return <DetailSkeleton />;
    }
    if (path.startsWith('/events/') && path !== '/events') {
        return <EventDetailSkeleton />;
    }
    if (path.startsWith('/events')) {
        return (
            <div className="skeleton-delay min-h-svh bg-alpine-snow dark:bg-black text-alpine-navy dark:text-alpine-snow pt-32 pb-24 px-6 md:px-12">
                <div className="max-w-7xl mx-auto space-y-12">
                    <Skeleton className="h-10 w-28 rounded-full mb-6" />
                    <div className="space-y-4">
                        <Skeleton className="h-14 md:h-20 w-72 md:w-96 rounded-2xl" />
                        <Skeleton className="h-5 w-80 max-w-full rounded-lg" />
                    </div>
                    <div className="space-y-8">
                        {[1, 2, 3].map(i => <EventSkeleton key={i} />)}
                    </div>
                </div>
            </div>
        );
    }
    if (path.startsWith('/gallery')) {
        return (
            <div className="min-h-svh bg-alpine-snow dark:bg-black pt-32 pb-24 px-4 md:px-8">
                <GallerySkeleton />
            </div>
        );
    }
    if (path.startsWith('/community')) {
        return (
            <div className="min-h-svh bg-alpine-snow dark:bg-[#0B0C10] pt-32 pb-24 px-6 md:px-12">
                <div className="max-w-7xl mx-auto space-y-8">
                    <Skeleton className="h-10 w-28 rounded-full" />
                    <div className="space-y-4">
                        <Skeleton className="h-14 md:h-20 w-72 md:w-96 rounded-2xl" />
                        <Skeleton className="h-5 w-80 max-w-full rounded-lg" />
                    </div>
                    <CommunitySkeleton />
                </div>
            </div>
        );
    }
    if (path.startsWith('/shop')) {
        return (
            <div className="min-h-svh bg-alpine-snow dark:bg-black pt-32 pb-24 px-6 md:px-12">
                <ShopSkeleton />
            </div>
        );
    }
    if (path.startsWith('/team')) {
        return (
            <div className="min-h-svh bg-alpine-snow dark:bg-black pt-32 pb-24 px-6 md:px-12">
                <TeamSkeleton />
            </div>
        );
    }
    if (path.startsWith('/reviews')) {
        return (
            <div className="min-h-svh bg-alpine-snow dark:bg-black pt-32 pb-24 px-6 md:px-12">
                <ReviewSkeleton />
            </div>
        );
    }

    // Default universal page skeleton (Stories, Profile, etc.)
    return (
        <div className="min-h-svh bg-alpine-snow dark:bg-black text-alpine-navy dark:text-alpine-snow pt-32 pb-24 px-6 md:px-12">
            <div className="max-w-7xl mx-auto space-y-12">
                <Skeleton className="h-10 w-28 rounded-full mb-6" />
                <div className="space-y-4 pb-8 border-b border-black/10 dark:border-white/10">
                    <Skeleton className="h-14 md:h-20 w-72 md:w-96 rounded-2xl" />
                    <Skeleton className="h-5 w-80 max-w-full rounded-lg" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
};

/** Image with Progressive Shimmer Skeleton Component (Eliminates CLS) */
export interface ImageWithSkeletonProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    containerClassName?: string;
    aspectRatio?: string;
    skeletonClassName?: string;
}

export const ImageWithSkeleton: React.FC<ImageWithSkeletonProps> = ({
    src,
    alt = '',
    className = '',
    containerClassName = '',
    aspectRatio,
    skeletonClassName = '',
    ...props
}) => {
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [hasError, setHasError] = React.useState(false);

    return (
        <div className={`relative overflow-hidden ${containerClassName}`} style={aspectRatio ? { aspectRatio } : undefined}>
            {!isLoaded && !hasError && (
                <Skeleton className={`absolute inset-0 w-full h-full rounded-[inherit] z-10 ${skeletonClassName}`} />
            )}
            <img
                src={src}
                alt={alt}
                // CDN images get width variants so phones don't download desktop-sized photos
                srcSet={props.srcSet ?? srcSetFor(src)}
                sizes={props.sizes ?? '(max-width: 768px) 100vw, 60vw'}
                loading={props.loading || 'lazy'}
                decoding="async"
                onLoad={() => setIsLoaded(true)}
                onError={() => {
                    setHasError(true);
                    setIsLoaded(true);
                }}
                className={`transition-opacity duration-700 ease-out ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
                {...props}
            />
        </div>
    );
};

/** User Profile Tab Skeleton */
export const ProfileSkeleton = () => (
    <div className="skeleton-delay w-full max-w-7xl mx-auto space-y-8 animate-fade-in">
        <div className="flex justify-between items-end mb-8">
            <div className="space-y-3">
                <Skeleton className="h-10 w-64 rounded-2xl" />
                <Skeleton className="h-4 w-80 rounded-lg" />
            </div>
        </div>
        {/* Basecamp Metrics Bar */}
        <div className="w-full bg-white/40 dark:bg-[#11141A]/60 backdrop-blur-3xl rounded-[2.5rem] border border-black/5 dark:border-white/5 p-8 flex flex-wrap gap-10 sm:gap-20">
            {[1, 2, 3].map(i => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-28 rounded-md" />
                    <Skeleton className="h-12 w-24 rounded-xl" />
                </div>
            ))}
        </div>
        {/* Profile Card & Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-white/40 dark:bg-[#11141A]/60 rounded-3xl p-8 border border-black/5 dark:border-white/5 space-y-6">
                <div className="flex items-center gap-6">
                    <Skeleton className="w-20 h-20 rounded-2xl" />
                    <div className="space-y-3">
                        <Skeleton className="h-7 w-48 rounded-xl" />
                        <Skeleton className="h-4 w-32 rounded-lg" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <Skeleton className="h-14 rounded-2xl" />
                    <Skeleton className="h-14 rounded-2xl" />
                    <Skeleton className="h-14 rounded-2xl" />
                    <Skeleton className="h-14 rounded-2xl" />
                </div>
            </div>
            <div className="lg:col-span-4 bg-white/40 dark:bg-[#11141A]/60 rounded-3xl p-8 border border-black/5 dark:border-white/5 space-y-6">
                <Skeleton className="h-6 w-36 rounded-lg" />
                <Skeleton className="h-12 rounded-2xl" />
                <Skeleton className="h-12 rounded-2xl" />
                <Skeleton className="h-12 rounded-2xl" />
            </div>
        </div>
    </div>
);

/** Expedition Passport Tab Skeleton */
export const ExpeditionTabSkeleton = () => (
    <div className="skeleton-delay space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
                <Skeleton className="w-14 h-14 rounded-2xl" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-56 rounded-xl" />
                    <Skeleton className="h-4 w-72 rounded-lg" />
                </div>
            </div>
            <Skeleton className="h-12 w-44 rounded-xl" />
        </div>
        {/* Passport Stats */}
        <div className="p-8 rounded-[2rem] bg-white/60 dark:bg-[#11141A]/60 border border-black/5 dark:border-white/5 space-y-6">
            <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-48 rounded-lg" />
                <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
            </div>
        </div>
        {/* Calendar and Upcoming list */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 bg-white/40 dark:bg-[#11141A]/60 rounded-[2rem] p-8 border border-black/5 dark:border-white/5 space-y-6">
                <Skeleton className="h-8 w-44 rounded-xl mx-auto" />
                <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 35 }).map((_, i) => (
                        <Skeleton key={i} className="aspect-square rounded-xl" />
                    ))}
                </div>
            </div>
            <div className="lg:col-span-5 space-y-4">
                <Skeleton className="h-6 w-36 rounded-lg mb-2" />
                {[1, 2, 3].map(i => (
                    <div key={i} className="p-6 rounded-2xl bg-white/40 dark:bg-[#11141A]/60 border border-black/5 dark:border-white/5 flex gap-4">
                        <Skeleton className="w-20 h-20 rounded-xl shrink-0" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-3/4 rounded-lg" />
                            <Skeleton className="h-4 w-1/2 rounded-md" />
                            <Skeleton className="h-4 w-1/3 rounded-md" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

/** Submissions Tab Skeleton */
export const SubmissionsSkeleton = () => (
    <div className="skeleton-delay flex flex-col h-full space-y-8 animate-fade-in">
        <div className="space-y-3">
            <Skeleton className="h-10 w-64 rounded-2xl" />
            <Skeleton className="h-4 w-80 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map(col => (
                <div key={col} className="bg-white/60 dark:bg-[#11141A] rounded-3xl p-6 sm:p-8 border border-black/5 dark:border-white/5 space-y-4">
                    <Skeleton className="h-7 w-40 rounded-xl mb-4" />
                    {[1, 2, 3].map(row => (
                        <div key={row} className="p-4 rounded-2xl bg-black/5 dark:bg-black/30 flex gap-4 items-center">
                            <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-5 w-3/4 rounded-lg" />
                                <Skeleton className="h-4 w-1/3 rounded-md" />
                            </div>
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    </div>
);

/** Wishlist Tab Skeleton */
export const WishlistSkeleton = () => (
    <div className="skeleton-delay space-y-8 animate-fade-in">
        <div className="flex items-center gap-4 mb-8">
            <Skeleton className="w-14 h-14 rounded-2xl" />
            <div className="space-y-2">
                <Skeleton className="h-8 w-48 rounded-xl" />
                <Skeleton className="h-4 w-64 rounded-lg" />
            </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white/60 dark:bg-[#11141A]/60 rounded-3xl p-5 border border-black/5 dark:border-white/5 space-y-4">
                    <Skeleton className="w-full aspect-square rounded-2xl" />
                    <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1 mr-4">
                            <Skeleton className="h-5 w-3/4 rounded-lg" />
                            <Skeleton className="h-4 w-1/2 rounded-md" />
                        </div>
                        <Skeleton className="h-6 w-16 rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

/** Communities / Factions Tab Skeleton */
export const CommunitiesTabSkeleton = () => (
    <div className="skeleton-delay space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
                <Skeleton className="w-14 h-14 rounded-2xl" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-44 rounded-xl" />
                    <Skeleton className="h-4 w-72 rounded-lg" />
                </div>
            </div>
            <Skeleton className="h-12 w-44 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="p-6 rounded-3xl bg-white/40 dark:bg-[#11141A]/60 border border-black/5 dark:border-white/5 flex gap-5">
                    <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-3">
                        <Skeleton className="h-6 w-48 rounded-xl" />
                        <Skeleton className="h-4 w-full rounded-md" />
                        <Skeleton className="h-4 w-2/3 rounded-md" />
                        <div className="flex justify-between items-center pt-2">
                            <Skeleton className="h-4 w-24 rounded-md" />
                            <Skeleton className="h-9 w-28 rounded-xl" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

/** Collections Tab Skeleton */
export const CollectionsTabSkeleton = () => (
    <div className="skeleton-delay space-y-8 animate-fade-in">
        <div className="space-y-3">
            <Skeleton className="h-10 w-64 rounded-2xl" />
            <Skeleton className="h-4 w-80 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
        </div>
    </div>
);

/** Peak Info AI Drawer Skeleton */
export const PeakInfoSkeleton = () => (
    <div className="skeleton-delay space-y-2.5 pt-1">
        <Skeleton className="h-3.5 w-11/12 rounded-md" />
        <Skeleton className="h-3.5 w-full rounded-md" />
        <Skeleton className="h-3.5 w-4/5 rounded-md" />
        <div className="pt-2 flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
        </div>
    </div>
);

/** Altitude Network Feeds Skeleton */
export const AltitudeNetworkSkeleton = () => (
    <div className="skeleton-delay grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        <div className="space-y-4">
            <Skeleton className="h-7 w-48 rounded-xl mb-4" />
            {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/40 dark:bg-black/30 border border-black/5 dark:border-white/10">
                    <Skeleton className="w-24 h-24 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4 rounded-md" />
                        <Skeleton className="h-4 w-full rounded-md" />
                        <Skeleton className="h-3 w-1/3 rounded-md" />
                    </div>
                </div>
            ))}
        </div>
        <div className="space-y-4">
            <Skeleton className="h-7 w-48 rounded-xl mb-4" />
            {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/40 dark:bg-black/30 border border-black/5 dark:border-white/10">
                    <Skeleton className="w-28 h-20 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-4/5 rounded-md" />
                        <Skeleton className="h-3 w-1/2 rounded-md" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

