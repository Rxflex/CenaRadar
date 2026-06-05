import { Radar, Store, TrendingDown } from "lucide-react";
import { cacheLife } from "next/cache";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { ProductFeed } from "@/components/product-feed";
import { ProductGridSkeleton } from "@/components/product-grid-skeleton";
import { ShopFeedSection } from "@/components/shop-feed-section";
import { ShopFeedSkeleton } from "@/components/shop-feed-skeleton";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/link";
import {
	HOME_FEED_PER_SHOP_LIMIT,
	getHomeFeed,
	type ShopSection,
} from "@/lib/scraper/feed";
import { getProducts, getProductsIndex } from "@/lib/scraper/products";

export async function generateMetadata() {
	const th = await getTranslations("home");
	return { title: th("title"), description: th("subtitle") };
}

async function loadHomeIndex() {
	"use cache";
	cacheLife("hours");
	return getProductsIndex();
}

async function loadHomeProducts() {
	"use cache";
	cacheLife("hours");
	return getProducts({ limit: 60, sort: "savings" });
}

async function loadHomeFeed() {
	return getHomeFeed(HOME_FEED_PER_SHOP_LIMIT);
}

export default async function Home() {
	const th = await getTranslations("home");
	return (
		<div className="space-y-10">
			<section className="relative overflow-hidden rounded-3xl border bg-card p-6 sm:p-10">
				<div className="absolute -top-20 -right-20 size-72 rounded-full bg-radar/10 blur-3xl" />
				<div className="absolute -bottom-20 -left-20 size-72 rounded-full bg-hot/10 blur-3xl" />
				<div className="relative max-w-2xl">
					<HeroChrome />
					<Suspense fallback={<HeroStatsSkeleton />}>
						<HeroStats />
					</Suspense>
				</div>
			</section>

			<section className="space-y-6">
				<header>
					<h2 className="text-lg font-semibold tracking-tight">
						{th("shopFlyers")}
					</h2>
					<p className="mt-0.5 text-sm text-muted-foreground">
						{th("shopFlyersSubtitle")}
					</p>
				</header>
				<Suspense fallback={<ShopFeedSkeleton count={4} />}>
					<ShopFeeds />
				</Suspense>
			</section>

			<section className="space-y-4">
				<header>
					<h2 className="text-lg font-semibold tracking-tight">
						{th("crossShop")}
					</h2>
				</header>
				<Suspense fallback={<ProductGridSkeleton count={10} />}>
					<CrossShopFeed />
				</Suspense>
			</section>
		</div>
	);
}

async function HeroChrome() {
	const t = await getTranslations("common");
	const th = await getTranslations("home");
	return (
		<>
			<div className="flex items-center gap-2 text-radar">
				<Radar className="size-5" />
				<span className="text-xs font-semibold uppercase tracking-widest">
					{t("appName")}
				</span>
			</div>
			<h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
				{th("title")}
			</h1>
			<p className="mt-2 text-base text-muted-foreground sm:text-lg">
				{th("subtitle")}
			</p>
		</>
	);
}

async function HeroStats() {
	const t = await getTranslations("common");
	const th = await getTranslations("home");
	const [index, sections, firstPage] = await Promise.all([
		loadHomeIndex(),
		loadHomeFeed(),
		loadHomeProducts(),
	]);
	const totalProducts = Math.max(firstPage.total, index.products.length);
	const topCategories = index.categories.slice(0, 8);
	return (
		<>
			<div className="mt-4 flex flex-wrap gap-2">
				<Badge
					variant="secondary"
					className="gap-1.5 bg-radar/15 text-radar"
				>
					<TrendingDown className="size-3" />
					{th("productsCount", { count: totalProducts })}
				</Badge>
				<Badge variant="secondary" className="gap-1.5">
					<Store className="size-3" />
					{t("fromShops", { count: sections.length })}
				</Badge>
			</div>
			<div className="mt-4 flex flex-wrap gap-1.5">
				{topCategories.slice(0, 6).map((c) => (
					<Link
						key={c.slug}
						href={`/category/${c.slug}`}
						className="rounded-full border bg-background/60 px-2.5 py-1 text-xs hover:bg-accent"
					>
						{c.name}
					</Link>
				))}
			</div>
		</>
	);
}

function HeroStatsSkeleton() {
	return (
		<>
			<div className="mt-4 flex flex-wrap gap-2">
				<Skeleton className="h-6 w-40 rounded-full" />
				<Skeleton className="h-6 w-32 rounded-full" />
			</div>
			<div className="mt-4 flex flex-wrap gap-1.5">
				{Array.from({ length: 6 }, (_, i) => (
					<Skeleton
						key={`hero-cat-${i}`}
						className="h-6 w-16 rounded-full"
					/>
				))}
			</div>
		</>
	);
}

async function ShopFeeds() {
	const th = await getTranslations("home");
	const sections: ShopSection[] = await loadHomeFeed();
	if (sections.length === 0) {
		return (
			<div className="rounded-xl border bg-muted/30 p-10 text-center">
				<p className="text-sm text-muted-foreground">{th("noProducts")}</p>
			</div>
		);
	}
	return (
		<div className="space-y-8">
			{sections.map((s) => (
				<ShopFeedSection key={s.shopSlug} section={s} />
			))}
		</div>
	);
}

async function CrossShopFeed() {
	const [index, firstPage] = await Promise.all([
		loadHomeIndex(),
		loadHomeProducts(),
	]);
	const totalProducts = Math.max(firstPage.total, index.products.length);
	return (
		<ProductFeed
			initialTotal={totalProducts}
			initialProducts={firstPage.products}
			initialCategories={index.categories}
		/>
	);
}
