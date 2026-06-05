/**
 * Pure helpers for kupi.cz image URLs — safe in both server and client
 * components. The server-only `getImageSize()` lives in `./images.ts`.
 *
 * kupi.cz serves product thumbnails from img.kupi.cz/kupi/thumbs/.
 * The default size is `{slug}_170_340.jpg` (portrait 1:2). Some products
 * use `.png` (e.g. nektarinky), and the source images themselves can
 * have wildly different aspect ratios — bananas are 1:1.5, oil bottles
 * are 1:3.4, square packs are 1:1.
 *
 * URLs are returned as RELATIVE paths under `/cdn/k/...` so they go
 * through the Vercel proxy route (`src/app/cdn/k/[...path]/route.ts`).
 * The proxy sets long `Cache-Control` headers — kupi.cz's own cache
 * policy is too short for repeat visits. The browser cache TTL is
 * `max-age=86400` (1 day), Vercel Data Cache revalidates every 24h,
 * stale-while-revalidate window is 7 days.
 */
const PROXY_PATH = "/cdn/k/kupi/thumbs";

export function imageUrlForSlug(
	slug: string,
	size: "sm" | "md" | "lg" = "sm",
): string {
	const [w, h] =
		size === "sm"
			? ["170", "340"]
			: size === "md"
				? ["220", "300"]
				: ["400", "400"];
	return `${PROXY_PATH}/${slug}_${w}_${h}.jpg`;
}

export function imageFallbacks(slug: string): string[] {
	return [
		imageUrlForSlug(slug, "sm"),
		imageUrlForSlug(slug, "md"),
		`${PROXY_PATH}/${slug}_170_340.png`,
		`${PROXY_PATH}/${slug}_220_300.png`,
	];
}

/**
 * Parse the `{slug}_{w}_{h}.{ext}` shape of a kupi.cz image URL into
 * intrinsic dimensions. Returns null if the URL doesn't match.
 *   "https://img.kupi.cz/kupi/thumbs/banany_220_300.jpg" → {220, 300}
 *   "/cdn/k/kupi/thumbs/banany_170_340.jpg"            → {170, 340}
 */
export function parseImageUrl(url: string | undefined): {
	width: number;
	height: number;
} | null {
	if (!url) return null;
	const m = url.match(/_(\d{2,4})_(\d{2,4})\.(?:jpg|png|webp)$/i);
	if (!m) return null;
	const width = Number.parseInt(m[1] ?? "0", 10);
	const height = Number.parseInt(m[2] ?? "0", 10);
	if (width <= 0 || height <= 0) return null;
	return { width, height };
}
