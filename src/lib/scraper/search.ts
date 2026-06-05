import "server-only";
import { searchAllProducts } from "./feed";
import type { SearchResult } from "./types";

/**
 * Diacritics-insensitive search over the unified product index
 * (cross-shop + per-shop leaflets). "mleko" matches "Mléko polotučné".
 *
 * Backed by the cacheable `getSearchableIndex()` so the heavy leaflet
 * aggregation only runs once per cacheLife window.
 */
export async function searchProducts(
  query: string,
  opts: { limit?: number } = {},
): Promise<SearchResult[]> {
  return searchAllProducts(query, opts);
}
