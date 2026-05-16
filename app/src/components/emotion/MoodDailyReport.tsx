"use client";

import { useEmotionStore } from "@/stores/emotionStore";
import { useWritingStore } from "@/stores/writingStore";
import { EmotionBadge } from "./EmotionBadge";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import { MOOD_CONFIG } from "@/lib/types";

export function MoodDailyReport() {
  const today = new Date().toISOString().slice(0, 10);
  const getLogsByDate = useEmotionStore((s) => s.getLogsByDate);
  const getWritingsByDate = useWritingStore((s) => s.getWritingsByDate);

  const logs = getLogsByDate(today);
  const writings = getWritingsByDate(today);

  if (logs.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-bg-elevated/50 p-5">
        <h3 className="text-sm font-display font-semibold text-text-primary tracking-wider mb-3">
          今日心绪
        </h3>
        <div className="text-center py-6">
          <span className="text-3xl block mb-2">🌸</span>
          <p className="text-xs text-text-tertiary font-display tracking-wider">尚未记录</p>
          <p className="text-[10px] text-text-tertiary/60 mt-1">
            {writings.length > 0 ? "保存一篇文章即可分析情绪" : "去写一篇日记吧"}
          </p>
        </div>
      </div>
    );
  }

  const latestLog = logs[logs.length - 1];
  const barData = latestLog.scores.map((s) => ({
    label: MOOD_CONFIG[s.mood]?.label || s.mood,
    value: s.score,
    color: MOOD_CONFIG[s.mood]?.color,
  }));

  return (
    <div className="rounded-2xl border border-border bg-bg-elevated/50 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-display font-semibold text-text-primary tracking-wider">
          今日心绪
        </h3>
        <EmotionBadge mood={latestLog.overallMood} size="sm" />
      </div>

      <p className="text-xs text-text-secondary leading-relaxed mb-4 font-serif">
        {latestLog.summary}
      </p>

      <SimpleBarChart data={barData} height={64} showLabels />

      {logs.length > 1 && (
        <p className="text-[10px] text-text-tertiary mt-3 text-center">
          今日已记录 {logs.length} 次情绪
        </p>
      )}
    </div>
  );
}
