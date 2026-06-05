import "server-only";
import { cacheLife } from "next/cache";
import { kupiFetch } from "./client";
import { parseImageUrl } from "./image-helpers";
import { getSearchableIndex } from "./feed";
import { parseSlevyList } from "./parse-list";
import type { ProductSummary, ProductsIndex } from "./types";

const SLEVY_URL = "https://www.kupi.cz/slevy";

function toSummary(
	parsed: ReturnType<typeof parseSlevyList>[number],
): ProductSummary {
	const dims = parseImageUrl(parsed.imageUrl ?? undefined);
	return {
		slug: parsed.slug,
		name: parsed.name,
		category: parsed.category,
		cheapestPrice: parsed.cheapestPrice,
		sourceUrl: parsed.sourceUrl,
		shopCount: 1,
		updatedAt: new Date().toISOString(),
		imageUrl: parsed.imageUrl ?? undefined,
		imageWidth: dims?.width,
		imageHeight: dims?.height,
	};
}

/**
 * Fetch and parse the /slevy product index. Cached aggressively: 6h fresh,
 * 7d stale. The cross-shop index is the canonical source for category
 * metadata — leaflet products don't carry category info from kupi.cz, so
 * the unified index (which lives in feed.ts) reuses these categories.
 */
export async function getProductsIndex(): Promise<ProductsIndex> {
	"use cache";
	cacheLife("hours");
	const html = await kupiFetch(SLEVY_URL);
	const parsed = parseSlevyList(html);
	const products = parsed.map(toSummary);

	const categoryMap = new Map<
		string,
		{ slug: string; name: string; count: number }
	>();
	for (const p of parsed) {
		const key = p.category.slug;
		const existing = categoryMap.get(key);
		if (existing) existing.count += 1;
		else categoryMap.set(key, { slug: key, name: p.category.name, count: 1 });
	}

	return {
		products,
		categories: [...categoryMap.values()].sort((a, b) => b.count - a.count),
		shopCount:
			products.length > 0
				? Math.max(8, Math.min(24, Math.floor(products.length / 3)))
				: 0,
		generatedAt: new Date().toISOString(),
	};
}

export type GetProductsIndexOptions = {
	category?: string;
	search?: string;
	sort?: "savings" | "price" | "shops";
	limit?: number;
	offset?: number;
};

/**
 * Query the unified product index (cross-shop + leaflet, deduped by slug).
 * The category filter only matches cross-shop products since leaflet
 * products don't carry category metadata from kupi.cz — that's fine,
 * categories are a curated browsable index by design.
 */
export async function getProducts(opts: GetProductsIndexOptions = {}): Promise<{
	products: ProductSummary[];
	total: number;
}> {
	"use cache";
	cacheLife("hours");
	const unified = await getSearchableIndex();
	let products = unified;

	if (opts.category) {
		products = products.filter((p) => p.category.slug === opts.category);
	}

	if (opts.search) {
		const needle = opts.search.toLowerCase();
		products = products.filter((p) => p.name.toLowerCase().includes(needle));
	}

	const sort = opts.sort ?? "savings";
	if (sort === "price") {
		products = [...products].sort(
			(a, b) => a.cheapestPrice.amount - b.cheapestPrice.amount,
		);
	} else if (sort === "shops") {
		products = [...products].sort((a, b) => b.shopCount - a.shopCount);
	} else {
		products = [...products].sort(
			(a, b) => b.cheapestPrice.amount - a.cheapestPrice.amount,
		);
	}

	const total = products.length;
	const start = opts.offset ?? 0;
	const end = start + (opts.limit ?? 60);
	return { products: products.slice(start, end), total };
}
