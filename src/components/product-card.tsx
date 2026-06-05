"use client";

import { ImageOff, TrendingDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ProductImage } from "@/components/product-image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/link";
import { formatPrice } from "@/lib/scraper/parse";
import type { ProductSummary } from "@/lib/scraper/types";

export function ProductCard({ product }: { product: ProductSummary }) {
  const t = useTranslations("common");
  const tp = useTranslations("product");
  const locale = useLocale();

  const hasImage = Boolean(product.imageUrl);

  return (
    <Card
      size="sm"
      className="t-card-lift break-inside-avoid mb-3 overflow-hidden hover:ring-foreground/20 transition-shadow"
    >
      <Link href={`/product/${product.slug}`} className="block">
        {hasImage ? (
          <div className="relative bg-muted/30">
            <div className="max-h-72 min-h-32 aspect-[1/2]">
              <ProductImage
                slug={product.slug}
                alt={product.name}
                mode="capped"
                sizes="(min-width: 1280px) 240px, (min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw"
              />
            </div>
            <Badge
              variant="secondary"
              className="absolute left-2 top-2 bg-radar/15 text-radar backdrop-blur"
            >
              <TrendingDown className="size-3" />
              {t("from")} {formatPrice(product.cheapestPrice, locale)}
            </Badge>
          </div>
        ) : (
          <div className="flex items-center gap-2 border-b bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
            <ImageOff className="size-3.5" />
            <span className="flex-1 truncate">{t("noImage")}</span>
            <Badge
              variant="secondary"
              className="bg-radar/15 text-radar tabular-nums"
            >
              {formatPrice(product.cheapestPrice, locale)}
            </Badge>
          </div>
        )}
        <CardHeader className="pb-2">
          <CardTitle className="line-clamp-2 text-sm leading-tight">
            {product.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-3 pt-0">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate">{product.category.name}</span>
            {product.shopCount > 1 ? (
              <span className="shrink-0">
                {tp("shopsWithDeal", { count: product.shopCount })}
              </span>
            ) : null}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
