"use client";

import Image from "next/image";
import { useState } from "react";
import { imageFallbacks } from "@/lib/scraper/image-helpers";
import { cn } from "@/lib/utils";

/**
 * Renders a kupi.cz product image at its natural aspect ratio.
 *
 * With `width`/`height` set, next/image reserves the right aspect ratio
 * box (no CLS) and picks the right source size from `sizes`. CSS
 * `w-full h-auto` then scales it to the container width so the image
 * fills its column without distortion. Without those props, defaults to
 * 170×340 (kupi.cz's standard thumbnail).
 */
export function ProductImage({
  slug,
  alt,
  className,
  sizes,
  intrinsicWidth = 170,
  intrinsicHeight = 340,
  fill = false,
}: {
  slug: string;
  alt: string;
  className?: string;
  sizes?: string;
  intrinsicWidth?: number;
  intrinsicHeight?: number;
  fill?: boolean;
}) {
  const fallbacks = imageFallbacks(slug);
  const [idx, setIdx] = useState(0);
  const url = fallbacks[idx] ?? fallbacks[0];
  const isLast = idx >= fallbacks.length - 1;

  return (
    <Image
      src={url}
      alt={alt}
      fill={fill}
      width={fill ? undefined : intrinsicWidth}
      height={fill ? undefined : intrinsicHeight}
      sizes={sizes}
      unoptimized
      className={cn(
        fill ? "object-contain" : "h-auto w-full",
        isLast ? "opacity-60" : "",
        className,
      )}
      onError={() => {
        if (idx < fallbacks.length - 1) setIdx(idx + 1);
      }}
    />
  );
}
