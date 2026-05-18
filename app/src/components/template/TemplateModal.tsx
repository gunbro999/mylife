'use client';

import { X, FileText, BookOpen, Heart, RefreshCcw, Film, Map, Code, Zap } from 'lucide-react';
import { BUILTIN_TEMPLATES, type WritingTemplate } from '@/lib/templates';
import { useTemplateStore } from '@/stores/templateStore';
import type { WritingType } from '@/lib/types';
import { useWritingStore } from '@/stores/writingStore';
import { useRouter } from 'next/navigation';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Calendar: BookOpen,
  Heart,
  RefreshCcw,
  BookOpen,
  Film,
  Map,
  Code,
  Zap,
};

interface Props {
  open: boolean;
  onClose: () => void;
  type: WritingType;
}

export function TemplateModal({ open, onClose, type }: Props) {
  const addWriting = useWritingStore((s) => s.addWriting);
  const customTemplates = useTemplateStore((s) => s.customTemplates);
  const router = useRouter();

  if (!open) return null;

  const allTemplates = [
    ...BUILTIN_TEMPLATES.filter((t) => t.type === type),
    ...customTemplates.filter((t) => t.type === type),
  ];

  const handleSelect = (template: WritingTemplate) => {
    const writing = addWriting(type, {
      title: template.name,
      content: template.content,
      tags: template.tags,
      isDraft: true,
    });
    onClose();
    const typePath = type === 'diary' ? 'diary' : type === 'essay' ? 'essays' : 'notes';
    router.push(`/${typePath}/${writing.id}`);
  };

  const handleBlank = () => {
    const writing = addWriting(type);
    onClose();
    const typePath = type === 'diary' ? 'diary' : type === 'essay' ? 'essays' : 'notes';
    router.push(`/${typePath}/${writing.id}`);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-bg-elevated shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="font-serif text-lg font-bold text-text-primary">
              选择模板
            </h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-text-tertiary hover:bg-bg-secondary hover:text-text-primary"
            >
              <X size={16} />
            </button>
          </div>

          {/* Templates Grid */}
          <div className="p-4 grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
            {allTemplates.map((tpl) => {
              const IconComp = ICON_MAP[tpl.icon] || FileText;
              return (
                <button
                  key={tpl.id}
                  onClick={() => handleSelect(tpl)}
                  className="flex flex-col items-start gap-2 rounded-xl border border-border p-4 text-left transition-all hover:border-accent/40 hover:bg-accent/5 hover:shadow-sm"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <IconComp size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {tpl.name}
                    </p>
                    <p className="text-xs text-text-tertiary mt-0.5 line-clamp-2">
                      {tpl.description}
                    </p>
                  </div>
                </button>
              );
            })}

            {/* Blank option */}
            <button
              onClick={handleBlank}
              className="flex flex-col items-start gap-2 rounded-xl border border-dashed border-border p-4 text-left transition-all hover:border-accent/30 hover:bg-bg-secondary"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-bg-secondary text-text-tertiary">
                <FileText size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">空白开始</p>
                <p className="text-xs text-text-tertiary mt-0.5">
                  从空白页面开始写作
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
