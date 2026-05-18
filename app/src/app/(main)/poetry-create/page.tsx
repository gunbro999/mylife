"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Save, Edit3, Trash2, X, ChevronRight } from "lucide-react";
import type { CreatedPoem } from "@/lib/types";
import { POEM_GENRE_CONFIG } from "@/lib/types";
import { useCreatePoemStore } from "@/stores/createPoemStore";
import { useAIConfigStore } from "@/stores/aiConfigStore";
import { useWritingStore } from "@/stores/writingStore";
import { CreatePanel, type ComposeResult } from "@/components/poetry-create/CreatePanel";
import { CreatedPoemCard } from "@/components/poetry-create/CreatedPoemCard";
import { cn } from "@/lib/utils";

export default function PoetryCreatePage() {
  const poems = useCreatePoemStore((s) => s.poems);
  const addPoem = useCreatePoemStore((s) => s.addPoem);
  const updatePoem = useCreatePoemStore((s) => s.updatePoem);
  const deletePoem = useCreatePoemStore((s) => s.deletePoem);

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ComposeResult | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedPoemId, setSavedPoemId] = useState<string | null>(null);

  // Detail panel state
  const [selectedPoem, setSelectedPoem] = useState<CreatedPoem | null>(null);

  const writings = useWritingStore((s) => s.writings);

  const sortedPoems = [...poems].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleGenerateStart = () => {
    setIsGenerating(true);
    setResult(null);
    setSaved(false);
    setSavedPoemId(null);
  };

  const handleResult = (res: ComposeResult) => {
    setIsGenerating(false);
    setResult(res);
    setEditContent(res.content);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!result || saved) return;

    const activeConfig = useAIConfigStore.getState().getActiveConfig();
    const selectedWritings = writings.filter((w) => result.sourceIds.includes(w.id));
    const poem = addPoem({
      title: result.title,
      content: result.content,
      genre: result.genre,
      sourceIds: result.sourceIds,
      sourceSnippets: selectedWritings.map((w) =>
        `${w.title || "无标题"}: ${w.content.slice(0, 80)}`
      ),
      aiProvider: activeConfig.provider,
      aiModel: activeConfig.model,
      explanation: result.explanation,
    });
    setSaved(true);
    setSavedPoemId(poem.id);
  };

  const handleEditSave = () => {
    if (!result || !saved || !savedPoemId) return;
    setIsEditing(false);
    updatePoem(savedPoemId, {
      isEdited: true,
      editedContent: editContent,
    });
    setResult({ ...result, content: editContent });
  };

  const handleDeletePoem = (id: string) => {
    deletePoem(id);
    setSelectedPoem(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold font-display text-text mb-2">
          ✨ 赋诗
        </h1>
        <p className="text-[14px] text-text-muted">
          AI 根据你的日记和小记，为你创作一首诗
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Create Panel */}
        <div className="bg-bg-elevated border border-border rounded-xl p-6">
          <CreatePanel
            onResult={handleResult}
            isGenerating={isGenerating}
            onGenerateStart={handleGenerateStart}
          />
        </div>

        {/* Right: Result */}
        <div>
          {isGenerating ? (
            <div className="bg-bg-elevated border border-border rounded-xl p-10 flex flex-col items-center justify-center min-h-[300px]">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="w-10 h-10 border-2 border-vermillion/30 border-t-vermillion rounded-full mb-4"
              />
              <p className="text-text-muted font-display">正在创作...</p>
            </div>
          ) : result ? (
            <div className="bg-bg-elevated border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold font-display text-text">
                  {result.title}
                </h2>
                <div className="flex gap-1">
                  {!saved && (
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm
                                 bg-vermillion text-white hover:opacity-90 transition-opacity"
                    >
                      <Save size={14} />
                      保存
                    </button>
                  )}
                  {saved && !isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm
                                 border border-border text-text-muted hover:bg-bg-secondary transition-colors"
                    >
                      <Edit3 size={14} />
                      编辑
                    </button>
                  )}
                  {saved && isEditing && (
                    <button
                      onClick={handleEditSave}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm
                                 bg-vermillion text-white hover:opacity-90 transition-opacity"
                    >
                      <Save size={14} />
                      保存修改
                    </button>
                  )}
                </div>
              </div>

              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-bg-base text-text
                             font-serif leading-loose resize-none
                             focus:outline-none focus:border-vermillion/50 transition-colors"
                />
              ) : (
                <div className="text-[17px] text-text leading-loose font-serif mb-4 whitespace-pre-line
                                p-4 rounded-lg bg-bg-base border border-border">
                  {editContent}
                </div>
              )}

              {result.explanation && (
                <div className="mt-3 p-3 rounded-lg bg-bg-base border border-border">
                  <p className="text-xs text-text-muted font-display mb-1">创作说明</p>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {result.explanation}
                  </p>
                </div>
              )}

              {saved && (
                <p className="text-xs text-green-600 mt-3 font-display">✓ 已保存</p>
              )}
            </div>
          ) : (
            <div className="bg-bg-elevated border border-border rounded-xl p-10 flex flex-col items-center justify-center min-h-[300px] text-center">
              <Sparkles size={40} className="text-text-muted/30 mb-3" />
              <p className="text-text-muted font-display">选择素材和体裁</p>
              <p className="text-text-muted/70 text-sm mt-1">点击「开始赋诗」生成</p>
            </div>
          )}
        </div>
      </div>

      {/* History */}
      {sortedPoems.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-bold font-display text-text mb-4">
            📚 创作历史
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedPoems.map((poem) => (
              <CreatedPoemCard
                key={poem.id}
                poem={poem}
                onClick={() => setSelectedPoem(poem)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Detail panel */}
      <AnimatePresence>
        {selectedPoem && (
          <motion.div
            className="fixed inset-0 z-50 flex justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPoem(null)}
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
                  {!isEditing && (
                    <button
                      onClick={() => {
                        setEditContent(selectedPoem.editedContent || selectedPoem.content);
                        setIsEditing(true);
                      }}
                      className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-bg-secondary transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                  )}
                  {isEditing && (
                    <button
                      onClick={() => {
                        updatePoem(selectedPoem.id, {
                          isEdited: true,
                          editedContent: editContent,
                        });
                        setIsEditing(false);
                        setSelectedPoem({
                          ...selectedPoem,
                          isEdited: true,
                          editedContent: editContent,
                        });
                      }}
                      className="p-2 rounded-lg text-vermillion hover:bg-vermillion/10 transition-colors"
                    >
                      <Save size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm("确定要删除这首创作吗？")) {
                        handleDeletePoem(selectedPoem.id);
                      }
                    }}
                    className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPoem(null);
                      setIsEditing(false);
                    }}
                    className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-bg-secondary transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Genre badge */}
                <div className="mb-4">
                  <span className="text-xs px-2.5 py-1 rounded border border-vermillion/30
                                 text-vermillion bg-vermillion/5 font-display">
                    {POEM_GENRE_CONFIG[selectedPoem.genre]?.emoji}{" "}
                    {POEM_GENRE_CONFIG[selectedPoem.genre]?.label}
                  </span>
                  {selectedPoem.isEdited && (
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-bg-secondary text-text-muted">
                      已编辑
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold font-display text-text mb-4">
                  {selectedPoem.title}
                </h2>

                {/* Content */}
                {isEditing ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={12}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-bg-base text-text
                               font-serif leading-loose resize-none
                               focus:outline-none focus:border-vermillion/50 transition-colors"
                  />
                ) : (
                  <div className="text-[17px] text-text leading-loose font-serif mb-6 whitespace-pre-line
                                  p-4 rounded-lg bg-bg-base border border-border">
                    {selectedPoem.editedContent || selectedPoem.content}
                  </div>
                )}

                {/* Explanation */}
                {selectedPoem.explanation && (
                  <div className="mb-4 p-3 rounded-lg bg-bg-base border border-border">
                    <p className="text-xs text-text-muted font-display mb-1">创作说明</p>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {selectedPoem.explanation}
                    </p>
                  </div>
                )}

                {/* Source materials */}
                {selectedPoem.sourceSnippets.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-text-muted font-display mb-2">灵感来源</p>
                    <div className="space-y-2">
                      {selectedPoem.sourceSnippets.map((snippet, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-lg bg-bg-base border border-border text-sm text-text-secondary"
                        >
                          {snippet}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Meta */}
                <div className="mt-6 pt-4 border-t border-border text-xs text-text-muted space-y-1">
                  <p>
                    创作于{" "}
                    {new Date(selectedPoem.createdAt).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p>
                    AI: {selectedPoem.aiProvider} / {selectedPoem.aiModel}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
