import { Skeleton } from "./skeleton";

/**
 * Full page loading skeleton for dashboard/day pages
 */
export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header skeleton */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-12 animate-slow-pulse" />
            <Skeleton className="h-6 w-24 animate-slow-pulse" />
          </div>
          <Skeleton className="h-9 w-9 rounded-full animate-slow-pulse" />
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-8 w-48 animate-slow-pulse" />
          <Skeleton className="h-4 w-64 animate-slow-pulse" />
          <div className="mt-4 grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-10 animate-slow-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for day page with calendar and task panel
 */
export function DayPageLoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header skeleton */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 animate-slow-pulse" />
            <Skeleton className="h-4 w-32 animate-slow-pulse hidden md:block" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 animate-slow-pulse" />
            <Skeleton className="h-9 w-9 animate-slow-pulse" />
            <Skeleton className="h-9 w-9 animate-slow-pulse" />
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 flex">
        {/* Calendar skeleton */}
        <div className="flex-1 p-4 border-r">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-32 animate-slow-pulse" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 animate-slow-pulse" />
              <Skeleton className="h-8 w-8 animate-slow-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex gap-2">
                <Skeleton className="h-8 w-16 animate-slow-pulse" />
                <Skeleton className="h-8 flex-1 animate-slow-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Task panel skeleton */}
        <div className="w-96 flex-shrink-0 hidden md:block">
          <TaskPanelLoadingSkeleton />
        </div>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for task panel
 */
export function TaskPanelLoadingSkeleton() {
  return (
    <div className="h-full flex flex-col">
      {/* Filter area skeleton */}
      <div className="p-4 border-b space-y-4">
        <Skeleton className="h-10 w-full animate-slow-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-12 animate-slow-pulse" />
            <Skeleton className="h-10 w-full animate-slow-pulse" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16 animate-slow-pulse" />
            <Skeleton className="h-10 w-full animate-slow-pulse" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 animate-slow-pulse" />
          <Skeleton className="h-4 w-32 animate-slow-pulse" />
        </div>
      </div>

      {/* Task list skeleton */}
      <div className="flex-1 p-4 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <TaskItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Loading skeleton for individual task item
 */
export function TaskItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
      <Skeleton className="h-4 w-4 animate-slow-pulse" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4 animate-slow-pulse" />
        <div className="flex gap-2">
          <Skeleton className="h-3 w-20 animate-slow-pulse" />
          <Skeleton className="h-3 w-16 animate-slow-pulse" />
        </div>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for event preview section in dashboard
 */
export function EventPreviewLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-4 w-32 mx-auto animate-slow-pulse" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-muted rounded-md p-2 pl-6 relative">
            <Skeleton className="absolute inset-y-2 left-2 w-1 rounded-full animate-slow-pulse" />
            <Skeleton className="h-4 w-3/4 animate-slow-pulse" />
            <Skeleton className="h-3 w-20 mt-1 animate-slow-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
