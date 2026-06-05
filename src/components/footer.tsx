"use client";

import { Code, Heart, Radar } from "lucide-react";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";

const REPO_URL = "https://github.com/Rxflex/CenaRadar";

export function Footer() {
  const t = useTranslations("common");
  const tf = useTranslations("footer");

  return (
    <footer className="mt-12 border-t bg-background/60">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Radar className="size-4 text-radar" />
              {t("appName")}
            </div>
            <p className="text-xs leading-relaxed">{tf("aboutText")}</p>
            <div className="flex items-center gap-1.5 text-xs">
              <Heart className="size-3 text-hot" />
              {tf("madeWith")}
            </div>
          </div>
          <div className="space-y-3 sm:text-right">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs hover:text-foreground"
            >
              <Code className="size-3" />
              {tf("openSource")}
            </a>
          </div>
        </div>
        <Separator className="my-6" />
        <p className="text-center text-[10px] text-muted-foreground/80">
          {tf("disclaimer")} · © {new Date().getFullYear()} {t("appName")}
        </p>
      </div>
    </footer>
  );
}
