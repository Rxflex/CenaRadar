import { parsePrice } from "./parse";
import type { Money } from "./types";

/**
 * Parses a single leaflet page (e.g. /letaky/tesco-hypermarket-letak-351) and
 * extracts all product areas with slug, name, price, and positional metadata.
 *
 * A leaflet page is the "interactive map" of a shop's current flyer: each
 * product occupies an <div class="area_content"> with positional data and
 * links to /sleva/{slug} for the cross-shop comparison view.
 */

export type ParsedLeafletProduct = {
  slug: string;
  productId: string;
  discountId: string;
  mapId: string;
  name: string;
  price: Money;
  /** "left/top/width/height" position on the leaflet image (0-1 normalized). */
  area: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
};

export type ParsedLeaflet = {
  url: string;
  title: string;
  shopName: string;
  shopSlug: string;
  validFrom: string;
  validTo: string;
  pageCount: number;
  products: ParsedLeafletProduct[];
};

const AREA_CONTENT_REGEX =
  /<div\s+class="area_content"([\s\S]*?)>([\s\S]*?)(?=<div\s+class="area_content"|<\/div>\s*<\/div>\s*<\/div>\s*<!--\s*area)/gi;

const DATA_PRODUCT_ID_REGEX = /data-product-id="(\d+)"/;
const DATA_DISCOUNT_REGEX = /data-discount="(\d+)"/;
const DATA_MAPID_REGEX = /data-mapid="(\d+)"/;
const DATA_LEFT_REGEX = /data-left="(\d+)"/;
const DATA_TOP_REGEX = /data-top="(\d+)"/;
const DATA_WIDTH_REGEX = /data-width="(\d+)"/;
const DATA_HEIGHT_REGEX = /data-height="(\d+)"/;

const PRODUCT_LINK_REGEX =
  /<a\s+[^>]*?href="\/sleva\/([a-z0-9][a-z0-9-]*)"[^>]*?(?:\sdata-product-name="([^"]*)")?[^>]*?>/i;

const NAME_SPAN_REGEX =
  /<div\s+class="map_product_info[^"]*"[^>]*>[\s\S]*?<span\s+class="name"[^>]*>([\s\S]*?)<\/span>/i;
const PRICE_SPAN_REGEX =
  /<div\s+class="map_product_info[^"]*"[^>]*>[\s\S]*?<span\s+class="price"[^>]*>\s*<span[^>]*>([\s\S]*?)<\/span>/i;

const TITLE_REGEX = /<h1[^>]*>([\s\S]*?)<\/h1>/i;
const VALIDITY_REGEX = /plat[ií]\s+od\s+([\d.\s]+)\s+do\s+([\d.\s]+)/i;

function decode(input: string): string {
  return input
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&hellip;/g, "…")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-z]+;|&#\d+;/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeArea(value: number, max = 1500): number {
  return Math.max(0, Math.min(1, value / max));
}

export function parseLeaflet(html: string, fallbackUrl: string): ParsedLeaflet {
  const titleMatch = html.match(TITLE_REGEX);
  const rawTitle = titleMatch ? decode(titleMatch[1] ?? "") : "";
  const shopMatch = rawTitle.match(/^(.+?)\s+(?:-\s+)?(?:leták|aktualni)\b/i);
  const shopName =
    shopMatch?.[1]?.trim() || rawTitle.split("–")[0]?.trim() || "";

  const validityMatch = html.match(VALIDITY_REGEX);
  const validFrom = validityMatch?.[1]?.trim() ?? "";
  const validTo = validityMatch?.[2]?.trim() ?? "";

  const products: ParsedLeafletProduct[] = [];
  const seen = new Set<string>();

  for (const m of html.matchAll(AREA_CONTENT_REGEX)) {
    const attrs = m[1] ?? "";
    const block = m[2] ?? "";

    const productId = attrs.match(DATA_PRODUCT_ID_REGEX)?.[1] ?? "";
    const discountId = attrs.match(DATA_DISCOUNT_REGEX)?.[1] ?? "";
    const mapId = attrs.match(DATA_MAPID_REGEX)?.[1] ?? "";
    const left = Number.parseInt(attrs.match(DATA_LEFT_REGEX)?.[1] ?? "0", 10);
    const top = Number.parseInt(attrs.match(DATA_TOP_REGEX)?.[1] ?? "0", 10);
    const width = Number.parseInt(
      attrs.match(DATA_WIDTH_REGEX)?.[1] ?? "0",
      10,
    );
    const height = Number.parseInt(
      attrs.match(DATA_HEIGHT_REGEX)?.[1] ?? "0",
      10,
    );

    const linkMatch = block.match(PRODUCT_LINK_REGEX);
    if (!linkMatch) continue;
    const slug = linkMatch[1] ?? "";
    if (!slug || seen.has(slug)) continue;

    const dataName = linkMatch[2] ? decode(linkMatch[2]) : "";
    const nameMatch = block.match(NAME_SPAN_REGEX);
    const name = nameMatch ? decode(nameMatch[1] ?? "") : dataName;
    if (!name) continue;

    const priceMatch = block.match(PRICE_SPAN_REGEX);
    const price = priceMatch ? parsePrice(priceMatch[1] ?? "") : null;
    if (!price) continue;

    seen.add(slug);
    products.push({
      slug,
      productId,
      discountId,
      mapId,
      name,
      price,
      area: {
        left: normalizeArea(left),
        top: normalizeArea(top),
        width: normalizeArea(width),
        height: normalizeArea(height),
      },
    });
  }

  const pageCount =
    [
      ...html.matchAll(
        /class="page_(?:item|number|active)[^"]*"|data-page-num="(\d+)"/g,
      ),
    ]
      .map((m) => m[1])
      .filter(Boolean).length || 1;

  return {
    url: fallbackUrl,
    title: rawTitle,
    shopName,
    shopSlug: extractShopSlugFromUrl(fallbackUrl),
    validFrom,
    validTo,
    pageCount,
    products,
  };
}

function extractShopSlugFromUrl(url: string): string {
  const m = url.match(/\/letaky?\/([a-z0-9-]+?)(?:-let[aá]k-\d+)?$/i);
  return m?.[1] ?? "";
}

/**
 * Find the current/active leaflet URL for a given shop index page
 * (e.g. /letaky/tesco). Strategy:
 *   1. Prefer the FIRST <a data-advert-group="leaflet-shop"> — this is the
 *      most recently published leaflet, in the order kupi.cz itself shows.
 *   2. Fall back to a regex over `/letaky/{slug}-*leták*` hrefs (picks
 *      highest trailing numeric id, breaking ties by URL string).
 */
export function findCurrentLeafletUrl(
  shopIndexHtml: string,
  shopSlug: string,
): string | null {
  const brickRe =
    /<a\s+[^>]*?href="(\/letaky?\/[^"]+)"[^>]*?data-advert-group="leaflet-shop"[\s\S]*?<\/a>/gi;
  for (const m of shopIndexHtml.matchAll(brickRe)) {
    const href = m[1];
    if (href && href.includes(shopSlug)) {
      return `https://www.kupi.cz${href}`;
    }
  }
  const re = new RegExp(
    `href="(\\/letaky?\\/${shopSlug}[a-z0-9-]*-let[aá]k-(\\d+))"`,
    "gi",
  );
  const matches = [...shopIndexHtml.matchAll(re)];
  if (matches.length === 0) return null;
  let best: { url: string; id: number } | null = null;
  for (const m of matches) {
    const id = Number.parseInt(m[2] ?? "0", 10);
    if (!best || id > best.id) best = { url: m[1] ?? "", id };
  }
  return best?.url ? `https://www.kupi.cz${best.url}` : null;
}
