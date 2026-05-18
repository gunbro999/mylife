"use client";

import { useState, useMemo } from "react";
import { Loader2, Sparkles, BookOpen, StickyNote } from "lucide-react";
import type { Writing, PoemGenre } from "@/lib/types";
import { POEM_GENRE_CONFIG } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAIConfigStore } from "@/stores/aiConfigStore";
import { useWritingStore } from "@/stores/writingStore";

export interface ComposeResult {
  title: string;
  content: string;
  explanation: string;
  genre: PoemGenre;
  sourceIds: string[];
}

interface CreatePanelProps {
  onResult: (result: ComposeResult) => void;
  isGenerating: boolean;
  onGenerateStart: () => void;
}

export function CreatePanel({ onResult, isGenerating, onGenerateStart }: CreatePanelProps) {
  const [selectedGenre, setSelectedGenre] = useState<PoemGenre>("七言绝句");
  const [extraNote, setExtraNote] = useState("");
  const [selectedSourceIds, setSelectedSourceIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  const writings = useWritingStore((s) => s.writings);

  const recentWritings = useMemo(
    () =>
      [...writings]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 20),
    [writings]
  );

  const diaries = useMemo(() => recentWritings.filter((w) => w.type === "diary"), [recentWritings]);
  const notes = useMemo(() => recentWritings.filter((w) => w.type === "note"), [recentWritings]);

  const toggleSource = (id: string) => {
    setSelectedSourceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedMaterials = useMemo(
    () =>
      recentWritings
        .filter((w) => selectedSourceIds.has(w.id))
        .map((w) => ({ title: w.title || "无标题", content: w.content })),
    [recentWritings, selectedSourceIds]
  );

  const handleGenerate = async () => {
    if (isGenerating) return;
    setError("");
    onGenerateStart();

    const activeConfig = useAIConfigStore.getState().getActiveConfig();

    try {
      const resp = await fetch("/api/ai/poem-compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: activeConfig.provider,
          apiKey: activeConfig.apiKey,
          endpoint: activeConfig.endpoint || undefined,
          model: activeConfig.model || undefined,
          genre: selectedGenre,
          sourceMaterials: selectedMaterials,
          extraNote: extraNote.trim() || undefined,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || "请求失败");
      }
      onResult({
        title: data.title,
        content: data.content,
        explanation: data.explanation,
        genre: selectedGenre,
        sourceIds: [...selectedSourceIds],
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "生成失败，请重试");
    }
  };

  return (
    <div className="space-y-6">
      {/* Genre selector */}
      <div>
        <h3 className="text-sm font-bold font-display text-text mb-2">选择体裁</h3>
        <div className="grid grid-cols-4 gap-2">
          {(Object.entries(POEM_GENRE_CONFIG) as [PoemGenre, { label: string; emoji: string; desc: string }][]).map(
            ([genre, config]) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={cn(
                  "p-3 rounded-lg border text-center transition-all",
                  selectedGenre === genre
                    ? "bg-vermillion/10 border-vermillion text-vermillion"
                    : "border-border text-text-muted hover:border-vermillion/30"
                )}
              >
                <div className="text-lg mb-0.5">{config.emoji}</div>
                <div className="text-xs font-display">{config.label}</div>
                <div className="text-[10px] text-text-muted/70">{config.desc}</div>
              </button>
            )
          )}
        </div>
      </div>

      {/* Source materials */}
      <div>
        <h3 className="text-sm font-bold font-display text-text mb-2">
          选择素材（日记/小记，可选多篇）
        </h3>
        {diaries.length === 0 && notes.length === 0 ? (
          <p className="text-[13px] text-text-muted">暂无日记或小记，不选素材可直接自由创作</p>
        ) : (
          <div className="space-y-2 max-h-[260px] overflow-y-auto">
            {diaries.length > 0 && (
              <div>
                <p className="text-[11px] text-text-muted font-display mb-1 flex items-center gap-1">
                  <BookOpen size={12} /> 日记
                </p>
                {diaries.map((w) => (
                  <SourceItem
                    key={w.id}
                    writing={w}
                    selected={selectedSourceIds.has(w.id)}
                    onToggle={() => toggleSource(w.id)}
                  />
                ))}
              </div>
            )}
            {notes.length > 0 && (
              <div className="mt-2">
                <p className="text-[11px] text-text-muted font-display mb-1 flex items-center gap-1">
                  <StickyNote size={12} /> 小记
                </p>
                {notes.map((w) => (
                  <SourceItem
                    key={w.id}
                    writing={w}
                    selected={selectedSourceIds.has(w.id)}
                    onToggle={() => toggleSource(w.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Extra note */}
      <div>
        <h3 className="text-sm font-bold font-display text-text mb-2">额外提示（可选）</h3>
        <textarea
          value={extraNote}
          onChange={(e) => setExtraNote(e.target.value)}
          rows={2}
          placeholder="如：以春天为主题、表达思念之情..."
          className="w-full px-3 py-2 rounded-lg border border-border bg-bg-base text-text text-sm
                     placeholder:text-text-muted/50 resize-none
                     focus:outline-none focus:border-vermillion/50 transition-colors"
        />
      </div>

      {/* Error */}
      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full py-3 rounded-lg font-display font-bold text-white
                   bg-vermillion hover:opacity-90 disabled:opacity-50 transition-all
                   flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            创作中...
          </>
        ) : (
          <>
            <Sparkles size={18} />
            开始赋诗
          </>
        )}
      </button>
    </div>
  );
}

function SourceItem({
  writing,
  selected,
  onToggle,
}: {
  writing: Writing;
  selected: boolean;
  onToggle: () => void;
}) {
  const preview = writing.content.slice(0, 60);
  const date = new Date(writing.createdAt).toLocaleDateString("zh-CN");

  return (
    <button
      onClick={onToggle}
      className={cn(
        "w-full text-left px-3 py-2 rounded-lg border text-sm transition-all",
        selected
          ? "border-vermillion/40 bg-vermillion/5"
          : "border-border bg-bg-base hover:border-vermillion/20"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-text truncate flex-1">
          {writing.title || "无标题"}
        </span>
        <span className="text-[11px] text-text-muted shrink-0 ml-2">{date}</span>
      </div>
      {preview && (
        <p className="text-[12px] text-text-muted/70 truncate mt-0.5">{preview}</p>
      )}
    </button>
  );
}
