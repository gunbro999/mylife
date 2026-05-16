import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Novel,
  Chapter,
  Character,
  CharacterRelation,
  WorldSetting,
} from "@/lib/types";
import { generateId } from "@/lib/utils";

interface NovelState {
  novels: Novel[];
  chapters: Chapter[];
  characters: Character[];
  relations: CharacterRelation[];
  worldSettings: WorldSetting[];

  // Novel CRUD
  addNovel: (partial?: Partial<Novel>) => Novel;
  updateNovel: (id: string, updates: Partial<Novel>) => void;
  deleteNovel: (id: string) => void;
  getNovelById: (id: string) => Novel | undefined;

  // Chapter CRUD
  addChapter: (novelId: string, partial?: Partial<Chapter>) => Chapter;
  updateChapter: (id: string, updates: Partial<Chapter>) => void;
  deleteChapter: (id: string) => void;
  reorderChapters: (novelId: string, orderedIds: string[]) => void;
  getChaptersByNovel: (novelId: string) => Chapter[];

  // Character CRUD
  addCharacter: (novelId: string, partial?: Partial<Character>) => Character;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  getCharactersByNovel: (novelId: string) => Character[];

  // Relations
  addRelation: (novelId: string, partial?: Partial<CharacterRelation>) => CharacterRelation;
  updateRelation: (id: string, updates: Partial<CharacterRelation>) => void;
  deleteRelation: (id: string) => void;
  getRelationsByNovel: (novelId: string) => CharacterRelation[];

  // World settings
  addWorldSetting: (novelId: string, partial?: Partial<WorldSetting>) => WorldSetting;
  updateWorldSetting: (id: string, updates: Partial<WorldSetting>) => void;
  deleteWorldSetting: (id: string) => void;
  getWorldSettingsByNovel: (novelId: string) => WorldSetting[];
}

export const useNovelStore = create<NovelState>()(
  persist(
    (set, get) => ({
      novels: [],
      chapters: [],
      characters: [],
      relations: [],
      worldSettings: [],

      // —— Novel ——
      addNovel: (partial = {}) => {
        const now = new Date().toISOString();
        const novel: Novel = {
          id: generateId(),
          title: "",
          description: "",
          coverEmoji: "📖",
          status: "planning",
          targetWordCount: 0,
          dailyGoal: 1000,
          createdAt: now,
          updatedAt: now,
          ...partial,
        };
        set((s) => ({ novels: [novel, ...s.novels] }));
        return novel;
      },

      updateNovel: (id, updates) =>
        set((s) => ({
          novels: s.novels.map((n) =>
            n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
          ),
        })),

      deleteNovel: (id) =>
        set((s) => ({
          novels: s.novels.filter((n) => n.id !== id),
          chapters: s.chapters.filter((c) => c.novelId !== id),
          characters: s.characters.filter((c) => c.novelId !== id),
          relations: s.relations.filter((r) => r.novelId !== id),
          worldSettings: s.worldSettings.filter((w) => w.novelId !== id),
        })),

      getNovelById: (id) => get().novels.find((n) => n.id === id),

      // —— Chapter ——
      addChapter: (novelId, partial = {}) => {
        const siblings = get().chapters.filter((c) => c.novelId === novelId);
        const maxOrder = siblings.reduce((max, c) => Math.max(max, c.sortOrder), -1);
        const chapter: Chapter = {
          id: generateId(),
          novelId,
          writingId: partial.isVolume ? "" : generateId(),
          title: "",
          sortOrder: maxOrder + 1,
          parentChapterId: null,
          isVolume: false,
          createdAt: new Date().toISOString(),
          ...partial,
        };
        set((s) => ({ chapters: [...s.chapters, chapter] }));
        return chapter;
      },

      updateChapter: (id, updates) =>
        set((s) => ({
          chapters: s.chapters.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      deleteChapter: (id) => {
        const chapter = get().chapters.find((c) => c.id === id);
        if (!chapter) return;
        // Also delete child chapters
        const childIds = new Set<string>();
        const collectChildren = (parentId: string) => {
          get().chapters
            .filter((c) => c.parentChapterId === parentId)
            .forEach((c) => {
              childIds.add(c.id);
              collectChildren(c.id);
            });
        };
        collectChildren(id);
        set((s) => ({
          chapters: s.chapters.filter(
            (c) => c.id !== id && !childIds.has(c.id)
          ),
        }));
      },

      reorderChapters: (novelId, orderedIds) =>
        set((s) => ({
          chapters: s.chapters.map((c) => {
            const idx = orderedIds.indexOf(c.id);
            return c.novelId === novelId && idx !== -1
              ? { ...c, sortOrder: idx }
              : c;
          }),
        })),

      getChaptersByNovel: (novelId) =>
        get()
          .chapters.filter((c) => c.novelId === novelId)
          .sort((a, b) => a.sortOrder - b.sortOrder),

      // —— Character ——
      addCharacter: (novelId, partial = {}) => {
        const character: Character = {
          id: generateId(),
          novelId,
          name: "",
          avatar: "🧑",
          role: "",
          gender: "",
          age: "",
          personality: "",
          appearance: "",
          background: "",
          notes: "",
          ...partial,
        };
        set((s) => ({ characters: [...s.characters, character] }));
        return character;
      },

      updateCharacter: (id, updates) =>
        set((s) => ({
          characters: s.characters.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      deleteCharacter: (id) =>
        set((s) => ({
          characters: s.characters.filter((c) => c.id !== id),
          relations: s.relations.filter(
            (r) => r.characterAId !== id && r.characterBId !== id
          ),
        })),

      getCharactersByNovel: (novelId) =>
        get().characters.filter((c) => c.novelId === novelId),

      // —— Relation ——
      addRelation: (novelId, partial = {}) => {
        const relation: CharacterRelation = {
          id: generateId(),
          novelId,
          characterAId: "",
          characterBId: "",
          type: "挚友",
          description: "",
          ...partial,
        };
        set((s) => ({ relations: [...s.relations, relation] }));
        return relation;
      },

      updateRelation: (id, updates) =>
        set((s) => ({
          relations: s.relations.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      deleteRelation: (id) =>
        set((s) => ({
          relations: s.relations.filter((r) => r.id !== id),
        })),

      getRelationsByNovel: (novelId) =>
        get().relations.filter((r) => r.novelId === novelId),

      // —— World Setting ——
      addWorldSetting: (novelId, partial = {}) => {
        const siblings = get().worldSettings.filter((w) => w.novelId === novelId);
        const maxOrder = siblings.reduce((max, w) => Math.max(max, w.sortOrder), -1);
        const ws: WorldSetting = {
          id: generateId(),
          novelId,
          category: "地理",
          title: "",
          content: "",
          sortOrder: maxOrder + 1,
          ...partial,
        };
        set((s) => ({ worldSettings: [...s.worldSettings, ws] }));
        return ws;
      },

      updateWorldSetting: (id, updates) =>
        set((s) => ({
          worldSettings: s.worldSettings.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
        })),

      deleteWorldSetting: (id) =>
        set((s) => ({
          worldSettings: s.worldSettings.filter((w) => w.id !== id),
        })),

      getWorldSettingsByNovel: (novelId) =>
        get()
          .worldSettings.filter((w) => w.novelId === novelId)
          .sort((a, b) => a.sortOrder - b.sortOrder),
    }),
    { name: "mylife-novels" }
  )
);
