import { Store } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/link";
import { getProductsIndex } from "@/lib/scraper/products";
import { KNOWN_SHOPS as SHOPS } from "@/lib/scraper/shops";

const KNOWN_SHOPS = Object.entries(SHOPS).map(([slug, { name }]) => ({
  slug,
  name,
}));

export default async function ShopsPage() {
  const t = await getTranslations("shop");
  const index = await getProductsIndex();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        <Badge variant="secondary" className="mt-3">
          {index.products.length} {t("products")}
        </Badge>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {KNOWN_SHOPS.map((shop) => (
          <Link key={shop.slug} href={`/shop/${shop.slug}`} className="group">
            <Card size="sm" className="t-card-lift h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="flex size-9 items-center justify-center rounded-md bg-muted/60">
                    <Store className="size-4 text-muted-foreground" />
                  </span>
                  <CardTitle className="text-sm">{shop.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-xs">
                  {t("viewShop")}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
