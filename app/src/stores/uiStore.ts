import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { EditorMode, ThemeName } from "@/lib/types";

interface UIState {
  themeName: ThemeName;
  themeMode: "light" | "dark";
  sidebarCollapsed: boolean;
  editorMode: EditorMode;
  focusModeEnabled: boolean;
  typewriterModeEnabled: boolean;
  aiPanelOpen: boolean;
  musicPanelOpen: boolean;

  setThemeName: (name: ThemeName) => void;
  setThemeMode: (mode: "light" | "dark") => void;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  setEditorMode: (mode: EditorMode) => void;
  toggleFocusMode: () => void;
  toggleTypewriterMode: () => void;
  setAIPanelOpen: (open: boolean) => void;
  toggleAIPanel: () => void;
  setMusicPanelOpen: (open: boolean) => void;
  toggleMusicPanel: () => void;
}

function syncDOM(themeName: ThemeName, mode: "light" | "dark") {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = themeName;
  document.documentElement.classList.toggle("dark", mode === "dark");
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      themeName: "ink",
      themeMode: "light",
      sidebarCollapsed: false,
      editorMode: "immersive",
      focusModeEnabled: false,
      typewriterModeEnabled: false,
      aiPanelOpen: false,
      musicPanelOpen: false,

      setThemeName: (name) => {
        const { themeMode } = get();
        syncDOM(name, themeMode);
        set({ themeName: name });
      },

      setThemeMode: (mode) => {
        const { themeName } = get();
        syncDOM(themeName, mode);
        set({ themeMode: mode });
      },

      toggleDarkMode: () => {
        const { themeName, themeMode } = get();
        const next = themeMode === "light" ? "dark" : "light";
        syncDOM(themeName, next);
        set({ themeMode: next });
      },

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setEditorMode: (editorMode) => set({ editorMode }),

      toggleFocusMode: () =>
        set((state) => ({ focusModeEnabled: !state.focusModeEnabled })),

      toggleTypewriterMode: () =>
        set((state) => ({
          typewriterModeEnabled: !state.typewriterModeEnabled,
        })),

      setAIPanelOpen: (open) => set({ aiPanelOpen: open }),

      toggleAIPanel: () => set((state) => ({ aiPanelOpen: !state.aiPanelOpen })),

      setMusicPanelOpen: (open) => set({ musicPanelOpen: open }),

      toggleMusicPanel: () => set((state) => ({ musicPanelOpen: !state.musicPanelOpen })),
    }),
    {
      name: "mylife-ui",
      version: 1,
      migrate: (persistedState, version) => {
        if (version === 0) {
          const old = persistedState as Record<string, unknown>;
          // Old format had `theme: "light" | "dark"` instead of themeName + themeMode
          if (typeof old.theme === "string" && (old.theme === "light" || old.theme === "dark")) {
            return {
              ...old,
              themeName: "ink",
              themeMode: old.theme,
              theme: undefined,
            };
          }
        }
        return persistedState as Record<string, unknown>;
      },
      partialize: (state) => ({
        themeName: state.themeName,
        themeMode: state.themeMode,
        sidebarCollapsed: state.sidebarCollapsed,
        editorMode: state.editorMode,
        aiPanelOpen: state.aiPanelOpen,
        musicPanelOpen: state.musicPanelOpen,
      }),
    }
  )
);
