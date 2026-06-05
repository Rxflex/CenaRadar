export const LOCALES = ["cs", "ru", "en"] as const;
export const DEFAULT_LOCALE = "cs" as const;

export const LOCALE_LABELS: Record<(typeof LOCALES)[number], string> = {
	cs: "Čeština",
	ru: "Русский",
	en: "English",
};

export const LOCALE_FLAGS: Record<(typeof LOCALES)[number], string> = {
	cs: "🇨🇿",
	ru: "🇷🇺",
	en: "🇬🇧",
};

export const LOCALE_HTML_LANG: Record<(typeof LOCALES)[number], string> = {
	cs: "cs",
	ru: "ru",
	en: "en",
};

export const LOCALE_COOKIE = "cena_radar_locale";

export type Locale = (typeof LOCALES)[number];

export function isLocale(value: unknown): value is Locale {
	return (
		typeof value === "string" && (LOCALES as readonly string[]).includes(value)
	);
}

/**
 * Parse the Accept-Language header and pick the best supported locale.
 * Quality values are honoured; ties are broken by declaration order.
 * Returns null if no supported language is present.
 */
export function negotiateLocale(acceptLanguage: string | null): Locale | null {
	if (!acceptLanguage) return null;
	const candidates: Array<{ tag: string; q: number; order: number }> = [];
	let order = 0;
	for (const raw of acceptLanguage.split(",")) {
		const [tagPart, ...params] = raw.split(";").map((s) => s.trim());
		if (!tagPart) continue;
		const qParam = params.find((p) => p.startsWith("q="));
		const q = qParam ? Number.parseFloat(qParam.slice(2)) : 1;
		if (Number.isNaN(q) || q <= 0) continue;
		candidates.push({ tag: tagPart.toLowerCase(), q, order: order++ });
	}
	if (candidates.length === 0) return null;
	candidates.sort((a, b) => (b.q - a.q) || (a.order - b.order));
	for (const c of candidates) {
		const primary = c.tag.split("-")[0];
		if (primary && isLocale(primary)) return primary;
	}
	return null;
}
