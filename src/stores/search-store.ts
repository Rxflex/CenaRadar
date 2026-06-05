"use client";

import { create } from "zustand";

type SearchState = {
  query: string;
  selectedShops: string[];
  selectedCategory: string | null;
  sort: "savings" | "price" | "shops";
  setQuery: (q: string) => void;
  toggleShop: (slug: string) => void;
  setShops: (slugs: string[]) => void;
  setCategory: (slug: string | null) => void;
  setSort: (sort: SearchState["sort"]) => void;
  reset: () => void;
};

export const useSearch = create<SearchState>((set) => ({
  query: "",
  selectedShops: [],
  selectedCategory: null,
  sort: "savings",
  setQuery: (q) => set({ query: q }),
  toggleShop: (slug) =>
    set((s) => ({
      selectedShops: s.selectedShops.includes(slug)
        ? s.selectedShops.filter((x) => x !== slug)
        : [...s.selectedShops, slug],
    })),
  setShops: (slugs) => set({ selectedShops: slugs }),
  setCategory: (slug) => set({ selectedCategory: slug }),
  setSort: (sort) => set({ sort }),
  reset: () =>
    set({
      query: "",
      selectedShops: [],
      selectedCategory: null,
      sort: "savings",
    }),
}));
