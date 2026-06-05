import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton mirroring the per-shop feed section: a sticky shop header and
 * a horizontal-scrolling row of product cards. Used both as a Suspense
 * fallback inside the home page and as part of the route-level loading
 * shell.
 */
export function ShopFeedSkeleton({ count = 2 }: { count?: number }) {
	return (
		<div className="space-y-8">
			{Array.from({ length: count }, (_, i) => (
				<div key={`shop-skel-${i}`} className="space-y-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Skeleton className="size-7 rounded-md" />
							<Skeleton className="h-5 w-32" />
							<Skeleton className="h-4 w-16" />
						</div>
						<Skeleton className="h-4 w-20" />
					</div>
					<div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 sm:gap-4">
						{Array.from({ length: 6 }, (_, j) => (
							<div
								key={`shop-card-${i}-${j}`}
								className="flex w-40 shrink-0 flex-col gap-2 rounded-xl bg-card p-3 ring-1 ring-foreground/10 sm:w-48"
							>
								<Skeleton className="aspect-[1/2] w-full rounded-md" />
								<Skeleton className="h-4 w-3/4" />
								<Skeleton className="h-4 w-1/2" />
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
