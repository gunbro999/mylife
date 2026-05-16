"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import { ArrowLeft, Trash2, Save } from "lucide-react";
import { useNovelStore } from "@/stores/novelStore";
import { useWritingStore } from "@/stores/writingStore";
import { Editor } from "@/components/editor/Editor";
import { cn } from "@/lib/utils";

export default function ChapterEditPage() {
  const params = useParams();
  const router = useRouter();
  const novelId = params.id as string;
  const chapterId = params.chapterId as string;
  const getNovelById = useNovelStore((s) => s.getNovelById);
  const updateChapter = useNovelStore((s) => s.updateChapter);
  const deleteChapter = useNovelStore((s) => s.deleteChapter);
  const allChapters = useNovelStore((s) => s.chapters);
  const chapters = useMemo(
    () => allChapters.filter((c) => c.novelId === novelId).sort((a, b) => a.sortOrder - b.sortOrder),
    [allChapters, novelId]
  );
  const getWritingById = useWritingStore((s) => s.getWritingById);
  const updateWriting = useWritingStore((s) => s.updateWriting);
  const addWriting = useWritingStore((s) => s.addWriting);

  const chapter = chapters.find((c) => c.id === chapterId);
  const novel = getNovelById(novelId);
  const writing = chapter ? getWritingById(chapter.writingId) : undefined;

  const [title, setTitle] = useState(chapter?.title ?? "");
  const [content, setContent] = useState(writing?.content ?? "");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!chapter || !novel) router.replace(`/novels/${novelId}`);
  }, [chapter, novel, router, novelId]);

  const handleContentChange = useCallback((val: string) => {
    setContent(val);
    setHasChanges(true);
  }, []);

  const handleSave = () => {
    updateChapter(chapterId, { title });
    if (chapter?.writingId) {
      const existing = getWritingById(chapter.writingId);
      if (existing) {
        updateWriting(chapter.writingId, { title, content, isDraft: false });
      } else {
        addWriting("essay", { id: chapter.writingId, title, content, isDraft: false });
      }
    }
    setHasChanges(false);
  };

  const handleDelete = () => {
    if (confirm("删除本章？子章节也会被删除。")) {
      deleteChapter(chapterId);
      router.push(`/novels/${novelId}`);
    }
  };

  if (!chapter || !novel) return null;

  // Build breadcrumb
  const buildBreadcrumb = (chId: string, acc: { id: string; title: string }[] = []) => {
    const ch = chapters.find((c) => c.id === chId);
    if (!ch) return acc;
    acc.unshift({ id: ch.id, title: ch.title || "未命名" });
    if (ch.parentChapterId) return buildBreadcrumb(ch.parentChapterId, acc);
    return acc;
  };
  const breadcrumb = buildBreadcrumb(chapterId);

  // Prev/Next chapter
  const writableChapters = chapters.filter((c) => !c.isVolume);
  const currentIdx = writableChapters.findIndex((c) => c.id === chapterId);
  const prevCh = currentIdx > 0 ? writableChapters[currentIdx - 1] : null;
  const nextCh = currentIdx < writableChapters.length - 1 ? writableChapters[currentIdx + 1] : null;

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-bg-elevated/50">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push(`/novels/${novelId}`)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary shrink-0 transition-all hover:bg-bg-secondary hover:text-text-primary"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-1.5 text-xs text-text-tertiary font-display min-w-0">
            <span className="truncate">{novel.title || "作品"}</span>
            <span className="text-border shrink-0">/</span>
            {breadcrumb.map((b, i) => (
              <span key={b.id} className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    if (i < breadcrumb.length - 1) {
                      const ch = chapters.find((c) => c.id === b.id);
                      if (ch && ch.isVolume) router.push(`/novels/${novelId}`);
                      else router.push(`/novels/${novelId}/chapters/${b.id}`);
                    }
                  }}
                  className="hover:text-text-primary truncate"
                >
                  {b.title || "未命名"}
                </button>
                {i < breadcrumb.length - 1 && <span className="text-border shrink-0">/</span>}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {prevCh && (
            <button
              onClick={() => router.push(`/novels/${novelId}/chapters/${prevCh.id}`)}
              className="text-[10px] text-text-tertiary hover:text-text-primary px-2 py-1 rounded-full hover:bg-bg-secondary transition-all"
            >
              ← 上一章
            </button>
          )}
          <button
            onClick={handleSave}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all",
              hasChanges
                ? "bg-accent text-white hover:bg-accent/90 hover:shadow-md"
                : "bg-bg-secondary text-text-tertiary"
            )}
          >
            <Save size={13} />
            {hasChanges ? "保存" : "已保存"}
          </button>
          {nextCh && (
            <button
              onClick={() => router.push(`/novels/${novelId}/chapters/${nextCh.id}`)}
              className="text-[10px] text-text-tertiary hover:text-text-primary px-2 py-1 rounded-full hover:bg-bg-secondary transition-all"
            >
              下一章 →
            </button>
          )}
          <button
            onClick={handleDelete}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-tertiary ml-1 transition-all hover:bg-accent-soft hover:text-vermillion"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="px-8 pt-8 max-w-2xl mx-auto w-full">
        <input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setHasChanges(true); }}
          placeholder="章节标题"
          className="w-full text-2xl font-display font-semibold text-text-primary placeholder:text-text-tertiary/40 bg-transparent border-none outline-none tracking-wider"
        />
        <div className="mt-3 h-px bg-gradient-to-r from-accent/20 via-border to-transparent" />
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          content={content}
          onChange={handleContentChange}
          placeholder="开始书写这一章..."
        />
      </div>

      {/* Bottom bar with prev/next */}
      <div className="flex items-center justify-between px-6 py-2 border-t border-border bg-bg-elevated/50">
        <div>
          {prevCh && (
            <button
              onClick={() => router.push(`/novels/${novelId}/chapters/${prevCh.id}`)}
              className="text-xs text-text-tertiary hover:text-text-primary transition-colors"
            >
              ← {prevCh.title || "上一章"}
            </button>
          )}
        </div>
        <span className="text-[10px] text-text-tertiary font-display">
          {chapters.filter((c) => !c.isVolume).findIndex((c) => c.id === chapterId) + 1} / {chapters.filter((c) => !c.isVolume).length} 章
        </span>
        <div>
          {nextCh && (
            <button
              onClick={() => router.push(`/novels/${novelId}/chapters/${nextCh.id}`)}
              className="text-xs text-text-tertiary hover:text-text-primary transition-colors"
            >
              {nextCh.title || "下一章"} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
