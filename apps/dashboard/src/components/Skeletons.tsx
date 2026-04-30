import type { CSSProperties } from 'react';

// Skeleton — animated placeholder for loading states

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div className={`skeleton ${className}`} style={style} aria-hidden="true" />
  );
}

// ─── Stat Card Skeleton ───────────────────────────────────────────────────────

export function StatCardSkeleton() {
  return (
    <div className="card p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-20 h-5 rounded-full" />
      </div>
      <div>
        <Skeleton className="w-24 h-8 rounded-lg mb-2" />
        <Skeleton className="w-32 h-4 rounded-md" />
      </div>
    </div>
  );
}

// ─── Table Row Skeleton ───────────────────────────────────────────────────────

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-slate-50">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className={`h-4 rounded-md ${i === 0 ? 'w-40' : i === cols - 1 ? 'w-16' : 'w-24'}`} />
        </td>
      ))}
    </tr>
  );
}

// ─── Card Skeleton ────────────────────────────────────────────────────────────

export function CardSkeleton() {
  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <Skeleton className="h-4 w-3/4 rounded-md mb-2" />
          <Skeleton className="h-3 w-1/2 rounded-md" />
        </div>
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="w-20 h-5 rounded-full" />
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <Skeleton className="w-24 h-4 rounded-md" />
        <Skeleton className="w-20 h-4 rounded-md" />
      </div>
    </div>
  );
}

// ─── Chart Skeleton ───────────────────────────────────────────────────────────

export function ChartSkeleton({ height = 260 }: { height?: number }) {
  return (
    <div className="flex items-end gap-2 px-4 pb-4" style={{ height }}>
      {[60, 90, 45, 75, 50, 85, 40, 70].map((h, i) => (
        <div key={i} className="flex-1 flex flex-col justify-end">
          <Skeleton className="w-full rounded-t-lg" style={{ height: `${h}%` }} />
        </div>
      ))}
    </div>
  );
}
