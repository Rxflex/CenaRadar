import "server-only";
import { cacheLife } from "next/cache";
import { imageFallbacks } from "./image-helpers";

export type ImageSize = { width: number; height: number; exists: boolean };

/**
 * HEAD-check + parse source dimensions from the first 32KB of the
 * image. Cached per slug for `cacheLife('hours')` so the heavy lifting
 * runs at most once per product. Used to drive the masonry grid:
 * knowing the real aspect ratio of each product lets us render the
 * card at the right height.
 */
export async function getImageSize(slug: string): Promise<ImageSize> {
  "use cache";
  cacheLife("hours");

  for (const url of imageFallbacks(slug)) {
    try {
      const head = await fetch(url, { method: "HEAD", redirect: "follow" });
      if (!head.ok) continue;
      const r = await fetch(url, {
        headers: { Range: "bytes=0-32767" },
        redirect: "follow",
      });
      if (!r.ok) continue;
      const buf = new Uint8Array(await r.arrayBuffer());
      const size = parseImageSize(buf);
      if (size) return { ...size, exists: true };
    } catch {
      // try next fallback
    }
  }
  return { width: 170, height: 340, exists: false };
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
    const w = readUint32BE(buf, 16);
    const h = readUint32BE(buf, 20);
    return { width: w, height: h };
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
        const h = readUint16BE(buf, i + 5);
        const w = readUint16BE(buf, i + 7);
        return { width: w, height: h };
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
