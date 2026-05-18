import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Excerpt, ExcerptType } from "@/lib/types";
import { generateId } from "@/lib/utils";

interface ExcerptState {
  excerpts: Excerpt[];

  addExcerpt: (partial: Omit<Excerpt, "id" | "createdAt" | "updatedAt">) => Excerpt;
  updateExcerpt: (id: string, updates: Partial<Excerpt>) => void;
  deleteExcerpt: (id: string) => void;
  getExcerptById: (id: string) => Excerpt | undefined;
  getExcerptsByType: (type: ExcerptType) => Excerpt[];
  getAllExcerpts: () => Excerpt[];
}

export const useExcerptStore = create<ExcerptState>()(
  persist(
    (set, get) => ({
      excerpts: [],

      addExcerpt: (partial) => {
        const now = new Date().toISOString();
        const excerpt: Excerpt = {
          id: generateId(),
          createdAt: now,
          updatedAt: now,
          ...partial,
        };
        set((state) => ({ excerpts: [excerpt, ...state.excerpts] }));
        return excerpt;
      },

      updateExcerpt: (id, updates) =>
        set((state) => ({
          excerpts: state.excerpts.map((e) =>
            e.id === id
              ? { ...e, ...updates, updatedAt: new Date().toISOString() }
              : e
          ),
        })),

      deleteExcerpt: (id) =>
        set((state) => ({
          excerpts: state.excerpts.filter((e) => e.id !== id),
        })),

      getExcerptById: (id) => get().excerpts.find((e) => e.id === id),

      getExcerptsByType: (type) =>
        get()
          .excerpts.filter((e) => e.type === type)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),

      getAllExcerpts: () =>
        [...get().excerpts].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    }),
    { name: "mylife-excerpts" }
  )
);
