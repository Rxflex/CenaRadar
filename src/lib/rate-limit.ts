/**
 * Tiny in-memory sliding-window rate limiter.
 *
 * Tracks per-key timestamps in a process-local Map. Designed for a
 * single-instance local deployment (Cena Radar runs on one node, no
 * edge cache). For multi-instance production, swap with a Redis-backed
 * limiter (Upstash) — interface is the same.
 *
 * `check()` is non-atomic but safe enough for our purposes: worst case
 * is one or two extra requests in a burst. The Map grows unbounded
 * because keys are bounded by unique client IPs in normal use, but a
 * periodic GC sweep trims cold entries to keep memory flat.
 */

type Bucket = { ts: number[] };

const buckets = new Map<string, Bucket>();
const SWEEP_INTERVAL_MS = 60_000;
const SWEEP_MAX_AGE_MS = 5 * 60_000;

let sweepTimer: ReturnType<typeof setInterval> | null = null;
function ensureSweep() {
	if (sweepTimer) return;
	sweepTimer = setInterval(() => {
		const cutoff = Date.now() - SWEEP_MAX_AGE_MS;
		for (const [key, bucket] of buckets) {
			bucket.ts = bucket.ts.filter((t) => t > cutoff);
			if (bucket.ts.length === 0) buckets.delete(key);
		}
	}, SWEEP_INTERVAL_MS);
	// Don't keep the process alive just for the sweep.
	if (typeof sweepTimer === "object" && sweepTimer && "unref" in sweepTimer) {
		(sweepTimer as { unref?: () => void }).unref?.();
	}
}

export type RateLimitDecision = { allowed: true } | { allowed: false; retryAfterMs: number };

/**
 * Record a hit for `key` and return whether it is allowed under
 * `limit` requests per `windowMs` (sliding window).
 */
export function checkRateLimit(
	key: string,
	limit: number,
	windowMs: number,
): RateLimitDecision {
	ensureSweep();
	const now = Date.now();
	const cutoff = now - windowMs;
	const bucket = buckets.get(key) ?? { ts: [] };
	bucket.ts = bucket.ts.filter((t) => t > cutoff);
	if (bucket.ts.length >= limit) {
		const oldest = bucket.ts[0] ?? now;
		return { allowed: false, retryAfterMs: Math.max(0, windowMs - (now - oldest)) };
	}
	bucket.ts.push(now);
	buckets.set(key, bucket);
	return { allowed: true };
}

/**
 * Best-effort client IP from common proxy headers. In dev, the value
 * is often `127.0.0.1` or `::1`; that's fine — all dev traffic shares
 * the same bucket, which is conservative.
 */
export function clientIpFromRequest(request: Request): string {
	const xff = request.headers.get("x-forwarded-for");
	if (xff) return xff.split(",")[0]?.trim() || "anon";
	const real = request.headers.get("x-real-ip");
	if (real) return real;
	return "anon";
}
