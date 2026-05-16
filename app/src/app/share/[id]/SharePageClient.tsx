"use client";

import { useState, useEffect } from "react";
import { MOOD_CONFIG, WEATHER_CONFIG } from "@/lib/types";
import { formatDate, stripHtml } from "@/lib/utils";
import type { Writing } from "@/lib/types";

interface SharePageClientProps {
  id: string;
}

export function SharePageClient({ id }: SharePageClientProps) {
  const [writing, setWriting] = useState<Writing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read writing data from localStorage (same origin)
    try {
      const raw = localStorage.getItem("mylife-writings");
      if (raw) {
        const data = JSON.parse(raw);
        const writings: Writing[] = data?.state?.writings || [];
        const found = writings.find((w: Writing) => w.id === id);
        if (found) {
          found.isDraft = false; // treat shared as published
        }
        setWriting(found || null);
      }
    } catch {
      setWriting(null);
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F5F0]">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-[#C9943E]/30 border-t-[#C9943E] rounded-full animate-spin mx-auto" />
          <p className="text-sm text-stone-400 mt-4 font-display tracking-wider">加载中...</p>
        </div>
      </div>
    );
  }

  if (!writing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F5F0]">
        <div className="text-center px-6">
          <p className="text-6xl mb-6">📜</p>
          <p className="font-display text-2xl text-stone-300 tracking-widest mb-3">
            文已随风去
          </p>
          <p className="text-sm text-stone-400">
            这篇文章不存在或已被作者收回
          </p>
        </div>
      </div>
    );
  }

  const plainText = stripHtml(writing.content);

  return (
    <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center p-4 sm:p-8">
      <article className="w-full max-w-2xl mx-auto">
        {/* Card */}
        <div className="rounded-2xl bg-white/90 shadow-lg border border-stone-200/60 p-6 sm:p-10">
          {/* Header */}
          <header className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-[10px] font-display tracking-[0.3em] text-stone-400 uppercase">
                {writing.type === "diary" ? "日记" : writing.type === "essay" ? "随笔" : "小记"}
              </span>
              <span className="w-8 h-px bg-stone-300" />
              <span className="text-[10px] text-stone-400">
                {formatDate(writing.createdAt, "full")}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-800 tracking-wider leading-relaxed">
              {writing.title || "无题"}
            </h1>

            {(writing.mood || writing.weather) && (
              <div className="flex items-center justify-center gap-4 mt-4">
                {writing.mood && (
                  <span className="text-sm text-stone-500">
                    {MOOD_CONFIG[writing.mood]?.emoji} {MOOD_CONFIG[writing.mood]?.label}
                  </span>
                )}
                {writing.weather && (
                  <span className="text-sm text-stone-500">
                    {WEATHER_CONFIG[writing.weather]?.emoji} {WEATHER_CONFIG[writing.weather]?.label}
                  </span>
                )}
              </div>
            )}
          </header>

          {/* Chinese divider */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="w-12 h-px bg-stone-300" />
            <span className="text-[10px] text-stone-400 font-display tracking-[0.3em]">浮生记</span>
            <span className="w-12 h-px bg-stone-300" />
          </div>

          {/* Content */}
          <div className="prose prose-stone max-w-none">
            {writing.content ? (
              <div
                className="text-stone-700 leading-8 text-[15px] font-serif tracking-wide"
                dangerouslySetInnerHTML={{ __html: writing.content }}
              />
            ) : (
              <p className="text-center text-stone-300 italic font-display tracking-wider py-12">
                此文无字，意境自现
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-stone-200/60 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-stone-400">
              <span>{writing.wordCount} 字</span>
              <span className="mx-2">·</span>
              <span>来自 浮生记</span>
            </div>
          </div>
        </div>

        {/* Branding */}
        <p className="text-center mt-6 text-[10px] text-stone-300 font-display tracking-[0.3em]">
          浮 生 记 · mylife
        </p>
      </article>
    </div>
  );
}
