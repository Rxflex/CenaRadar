import { parsePrice } from "./parse";
import type { Money } from "./types";

/**
 * Parse the /slevy page to extract all products with their categories.
 * The page groups products into sections, each with a header link to /slevy/{category}.
 * Each product is an <a class="...discount_item..." href="/sleva/{slug}"> element.
 */

export type ParsedProductCard = {
  slug: string;
  productId: string;
  name: string;
  cheapestPrice: Money;
  imageUrl: string | null;
  category: {
    slug: string;
    name: string;
    subcategory?: { slug: string; name: string };
  };
  sourceUrl: string;
};

const PRODUCT_LINK_REGEX =
  /<a\s+([^>]*?)href="\/sleva\/([a-z0-9][a-z0-9-]*)"([^>]*)>([\s\S]*?)<\/a>/gi;

const PRICE_REGEX =
  /class="item_price"[^>]*>\s*(?:od\s+)?<span>\s*([\d\s\u00a0,.]+)\s*Kč/i;
const STRONG_NAME_REGEX = /<strong>([\s\S]*?)<\/strong>/i;
const IMG_DATA_SRC_REGEX = /data-src="(https?:\/\/[^"]+)"/i;
const DATA_PRODUCT_ID_REGEX = /data-product-id="(\d+)"/i;

function decodeEntities(input: string): string {
  return input
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&hellip;/g, "…")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&[a-z]+;|&#\d+;/gi, "");
}

function findCategoryForOffset(
  html: string,
  offset: number,
): {
  slug: string;
  name: string;
  subcategory?: { slug: string; name: string };
} | null {
  const before = html.slice(0, offset);
  const sections = [
    ...before.matchAll(
      /<h2>\s*<a\s+href="\/slevy\/([a-z0-9-]+)"[^>]*>([\s\S]*?)<\/a>\s*<\/h2>/gi,
    ),
  ];
  if (sections.length === 0) return null;

  const last = sections[sections.length - 1];
  const slug = last[1] ?? "";
  const rawName = last[2] ?? "";
  const name = decodeEntities(rawName)
    .replace(/<[^>]+>/g, "")
    .trim();

  return { slug, name };
}

export function parseSlevyList(html: string): ParsedProductCard[] {
  const products: ParsedProductCard[] = [];
  const seen = new Set<string>();

  const matches = [...html.matchAll(PRODUCT_LINK_REGEX)];

  for (const match of matches) {
    const attrsBefore = match[1] ?? "";
    const slug = match[2] ?? "";
    const attrsAfter = match[3] ?? "";
    const inner = match[4] ?? "";
    const offset = match.index ?? 0;

    if (!slug || seen.has(slug)) continue;
    if (!/discount_item/.test(attrsBefore + attrsAfter)) continue;
    if (!/data-product-id/.test(attrsBefore + attrsAfter)) continue;

    const idMatch = (attrsBefore + attrsAfter).match(DATA_PRODUCT_ID_REGEX);
    const productId = idMatch?.[1] ?? "";

    const nameMatch = inner.match(STRONG_NAME_REGEX);
    const rawName = nameMatch?.[1] ?? "";
    const name = decodeEntities(rawName).trim();
    if (!name) continue;

    const priceMatch = inner.match(PRICE_REGEX);
    if (!priceMatch) continue;
    const price = parsePrice(priceMatch[1] ?? "");
    if (!price) continue;

    const imgMatch = inner.match(IMG_DATA_SRC_REGEX);
    const imageUrl = imgMatch?.[1] ?? null;

    const category = findCategoryForOffset(html, offset);
    if (!category) continue;

    seen.add(slug);
    products.push({
      slug,
      productId,
      name,
      cheapestPrice: price,
      imageUrl,
      category,
      sourceUrl: `https://www.kupi.cz/sleva/${slug}`,
    });
  }

  return products;
}
