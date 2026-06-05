"use client";

import { useState } from "react";
import { imageFallbacks } from "@/lib/scraper/image-helpers";
import { cn } from "@/lib/utils";

type Mode = "natural" | "fixed";

/**
 * Renders a kupi.cz product image.
 *
 * In `natural` mode (default for masonry cards) the image is rendered
 * with `width: 100%; height: auto` so the browser uses the image's
 * intrinsic aspect ratio for layout. This restores the masonry look
 * across the home feed and per-shop sections without any server-side
 * probing — the trade-off is a small layout shift while images load
 * (mitigated by `min-h-*` on the parent wrapper).
 *
 * In `fixed` mode the caller specifies `intrinsicWidth` and
 * `intrinsicHeight` and the image is rendered at that aspect ratio
 * regardless of the source. Used by the product detail hero and the
 * search palette where a uniform box is preferred.
 */
export function ProductImage({
  slug,
  alt,
  className,
  sizes,
  intrinsicWidth = 170,
  intrinsicHeight = 340,
  fill = false,
  mode = "natural",
}: {
  slug: string;
  alt: string;
  className?: string;
  sizes?: string;
  intrinsicWidth?: number;
  intrinsicHeight?: number;
  fill?: boolean;
  mode?: Mode;
}) {
  const fallbacks = imageFallbacks(slug);
  const [idx, setIdx] = useState(0);
  const url = fallbacks[idx] ?? fallbacks[0];
  const isLast = idx >= fallbacks.length - 1;
  const w = intrinsicWidth;
  const h = intrinsicHeight;

  if (mode === "fixed") {
    return (
      <img
        src={url}
        alt={alt}
        loading="lazy"
        decoding="async"
        width={fill ? undefined : w}
        height={fill ? undefined : h}
        className={cn(
          fill ? "size-full object-contain" : "h-auto w-full",
          isLast ? "opacity-60" : "",
          className,
        )}
        onError={() => {
          if (idx < fallbacks.length - 1) setIdx(idx + 1);
        }}
      />
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      loading="lazy"
      decoding="async"
      sizes={sizes}
      className={cn("h-auto w-full", isLast ? "opacity-60" : "", className)}
      onError={() => {
        if (idx < fallbacks.length - 1) setIdx(idx + 1);
      }}
    />
  );
}
