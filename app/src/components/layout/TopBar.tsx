"use client";

import { useState } from "react";
import { Sparkles, Search, Sun, Moon, Palette, Music, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const router = useRouter();

  const currentTheme = THEME_CONFIG[themeName];

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

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
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="搜文寻句... (Ctrl+K)"
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

        {/* User menu */}
        {user && (
          <div className="relative ml-1">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent transition-all hover:bg-accent/20"
              title={user.email}
            >
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="avatar"
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <User size={14} />
              )}
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-bg-elevated shadow-lg z-50 py-1">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-xs font-medium text-text-primary truncate">
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:bg-bg-secondary hover:text-red-500 transition-colors"
                  >
                    <LogOut size={13} />
                    退出登录
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
