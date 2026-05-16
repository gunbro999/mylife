import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Writing, WritingType, Tag } from "@/lib/types";
import { generateId, getWordCount } from "@/lib/utils";

interface WritingState {
  writings: Writing[];
  tags: Tag[];

  addWriting: (type: WritingType, partial?: Partial<Writing>) => Writing;
  updateWriting: (id: string, updates: Partial<Writing>) => void;
  deleteWriting: (id: string) => void;
  getWritingById: (id: string) => Writing | undefined;
  getWritingsByType: (type: WritingType) => Writing[];
  getWritingsByDate: (date: string) => Writing[];
  getRecentWritings: (limit?: number) => Writing[];

  addTag: (name: string, color: string) => Tag;
  deleteTag: (id: string) => void;

  convertNote: (noteId: string, targetType: "diary" | "essay") => Writing | undefined;
}

export const useWritingStore = create<WritingState>()(
  persist(
    (set, get) => ({
      writings: [],
      tags: [],

      addWriting: (type, partial = {}) => {
        const now = new Date().toISOString();
        const writing: Writing = {
          id: generateId(),
          type,
          title: "",
          content: "",
          wordCount: 0,
          isDraft: true,
          createdAt: now,
          updatedAt: now,
          tags: [],
          ...partial,
        };
        set((state) => ({ writings: [writing, ...state.writings] }));
        return writing;
      },

      updateWriting: (id, updates) =>
        set((state) => ({
          writings: state.writings.map((w) =>
            w.id === id
              ? {
                  ...w,
                  ...updates,
                  wordCount: updates.content !== undefined
                    ? getWordCount(updates.content)
                    : w.wordCount,
                  updatedAt: new Date().toISOString(),
                }
              : w
          ),
        })),

      deleteWriting: (id) =>
        set((state) => ({
          writings: state.writings.filter((w) => w.id !== id),
        })),

      getWritingById: (id) => get().writings.find((w) => w.id === id),

      getWritingsByType: (type) =>
        get()
          .writings.filter((w) => w.type === type)
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          ),

      getWritingsByDate: (date) =>
        get().writings.filter(
          (w) => w.createdAt.startsWith(date)
        ),

      getRecentWritings: (limit = 10) =>
        [...get().writings]
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
          .slice(0, limit),

      addTag: (name, color) => {
        const tag: Tag = { id: generateId(), name, color };
        set((state) => ({ tags: [...state.tags, tag] }));
        return tag;
      },

      deleteTag: (id) =>
        set((state) => ({
          tags: state.tags.filter((t) => t.id !== id),
          writings: state.writings.map((w) => ({
            ...w,
            tags: w.tags.filter((t) => t !== id),
          })),
        })),

      convertNote: (noteId, targetType) => {
        const note = get().getWritingById(noteId);
        if (!note || note.type !== "note") return undefined;
        const converted = get().addWriting(targetType, {
          title: note.title,
          content: note.content,
          tags: note.tags,
        });
        get().deleteWriting(noteId);
        return converted;
      },
    }),
    { name: "mylife-writings" }
  )
);
