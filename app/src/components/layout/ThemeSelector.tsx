"use client";

import { useEffect, useRef } from "react";
import { Check } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { THEME_CONFIG } from "@/lib/types";
import type { ThemeName } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ThemeSelectorProps {
  open: boolean;
  onClose: () => void;
}

export function ThemeSelector({ open, onClose }: ThemeSelectorProps) {
  const themeName = useUIStore((s) => s.themeName);
  const setThemeName = useUIStore((s) => s.setThemeName);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-border bg-bg-elevated shadow-xl p-4 z-50"
    >
      <h3 className="text-xs font-display font-semibold text-text-secondary mb-3 tracking-wider text-center">
        选 择 主 题
      </h3>
      <div className="space-y-1.5">
        {(Object.values(THEME_CONFIG) as { name: ThemeName; label: string; description: string; emoji: string; previewColors: [string, string, string, string] }[]).map((theme) => (
          <button
            key={theme.name}
            onClick={() => {
              setThemeName(theme.name);
              onClose();
            }}
            className={cn(
              "flex items-center gap-3 w-full rounded-xl p-2.5 text-left transition-all",
              themeName === theme.name
                ? "bg-accent-soft border border-accent/30"
                : "hover:bg-bg-secondary border border-transparent"
            )}
          >
            {/* Color preview swatches */}
            <div className="flex gap-0.5 shrink-0">
              {theme.previewColors.map((color, i) => (
                <span
                  key={i}
                  className="w-2.5 h-5 rounded-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span className="text-sm">{theme.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-display font-semibold text-text-primary">
                {theme.label}
              </div>
              <div className="text-[10px] text-text-tertiary">
                {theme.description}
              </div>
            </div>
            {themeName === theme.name && (
              <Check size={14} className="text-accent shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
