import { clsx } from 'clsx';

export const Skeleton = ({ className }) => (
  <div className={clsx('skeleton', className)} />
);

export const StatCardSkeleton = () => (
  <div className="card p-5 space-y-3">
    <Skeleton className="h-9 w-9 rounded-xl" />
    <Skeleton className="h-3 w-20" />
    <Skeleton className="h-7 w-14" />
  </div>
);

export const CardSkeleton = () => (
  <div className="card overflow-hidden">
    <Skeleton className="h-36 w-full rounded-none" />
    <div className="p-4 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="card overflow-hidden">
    <div className="p-4 border-b border-border">
      <Skeleton className="h-4 w-40" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 px-4 py-3 border-b border-border last:border-0">
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    ))}
  </div>
);
