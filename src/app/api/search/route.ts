import { NextResponse } from "next/server";
import { checkRateLimit, clientIpFromRequest } from "@/lib/rate-limit";
import { searchProducts } from "@/lib/scraper/search";

const CACHE_HEADERS = {
	"Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
};

const SEARCH_LIMIT = 30;
const SEARCH_WINDOW_MS = 60_000;

export async function GET(request: Request) {
	const ip = clientIpFromRequest(request);
	const decision = checkRateLimit(`search:${ip}`, SEARCH_LIMIT, SEARCH_WINDOW_MS);
	if (!decision.allowed) {
		return NextResponse.json(
			{ error: "rate_limited" },
			{
				status: 429,
				headers: {
					...CACHE_HEADERS,
					"Retry-After": String(Math.ceil(decision.retryAfterMs / 1000)),
				},
			},
		);
	}

	const url = new URL(request.url);
	const q = url.searchParams.get("q") ?? "";
	const limit = Number.parseInt(url.searchParams.get("limit") ?? "12", 10);
	if (q.length < 2) {
		return NextResponse.json({ results: [] }, { headers: CACHE_HEADERS });
	}
	const results = await searchProducts(q, { limit });
	return NextResponse.json({ results }, { headers: CACHE_HEADERS });
}
