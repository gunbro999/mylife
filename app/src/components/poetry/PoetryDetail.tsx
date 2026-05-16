"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { usePoetryStore } from "@/stores/poetryStore";
import { useAIConfigStore } from "@/stores/aiConfigStore";
import type { Poem, PoemAnalysis } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PoetryDetail() {
  const selectedPoem = usePoetryStore((s) => s.selectedPoem);
  const closeDetail = usePoetryStore((s) => s.closeDetail);
  const openDetail = usePoetryStore((s) => s.openDetail);
  const cache = usePoetryStore((s) => s.analysisCache);
  const setCachedAnalysis = usePoetryStore((s) => s.setCachedAnalysis);

  const selectedProvider = useAIConfigStore((s) => s.selectedProvider);
  const hasApiKey = useAIConfigStore((s) => !!s.apiKeys[s.selectedProvider]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PoemAnalysis | null>(null);
  const [allPoems, setAllPoems] = useState<Poem[]>([]);

  const poem = selectedPoem;

  // Load all poems for related recommendations
  useEffect(() => {
    import("@/data/poems.json").then((m) => setAllPoems(m.default as Poem[]));
  }, []);

  useEffect(() => {
    if (!poem) {
      setAnalysis(null);
      setError(null);
      return;
    }

    const cached = cache[poem.id];
    if (cached) {
      setAnalysis(cached);
      setError(null);
      return;
    }

    if (hasApiKey) {
      generateAnalysis(poem);
    }
  }, [poem?.id]);

  async function generateAnalysis(poem: Poem) {
    setLoading(true);
    setError(null);
    const config = useAIConfigStore.getState().getActiveConfig();
    try {
      const resp = await fetch("/api/ai/poem-analysis", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          provider: config.provider,
          apiKey: config.apiKey,
          endpoint: config.endpoint || undefined,
          model: config.model || undefined,
          title: poem.title,
          author: poem.author,
          dynasty: poem.dynasty,
          content: poem.content,
          background: poem.background,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "生成失败");
      }

      const data = (await resp.json()) as PoemAnalysis;
      setCachedAnalysis(poem.id, data);
      setAnalysis(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "未知错误");
    } finally {
      setLoading(false);
    }
  }

  function handleRegenerate() {
    if (poem) generateAnalysis(poem);
  }

  // Related poems
  const related = poem ? allPoems
    .filter((p) => p.id !== poem.id)
    .map((p) => {
      let score = 0;
      if (p.author === poem.author) score += 3;
      p.tags.moods.forEach((m) => { if (poem.tags.moods.includes(m)) score += 2; });
      p.tags.objects.forEach((o) => { if (poem.tags.objects.includes(o)) score += 1; });
      return { poem: p, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((r) => r.poem) : [];

  return (
    <AnimatePresence>
      {poem && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDetail}
          />

          {/* Detail panel */}
          <motion.div
            className="fixed right-0 top-0 bottom-0 z-50 w-[480px] max-w-[90vw]
                       bg-bg-base border-l border-border overflow-y-auto shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-5
                          bg-bg-base/95 backdrop-blur-sm border-b border-border">
              <div>
                <span className="text-[11px] px-2 py-0.5 rounded border border-border
                               text-text-muted font-display mr-2">
                  {poem.dynasty}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded border border-vermillion/30
                               text-vermillion bg-vermillion/5 font-display">
                  {poem.type}
                </span>
              </div>
              <button
                onClick={closeDetail}
                className="w-8 h-8 flex items-center justify-center rounded
                         hover:bg-bg-elevated transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              {/* Title & Author */}
              <h2 className="text-2xl font-bold font-display text-text mb-1">
                《{poem.title}》
              </h2>
              <p className="text-[15px] text-text-muted mb-6">{poem.dynasty} · {poem.author}</p>

              {/* Full content */}
              <div className="space-y-2 mb-8 text-[18px] text-text leading-loose font-serif
                            text-center py-6 px-4 rounded-lg bg-bg-elevated border border-border">
                {poem.content.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>

              {/* Background */}
              {poem.background && (
                <div className="mb-6">
                  <h4 className="text-[13px] font-bold font-display text-text-muted mb-2">
                    创作背景
                  </h4>
                  <p className="text-[14px] text-text-muted leading-relaxed">
                    {poem.background}
                  </p>
                </div>
              )}

              {/* Notes */}
              {poem.notes && Object.keys(poem.notes).length > 0 && (
                <div className="mb-6">
                  <h4 className="text-[13px] font-bold font-display text-text-muted mb-2">
                    注释
                  </h4>
                  <div className="space-y-1">
                    {Object.entries(poem.notes).map(([word, note]) => (
                      <p key={word} className="text-[14px] text-text-muted">
                        <span className="font-bold text-text">{word}</span>：{note}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {poem.tags.time.filter(t => t !== "通用").map((t) => (
                  <span key={t} className="text-[11px] px-2 py-0.5 rounded bg-bg-elevated
                                         text-text-muted font-display">{t}</span>
                ))}
                {poem.tags.moods.map((m) => (
                  <span key={m} className="text-[11px] px-2 py-0.5 rounded bg-bg-elevated
                                         text-text-muted font-display">{m}</span>
                ))}
              </div>

              {/* AI Analysis */}
              <div className="border-t border-border pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[15px] font-bold font-display text-text flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-vermillion" />
                    AI 赏析
                  </h3>
                  {analysis && (
                    <button
                      onClick={handleRegenerate}
                      disabled={loading}
                      className="flex items-center gap-1 text-[12px] text-text-muted
                               hover:text-vermillion transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
                      重新生成
                    </button>
                  )}
                </div>

                {loading && (
                  <div className="flex items-center gap-2 text-text-muted py-8 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-[14px]">正在赏析...</span>
                  </div>
                )}

                {error && !analysis && (
                  <div className="text-center py-8">
                    <p className="text-[14px] text-text-muted mb-2">
                      {error === "NOT_CONFIGURED"
                        ? "未配置 AI，无法生成赏析"
                        : `赏析生成失败：${error}`}
                    </p>
                    {error !== "NOT_CONFIGURED" && (
                      <button
                        onClick={handleRegenerate}
                        className="text-[13px] text-vermillion hover:underline"
                      >
                        重试
                      </button>
                    )}
                  </div>
                )}

                {analysis && !loading && (
                  <div>
                    <p className="text-[14px] text-text leading-relaxed whitespace-pre-line mb-4">
                      {analysis.appreciation}
                    </p>
                    {analysis.beauty && (
                      <div className="px-4 py-3 rounded bg-vermillion/5 border border-vermillion/20
                                    text-center mb-4">
                        <p className="text-[14px] text-vermillion italic font-serif">
                          「{analysis.beauty}」
                        </p>
                      </div>
                    )}
                    {analysis.themes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.themes.map((t) => (
                          <span key={t} className="text-[11px] px-2 py-0.5 rounded
                                          bg-bg-elevated border border-border text-text-muted">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {!analysis && !loading && !error && !hasApiKey && (
                  <p className="text-[14px] text-text-muted text-center py-8">
                    配置 AI 后可生成智能赏析
                  </p>
                )}
              </div>

              {/* Related poems */}
              {related.length > 0 && (
                <div className="border-t border-border pt-6 mt-6">
                  <h4 className="text-[13px] font-bold font-display text-text-muted mb-3">相关推荐</h4>
                  <div className="space-y-2">
                    {related.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => openDetail(p)}
                        className="w-full text-left p-3 rounded border border-border hover:border-vermillion/30
                                 hover:bg-bg-elevated transition-all group"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded border border-border
                                         text-text-muted">{p.dynasty}</span>
                          <span className="text-[14px] font-bold font-display text-text
                                         group-hover:text-vermillion transition-colors">
                            《{p.title}》
                          </span>
                        </div>
                        <p className="text-[12px] text-text-muted">{p.author}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
