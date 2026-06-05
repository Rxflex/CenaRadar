"use client";

import { create } from "zustand";

type PaletteState = {
  open: boolean;
  toggle: () => void;
  setOpen: (v: boolean) => void;
};

type MobileMenuState = {
  open: boolean;
  toggle: () => void;
  setOpen: (v: boolean) => void;
};

export const usePalette = create<PaletteState>((set) => ({
  open: false,
  toggle: () => set((s) => ({ open: !s.open })),
  setOpen: (v) => set({ open: v }),
}));

export const useMobileMenu = create<MobileMenuState>((set) => ({
  open: false,
  toggle: () => set((s) => ({ open: !s.open })),
  setOpen: (v) => set({ open: v }),
}));
