"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Trash2, Save, Sparkles, Share2, Download } from "lucide-react";
import { useWritingStore } from "@/stores/writingStore";
import { useUIStore } from "@/stores/uiStore";
import { useAIConfigStore } from "@/stores/aiConfigStore";
import { useEmotionStore } from "@/stores/emotionStore";
import { Editor } from "@/components/editor/Editor";
import { MoodPicker } from "@/components/diary/MoodPicker";
import { WeatherPicker } from "@/components/diary/WeatherPicker";
import { ShareCardModal } from "@/components/share/ShareCardModal";
import type { Mood, Weather } from "@/lib/types";
import { formatDate, stripHtml, getWordCount } from "@/lib/utils";
import { exportWritingToMarkdown, downloadFile, printWriting } from "@/lib/export";
import { syncWritingSave, syncWritingDelete } from "@/lib/sync";
import type { Writing } from "@/lib/types";

export default function DiaryEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const getWritingById = useWritingStore((s) => s.getWritingById);
  const updateWriting = useWritingStore((s) => s.updateWriting);
  const deleteWriting = useWritingStore((s) => s.deleteWriting);

  const toggleAIPanel = useUIStore((s) => s.toggleAIPanel);
  const getActiveConfig = useAIConfigStore((s) => s.getActiveConfig);
  const addEmotionLog = useEmotionStore((s) => s.addLog);

  const writing = getWritingById(id);
  const [title, setTitle] = useState(writing?.title ?? "");
  const [content, setContent] = useState(writing?.content ?? "");
  const [mood, setMood] = useState<Mood | undefined>(writing?.mood);
  const [weather, setWeather] = useState<Weather | undefined>(writing?.weather);
  const [hasChanges, setHasChanges] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (!writing) router.replace("/diary");
  }, [writing, router]);

  const handleContentChange = useCallback((val: string) => {
    setContent(val);
    setHasChanges(true);
  }, [setContent, setHasChanges]);

  const analyzeEmotion = useCallback(async () => {
    const plain = stripHtml(content);
    if (plain.length < 50) return;
    try {
      const config = getActiveConfig();
      const resp = await fetch("/api/ai/emotion-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: config.provider,
          apiKey: config.apiKey,
          endpoint: config.endpoint,
          model: config.model,
          content: plain,
          date: new Date().toISOString().slice(0, 10),
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        addEmotionLog({
          writingId: id,
          date: new Date().toISOString().slice(0, 10),
          overallMood: data.overallMood,
          scores: data.scores,
          summary: data.summary,
        });
      }
    } catch {
      // Silent fail — emotion analysis is non-critical
    }
  }, [content, id, getActiveConfig, addEmotionLog]);

  const handleSave = () => {
    const now = new Date().toISOString();
    updateWriting(id, { title, content, mood, weather, isDraft: false });
    setHasChanges(false);
    analyzeEmotion();
    // Sync to Supabase (upsert — creates if not exists)
    syncWritingSave({
      id,
      type: 'diary',
      title,
      content,
      wordCount: getWordCount(content),
      isDraft: false,
      tags: [],
      mood: mood ?? null,
      weather: weather ?? null,
      createdAt: writing!.createdAt,
      updatedAt: now,
    });
  };

  const handleDelete = () => {
    if (confirm("确定要删除这篇日记吗？")) {
      deleteWriting(id);
      syncWritingDelete(id);
      router.push("/diary");
    }
  };

  if (!writing) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-bg-elevated/50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/diary")}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-all hover:bg-bg-secondary hover:text-text-primary"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="text-xs text-text-tertiary font-display">
            {formatDate(writing.createdAt, "full")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAIPanel}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-tertiary transition-all hover:bg-accent-soft hover:text-accent"
            title="AI 写作助手"
          >
            <Sparkles size={15} />
          </button>
          <button
            onClick={() => setShareOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-tertiary transition-all hover:bg-accent-soft hover:text-accent"
            title="分享"
          >
            <Share2 size={15} />
          </button>
          <button
            onClick={() => {
              if (writing) {
                const md = exportWritingToMarkdown(writing as Writing);
                downloadFile(md, `日记_${writing.createdAt.slice(0, 10)}.md`);
              }
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-tertiary transition-all hover:bg-accent-soft hover:text-accent"
            title="导出 Markdown"
          >
            <Download size={15} />
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-white transition-all hover:bg-accent/90 hover:shadow-md disabled:opacity-40"
          >
            <Save size={13} />
            {hasChanges ? "保存" : "已保存"}
          </button>
          <button
            onClick={handleDelete}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-tertiary transition-all hover:bg-accent-soft hover:text-vermillion"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Mood & Weather */}
      <div className="px-6 py-4 border-b border-border bg-bg-elevated/30 space-y-3">
        <div>
          <label className="text-[11px] font-display text-text-tertiary mb-2 block tracking-wider">
            今日心境
          </label>
          <MoodPicker value={mood} onChange={(v) => { setMood(v); setHasChanges(true); }} />
        </div>
        <div>
          <label className="text-[11px] font-display text-text-tertiary mb-2 block tracking-wider">
            今日天气
          </label>
          <WeatherPicker value={weather} onChange={(v) => { setWeather(v); setHasChanges(true); }} />
        </div>
      </div>

      {/* Title */}
      <div className="px-8 pt-8 max-w-2xl mx-auto w-full">
        <input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setHasChanges(true); }}
          placeholder="题记..."
          className="w-full text-2xl font-display font-semibold text-text-primary placeholder:text-text-tertiary/50 bg-transparent border-none outline-none tracking-wider"
        />
        <div className="mt-3 h-px bg-gradient-to-r from-accent/20 via-border to-transparent" />
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          content={content}
          onChange={handleContentChange}
          placeholder="今天发生了什么..."
        />
      </div>

      <ShareCardModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        writing={writing}
      />
    </div>
  );
}
