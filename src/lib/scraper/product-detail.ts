import "server-only";
import { cacheLife } from "next/cache";
import { kupiFetch } from "./client";
import { parseProductDetail } from "./parse-detail";
import type { ProductDetail } from "./types";

/**
 * Fetch and parse a single product detail page.
 * Cached aggressively: 6h fresh, 7d stale.
 */
export async function getProductDetail(
  slug: string,
): Promise<ProductDetail | null> {
  "use cache";
  cacheLife("hours");
  const html = await kupiFetch(`https://www.kupi.cz/sleva/${slug}`);
  return parseProductDetail(html, slug);
}

/**
 * Fetch detail for many slugs in parallel (for top-N cross-shop comparison preview).
 */
export async function getProductDetails(
  slugs: string[],
): Promise<(ProductDetail | null)[]> {
  "use cache";
  cacheLife("hours");
  return Promise.all(slugs.map((s) => getProductDetail(s)));
}
