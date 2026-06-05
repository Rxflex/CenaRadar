import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";
import { ProductFeed } from "@/components/product-feed";
import { getProducts, getProductsIndex } from "@/lib/scraper/products";

async function loadCategoryPage(slug: string) {
  "use cache";
  cacheLife("hours");
  const [index, products] = await Promise.all([
    getProductsIndex(),
    getProducts({ category: slug, limit: 60 }),
  ]);
  const category = index.categories.find((c) => c.slug === slug);
  return { index, products, category };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const index = await getProductsIndex();
  const category = index.categories.find((c) => c.slug === slug);
  return {
    title: category ? category.name : "Category",
    description: category ? `${category.count} products on sale` : undefined,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { index, products, category } = await loadCategoryPage(slug);
  if (!category) notFound();

  return (
    <ProductFeed
      initialTotal={products.total}
      initialProducts={products.products}
      initialCategories={index.categories}
    />
  );
}
