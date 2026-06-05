"use client";

import { useState } from "react";
import { imageFallbacks } from "@/lib/scraper/image-helpers";
import { cn } from "@/lib/utils";

type Mode = "natural" | "capped" | "fixed";

/**
 * Renders a kupi.cz product image.
 *
 * - `natural`: lets the browser use the image's intrinsic aspect ratio.
 *   Restores the masonry look across the home feed and per-shop sections
 *   without any server-side probing. No CLS for image swaps, but very
 *   tall sources (e.g. water/oil bottles, 1:3+) make their cards
 *   disproportionately large.
 * - `capped` (default for masonry cards): image renders at 100% width
 *   with `max-h-72` (288px) and `object-fit: cover` from center. Short
 *   sources (1:1, 1:1.5) keep their natural aspect ratio, giving the
 *   masonry its height variety. Tall sources (1:2+) cap at 288px and
 *   crop the top/bottom equally — bottle cards stay compact without
 *   the loss of the bottle's top label. The wrapper has `overflow-hidden`
 *   so the image can't bleed past the cap.
 * - `fixed`: caller specifies `intrinsicWidth` and `intrinsicHeight` and
 *   the image is rendered at that aspect ratio regardless of the source.
 *   Used by the product detail hero and the search palette.
 */
export function ProductImage({
	slug,
	alt,
	className,
	sizes,
	intrinsicWidth = 170,
	intrinsicHeight = 340,
	fill = false,
	mode = "capped",
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

	if (mode === "natural") {
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

	// mode === "capped" — natural aspect ratio with a 288px ceiling;
	// tall sources get center-cropped by object-fit:cover. The wrapper
	// supplies `overflow-hidden` so the image can't bleed past max-h.
	return (
		<img
			src={url}
			alt={alt}
			loading="lazy"
			decoding="async"
			sizes={sizes}
			className={cn(
				"h-auto w-full max-h-72 object-cover object-center",
				isLast ? "opacity-60" : "",
				className,
			)}
			onError={() => {
				if (idx < fallbacks.length - 1) setIdx(idx + 1);
			}}
		/>
	);
}
