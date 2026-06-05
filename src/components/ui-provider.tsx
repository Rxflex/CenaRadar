"use client";

import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

export function UiProvider({ children }: { children: ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>;
}
