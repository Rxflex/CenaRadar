import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import {
	DEFAULT_LOCALE,
	isLocale,
	LOCALE_COOKIE,
	negotiateLocale,
} from "@/lib/locales";

export default getRequestConfig(async () => {
	const cookieStore = await cookies();
	const headerStore = await headers();

	const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
	const acceptLanguage = headerStore.get("accept-language");

	const locale = isLocale(cookieLocale)
		? cookieLocale
		: (negotiateLocale(acceptLanguage) ?? DEFAULT_LOCALE);

	const messages = (await import(`../../messages/${locale}.json`)).default;

	return { locale, messages };
});
