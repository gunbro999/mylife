"use client";

import { useState } from "react";
import { useEmotionStore } from "@/stores/emotionStore";
import { MOOD_CONFIG } from "@/lib/types";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import { EmotionBadge } from "./EmotionBadge";
import type { Mood } from "@/lib/types";

type Range = "week" | "month";

export function MoodTrendChart() {
  const [range, setRange] = useState<Range>("week");
  const getWeeklyTrend = useEmotionStore((s) => s.getWeeklyTrend);
  const getMonthlyTrend = useEmotionStore((s) => s.getMonthlyTrend);

  const weeklyData = getWeeklyTrend();
  const monthlyData = getMonthlyTrend();

  const activeData = range === "week" ? weeklyData : monthlyData;

  const barData = activeData.map((d) => {
    const score = "dominantScore" in d ? d.dominantScore : d.avgScore;
    return {
      label: d.label,
      value: score,
      color: d.mood ? MOOD_CONFIG[d.mood]?.color || "var(--border-color)" : "var(--border-color)",
      extra: d.mood ? ` (${MOOD_CONFIG[d.mood]?.label})` : "",
    };
  });

  const hasData = activeData.some((d) => d.mood !== null);

  return (
    <div className="rounded-2xl border border-border bg-bg-elevated/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-display font-semibold text-text-primary tracking-wider">
          情绪趋势
        </h3>
        <div className="flex gap-0.5 rounded-full border border-border p-0.5">
          <button
            onClick={() => setRange("week")}
            className={`rounded-full px-3 py-1 text-[10px] font-medium transition-all ${
              range === "week"
                ? "bg-accent text-white"
                : "text-text-tertiary hover:text-text-secondary"
            }`}
          >
            周
          </button>
          <button
            onClick={() => setRange("month")}
            className={`rounded-full px-3 py-1 text-[10px] font-medium transition-all ${
              range === "month"
                ? "bg-accent text-white"
                : "text-text-tertiary hover:text-text-secondary"
            }`}
          >
            月
          </button>
        </div>
      </div>

      {hasData ? (
        <SimpleBarChart data={barData} height={100} />
      ) : (
        <div className="flex items-center justify-center h-24 text-[11px] text-text-tertiary">
          尚无情绪数据，去写一篇日记吧
        </div>
      )}

      {/* Today's dominant mood */}
      {activeData.length > 0 && (() => {
        const last = activeData[activeData.length - 1];
        const score = "dominantScore" in last ? last.dominantScore : last.avgScore;
        return last.mood ? (
          <div className="mt-4 flex items-center gap-2 pt-3 border-t border-border">
            <span className="text-[10px] text-text-tertiary font-display">今日心境</span>
            <EmotionBadge mood={last.mood} score={score} />
          </div>
        ) : null;
      })()}
    </div>
  );
}
