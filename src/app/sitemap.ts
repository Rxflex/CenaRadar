import type { MetadataRoute } from "next";
import { getProductsIndex } from "@/lib/scraper/products";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cena-radar.local";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const index = await getProductsIndex();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/shops`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  const productRoutes: MetadataRoute.Sitemap = index.products
    .slice(0, 500)
    .map((p) => ({
      url: `${SITE_URL}/product/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "hourly",
      priority: 0.8,
    }));

  const categoryRoutes: MetadataRoute.Sitemap = index.categories.map((c) => ({
    url: `${SITE_URL}/category/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "hourly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
