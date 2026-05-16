import { create } from "zustand";
import type { Poem, PoemAnalysis, TimeTag, TermTag } from "@/lib/types";

type PoetryTab = "time" | "term" | "place";

interface PoetryState {
  // Tab
  activeTab: PoetryTab;
  setActiveTab: (tab: PoetryTab) => void;

  // Time
  selectedTime: TimeTag | null; // null = auto-detect
  setSelectedTime: (time: TimeTag | null) => void;

  // Term
  selectedTerm: TermTag | null; // null = auto-detect
  setSelectedTerm: (term: TermTag | null) => void;

  // Place
  selectedProvince: string | null; // null = show all
  setSelectedProvince: (province: string | null) => void;

  // Detail modal
  selectedPoem: Poem | null;
  openDetail: (poem: Poem) => void;
  closeDetail: () => void;

  // AI analysis cache (in-memory, persisted to localStorage)
  analysisCache: Record<string, PoemAnalysis>;
  setCachedAnalysis: (poemId: string, analysis: PoemAnalysis) => void;
}

function loadCache(): Record<string, PoemAnalysis> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("poem-analysis-cache");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCache(cache: Record<string, PoemAnalysis>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("poem-analysis-cache", JSON.stringify(cache));
  } catch {
    // localStorage full or unavailable
  }
}

export const usePoetryStore = create<PoetryState>()((set, get) => ({
  activeTab: "time",
  setActiveTab: (tab) => set({ activeTab: tab }),

  selectedTime: null,
  setSelectedTime: (time) => set({ selectedTime: time }),

  selectedTerm: null,
  setSelectedTerm: (term) => set({ selectedTerm: term }),

  selectedProvince: null,
  setSelectedProvince: (province) => set({ selectedProvince: province }),

  selectedPoem: null,
  openDetail: (poem) => set({ selectedPoem: poem }),
  closeDetail: () => set({ selectedPoem: null }),

  analysisCache: loadCache(),
  setCachedAnalysis: (poemId, analysis) => {
    const next = { ...get().analysisCache, [poemId]: analysis };
    saveCache(next);
    set({ analysisCache: next });
  },
}));
