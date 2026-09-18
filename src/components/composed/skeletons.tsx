import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Header block: eyebrow label, title, subtitle. Mirrors page-header layout. */
export function PageHeaderSkeleton({ withAction }: { withAction?: boolean }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-3.5 w-72 max-w-full" />
      </div>
      {withAction && <Skeleton className="h-8 w-32 self-start sm:self-auto" />}
    </div>
  );
}

/** Matches MetricCard / KPI tile: label, big value, subtext. */
export function MetricCardSkeleton() {
  return (
    <Card className="p-4 sm:p-5 border-border-subtle bg-canvas-surface space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-7 w-16" />
      <Skeleton className="h-3 w-24" />
    </Card>
  );
}

export function MetricCardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <MetricCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Matches shadcn Table: header row + N body rows across given column widths. */
export function TableSkeleton({
  columns = 5,
  rows = 5,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-4 border-b border-border-subtle pb-2.5 mb-2.5">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton
                key={c}
                className={cn("h-3.5 flex-1", c === 0 && "h-8")}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Generic panel: title row + N stacked lines, wrapped in a Card. */
export function CardListSkeleton({
  title = true,
  rows = 4,
}: {
  title?: boolean;
  rows?: number;
}) {
  return (
    <Card className="p-5 border-border-subtle bg-canvas-surface space-y-4">
      {title && (
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </Card>
  );
}

/** Matches ProjectCard grid item: badge, title, progress bar, stat row. */
export function ProjectCardSkeleton() {
  return (
    <Card className="border-border-subtle bg-canvas-surface p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <Skeleton className="h-1.5 w-full rounded-full" />
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
      </div>
      <div className="flex items-center justify-between border-t border-border-subtle pt-3">
        <Skeleton className="h-3 w-20" />
        <div className="flex -space-x-1.5">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      </div>
    </Card>
  );
}

export function ProjectCardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Matches WorkspaceHeader: breadcrumb line, icon+title, avatar stack. */
export function WorkspaceHeaderSkeleton() {
  return (
    <div className="space-y-4 pb-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Skeleton className="h-3 w-40" />
        <div className="flex gap-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <Skeleton className="h-11 w-11 shrink-0 rounded-lg" />
          <div className="space-y-2 flex-1 min-w-0">
            <Skeleton className="h-6 w-64 max-w-full" />
            <Skeleton className="h-3.5 w-full max-w-md" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2.5 shrink-0">
          <div className="flex -space-x-1.5">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-7 w-7 rounded-full" />
          </div>
          <Skeleton className="h-8 w-40" />
        </div>
      </div>
    </div>
  );
}
