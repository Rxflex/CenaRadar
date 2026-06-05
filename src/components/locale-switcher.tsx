"use client";

import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter } from "@/i18n/link";
import {
  LOCALE_COOKIE,
  LOCALE_FLAGS,
  LOCALE_LABELS,
  LOCALES,
} from "@/lib/locales";

export function LocaleSwitcher() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  function switchTo(next: string) {
    if (next === locale) return;
    // biome-ignore lint/suspicious/noDocumentCookie: server route reads cookie, client sets it
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    startTransition(() => router.refresh());
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            disabled={isPending}
            aria-label={t("language")}
          />
        }
      >
        <Globe className="size-4" />
      </PopoverTrigger>
      <PopoverContent align="end" className="min-w-40 p-1">
        {LOCALES.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => switchTo(l)}
            className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <span className="text-base leading-none">{LOCALE_FLAGS[l]}</span>
            <span className="flex-1">{LOCALE_LABELS[l]}</span>
            {l === locale ? (
              <span className="text-radar text-xs">✓</span>
            ) : null}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
