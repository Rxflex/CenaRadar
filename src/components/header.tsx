"use client";

import { Menu, Radar, Search, Store } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Link } from "@/i18n/link";
import { useSearch } from "@/stores/search-store";
import { useMobileMenu, usePalette } from "@/stores/ui-store";

export function Header() {
  const t = useTranslations("common");
  const tn = useTranslations("nav");
  const ts = useTranslations("search");
  const setOpen = usePalette((s) => s.setOpen);
  const mobileOpen = useMobileMenu((s) => s.open);
  const setMobileOpen = useMobileMenu((s) => s.setOpen);
  const query = useSearch((s) => s.query);
  const setQuery = useSearch((s) => s.setQuery);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (query.trim().length >= 2) {
      setOpen(true);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <span className="relative inline-flex items-center justify-center">
              <Radar className="size-5 text-radar" strokeWidth={2.25} />
              <span className="absolute inset-0 rounded-full t-ping" />
            </span>
            <span className="text-base">{t("appName")}</span>
          </Link>

          <form
            onSubmit={onSubmit}
            className="ml-2 hidden flex-1 max-w-md md:flex"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                value={hydrated ? query : ""}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={ts("placeholder")}
                className="h-9 w-full pl-9 pr-14"
                onClick={() => setOpen(true)}
              />
              <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </form>

          <div className="ml-auto flex items-center gap-1">
            <nav className="hidden md:flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={<Link href="/" />}
              >
                {tn("home")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={<Link href="/shops" />}
              >
                <Store className="size-3.5" />
                {tn("shops")}
              </Button>
            </nav>
            <Separator
              orientation="vertical"
              className="mx-1 hidden md:block h-6"
            />
            <LocaleSwitcher />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label={t("openMenu")}
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-[min(360px,90vw)] p-6">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Radar className="size-4 text-radar" />
              {t("appName")}
            </SheetTitle>
            <SheetDescription className="sr-only">
              {t("appTagline")}
            </SheetDescription>
          </SheetHeader>
          <nav className="flex flex-col gap-2 mt-2">
            <Button
              variant="ghost"
              className="justify-start"
              nativeButton={false}
              render={<Link href="/" />}
              onClick={() => setMobileOpen(false)}
            >
              {tn("home")}
            </Button>
            <Button
              variant="ghost"
              className="justify-start"
              nativeButton={false}
              render={<Link href="/shops" />}
              onClick={() => setMobileOpen(false)}
            >
              <Store className="size-4" />
              {tn("shops")}
            </Button>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
