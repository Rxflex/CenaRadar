import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import type { ReactNode } from "react";
import { HtmlLangSync } from "@/components/html-lang-sync";
import { QueryProvider } from "@/components/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { UiProvider } from "@/components/ui-provider";
import { isLocale, LOCALE_HTML_LANG } from "@/lib/locales";

export async function I18nProvider({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const htmlLang = isLocale(locale) ? LOCALE_HTML_LANG[locale] : "ru";
  return (
    <NextIntlClientProvider locale={htmlLang} messages={messages}>
      <HtmlLangSync />
      <QueryProvider>
        <ThemeProvider>
          <UiProvider>{children}</UiProvider>
        </ThemeProvider>
      </QueryProvider>
    </NextIntlClientProvider>
  );
}
