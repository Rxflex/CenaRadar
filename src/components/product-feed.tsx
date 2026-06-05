"use client";

import { Filter, SortDesc } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategoriesQuery, useProductsQuery } from "@/lib/query/hooks";
import type { ProductSummary } from "@/lib/scraper/types";
import { cn } from "@/lib/utils";
import { useSearch } from "@/stores/search-store";
import { ProductCard } from "./product-card";
import { ProductGridSkeleton } from "./product-grid-skeleton";

type SortKey = "savings" | "price" | "shops";

export function ProductFeed({
  initialTotal,
  initialProducts,
  initialCategories,
}: {
  initialTotal: number;
  initialProducts?: ProductSummary[];
  initialCategories?: { slug: string; name: string; count: number }[];
}) {
  const t = useTranslations("common");
  const th = useTranslations("home");
  const category = useSearch((s) => s.selectedCategory ?? "");
  const setCategory = useSearch((s) => s.setCategory);
  const sort = useSearch((s) => s.sort);
  const setSort = useSearch((s) => s.setSort);
  const [showCategories, setShowCategories] = useState(true);

  const sortKey: SortKey = (["savings", "price", "shops"] as const).includes(
    sort as SortKey,
  )
    ? (sort as SortKey)
    : "savings";

  const { data: categoriesData } = useCategoriesQuery({
    initialData: initialCategories
      ? { categories: initialCategories, shopCount: initialCategories.length }
      : undefined,
  });
  const { data, isLoading, isError } = useProductsQuery(
    {
      category: category || undefined,
      sort: sortKey,
      limit: 60,
    },
    {
      initialData: initialProducts
        ? { products: initialProducts, total: initialTotal }
        : undefined,
    },
  );

  const total = data?.total ?? initialTotal;
  const products = useMemo(() => data?.products ?? [], [data?.products]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight">
            {th("allProducts")}
          </h2>
          <Badge variant="secondary" className="font-normal">
            {t("from")} {total}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setShowCategories((v) => !v)}
          >
            <Filter className="size-3.5" />
            {showCategories ? "−" : "+"}
          </Button>
          <Select value={sortKey} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger size="sm" className="w-auto">
              <SortDesc className="size-3.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="savings">{t("compare")}</SelectItem>
              <SelectItem value="price">{t("from")} ↑</SelectItem>
              <SelectItem value="shops">{t("shops")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className={cn("md:block", showCategories ? "block" : "hidden")}>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max gap-2 pb-2">
            <Button
              variant={category === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory(null)}
            >
              {t("allCategories")}
            </Button>
            {categoriesData?.categories.slice(0, 16).map((c) => (
              <Button
                key={c.slug}
                variant={category === c.slug ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(c.slug === category ? null : c.slug)}
              >
                {c.name}
                <Badge variant="secondary" className="ml-1 px-1.5 text-[10px]">
                  {c.count}
                </Badge>
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {isLoading ? (
        <ProductGridSkeleton count={12} />
      ) : isError ? (
        <div className="rounded-xl border bg-muted/30 p-10 text-center">
          <p className="text-sm text-muted-foreground">{t("error")}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border bg-muted/30 p-10 text-center">
          <p className="text-sm text-muted-foreground">{th("noProducts")}</p>
        </div>
      ) : (
        <div className="columns-2 gap-3 [column-fill:_balance] sm:columns-3 lg:columns-4 xl:columns-5">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
