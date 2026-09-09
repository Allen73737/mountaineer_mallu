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
    <div className="rounded-3xl overflow-hidden glass-dark bg-white/40 dark:bg-black/30 border border-black/5 dark:border-white/10 p-6 md:p-8 flex flex-col justify-between h-full shadow-lg">
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
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 bg-white/40 dark:bg-black/30 rounded-3xl p-6 md:p-10 border border-black/5 dark:border-white/10 shadow-xl backdrop-blur-md">
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
    <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
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
    <div className="min-h-screen bg-alpine-snow dark:bg-[#0B0C10] text-alpine-navy dark:text-white pt-28 pb-20 px-6 md:px-12">
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
    <div className="min-h-screen bg-alpine-snow dark:bg-black text-alpine-navy dark:text-alpine-snow pt-32 pb-24 px-6 md:px-12">
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
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
    <div className="space-y-4">
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
    <div className="max-w-7xl mx-auto space-y-12">
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
    <div className="max-w-7xl mx-auto space-y-12">
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
    <div className="max-w-7xl mx-auto space-y-12">
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

/** Metric / Stat Card Skeleton */
export const StatSkeleton = () => (
    <div className="bg-white/40 dark:bg-white/5 p-6 rounded-2xl border border-black/5 dark:border-white/10 shadow-md">
        <div className="flex items-start justify-between mb-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-10 w-20 mb-2 rounded-lg" />
        <Skeleton className="h-4 w-28 rounded-md" />
    </div>
);

/** Smart Route Suspense Skeleton that dynamically adapts to target path */
export const RouteSuspenseSkeleton: React.FC = () => {
    const location = useLocation();
    const path = location.pathname;

    if (path.startsWith('/stories/') && path !== '/stories') {
        return <DetailSkeleton />;
    }
    if (path.startsWith('/events/') && path !== '/events') {
        return <EventDetailSkeleton />;
    }
    if (path.startsWith('/events')) {
        return (
            <div className="min-h-screen bg-alpine-snow dark:bg-black text-alpine-navy dark:text-alpine-snow pt-32 pb-24 px-6 md:px-12">
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
            <div className="min-h-screen bg-alpine-snow dark:bg-black pt-32 pb-24 px-4 md:px-8">
                <GallerySkeleton />
            </div>
        );
    }
    if (path.startsWith('/community')) {
        return (
            <div className="min-h-screen bg-alpine-snow dark:bg-[#0B0C10] pt-32 pb-24 px-6 md:px-12">
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
            <div className="min-h-screen bg-alpine-snow dark:bg-black pt-32 pb-24 px-6 md:px-12">
                <ShopSkeleton />
            </div>
        );
    }
    if (path.startsWith('/team')) {
        return (
            <div className="min-h-screen bg-alpine-snow dark:bg-black pt-32 pb-24 px-6 md:px-12">
                <TeamSkeleton />
            </div>
        );
    }
    if (path.startsWith('/reviews')) {
        return (
            <div className="min-h-screen bg-alpine-snow dark:bg-black pt-32 pb-24 px-6 md:px-12">
                <ReviewSkeleton />
            </div>
        );
    }

    // Default universal page skeleton (Stories, Profile, etc.)
    return (
        <div className="min-h-screen bg-alpine-snow dark:bg-black text-alpine-navy dark:text-alpine-snow pt-32 pb-24 px-6 md:px-12">
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

