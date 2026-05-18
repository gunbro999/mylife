import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CreatedPoem, PoemGenre } from "@/lib/types";
import { generateId } from "@/lib/utils";

interface CreatePoemState {
  poems: CreatedPoem[];

  addPoem: (partial: Omit<CreatedPoem, "id" | "createdAt" | "updatedAt" | "isEdited">) => CreatedPoem;
  updatePoem: (id: string, updates: Partial<CreatedPoem>) => void;
  deletePoem: (id: string) => void;
  getPoemById: (id: string) => CreatedPoem | undefined;
  getPoemsByGenre: (genre: PoemGenre) => CreatedPoem[];
  getAllPoems: () => CreatedPoem[];
}

export const useCreatePoemStore = create<CreatePoemState>()(
  persist(
    (set, get) => ({
      poems: [],

      addPoem: (partial) => {
        const now = new Date().toISOString();
        const poem: CreatedPoem = {
          id: generateId(),
          isEdited: false,
          createdAt: now,
          updatedAt: now,
          ...partial,
        };
        set((state) => ({ poems: [poem, ...state.poems] }));
        return poem;
      },

      updatePoem: (id, updates) =>
        set((state) => ({
          poems: state.poems.map((p) =>
            p.id === id
              ? { ...p, ...updates, updatedAt: new Date().toISOString() }
              : p
          ),
        })),

      deletePoem: (id) =>
        set((state) => ({
          poems: state.poems.filter((p) => p.id !== id),
        })),

      getPoemById: (id) => get().poems.find((p) => p.id === id),

      getPoemsByGenre: (genre) =>
        get()
          .poems.filter((p) => p.genre === genre)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),

      getAllPoems: () =>
        [...get().poems].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    }),
    { name: "mylife-created-poems" }
  )
);
