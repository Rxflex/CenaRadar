"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";

/**
 * Keep <html lang> in sync with the resolved locale. The static default
 * comes from the server-rendered <html lang="cs"> in RootLayout, and this
 * component updates it after hydration if the user has chosen a different
 * locale. The flash is invisible because the default is the most common
 * locale (Czech) for the source data.
 */
export function HtmlLangSync() {
	const locale = useLocale();
	useEffect(() => {
		if (typeof document !== "undefined" && locale) {
			document.documentElement.lang = locale;
		}
	}, [locale]);
	return null;
}
