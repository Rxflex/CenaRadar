"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { useRouter } from "@/i18n/link";
import { useSearchQuery } from "@/lib/query/hooks";
import { formatPrice } from "@/lib/scraper/parse";
import { usePalette } from "@/stores/ui-store";

export function CommandPalette() {
	const open = usePalette((s) => s.open);
	const setOpen = usePalette((s) => s.setOpen);
	const toggle = usePalette((s) => s.toggle);
	const ts = useTranslations("search");
	const locale = useLocale();
	const router = useRouter();
	const [, startTransition] = useTransition();
	const [value, setValue] = useState("");
	const debounced = useDebouncedValue(value, 250);

	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				toggle();
			}
			if (e.key === "Escape") setOpen(false);
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [setOpen, toggle]);

	const query = debounced.trim();
	const { data, isFetching } = useSearchQuery(query);

	return (
		<CommandDialog
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				if (!next) setValue("");
			}}
			title={ts("title")}
			description={ts("placeholder")}
			showCloseButton={false}
		>
			<Command shouldFilter={false}>
				<CommandInput
					value={value}
					onValueChange={setValue}
					placeholder={ts("placeholder")}
					isFetching={isFetching}
				/>
				<CommandList className="max-h-[60vh] p-2">
					{value.trim().length < 2 ? (
						<CommandEmpty>{ts("typeToSearch")}</CommandEmpty>
					) : query.length < 2 ? (
						<CommandEmpty>{ts("typeToSearch")}</CommandEmpty>
					) : data?.results.length === 0 ? (
						<CommandEmpty>{ts("noResults", { query })}</CommandEmpty>
					) : (
						<CommandGroup
							heading={ts("results", { count: data?.results.length ?? 0 })}
						>
							{data?.results.map((r) => (
								<CommandItem
									key={r.product.slug}
									value={r.product.slug}
									onSelect={() => {
										setOpen(false);
										setValue("");
										startTransition(() =>
											router.push(`/product/${r.product.slug}`),
										);
									}}
								>
									<div className="flex-1 min-w-0">
										<div className="truncate text-sm font-medium">
											{r.product.name}
										</div>
										<div className="truncate text-xs text-muted-foreground">
											{r.product.category.name}
										</div>
									</div>
									<div className="tabular shrink-0 text-sm font-semibold text-radar">
										{formatPrice(r.product.cheapestPrice, locale)}
									</div>
								</CommandItem>
							))}
						</CommandGroup>
					)}
				</CommandList>
			</Command>
		</CommandDialog>
	);
}
