'use client';

import { X } from 'lucide-react';

interface ContentPreviewProps {
  writing: {
    id: string;
    type: string;
    title: string;
    userEmail: string;
    wordCount: number;
    tags: string[];
    createdAt: string;
    updatedAt: string;
  };
  content: string;
  onClose: () => void;
}

const typeLabels: Record<string, string> = {
  diary: '日记',
  essay: '随笔',
  note: '小记',
  novel_chapter: '小说章节',
};

export function ContentPreview({ writing, content, onClose }: ContentPreviewProps) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />

      <div className="fixed right-0 top-0 z-50 h-full w-[500px] border-l border-border bg-bg-elevated shadow-lg overflow-auto">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <span className="text-xs text-text-tertiary bg-bg-secondary rounded-full px-2 py-0.5">
              {typeLabels[writing.type] || writing.type}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-tertiary hover:bg-bg-secondary hover:text-text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <h2 className="text-lg font-display font-bold text-text-primary">
            {writing.title || '无标题'}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-text-tertiary">
            <span>作者: {writing.userEmail}</span>
            <span>字数: {writing.wordCount}</span>
            <span>创建: {new Date(writing.createdAt).toLocaleString('zh-CN')}</span>
          </div>
          {writing.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {writing.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="border-t border-border pt-4">
            <div className="prose prose-sm max-w-none text-text-primary whitespace-pre-wrap font-serif leading-relaxed">
              {content ? content.slice(0, 2000) : '（无内容）'}
              {content && content.length > 2000 && (
                <p className="text-text-tertiary text-xs mt-2">
                  ... 内容过长，仅显示前 2000 字
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
