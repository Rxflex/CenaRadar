import "server-only";
import { cacheLife } from "next/cache";
import { imageUrlForSlug } from "./image-helpers";

export type ImageSize = { width: number; height: number; exists: boolean };

const PROBE_TIMEOUT_MS = 500;
const PROBE_BUFFER_BYTES = 8_192;
const DEFAULT: ImageSize = { width: 170, height: 340, exists: false };

/**
 * Read the first 8KB of the source image and parse out the intrinsic
 * width/height from the PNG IHDR or JPEG SOF marker. Cached per slug for
 * `cacheLife('hours')` so the work runs at most once per product.
 *
 * Single Range-GET, no fallback URLs. If the canonical kupi.cz thumb
 * doesn't exist or doesn't respond in 500ms, we return `exists: false`
 * and the card falls back to a 1:2 placeholder — far cheaper than
 * probing PNG variants and md/lg sizes that almost never differ from
 * the sm JPG.
 *
 * The 500ms cap is the lever that keeps the home page on Vercel's 10s
 * serverless timeout: with concurrency 8 and 96 products, worst case
 * is 6s of probe work fitting alongside the 8 leaflet fetches.
 */
export async function getImageSize(slug: string): Promise<ImageSize> {
  "use cache";
  cacheLife("hours");

  const url = imageUrlForSlug(slug, "sm");
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { Range: `bytes=0-${PROBE_BUFFER_BYTES - 1}` },
      redirect: "follow",
      signal: controller.signal,
      cache: "force-cache",
    });
    if (!res.ok && res.status !== 206) return DEFAULT;
    const buf = new Uint8Array(await res.arrayBuffer());
    const size = parseImageSize(buf);
    if (!size) return DEFAULT;
    if (size.width < 32 || size.height < 32) return DEFAULT;
    if (size.width > 4000 || size.height > 4000) return DEFAULT;
    return { ...size, exists: true };
  } catch {
    return DEFAULT;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Tiny binary header parser — avoids pulling in `image-size` or `sharp`.
 * Supports PNG (IHDR @ byte 16) and JPEG (SOF0/SOF2 at next marker).
 * Returns null if the buffer isn't a recognised image.
 */
function parseImageSize(
  buf: Uint8Array,
): { width: number; height: number } | null {
  if (buf.length < 24) return null;
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[12] === 0x49 &&
    buf[13] === 0x48 &&
    buf[14] === 0x44 &&
    buf[15] === 0x52
  ) {
    return { width: readUint32BE(buf, 16), height: readUint32BE(buf, 20) };
  }
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length - 9) {
      if (buf[i] !== 0xff) return null;
      let marker = buf[i + 1] ?? 0;
      while (marker === 0xff && i + 2 < buf.length) {
        i++;
        marker = buf[i + 1] ?? 0;
      }
      if (marker === 0xd9 || marker === 0xda) return null;
      const segLen = readUint16BE(buf, i + 2);
      if (
        marker >= 0xc0 &&
        marker <= 0xcf &&
        marker !== 0xc4 &&
        marker !== 0xc8 &&
        marker !== 0xcc
      ) {
        return {
          height: readUint16BE(buf, i + 5),
          width: readUint16BE(buf, i + 7),
        };
      }
      i += 2 + segLen;
    }
  }
  return null;
}

function readUint16BE(buf: Uint8Array, off: number): number {
  return ((buf[off] ?? 0) << 8) | (buf[off + 1] ?? 0);
}
function readUint32BE(buf: Uint8Array, off: number): number {
  return (
    (((buf[off] ?? 0) << 24) |
      ((buf[off + 1] ?? 0) << 16) |
      ((buf[off + 2] ?? 0) << 8) |
      (buf[off + 3] ?? 0)) >>>
    0
  );
}
