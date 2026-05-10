import React from 'react';

interface SkeletonProps {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
    <div className={`animate-pulse bg-white/10 rounded-2xl ${className}`} />
);

export const CardSkeleton = () => (
    <div className="rounded-3xl overflow-hidden glass-dark bg-white/5 border border-white/5 p-6">
        <Skeleton className="h-48 mb-4" />
        <Skeleton className="h-4 w-2/3 mb-3" />
        <Skeleton className="h-3 w-full mb-2" />
        <Skeleton className="h-3 w-3/4" />
    </div>
);

export const EventSkeleton = () => (
    <div className="flex flex-col xl:flex-row gap-12 bg-white/5 dark:bg-black/30 rounded-3xl p-6 md:p-10 border border-black/5 dark:border-white/10">
        <Skeleton className="w-full xl:w-2/5 aspect-video" />
        <div className="w-full xl:w-3/5 space-y-4">
            <div className="flex gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-4 pt-4">
                <Skeleton className="h-12 w-40 rounded-full" />
                <Skeleton className="h-12 w-40 rounded-full" />
            </div>
        </div>
    </div>
);

export const TableRowSkeleton = () => (
    <tr className="border-b border-white/5">
        <td className="p-5"><Skeleton className="h-10 w-48" /></td>
        <td className="p-5"><Skeleton className="h-6 w-20 rounded-full" /></td>
        <td className="p-5"><Skeleton className="h-6 w-full" /></td>
        <td className="p-5"><Skeleton className="h-8 w-16" /></td>
    </tr>
);

export const StatSkeleton = () => (
    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
        <div className="flex items-start justify-between mb-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-10 w-20 mb-2" />
        <Skeleton className="h-4 w-28" />
    </div>
);
