import { ArrowRight, ExternalLink, Store, Tag } from "lucide-react";
import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/link";
import { getShopLeaflet } from "@/lib/scraper/leaflet";
import { formatPrice } from "@/lib/scraper/parse";
import { KNOWN_SHOPS } from "@/lib/scraper/shops";

async function loadShopLeaflet(slug: string) {
  "use cache";
  cacheLife("hours");
  return getShopLeaflet(slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const shop = KNOWN_SHOPS[slug];
  if (!shop) return { title: "Not found" };
  return {
    title: shop.name,
    description: `All current deals from ${shop.name} — live from the shop's leaflet.`,
  };
}

export default async function ShopPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const shop = KNOWN_SHOPS[slug];
  if (!shop) notFound();

  const leaflet = await loadShopLeaflet(slug);
  const t = await getTranslations("common");
  const ts = await getTranslations("shop");

  if (!leaflet || leaflet.products.length === 0) {
    return (
      <div className="space-y-6">
        <header className="flex items-center gap-4">
          <span className="flex size-12 items-center justify-center rounded-xl bg-radar/10 text-radar">
            <Store className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {shop.name}
            </h1>
          </div>
        </header>
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            {ts("notFound")}
          </CardContent>
        </Card>
      </div>
    );
  }

  const products = [...leaflet.products].sort(
    (a, b) => a.price.amount - b.price.amount,
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center gap-4">
        <span className="flex size-12 items-center justify-center rounded-xl bg-radar/10 text-radar">
          <Store className="size-5" />
        </span>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">
            {leaflet.shopName || shop.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {leaflet.validFrom && leaflet.validTo
              ? `${leaflet.validFrom} — ${leaflet.validTo}`
              : t("lastUpdated", { ago: "" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-radar/15 text-radar">
            <Tag className="size-3" />
            {products.length} {t("products")}
          </Badge>
          {leaflet.pageCount > 1 ? (
            <Badge variant="secondary">
              {leaflet.pageCount} {ts("pages")}
            </Badge>
          ) : null}
        </div>
      </header>

      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        render={
          <a href={leaflet.url} target="_blank" rel="noopener noreferrer" />
        }
      >
        <ExternalLink className="size-3.5" />
        {t("viewOnKupi")}
      </Button>

      <ol className="space-y-2">
        {products.map((p, i) => (
          <Link key={p.slug} href={`/product/${p.slug}`} className="block">
            <Card
              size="sm"
              className={
                i === 0
                  ? "ring-2 ring-radar/50 bg-radar/5 t-card-lift"
                  : "t-card-lift"
              }
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted/40 text-muted-foreground text-xs font-mono">
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{p.name}</div>
                </div>
                <div className="text-right shrink-0">
                  <div
                    className={`tabular text-base font-semibold ${i === 0 ? "text-radar" : ""}`}
                  >
                    {formatPrice(p.price, "ru")}
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </ol>
    </div>
  );
}
