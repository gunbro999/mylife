"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit3, X } from "lucide-react";
import type { Excerpt, ExcerptType } from "@/lib/types";
import { EXCERPT_TYPE_CONFIG } from "@/lib/types";
import { useExcerptStore } from "@/stores/excerptStore";
import { ExcerptCard } from "@/components/excerpts/ExcerptCard";
import { ExcerptForm } from "@/components/excerpts/ExcerptForm";
import { cn } from "@/lib/utils";

const FILTER_TABS = [
  { key: "all" as const, label: "全部", emoji: "📚" },
  { key: "诗" as const, label: "诗", emoji: "📜" },
  { key: "词" as const, label: "词", emoji: "🎵" },
  { key: "曲" as const, label: "曲", emoji: "🎭" },
  { key: "文" as const, label: "文", emoji: "📖" },
];

export default function ExcerptsPage() {
  const excerpts = useExcerptStore((s) => s.excerpts);
  const addExcerpt = useExcerptStore((s) => s.addExcerpt);
  const updateExcerpt = useExcerptStore((s) => s.updateExcerpt);
  const deleteExcerpt = useExcerptStore((s) => s.deleteExcerpt);

  const [filter, setFilter] = useState<ExcerptType | "all">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingExcerpt, setEditingExcerpt] = useState<Excerpt | null>(null);
  const [selectedExcerpt, setSelectedExcerpt] = useState<Excerpt | null>(null);

  const filtered =
    filter === "all"
      ? [...excerpts].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      : excerpts
          .filter((e) => e.type === filter)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleSave = (
    data: Omit<Excerpt, "id" | "createdAt" | "updatedAt">
  ) => {
    if (editingExcerpt) {
      updateExcerpt(editingExcerpt.id, data);
      setEditingExcerpt(null);
    } else {
      addExcerpt(data);
    }
  };

  const handleEdit = (excerpt: Excerpt) => {
    setEditingExcerpt(excerpt);
    setFormOpen(true);
    setSelectedExcerpt(null);
  };

  const handleDelete = (id: string) => {
    deleteExcerpt(id);
    setSelectedExcerpt(null);
  };

  const handleNew = () => {
    setEditingExcerpt(null);
    setFormOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold font-display text-text mb-2">
          ✂️ 摘录
        </h1>
        <p className="text-[14px] text-text-muted">
          记录生活中读到的诗、词、曲、文
        </p>
      </div>

      {/* Filter tabs + New button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[13px] font-display transition-all",
                filter === tab.key
                  ? "bg-vermillion text-white shadow-sm"
                  : "bg-bg-elevated text-text-muted border border-border hover:border-vermillion/30"
              )}
            >
              <span className="mr-1">{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-display
                     bg-vermillion text-white hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          新增摘录
        </button>
      </div>

      {/* Excerpt list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📜</p>
          <p className="text-text-muted">还没有摘录，点击「新增摘录」开始记录吧</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((excerpt) => (
            <ExcerptCard
              key={excerpt.id}
              excerpt={excerpt}
              onClick={() => setSelectedExcerpt(excerpt)}
            />
          ))}
        </div>
      )}

      {/* Excerpt detail panel */}
      <AnimatePresence>
        {selectedExcerpt && (
          <motion.div
            className="fixed inset-0 z-50 flex justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedExcerpt(null)}
          >
            <motion.div
              className="absolute inset-0 bg-black/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="relative w-[480px] max-w-full bg-bg-elevated border-l border-border
                         h-full overflow-y-auto shadow-xl"
              initial={{ x: 480 }}
              animate={{ x: 0 }}
              exit={{ x: 480 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Actions */}
                <div className="flex items-center justify-end gap-2 mb-6">
                  <button
                    onClick={() => handleEdit(selectedExcerpt)}
                    className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-bg-secondary transition-colors"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("确定要删除这条摘录吗？")) {
                        handleDelete(selectedExcerpt.id);
                      }
                    }}
                    className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => setSelectedExcerpt(null)}
                    className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-bg-secondary transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Type + dynasty badges */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs px-2.5 py-1 rounded border border-vermillion/30
                                 text-vermillion bg-vermillion/5 font-display">
                    {EXCERPT_TYPE_CONFIG[selectedExcerpt.type].emoji}{" "}
                    {EXCERPT_TYPE_CONFIG[selectedExcerpt.type].label}
                  </span>
                  {selectedExcerpt.dynasty && (
                    <span className="text-xs px-2.5 py-1 rounded border border-border
                                   text-text-muted font-display bg-bg-base">
                      {selectedExcerpt.dynasty}
                    </span>
                  )}
                </div>

                {/* Author */}
                <h2 className="text-xl font-bold font-display text-text mb-4">
                  {selectedExcerpt.author}
                </h2>

                {/* Content */}
                <div className="text-[17px] text-text leading-loose font-serif mb-6 whitespace-pre-line
                                p-4 rounded-lg bg-bg-base border border-border">
                  {selectedExcerpt.content}
                </div>

                {/* Source */}
                {selectedExcerpt.sourceTitle && (
                  <div className="mb-4">
                    <p className="text-xs text-text-muted font-display mb-1">出处</p>
                    <p className="text-sm text-text-secondary">
                      《{selectedExcerpt.sourceTitle}》
                    </p>
                  </div>
                )}

                {/* Personal note */}
                {selectedExcerpt.personalNote && (
                  <div>
                    <p className="text-xs text-text-muted font-display mb-1">批注</p>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {selectedExcerpt.personalNote}
                    </p>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-border">
                  <p className="text-xs text-text-muted">
                    摘录于{" "}
                    {new Date(selectedExcerpt.createdAt).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form modal */}
      <ExcerptForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingExcerpt(null);
        }}
        onSave={handleSave}
        initial={editingExcerpt}
      />
    </div>
  );
}
