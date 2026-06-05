"use client";

import {
	ArrowDown,
	Calendar,
	ExternalLink,
	Package,
	Store,
	TrendingDown,
	Trophy,
} from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/link";
import { formatPrice } from "@/lib/scraper/parse";
import type { ProductDetail as ProductDetailType } from "@/lib/scraper/types";
import { cn } from "@/lib/utils";

function formatDate(iso: string, locale: string) {
	if (!iso) return "—";
	try {
		return new Date(iso).toLocaleDateString(locale, {
			day: "numeric",
			month: "long",
		});
	} catch {
		return iso;
	}
}

function uniquePackCount(offers: ProductDetailType["offers"]): number {
	const packs = new Set<string>();
	for (const o of offers) if (o.packKey) packs.add(o.packKey);
	return packs.size;
}

type SortKey = "unit" | "total";

export function ProductDetailView({ product }: { product: ProductDetailType }) {
	const t = useTranslations("common");
	const tp = useTranslations("product");
	const locale = useLocale();
	const allOffers = product.offers;
	const packCount = uniquePackCount(allOffers);
	const normalized = packCount > 0;
	const hasUnitPrice = allOffers.some((o) => o.perUnitPrice);

	// Default: sort by per-unit (the apples-to-apples comparison).
	// Fall back to total when no per-unit prices are available.
	const [sortKey, setSortKey] = useState<SortKey>(hasUnitPrice ? "unit" : "total");

	const offers = [...allOffers].sort((a, b) => {
		if (sortKey === "unit") {
			const aUnit = a.perUnitPrice?.amount ?? Number.POSITIVE_INFINITY;
			const bUnit = b.perUnitPrice?.amount ?? Number.POSITIVE_INFINITY;
			return aUnit - bUnit;
		}
		return a.price.amount - b.price.amount;
	});

	// "Cheapest per unit" — sorted[0] when sortKey=unit, else null
	const bestPerUnit = sortKey === "unit" && hasUnitPrice ? offers[0] : null;
	// "Cheapest total" — independent of current sort
	const bestTotal = allOffers.reduce<ProductDetailType["offers"][number] | null>(
		(best, o) => (best === null || o.price.amount < best.price.amount ? o : best),
		null,
	);
	// Hero anchor: the "win" depends on which lens we're using.
	const hero = bestPerUnit ?? bestTotal ?? allOffers[0];

	// Savings between best and worst total (same metric — easy to explain).
	const worstTotal = allOffers.reduce<ProductDetailType["offers"][number] | null>(
		(worst, o) => (worst === null || o.price.amount > worst.price.amount ? o : worst),
		null,
	);
	const totalSavings =
		bestTotal && worstTotal && bestTotal.price.amount < worstTotal.price.amount
			? worstTotal.price.amount - bestTotal.price.amount
			: 0;

	const unitSavings =
		bestPerUnit && hasUnitPrice
			? allOffers.reduce((max, o) => {
					const u = o.perUnitPrice?.amount ?? 0;
					return Math.max(max, u);
				}, 0) - (bestPerUnit.perUnitPrice?.amount ?? 0)
			: 0;

	return (
		<article className="space-y-8">
			<div className="text-xs text-muted-foreground">
				<Link href="/" className="hover:text-foreground">
					{tp("backToList")}
				</Link>
				{product.category.slug ? (
					<>
						{" / "}
						<Link
							href={`/category/${product.category.slug}`}
							className="hover:text-foreground"
						>
							{product.category.name}
						</Link>
					</>
				) : null}
			</div>

			<div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
				<div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-2xl bg-muted/40">
					{product.imageUrl ? (
						<Image
							src={product.imageUrl}
							alt={product.name}
							fill
							sizes="(min-width: 768px) 480px, 100vw"
							className="object-contain p-4"
							priority
						/>
					) : null}
				</div>

				<div className="space-y-4">
					<div className="flex flex-wrap items-center gap-2">
						<Badge className="bg-radar/15 text-radar">
							<TrendingDown className="size-3" />
							{t("compareAcross", { count: allOffers.length })}
						</Badge>
						{product.category.subcategory ? (
							<Badge variant="secondary">
								{product.category.subcategory.name}
							</Badge>
						) : null}
						{normalized ? (
							<Badge variant="outline" className="font-normal">
								<Package className="size-3" />
								{packCount} {packCount === 1 ? tp("packSize") : tp("packSizes")}
							</Badge>
						) : null}
					</div>
					<h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
						{product.name}
					</h1>

					{hero ? (
						<div className="rounded-2xl border bg-card p-5">
							{bestPerUnit && bestPerUnit.perUnitPrice ? (
								<>
									<div className="text-xs uppercase tracking-wider text-muted-foreground">
										{tp("bestPerUnit")}
									</div>
									<div className="mt-1 flex items-baseline gap-2">
										<span className="text-3xl font-bold tabular text-radar t-price-pop">
											{formatPrice(bestPerUnit.perUnitPrice, locale)}
										</span>
										{bestPerUnit.perUnitPrice.perUnit ? (
											<span className="text-sm text-muted-foreground">
												{bestPerUnit.perUnitPrice.perUnit}
											</span>
										) : null}
									</div>
									<div className="mt-1.5 text-sm text-muted-foreground">
										{tp("fromTotal")}{" "}
										<span className="font-semibold tabular text-foreground">
											{formatPrice(bestPerUnit.price, locale)}
										</span>
										{bestPerUnit.packKey ? (
											<>
												{" "}
												<span className="text-muted-foreground">·</span>{" "}
												<span>{bestPerUnit.packKey}</span>
											</>
										) : null}
									</div>
								</>
							) : (
								<>
									<div className="text-xs uppercase tracking-wider text-muted-foreground">
										{tp("bestPrice")}
									</div>
									<div className="mt-1 text-3xl font-bold tabular text-radar t-price-pop">
										{formatPrice(hero.price, locale)}
									</div>
									{hero.price.perUnit ? (
										<div className="mt-1 text-sm text-muted-foreground">
											{hero.price.perUnit}
										</div>
									) : null}
								</>
							)}
							<div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
								<div className="flex items-center gap-1.5 text-muted-foreground">
									<Store className="size-3.5" />
									<span className="font-medium text-foreground">
										{hero.shop.name}
									</span>
								</div>
								{hero.validUntil ? (
									<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
										<Calendar className="size-3" />
										{t("validUntil", {
											date: formatDate(hero.validUntil, locale),
										})}
									</div>
								) : null}
							</div>
							{bestPerUnit && bestPerUnit !== bestTotal ? (
								<div className="mt-3 flex items-start gap-2 rounded-md bg-muted/40 p-2.5 text-xs text-muted-foreground">
									<ArrowDown className="mt-0.5 size-3.5 shrink-0" />
									<span>
										{tp("alsoCheapestTotal", {
											shop: bestTotal?.shop.name ?? "",
											price: bestTotal
												? formatPrice(bestTotal.price, locale)
												: "",
											pack: bestTotal?.packKey ? ` (${bestTotal.packKey})` : "",
										})}
									</span>
								</div>
							) : null}
							{unitSavings > 0 && bestPerUnit ? (
								<div className="mt-3 text-sm font-medium text-hot">
									{tp("savingsPerUnit", {
										amount: formatPrice(
											{
												amount: unitSavings,
												currency: "CZK",
												formatted: "",
											},
											locale,
										),
									})}
								</div>
							) : null}
							{totalSavings > 0 ? (
								<div className="mt-1 text-sm font-medium text-hot/80">
									{tp("savings", {
										amount: formatPrice(
											{
												amount: totalSavings,
												currency: "CZK",
												formatted: "",
											},
											locale,
										),
									})}
								</div>
							) : null}
						</div>
					) : null}

					{product.description ? (
						<p className="text-sm leading-relaxed text-muted-foreground">
							{product.description}
						</p>
					) : null}

					<Button
						variant="outline"
						nativeButton={false}
						render={
							<a
								href={product.sourceUrl}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={t("viewOnKupi")}
							/>
						}
					>
						<ExternalLink className="size-3.5" />
						{t("viewOnKupi")}
					</Button>
				</div>
			</div>

			<Separator />

			<section>
				<header className="mb-3 flex flex-wrap items-center gap-2">
					<h2 className="text-lg font-semibold tracking-tight">
						{t("compareAcross", { count: allOffers.length })}
					</h2>
					<Badge variant="secondary" className="font-normal">
						{allOffers.length} {t("shops")}
					</Badge>
					{hasUnitPrice ? (
						<div className="ml-auto inline-flex rounded-md border bg-muted/30 p-0.5 text-xs">
							<button
								type="button"
								onClick={() => setSortKey("unit")}
								className={cn(
									"rounded-sm px-2 py-1 transition-colors",
									sortKey === "unit"
										? "bg-background shadow-sm"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								{tp("sortByUnit")}
							</button>
							<button
								type="button"
								onClick={() => setSortKey("total")}
								className={cn(
									"rounded-sm px-2 py-1 transition-colors",
									sortKey === "total"
										? "bg-background shadow-sm"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								{tp("sortByTotal")}
							</button>
						</div>
					) : null}
				</header>

				{allOffers.length === 0 ? (
					<Card>
						<CardContent className="p-6 text-center text-sm text-muted-foreground">
							{tp("notFound")}
						</CardContent>
					</Card>
				) : (
					<ol className="space-y-2">
						{offers.map((o, i) => {
							const isBestPerUnit =
								hasUnitPrice && bestPerUnit?.shop.slug === o.shop.slug && sortKey === "unit";
							const isBestTotal = bestTotal?.shop.slug === o.shop.slug;
							return (
								<Card
									key={`${o.shop.slug}-${i}`}
									size="sm"
									className={cn(
										"t-card-lift",
										isBestPerUnit && "ring-2 ring-radar/50 bg-radar/5",
									)}
								>
									<CardContent className="flex items-center gap-4 p-4">
										<div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-background ring-1 ring-foreground/10 overflow-hidden">
											{o.shop.logoUrl ? (
												<Image
													src={o.shop.logoUrl}
													alt={o.shop.name}
													width={48}
													height={48}
													className="size-10 object-contain"
												/>
											) : (
												<Store className="size-5 text-muted-foreground" />
											)}
										</div>
										<div className="flex-1 min-w-0 space-y-0.5">
											<div className="flex flex-wrap items-center gap-1.5">
												{isBestPerUnit ? (
													<Trophy className="size-3.5 text-radar" />
												) : null}
												<span className="truncate font-medium">
													{o.shop.name}
												</span>
												{o.packKey ? (
													<Badge
														variant="outline"
														className="font-normal text-[10px] px-1.5 py-0"
													>
														{o.packKey}
													</Badge>
												) : null}
												{isBestTotal && !isBestPerUnit ? (
													<Badge
														variant="secondary"
														className="bg-muted text-[10px] font-normal"
													>
														{tp("bestTotalBadge")}
													</Badge>
												) : null}
											</div>
											{o.validUntil ? (
												<div className="text-xs text-muted-foreground">
													{t("validUntil", {
														date: formatDate(o.validUntil, locale),
													})}
												</div>
											) : null}
											{o.note ? (
												<div className="text-[11px] text-hot/80 line-clamp-1">
													{o.note}
												</div>
											) : null}
										</div>
										<div className="text-right shrink-0 space-y-0.5">
											<div
												className={cn(
													"tabular text-base font-semibold",
													isBestPerUnit && "text-radar",
												)}
											>
												{formatPrice(o.price, locale)}
											</div>
											{o.perUnitPrice ? (
												<div className="text-[10px] tabular text-muted-foreground">
													{formatPrice(o.perUnitPrice, locale)}
													{o.perUnitPrice.perUnit
														? ` ${o.perUnitPrice.perUnit}`
														: ""}
												</div>
											) : null}
										</div>
									</CardContent>
								</Card>
							);
						})}
					</ol>
				)}
			</section>
		</article>
	);
}
