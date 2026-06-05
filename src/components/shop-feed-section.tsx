import { ArrowRight, ImageOff, Store } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { ProductImage } from "@/components/product-image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/link";
import type { ShopSection } from "@/lib/scraper/feed";
import { formatPrice } from "@/lib/scraper/parse";
import { cn } from "@/lib/utils";

export async function ShopFeedSection({ section }: { section: ShopSection }) {
  const t = await getTranslations("shop");
  const locale = await getLocale();
  const tCommon = await getTranslations("common");

  return (
    <section className="space-y-3">
      <header className="flex items-end justify-between gap-2">
        <Link
          href={`/shop/${section.shopSlug}`}
          className="group flex items-center gap-2"
        >
          <span
            className={cn(
              "flex size-8 items-center justify-center rounded-md bg-muted/60 text-base",
              "group-hover:bg-muted",
            )}
          >
            {section.shopEmoji ? (
              <span aria-hidden>{section.shopEmoji}</span>
            ) : (
              <Store className="size-4 text-muted-foreground" />
            )}
          </span>
          <div>
            <h2 className="text-base font-semibold leading-tight tracking-tight">
              {section.shopName}
            </h2>
            <p className="text-xs text-muted-foreground tabular-nums">
              {section.productCount} {t("products")}
            </p>
          </div>
        </Link>
        <Link
          href={`/shop/${section.shopSlug}`}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          {tCommon("viewAll")}
          <ArrowRight className="size-3" />
        </Link>
      </header>

      <div className="columns-2 gap-3 [column-fill:_balance] sm:columns-3 lg:columns-4 xl:columns-5">
        {section.products.map((p) => {
          const hasImage = Boolean(p.imageUrl);
          return (
            <Link
              key={p.slug}
              href={`/product/${p.slug}`}
              className="group mb-3 block break-inside-avoid"
            >
              <Card
                size="sm"
                className="t-card-lift overflow-hidden transition-shadow hover:ring-foreground/20"
              >
                {hasImage ? (
                  <div className="relative max-h-72 overflow-hidden bg-muted/30">
                    <ProductImage
                      slug={p.slug}
                      alt={p.name}
                      mode="capped"
                      sizes="(min-width: 1280px) 220px, (min-width: 1024px) 240px, (min-width: 640px) 33vw, 50vw"
                    />
                    <Badge
                      variant="secondary"
                      className="absolute left-2 top-2 bg-radar/15 font-semibold text-radar backdrop-blur tabular-nums"
                    >
                      {formatPrice(p.price, locale)}
                    </Badge>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 border-b bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                    <ImageOff className="size-3.5" />
                    <span className="flex-1 truncate">
                      {tCommon("noImage")}
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-radar/15 text-radar tabular-nums"
                    >
                      {formatPrice(p.price, locale)}
                    </Badge>
                  </div>
                )}
                <CardContent className="flex flex-col gap-2 p-3">
                  <div className="line-clamp-2 min-h-[2.5rem] text-sm leading-tight">
                    {p.name}
                  </div>
                  <div className="mt-auto flex items-center justify-end">
                    <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
