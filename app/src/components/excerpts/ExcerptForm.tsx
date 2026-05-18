"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Excerpt, ExcerptType } from "@/lib/types";
import { EXCERPT_TYPE_CONFIG } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ExcerptFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Excerpt, "id" | "createdAt" | "updatedAt">) => void;
  initial?: Excerpt | null;
}

export function ExcerptForm({ open, onClose, onSave, initial }: ExcerptFormProps) {
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [dynasty, setDynasty] = useState("");
  const [type, setType] = useState<ExcerptType>("诗");
  const [sourceTitle, setSourceTitle] = useState("");
  const [personalNote, setPersonalNote] = useState("");

  useEffect(() => {
    if (initial) {
      setContent(initial.content);
      setAuthor(initial.author);
      setDynasty(initial.dynasty || "");
      setType(initial.type);
      setSourceTitle(initial.sourceTitle || "");
      setPersonalNote(initial.personalNote || "");
    } else {
      setContent("");
      setAuthor("");
      setDynasty("");
      setType("诗");
      setSourceTitle("");
      setPersonalNote("");
    }
  }, [initial, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !author.trim()) return;
    onSave({
      content: content.trim(),
      author: author.trim(),
      dynasty: dynasty.trim() || undefined,
      type,
      sourceTitle: sourceTitle.trim() || undefined,
      personalNote: personalNote.trim() || undefined,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-bg-elevated border border-border rounded-xl p-6 w-full max-w-lg mx-4 shadow-xl max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold font-display text-text">
                {initial ? "编辑摘录" : "新增摘录"}
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-md text-text-muted hover:text-text hover:bg-bg-secondary transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type selector */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">类型</label>
                <div className="flex gap-2">
                  {(Object.entries(EXCERPT_TYPE_CONFIG) as [ExcerptType, { label: string; emoji: string }][]).map(
                    ([t, config]) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm font-display border transition-all",
                          type === t
                            ? "bg-vermillion/10 border-vermillion text-vermillion"
                            : "border-border text-text-muted hover:border-vermillion/30"
                        )}
                      >
                        {config.emoji} {config.label}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  正文 <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  placeholder="输入摘录的诗句、词句..."
                  className="w-full px-4 py-3 rounded-lg border border-border bg-bg-base text-text
                             placeholder:text-text-muted/50 resize-none font-serif
                             focus:outline-none focus:border-vermillion/50 transition-colors"
                />
              </div>

              {/* Author + Dynasty */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    作者 <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="如 李白"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-bg-base text-text
                               placeholder:text-text-muted/50
                               focus:outline-none focus:border-vermillion/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">朝代</label>
                  <input
                    value={dynasty}
                    onChange={(e) => setDynasty(e.target.value)}
                    placeholder="如 唐"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-bg-base text-text
                               placeholder:text-text-muted/50
                               focus:outline-none focus:border-vermillion/50 transition-colors"
                  />
                </div>
              </div>

              {/* Source */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">出处</label>
                <input
                  value={sourceTitle}
                  onChange={(e) => setSourceTitle(e.target.value)}
                  placeholder="作品名、书名或网址"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-bg-base text-text
                             placeholder:text-text-muted/50
                             focus:outline-none focus:border-vermillion/50 transition-colors"
                />
              </div>

              {/* Personal note */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">个人批注</label>
                <textarea
                  value={personalNote}
                  onChange={(e) => setPersonalNote(e.target.value)}
                  rows={3}
                  placeholder="记录你读到此处的感受..."
                  className="w-full px-4 py-3 rounded-lg border border-border bg-bg-base text-text
                             placeholder:text-text-muted/50 resize-none
                             focus:outline-none focus:border-vermillion/50 transition-colors"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-sm text-text-muted border border-border
                             hover:bg-bg-secondary transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={!content.trim() || !author.trim()}
                  className="px-4 py-2 rounded-lg text-sm text-white bg-vermillion
                             disabled:opacity-40 disabled:cursor-not-allowed
                             hover:opacity-90 transition-opacity"
                >
                  {initial ? "保存修改" : "添加摘录"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
