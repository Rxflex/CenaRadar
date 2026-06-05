import { ExternalLink, Store, Tag } from "lucide-react";
import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ProductImage } from "@/components/product-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/link";
import { getShopLeaflet } from "@/lib/scraper/leaflet";
import { formatPrice } from "@/lib/scraper/parse";
import { KNOWN_SHOPS } from "@/lib/scraper/shops";

async function loadShopLeaflet(slug: string) {
	"use cache";
	cacheLife("hours");
	return getShopLeaflet(slug);
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const shop = KNOWN_SHOPS[slug];
	if (!shop) return { title: "Not found" };
	return {
		title: shop.name,
		description: `All current deals from ${shop.name} — live from the shop's leaflet.`,
	};
}

export default async function ShopPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const shop = KNOWN_SHOPS[slug];
	if (!shop) notFound();

	const leaflet = await loadShopLeaflet(slug);
	const t = await getTranslations("common");
	const ts = await getTranslations("shop");
	const locale = await getLocale();

	if (!leaflet || leaflet.products.length === 0) {
		return (
			<div className="space-y-6">
				<header className="flex items-center gap-4">
					<span className="flex size-12 items-center justify-center rounded-xl bg-radar/10 text-radar">
						<Store className="size-5" />
					</span>
					<div>
						<h1 className="text-2xl font-semibold tracking-tight">
							{shop.name}
						</h1>
					</div>
				</header>
				<Card>
					<CardContent className="p-10 text-center text-sm text-muted-foreground">
						{ts("notFound")}
					</CardContent>
				</Card>
			</div>
		);
	}

	const products = [...leaflet.products].sort(
		(a, b) => a.price.amount - b.price.amount,
	);

	return (
		<div className="space-y-6">
			<header className="flex flex-wrap items-center gap-4">
				<span className="flex size-12 items-center justify-center rounded-xl bg-radar/10 text-radar">
					{shop.emoji ? (
						<span aria-hidden className="text-2xl">
							{shop.emoji}
						</span>
					) : (
						<Store className="size-5" />
					)}
				</span>
				<div className="flex-1 min-w-0">
					<h1 className="text-2xl font-semibold tracking-tight">
						{leaflet.shopName || shop.name}
					</h1>
					<p className="text-sm text-muted-foreground">
						{leaflet.validFrom && leaflet.validTo
							? `${leaflet.validFrom} — ${leaflet.validTo}`
							: t("lastUpdated", { ago: "" })}
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Badge className="bg-radar/15 text-radar">
						<Tag className="size-3" />
						{products.length} {t("products")}
					</Badge>
					{leaflet.pageCount > 1 ? (
						<Badge variant="secondary">
							{leaflet.pageCount} {ts("pages")}
						</Badge>
					) : null}
				</div>
			</header>

			<Button
				variant="outline"
				size="sm"
				nativeButton={false}
				render={
					<a href={leaflet.url} target="_blank" rel="noopener noreferrer" />
				}
			>
				<ExternalLink className="size-3.5" />
				{t("viewOnKupi")}
			</Button>

			<div className="columns-2 gap-3 [column-fill:_balance] sm:columns-3 lg:columns-4 xl:columns-5">
				{products.map((p) => (
					<Link
						key={p.slug}
						href={`/product/${p.slug}`}
						className="group mb-3 block break-inside-avoid"
					>
						<Card
							size="sm"
							className="t-card-lift overflow-hidden transition-shadow hover:ring-foreground/20"
						>
							<div className="relative bg-muted/30">
								<div className="max-h-72 min-h-32 aspect-[1/2]">
									<ProductImage
										slug={p.slug}
										alt={p.name}
										mode="capped"
										sizes="(min-width: 1280px) 220px, (min-width: 1024px) 240px, (min-width: 640px) 33vw, 50vw"
									/>
								</div>
								<Badge
									variant="secondary"
									className="absolute left-2 top-2 bg-radar/15 font-semibold text-radar backdrop-blur tabular-nums"
								>
									{formatPrice(p.price, locale)}
								</Badge>
							</div>
							<CardContent className="flex flex-col gap-2 p-3">
								<div className="line-clamp-2 min-h-[2.5rem] text-sm leading-tight">
									{p.name}
								</div>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>
		</div>
	);
}
