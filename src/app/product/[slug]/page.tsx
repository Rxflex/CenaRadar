import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/product-detail-view";
import { getProductDetail } from "@/lib/scraper/product-detail";

async function loadProductPage(slug: string) {
  "use cache";
  cacheLife("hours");
  return getProductDetail(slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductDetail(slug);
  if (!product) return { title: "Not found" };
  return {
    title: product.name,
    description: `${product.name} — ${product.offers.length} shops, from ${product.cheapestPrice.formatted}`,
    openGraph: {
      title: product.name,
      description: `From ${product.cheapestPrice.formatted} at ${product.offers[0]?.shop.name ?? "—"}`,
      images: product.imageUrl ? [{ url: product.imageUrl }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await loadProductPage(slug);
  if (!product) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.imageUrl,
    description: product.description,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "CZK",
      lowPrice: product.cheapestPrice.amount / 100,
      highPrice:
        product.offers[product.offers.length - 1]?.price.amount ??
        product.cheapestPrice.amount / 100,
      offerCount: product.offers.length,
      offers: product.offers.map((o) => ({
        "@type": "Offer",
        offeredBy: { "@type": "Organization", name: o.shop.name },
        price: o.price.amount / 100,
        priceCurrency: "CZK",
        priceValidUntil: o.validUntil || undefined,
        url: o.leafletUrl || product.sourceUrl,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailView product={product} />
    </>
  );
}
