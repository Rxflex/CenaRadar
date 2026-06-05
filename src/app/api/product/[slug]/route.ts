import { NextResponse } from "next/server";
import { getProductDetail } from "@/lib/scraper/product-detail";

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const detail = await getProductDetail(slug);
  if (!detail) {
    return NextResponse.json(
      { error: "not_found" },
      { status: 404, headers: CACHE_HEADERS },
    );
  }
  return NextResponse.json(detail, { headers: CACHE_HEADERS });
}
