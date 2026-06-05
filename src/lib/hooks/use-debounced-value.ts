"use client";

import { useEffect, useState } from "react";

/**
 * Debounce a fast-changing value. Returns `value` after it has been stable
 * for `delay` ms. Used to throttle network calls for keystroke-driven
 * search inputs.
 */
export function useDebouncedValue<T>(value: T, delay = 250): T {
	const [debounced, setDebounced] = useState(value);
	useEffect(() => {
		const t = setTimeout(() => setDebounced(value), delay);
		return () => clearTimeout(t);
	}, [value, delay]);
	return debounced;
}
