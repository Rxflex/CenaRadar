import { NextResponse } from "next/server";
import { getProductsIndex } from "@/lib/scraper/products";

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
};

export async function GET() {
  const index = await getProductsIndex();
  return NextResponse.json(
    { categories: index.categories, shopCount: index.shopCount },
    { headers: CACHE_HEADERS },
  );
}
