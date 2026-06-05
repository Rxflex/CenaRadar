"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  ProductDetail,
  ProductSummary,
  SearchResult,
} from "@/lib/scraper/types";
import { queryKeys } from "./keys";

type ProductsResponse = { products: ProductSummary[]; total: number };
type CategoriesResponse = {
  categories: { slug: string; name: string; count: number }[];
  shopCount: number;
};
type SearchResponse = { results: SearchResult[] };

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
  return (await res.json()) as T;
}

export function useProductsQuery(
  filters: {
    category?: string;
    sort?: "savings" | "price" | "shops";
    search?: string;
    limit?: number;
    offset?: number;
  },
  options?: { initialData?: ProductsResponse },
) {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.search) params.set("q", filters.search);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.offset) params.set("offset", String(filters.offset));

  return useQuery<ProductsResponse>({
    queryKey: queryKeys.products(filters),
    queryFn: () =>
      fetchJson<ProductsResponse>(`/api/products?${params.toString()}`),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    initialData: options?.initialData,
  });
}

export function useProductQuery(slug: string) {
  return useQuery<ProductDetail>({
    queryKey: queryKeys.product(slug),
    queryFn: () => fetchJson<ProductDetail>(`/api/product/${slug}`),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    enabled: slug.length > 0,
  });
}

export function useCategoriesQuery(options?: {
  initialData?: CategoriesResponse;
}) {
  return useQuery<CategoriesResponse>({
    queryKey: queryKeys.categories(),
    queryFn: () => fetchJson<CategoriesResponse>("/api/categories"),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    initialData: options?.initialData,
  });
}

export function useSearchQuery(query: string) {
  return useQuery<SearchResponse>({
    queryKey: queryKeys.search(query),
    queryFn: () =>
      fetchJson<SearchResponse>(`/api/search?q=${encodeURIComponent(query)}`),
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    enabled: query.trim().length >= 2,
  });
}
