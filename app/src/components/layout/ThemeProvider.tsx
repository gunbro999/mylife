"use client";

import { useEffect } from "react";
import { useUIStore } from "@/stores/uiStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeName = useUIStore((s) => s.themeName);
  const themeMode = useUIStore((s) => s.themeMode);

  useEffect(() => {
    document.documentElement.dataset.theme = themeName;
    document.documentElement.classList.toggle("dark", themeMode === "dark");
  }, [themeName, themeMode]);

  return <>{children}</>;
}
