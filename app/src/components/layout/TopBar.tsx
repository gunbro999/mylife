"use client";

import { useState } from "react";
import { Sparkles, Search, Sun, Moon, Palette, Music } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { THEME_CONFIG } from "@/lib/types";
import { ThemeSelector } from "./ThemeSelector";

export function TopBar() {
  const themeName = useUIStore((s) => s.themeName);
  const themeMode = useUIStore((s) => s.themeMode);
  const toggleDarkMode = useUIStore((s) => s.toggleDarkMode);
  const toggleAIPanel = useUIStore((s) => s.toggleAIPanel);
  const aiPanelOpen = useUIStore((s) => s.aiPanelOpen);
  const toggleMusicPanel = useUIStore((s) => s.toggleMusicPanel);
  const musicPanelOpen = useUIStore((s) => s.musicPanelOpen);
  const [themePanelOpen, setThemePanelOpen] = useState(false);

  const currentTheme = THEME_CONFIG[themeName];

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-bg-elevated backdrop-blur-md px-6">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
        />
        <input
          type="text"
          placeholder="搜文寻句..."
          className="h-8 w-full rounded-full border border-border bg-bg-secondary/60 pl-9 pr-4 text-xs text-text-primary placeholder:text-text-tertiary outline-none transition-all focus:border-accent/40 focus:bg-bg-secondary focus:shadow-sm"
        />
      </div>

      <div className="flex items-center gap-1">
        {/* Theme selector */}
        <div className="relative">
          <button
            onClick={() => setThemePanelOpen(!themePanelOpen)}
            className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] text-text-secondary transition-all hover:bg-bg-secondary hover:text-text-primary hover:border-accent/30"
            title="切换主题"
          >
            <Palette size={13} />
            <span>{currentTheme.emoji}</span>
            <span className="font-display">{currentTheme.label}</span>
          </button>
          <ThemeSelector
            open={themePanelOpen}
            onClose={() => setThemePanelOpen(false)}
          />
        </div>

        {/* Music panel toggle */}
        <button
          onClick={toggleMusicPanel}
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-all hover:scale-110 ${
            musicPanelOpen
              ? "bg-accent-soft text-accent"
              : "text-text-tertiary hover:bg-bg-secondary hover:text-accent"
          }`}
          title="音乐推荐 (佳音)"
        >
          <Music size={16} />
        </button>

        {/* AI Panel toggle */}
        <button
          onClick={toggleAIPanel}
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-all hover:scale-110 ${
            aiPanelOpen
              ? "bg-accent-soft text-accent"
              : "text-text-tertiary hover:bg-bg-secondary hover:text-accent"
          }`}
          title="AI 写作助手 (文思)"
        >
          <Sparkles size={16} />
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="flex h-8 w-8 items-center justify-center rounded-full text-text-tertiary transition-all hover:bg-bg-secondary hover:text-text-primary hover:scale-110"
          title={themeMode === "light" ? "月" : "日"}
        >
          {themeMode === "light" ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>
    </header>
  );
}
