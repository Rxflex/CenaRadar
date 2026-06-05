"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ProductDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-48" />
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={`skeleton-${i}`} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
