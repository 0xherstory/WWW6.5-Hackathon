"use client";

import { LocaleProvider } from "@/contexts/locale-context";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <LocaleProvider>{children}</LocaleProvider>;
}
