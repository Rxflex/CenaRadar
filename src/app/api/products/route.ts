import { NextResponse } from "next/server";
import { getProducts } from "@/lib/scraper/products";

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category") ?? undefined;
  const search = url.searchParams.get("q") ?? undefined;
  const sort =
    (url.searchParams.get("sort") as "savings" | "price" | "shops" | null) ??
    undefined;
  const limit = Number.parseInt(url.searchParams.get("limit") ?? "60", 10);
  const offset = Number.parseInt(url.searchParams.get("offset") ?? "0", 10);

  const data = await getProducts({ category, search, sort, limit, offset });
  return NextResponse.json(data, { headers: CACHE_HEADERS });
}
