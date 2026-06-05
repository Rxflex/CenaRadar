import { ProductGridSkeleton } from "@/components/product-grid-skeleton";
import { ShopFeedSkeleton } from "@/components/shop-feed-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="space-y-10">
			<section className="relative overflow-hidden rounded-3xl border bg-card p-6 sm:p-10">
				<div className="absolute -top-20 -right-20 size-72 rounded-full bg-radar/10 blur-3xl" />
				<div className="absolute -bottom-20 -left-20 size-72 rounded-full bg-hot/10 blur-3xl" />
				<div className="relative max-w-2xl space-y-3">
					<div className="flex items-center gap-2 text-radar">
						<Skeleton className="h-5 w-5 rounded-md" />
						<Skeleton className="h-3 w-24" />
					</div>
					<Skeleton className="h-9 w-72 sm:h-10" />
					<Skeleton className="h-5 w-96 max-w-full" />
					<div className="mt-4 flex flex-wrap gap-2">
						<Skeleton className="h-6 w-40 rounded-full" />
						<Skeleton className="h-6 w-32 rounded-full" />
					</div>
					<div className="mt-4 flex flex-wrap gap-1.5">
						{Array.from({ length: 6 }, (_, i) => (
							<Skeleton
								key={`cat-${i}`}
								className="h-6 w-16 rounded-full"
							/>
						))}
					</div>
				</div>
			</section>

			<section className="space-y-6">
				<div>
					<Skeleton className="h-6 w-40" />
					<Skeleton className="mt-1 h-4 w-72 max-w-full" />
				</div>
				<ShopFeedSkeleton />
			</section>

			<section className="space-y-4">
				<Skeleton className="h-6 w-56" />
				<ProductGridSkeleton count={10} />
			</section>
		</div>
	);
}
