import { Skeleton } from "@/components/ui/skeleton";

export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={`skeleton-${i}`}
          className="flex flex-col gap-3 rounded-xl ring-1 ring-foreground/10 bg-card p-3"
        >
          <Skeleton className="aspect-[1/2] w-full max-h-72 rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
