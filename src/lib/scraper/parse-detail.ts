import { extractCzechDate, parsePrice } from "./parse";
import type { Money, Offer, ProductDetail, ShopRef } from "./types";

type RawOffer = {
  shopName: string;
  shopSlug: string;
  shopLogoUrl: string | null;
  priceText: string;
  perUnitText: string | null;
  packKey: string | null;
  note: string | null;
  validityText: string;
  leafletUrl: string | null;
  discountPercent: number | null;
};

function splitOfferBlocks(html: string): string[] {
  const blocks: string[] = [];
  const starts: number[] = [];
  const startRe = /<div\s+class="discount_row[^"]*"/g;
  let m: RegExpExecArray | null;
  while ((m = startRe.exec(html)) !== null) starts.push(m.index);
  for (let i = 0; i < starts.length; i++) {
    const start = starts[i] ?? 0;
    const end =
      i + 1 < starts.length ? (starts[i + 1] ?? html.length) : html.length;
    blocks.push(html.slice(start, end));
  }
  return blocks;
}

const DATA_KEY_REGEX = /data-key="([^"]+)"/;
const SHOP_LINK_REGEX =
  /<a\s+href="\/letaky\/([a-z0-9-]+)"[^>]*class="[^"]*product_link_history/i;
const SHOP_LOGO_REGEX =
  /<img\s+src="(https?:\/\/img\.kupi\.cz\/[^"]+loga_shopy[^"]+)"[^>]*alt="([^"]+?)(?:\s+leták)?"/i;
const SHOP_TITLE_REGEX =
  /<a\s+href="\/letaky\/[a-z0-9-]+"[^>]*class="[^"]*product_link_history"[^>]*title="([^"]+)"/i;
const SHOP_NAME_SPAN_REGEX =
  /<a\s+href="\/letaky\/[a-z0-9-]+"[^>]*class="[^"]*product_link_history"[\s\S]*?<span>([\s\S]*?)<\/span>/i;
const PRICE_VALUE_REGEX =
  /class="discount_price_value"[^>]*>([\s\S]*?)<\/strong>/i;
const PER_UNIT_REGEX = /class="price_per_unit"[^>]*>([\s\S]*?)<\/span>/i;
const PERCENTAGE_REGEX =
  /<div\s+class="amount_percentage"[^>]*>([\s\S]*?)<\/div>/i;
const VALIDITY_REGEX =
  /class="discounts_validity[^"]*"[\s\S]*?<div[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i;
const NOTE_REGEX =
  /<div\s+class="discount_note"[^>]*>[\s\S]*?<span>([\s\S]*?)<\/span>/i;
const LEAFLET_TAG_REGEX =
  /<a\s+([^>]*?)class="[^"]*btn_link_leaflet[^"]*"([^>]*)>/i;
const HREF_REGEX = /href="([^"]+)"/i;

const JSON_LD_REGEX =
  /<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i;

function decode(input: string): string {
  return input
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePercent(raw: string): number | null {
  const m = raw.match(/(-?\d+)\s*%/);
  return m?.[1] ? Number.parseInt(m[1], 10) : null;
}

function czkToHalere(value: number): number {
  return Math.round(value * 100);
}

/**
 * Try to extract a numeric per-unit price (in haléře) from a per-unit text
 * like "5,75 Kč / 1 ks" or "29,90 Kč / 100 g".
 * Returns null if no numeric value found.
 */
function parsePerUnitPrice(text: string | null): Money | null {
  if (!text) return null;
  const match = text.match(
    /(\d{1,3}(?:[\s\u00a0]?\d{3})*|\d+)(?:[,.](\d{1,2}))?/,
  );
  if (!match) return null;
  const whole = (match[1] ?? "").replace(/[\s\u00a0]/g, "");
  const cents = match[2] ? match[2].padEnd(2, "0") : "00";
  const amount = Number.parseInt(whole, 10) * 100 + Number.parseInt(cents, 10);
  if (Number.isNaN(amount) || amount <= 0) return null;
  return { amount, currency: "CZK", formatted: "" };
}

function parseOfferBlock(block: string): RawOffer | null {
  const linkMatch = block.match(SHOP_LINK_REGEX);
  if (!linkMatch) return null;
  const shopSlug = linkMatch[1] ?? "";

  const logoMatch = block.match(SHOP_LOGO_REGEX);
  const titleMatch = block.match(SHOP_TITLE_REGEX);
  const nameSpanMatch = block.match(SHOP_NAME_SPAN_REGEX);
  const rawTitle =
    (titleMatch?.[1] && decode(titleMatch[1])) ||
    (nameSpanMatch?.[1] && decode(nameSpanMatch[1])) ||
    shopSlug;
  const shopName = rawTitle.replace(/\s+leták$/i, "").trim();
  if (!shopName) return null;

  const priceMatch = block.match(PRICE_VALUE_REGEX);
  if (!priceMatch) return null;
  const priceText = decode(priceMatch[1] ?? "");

  const dataKeyMatch = block.match(DATA_KEY_REGEX);
  const packKey = dataKeyMatch?.[1] ?? null;

  const perUnitMatch = block.match(PER_UNIT_REGEX);
  const perUnitText = perUnitMatch ? decode(perUnitMatch[1] ?? "") : null;

  const percentageMatch = block.match(PERCENTAGE_REGEX);
  const validityMatch = block.match(VALIDITY_REGEX);
  const noteMatch = block.match(NOTE_REGEX);

  const leafletTagMatch = block.match(LEAFLET_TAG_REGEX);
  const leafletHrefMatch = leafletTagMatch
    ? ((leafletTagMatch[1] ?? "").match(HREF_REGEX) ??
      (leafletTagMatch[2] ?? "").match(HREF_REGEX))
    : null;
  const leafletUrl = leafletHrefMatch?.[1]
    ? `https://www.kupi.cz${leafletHrefMatch[1]}`
    : null;

  return {
    shopName,
    shopSlug,
    shopLogoUrl: logoMatch?.[1] ?? null,
    priceText,
    perUnitText: perUnitText && perUnitText !== "/" ? perUnitText : null,
    packKey,
    note: noteMatch?.[1] ? decode(noteMatch[1]) : null,
    validityText: validityMatch ? decode(validityMatch[1] ?? "") : "",
    leafletUrl,
    discountPercent: percentageMatch
      ? parsePercent(percentageMatch[1] ?? "")
      : null,
  };
}

type ParsedJsonLd = {
  name: string;
  image: string;
  description: string;
  lowPriceCzk: number;
  highPriceCzk: number;
  offerCount: number;
  offers: { offeredBy: string; priceCzk: number; validUntil: string }[];
};

function parseJsonLd(html: string): ParsedJsonLd | null {
  const m = html.match(JSON_LD_REGEX);
  if (!m) return null;
  try {
    const json = JSON.parse(m[1] ?? "");
    if (json["@type"] !== "Product") return null;
    const agg = json.offers;
    if (!agg || agg["@type"] !== "AggregateOffer") return null;
    const offers = Array.isArray(agg.offers) ? agg.offers : [];
    return {
      name: String(json.name ?? ""),
      image: String(json.image ?? ""),
      description: String(json.description ?? ""),
      lowPriceCzk: Number(agg.lowPrice ?? 0),
      highPriceCzk: Number(agg.highPrice ?? 0),
      offerCount: Number(agg.offerCount ?? offers.length),
      offers: offers.map((o: Record<string, unknown>) => ({
        offeredBy: String(o.offeredBy ?? ""),
        priceCzk: Number(o.price ?? 0),
        validUntil: String(o.priceValidUntil ?? ""),
      })),
    };
  } catch {
    return null;
  }
}

function extractBreadcrumb(html: string): {
  category: { slug: string; name: string };
  subcategory?: { slug: string; name: string };
} {
  const bcMatch = html.match(/<div\s+class="bc_nav"[^>]*>([\s\S]*?)<\/div>/i);
  if (!bcMatch) return { category: { slug: "", name: "" } };
  const bc = bcMatch[1] ?? "";
  const links = [
    ...bc.matchAll(/<a\s+href="\/slevy\/([a-z0-9-]+)"[^>]*>([\s\S]*?)<\/a>/gi),
  ];
  const cat = links[0]
    ? { slug: links[0][1] ?? "", name: decode(links[0][2] ?? "") }
    : { slug: "", name: "" };
  const sub = links[1]
    ? { slug: links[1][1] ?? "", name: decode(links[1][2] ?? "") }
    : undefined;
  return { category: cat, subcategory: sub };
}

function formatHalere(
  amount: number,
  locale: "ru" | "en" | "cs" = "cs",
): string {
  const whole = Math.floor(amount / 100);
  const cents = amount % 100;
  const localeTag =
    locale === "ru" ? "ru-RU" : locale === "en" ? "en-US" : "cs-CZ";
  const wholeStr = whole.toLocaleString(localeTag);
  if (locale === "en") {
    return `${wholeStr}.${cents.toString().padStart(2, "0")} CZK`;
  }
  return `${wholeStr},${cents.toString().padStart(2, "0")} Kč`;
}

export function parseProductDetail(
  html: string,
  slug: string,
): ProductDetail | null {
  const jsonLd = parseJsonLd(html);
  const blocks = splitOfferBlocks(html);

  type Parsed = {
    shopSlug: string;
    price: Money;
    perUnitPrice: Money | null;
    perUnitText: string | null;
    packKey: string | null;
    note: string | null;
    shopName: string;
    shopLogoUrl: string | null;
    validUntil: string;
    leafletUrl: string | null;
  };

  const parsedList: Parsed[] = [];

  for (const block of blocks) {
    const raw = parseOfferBlock(block);
    if (!raw) continue;
    const price = parsePrice(raw.priceText);
    if (!price) continue;

    // De-dupe: keep cheapest per shop (in case of multiple sizes for the same shop)
    const existing = parsedList.find((p) => p.shopSlug === raw.shopSlug);
    if (existing) {
      if (price.amount < existing.price.amount) {
        existing.price = price;
        existing.perUnitPrice = parsePerUnitPrice(raw.perUnitText);
        existing.perUnitText = raw.perUnitText;
        existing.packKey = raw.packKey;
        existing.note = raw.note;
      }
      continue;
    }

    parsedList.push({
      shopSlug: raw.shopSlug,
      price,
      perUnitPrice: parsePerUnitPrice(raw.perUnitText),
      perUnitText: raw.perUnitText,
      packKey: raw.packKey,
      note: raw.note,
      shopName: raw.shopName,
      shopLogoUrl: raw.shopLogoUrl,
      validUntil: extractCzechDate(raw.validityText) ?? "",
      leafletUrl: raw.leafletUrl,
    });
  }

  const offers: Offer[] = parsedList.map((p) => {
    const shop: ShopRef = {
      slug: p.shopSlug,
      name: p.shopName,
      logoUrl: p.shopLogoUrl ?? undefined,
    };
    const offer: Offer = {
      shop,
      price: { ...p.price, formatted: formatHalere(p.price.amount, "cs") },
      validUntil: p.validUntil,
      leafletName: p.leafletUrl ?? undefined,
      leafletUrl: p.leafletUrl ?? undefined,
    };
    if (p.perUnitPrice) {
      offer.perUnitPrice = {
        ...p.perUnitPrice,
        formatted: formatHalere(p.perUnitPrice.amount, "cs"),
        perUnit: p.perUnitText ?? undefined,
      };
    }
    if (p.packKey) offer.packKey = p.packKey;
    if (p.note) offer.note = p.note;
    return offer;
  });

  // Sort: prefer per-unit price when present (apples-to-apples), fall back to total.
  offers.sort((a, b) => {
    const aKey = a.perUnitPrice?.amount ?? a.price.amount;
    const bKey = b.perUnitPrice?.amount ?? b.price.amount;
    return aKey - bKey;
  });

  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1Name = h1Match ? decode(h1Match[1] ?? "") : "";
  const name = jsonLd?.name || h1Name;
  if (!name) return null;

  const cheapest = offers[0];
  if (!cheapest) return null;

  const imageMatch = html.match(
    /<div\s+class="product_image"[^>]*>\s*<img\s+src="(https?:\/\/[^"]+)"/i,
  );
  const imageUrl = jsonLd?.image || imageMatch?.[1] || undefined;

  const { category, subcategory } = extractBreadcrumb(html);
  const description = jsonLd?.description
    ? decode(jsonLd.description).slice(0, 500)
    : undefined;

  return {
    slug,
    name,
    cheapestPrice: cheapest.price,
    category: { ...category, subcategory },
    imageUrl,
    offers,
    description,
    shopCount: offers.length,
    sourceUrl: `https://www.kupi.cz/sleva/${slug}`,
    updatedAt: new Date().toISOString(),
  };
}
