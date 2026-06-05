export const queryKeys = {
  all: ["cena-radar"] as const,
  products: (filters?: {
    category?: string;
    sort?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) => [...queryKeys.all, "products", filters ?? {}] as const,
  product: (slug: string) => [...queryKeys.all, "product", slug] as const,
  categories: () => [...queryKeys.all, "categories"] as const,
  search: (q: string) => [...queryKeys.all, "search", q] as const,
};
