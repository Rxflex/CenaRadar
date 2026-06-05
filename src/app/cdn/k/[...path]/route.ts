import type { NextRequest } from "next/server";

/**
 * Reverse-proxy for kupi.cz CDN images with our own Cache-Control
 * headers. The `unoptimized` flag on next/image (and our `<img>` tags)
 * does NOT influence browser caching — the browser respects whatever
 * `Cache-Control` kupi.cz sends, which is often very short.
 *
 * Routing everything through Vercel lets us set:
 *   - max-age: 1 day (browser caches locally; revisit = instant)
 *   - stale-while-revalidate: 7 days (Vercel re-fetches in background)
 *   - the Vercel Data Cache layer (`next: { revalidate }`) deduplicates
 *     and pins each image for 1 day server-side, so we don't hammer
 *     kupi.cz on every page hit.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const segments = path?.join("/") ?? "";
  if (!segments) return new Response("Not found", { status: 404 });

  const upstream = `https://img.kupi.cz/${segments}`;
  const upstreamRes = await fetch(upstream, {
    next: { revalidate: 86_400 },
    headers: { Accept: "image/*" },
  }).catch(() => null);

  if (!upstreamRes || !upstreamRes.ok) {
    return new Response("Upstream fetch failed", { status: 502 });
  }

  const contentType = upstreamRes.headers.get("Content-Type") ?? "image/jpeg";
  const body = await upstreamRes.arrayBuffer();

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control":
        "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      "CDN-Cache-Control": "public, s-maxage=86400",
      "Content-Length": String(body.byteLength),
    },
  });
}
