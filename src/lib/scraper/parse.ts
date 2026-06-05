import type { Money } from "./types";

/**
 * Parse Czech-format price strings like "29,90 Kč", "od 49,90 Kč", "1 299,00 Kč".
 * Returns haléře as integer (2990 for "29,90").
 */
export function parsePrice(raw: string): Money | null {
  const cleaned = raw.replace(/\s+/g, " ").trim();
  const match = cleaned.match(
    /(\d{1,3}(?:[\s\u00a0]?\d{3})*|\d+)(?:[,.](\d{1,2}))?\s*(Kč|czk)?/i,
  );
  if (!match) return null;

  const wholePart = (match[1] ?? "").replace(/[\s\u00a0]/g, "");
  const cents = match[2] ? match[2].padEnd(2, "0") : "00";
  const amount =
    Number.parseInt(wholePart, 10) * 100 + Number.parseInt(cents, 10);
  if (Number.isNaN(amount) || amount < 0) return null;

  const formatted = formatPrice(amount);

  const perUnitMatch = cleaned.match(
    /\/\s*([\d,.\s]+\s*(?:l|ml|g|kg|ks|cm|mm|m|bal))?/i,
  );
  const perUnit = perUnitMatch?.[1]
    ? ` / ${perUnitMatch[1].trim()}`
    : undefined;

  return { amount, currency: "CZK", formatted, perUnit };
}

export function formatPrice(input: number | Money, locale = "cs"): string {
  const amount = typeof input === "number" ? input : input.amount;
  const whole = Math.floor(amount / 100);
  const cents = amount % 100;
  const localeTag =
    locale === "ru" ? "ru-RU" : locale === "en" ? "en-US" : "cs-CZ";
  const wholeStr = whole.toLocaleString(localeTag);
  if (locale === "en") {
    const centsStr = cents.toString().padStart(2, "0");
    return `${wholeStr}.${centsStr} CZK`;
  }
  return `${wholeStr},${cents.toString().padStart(2, "0")} Kč`;
}

/**
 * Strip Czech diacritics and lowercase for comparison keys.
 * "Slunečnicový olej" → "slunecnicovy olej"
 */
export function normalizeCzech(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Create a URL-safe slug from a name.
 */
export function slugify(input: string): string {
  return normalizeCzech(input)
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

/**
 * Convert Czech month name to month number (1-12).
 */
const CZECH_MONTHS: Record<string, number> = {
  ledna: 1,
  února: 2,
  brezna: 3,
  března: 3,
  dubna: 4,
  května: 5,
  kvetna: 5,
  června: 6,
  cervna: 6,
  července: 7,
  cervence: 7,
  srpna: 8,
  září: 9,
  zari: 9,
  října: 10,
  rijna: 10,
  listopadu: 11,
  prosince: 12,
};

const CZECH_WEEKDAYS: Record<string, number> = {
  pondělí: 1,
  pondeli: 1,
  úterý: 2,
  utery: 2,
  středa: 3,
  streda: 3,
  čtvrtek: 4,
  ctvrtek: 4,
  pátek: 5,
  patek: 5,
  sobota: 6,
  neděle: 0,
  nedele: 0,
};

/**
 * Parse Czech date like "úterý 9. 6." (Tuesday June 9).
 * Returns ISO date string or null.
 * Year is inferred (current or next year if date already passed).
 */
export function parseCzechDate(
  input: string,
  referenceYear = new Date().getFullYear(),
): string | null {
  const cleaned = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^\s*(?:pondeli|utery|streda|ctvrtek|patek|sobota|nedele)\s*/i, "")
    .trim();

  const match = cleaned.match(/(\d{1,2})\.\s*(\d{1,2})\.?/);
  if (!match) return null;

  const day = Number.parseInt(match[1] ?? "", 10);
  const month = Number.parseInt(match[2] ?? "", 10);
  if (
    Number.isNaN(day) ||
    Number.isNaN(month) ||
    day < 1 ||
    day > 31 ||
    month < 1 ||
    month > 12
  ) {
    return null;
  }

  const now = new Date();
  let year = referenceYear;
  const candidate = new Date(Date.UTC(year, month - 1, day));
  if (candidate.getTime() < now.getTime() - 30 * 24 * 60 * 60 * 1000) {
    year += 1;
  }
  return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);
}

/**
 * Extract a date from text that contains a Czech date expression.
 */
export function extractCzechDate(input: string): string | null {
  const match = input.match(
    /(?:do|az do)\s+(?:[a-zěščřžýáíéúů]+\s+)?(\d{1,2})\.\s*(\d{1,2})\.?/i,
  );
  if (!match) return null;

  const day = Number.parseInt(match[1] ?? "", 10);
  const month = Number.parseInt(match[2] ?? "", 10);
  if (Number.isNaN(day) || Number.isNaN(month)) return null;

  const now = new Date();
  let year = now.getFullYear();
  const candidate = new Date(Date.UTC(year, month - 1, day));
  if (candidate.getTime() < now.getTime() - 30 * 24 * 60 * 60 * 1000) {
    year += 1;
  }
  return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);
}

/** Re-export the constant for callers that need them. */
export { CZECH_MONTHS, CZECH_WEEKDAYS };
