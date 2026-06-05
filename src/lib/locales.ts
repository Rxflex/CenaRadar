export const LOCALES = ["ru", "en", "cs"] as const;
export const DEFAULT_LOCALE = "ru" as const;

export const LOCALE_LABELS: Record<(typeof LOCALES)[number], string> = {
  ru: "Русский",
  en: "English",
  cs: "Čeština",
};

export const LOCALE_FLAGS: Record<(typeof LOCALES)[number], string> = {
  ru: "🇷🇺",
  en: "🇬🇧",
  cs: "🇨🇿",
};

export const LOCALE_HTML_LANG: Record<(typeof LOCALES)[number], string> = {
  ru: "ru",
  en: "en",
  cs: "cs",
};

export const LOCALE_COOKIE = "cena_radar_locale";

export type Locale = (typeof LOCALES)[number];

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (LOCALES as readonly string[]).includes(value)
  );
}
