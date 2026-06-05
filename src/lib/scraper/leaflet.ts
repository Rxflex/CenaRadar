import "server-only";
import { cacheLife } from "next/cache";
import { kupiFetch } from "./client";
import {
  findCurrentLeafletUrl,
  type ParsedLeaflet,
  parseLeaflet,
} from "./parse-leaflet";

/**
 * Fetch a shop's current leaflet (interactive product map) and parse all
 * products from it. This gives a much more complete view of what's on sale
 * at a given shop than the cross-shop /slevy index.
 */
export async function getShopLeaflet(
  shopSlug: string,
): Promise<ParsedLeaflet | null> {
  "use cache";
  cacheLife("hours");
  const indexHtml = await kupiFetch(`/letaky/${shopSlug}`);
  const leafletUrl = findCurrentLeafletUrl(indexHtml, shopSlug);
  if (!leafletUrl) return null;

  const leafletHtml = await kupiFetch(leafletUrl);
  return parseLeaflet(leafletHtml, leafletUrl);
}
