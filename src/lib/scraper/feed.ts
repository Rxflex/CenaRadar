import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { imageUrlForSlug } from "./image-helpers";
import { getShopLeaflet } from "./leaflet";
import { normalizeCzech } from "./parse";
import { getProductsIndex } from "./products";
import { KNOWN_SHOPS } from "./shops";
import type { Money, ProductSummary, SearchResult } from "./types";

/**
 * Subset of `Money` suitable for a compact product card on shop/home feeds.
 * Leaflet products only carry a price (not a per-unit), so we use the
 * bare `Money` shape. Image dimensions are intentionally absent — the
 * client uses natural aspect ratio for the masonry layout, no server
 * probe needed.
 */
export type LeafletCard = {
  slug: string;
  name: string;
  price: Money;
  imageUrl: string | null;
  shopSlug: string;
};

export type ShopSection = {
  shopSlug: string;
  shopName: string;
  shopEmoji?: string;
  url: string;
  productCount: number;
  products: LeafletCard[];
};

/**
 * Lightweight, deduped product index that combines:
 *   - the cross-shop /slevy index (40 products, rich data: category, shopCount)
 *   - the per-shop leaflet data (~650 products, raw price from one shop)
 *
 * The cross-shop entry wins for any product that exists in both. This is
 * the canonical index for cross-cutting features like search.
 */
export type SearchableProduct = ProductSummary;

/**
 * Walks the working leaflet shops once, dedupes by slug, and keeps the
 * cheapest price per slug. Image dimensions are deliberately NOT probed
 * here — the client uses natural aspect ratio for the masonry layout.
 */
async function getLeafletProducts(): Promise<ProductSummary[]> {
  const sections = await Promise.all(
    LEAFLET_SHOPS.map(async (slug) => {
      const leaflet = await getShopLeaflet(slug);
      if (!leaflet) return [];
      return leaflet.products;
    }),
  );

  const all = sections.flat();
  const bySlug = new Map<string, ProductSummary>();
  const now = new Date().toISOString();

  for (const p of all) {
    const existing = bySlug.get(p.slug);
    if (!existing || p.price.amount < existing.cheapestPrice.amount) {
      bySlug.set(p.slug, {
        slug: p.slug,
        name: p.name,
        category: { slug: "leaflet", name: "" },
        cheapestPrice: p.price,
        sourceUrl: `https://www.kupi.cz/sleva/${p.slug}`,
        shopCount: 1,
        updatedAt: now,
        imageUrl: undefined,
      });
    }
  }

  return [...bySlug.values()];
}

export async function getSearchableIndex(): Promise<SearchableProduct[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("searchable-index");

  const [crossShop, leaflet] = await Promise.all([
    getProductsIndex(),
    getLeafletProducts(),
  ]);

  const bySlug = new Map<string, SearchableProduct>();
  for (const p of crossShop.products) bySlug.set(p.slug, p);
  for (const p of leaflet) {
    const existing = bySlug.get(p.slug);
    if (!existing) {
      bySlug.set(p.slug, p);
    } else if (p.cheapestPrice.amount < existing.cheapestPrice.amount) {
      bySlug.set(p.slug, { ...existing, cheapestPrice: p.cheapestPrice });
    }
  }

  return [...bySlug.values()];
}

/**
 * Diacritics-insensitive search over the unified index. "mleko" matches
 * "Mléko polotučné".
 */
export async function searchAllProducts(
  query: string,
  opts: { limit?: number } = {},
): Promise<SearchResult[]> {
  const needle = normalizeCzech(query);
  if (needle.length < 2) return [];

  const index = await getSearchableIndex();
  const results: SearchResult[] = [];

  for (const product of index) {
    const target = normalizeCzech(product.name);
    const idx = target.indexOf(needle);
    if (idx === -1) continue;

    let score = 100 - idx;
    if (idx === 0) score += 50;
    if (target === needle) score += 200;
    results.push({ product, score });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, opts.limit ?? 12);
}

/**
 * Slugs known to have a working /letaky/{slug} index that resolves to a
 * kupi.cz leaflet with parseable products. Anything outside this list
 * either 404s (penny, pilulka, benu) or has no leaflet of its own
 * (rossmann, norma, teta-drogerie).
 */
export const LEAFLET_SHOPS: readonly string[] = [
  "albert",
  "tesco",
  "lidl",
  "billa",
  "kaufland",
  "globus",
  "makro",
  "dm-drogerie",
] as const;

/** Default per-shop cap on the home feed; ~96 products total. */
export const HOME_FEED_PER_SHOP_LIMIT = 12;

/**
 * Aggregate top-N products per shop from the current leaflet of every
 * known working shop, in parallel. Skips shops that have no leaflet or
 * that fail to parse — they just don't show up.
 *
 * Image dimensions are NOT probed server-side. The client uses plain
 * `<img width="100%" height="auto">` to let the browser compute the
 * natural aspect ratio for each card, restoring the masonry look
 * without any scraper work. The `imageUrl` is still set so the card
 * renders the image; the wrapper has `min-h-32` to dampen CLS while
 * images load.
 */
export async function getHomeFeed(
  perShopLimit = HOME_FEED_PER_SHOP_LIMIT,
): Promise<ShopSection[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("home-feed");

  const sections = await Promise.all(
    LEAFLET_SHOPS.map(async (slug): Promise<ShopSection | null> => {
      try {
        const leaflet = await getShopLeaflet(slug);
        if (!leaflet) return null;
        const shop = KNOWN_SHOPS[slug];
        const products: LeafletCard[] = leaflet.products
          .slice(0, perShopLimit)
          .map((p) => ({
            slug: p.slug,
            name: p.name,
            price: p.price,
            imageUrl: imageUrlForSlug(p.slug),
            shopSlug: slug,
          }));
        return {
          shopSlug: slug,
          shopName: shop?.name ?? leaflet.shopName,
          shopEmoji: shop?.emoji,
          url: leaflet.url,
          productCount: leaflet.products.length,
          products,
        };
      } catch {
        return null;
      }
    }),
  );

  return sections.filter((s): s is ShopSection => s !== null);
}
