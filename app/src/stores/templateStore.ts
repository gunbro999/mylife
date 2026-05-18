import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WritingTemplate } from '@/lib/templates';
import { generateId } from '@/lib/utils';

interface TemplateState {
  customTemplates: WritingTemplate[];

  addTemplate: (template: Omit<WritingTemplate, 'id' | 'builtin'>) => WritingTemplate;
  updateTemplate: (id: string, updates: Partial<WritingTemplate>) => void;
  deleteTemplate: (id: string) => void;
  getCustomTemplates: () => WritingTemplate[];
}

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      customTemplates: [],

      addTemplate: (partial) => {
        const tpl: WritingTemplate = {
          id: generateId(),
          builtin: false,
          ...partial,
        };
        set((s) => ({ customTemplates: [...s.customTemplates, tpl] }));
        return tpl;
      },

      updateTemplate: (id, updates) =>
        set((s) => ({
          customTemplates: s.customTemplates.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      deleteTemplate: (id) =>
        set((s) => ({
          customTemplates: s.customTemplates.filter((t) => t.id !== id),
        })),

      getCustomTemplates: () => get().customTemplates,
    }),
    { name: 'mylife-templates' }
  )
);
