"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useWritingStore } from "@/stores/writingStore";
import { useEmotionStore } from "@/stores/emotionStore";
import { AnnualStats, computeAnnualStats } from "@/components/annual/AnnualStats";
import { WritingHeatmap } from "@/components/annual/WritingHeatmap";
import { WordCloud, useWordCloudWords } from "@/components/annual/WordCloud";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import { MOOD_CONFIG } from "@/lib/types";
import { stripHtml } from "@/lib/utils";
import type { Mood } from "@/lib/types";

const MOOD_EMOJI: Record<string, string> = {
  happy: "😊", calm: "😌", sad: "😢", anxious: "😰",
  angry: "😤", grateful: "🙏", excited: "🤩", tired: "😴",
};

export default function AnnualReportPage() {
  const writings = useWritingStore((s) => s.writings);
  const logs = useEmotionStore((s) => s.logs);

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  // Compute annual stats
  const stats = useMemo(() => computeAnnualStats(writings, year), [writings, year]);

  // Build heatmap data: date -> total words
  const heatmapData = useMemo(() => {
    const map = new Map<string, number>();
    writings.forEach((w) => {
      const date = w.createdAt.slice(0, 10);
      if (date.startsWith(`${year}-`)) {
        map.set(date, (map.get(date) || 0) + w.wordCount);
      }
    });
    return map;
  }, [writings, year]);

  // Emotion monthly trend
  const emotionMonthly = useMemo(() => {
    const months: Array<{ month: string; mood: string | null; avgScore: number }> = [];
    for (let m = 0; m < 12; m++) {
      const monthStr = `${year}-${String(m + 1).padStart(2, "0")}`;
      const monthLogs = logs.filter((l) => l.date.startsWith(monthStr));
      if (monthLogs.length > 0) {
        let totalScore = 0;
        const moodCounts = new Map<string, number>();
        monthLogs.forEach((l) => {
          const top = l.scores.reduce((max, s) => Math.max(max, s.score), 0);
          totalScore += top;
          moodCounts.set(l.overallMood, (moodCounts.get(l.overallMood) || 0) + 1);
        });
        let topMood: string | null = monthLogs[0].overallMood;
        let topCount = 0;
        moodCounts.forEach((c, mood) => { if (c > topCount) { topMood = mood; topCount = c; } });
        months.push({
          month: `${m + 1}月`,
          mood: topMood,
          avgScore: totalScore / monthLogs.length,
        });
      } else {
        months.push({ month: `${m + 1}月`, mood: null, avgScore: 0 });
      }
    }
    return months;
  }, [logs, year]);

  // Month bar chart data for writing count
  const monthCountData = useMemo(() => {
    const counts = new Array(12).fill(0);
    stats.yearWritings.forEach((w) => {
      const m = parseInt(w.createdAt.slice(5, 7)) - 1;
      counts[m]++;
    });
    const maxCount = Math.max(...counts);
    return counts.map((v, i) => ({
      label: `${i + 1}月`,
      value: v,
      color: v === maxCount && v > 0 ? "var(--accent)" : "var(--border)",
    }));
  }, [stats.yearWritings]);

  // Word cloud words
  const allContents = useMemo(
    () => stats.yearWritings.map((w) => stripHtml(w.content)),
    [stats.yearWritings]
  );
  const cloudWords = useWordCloudWords(allContents);

  // Hour distribution chart
  const hourChartData = useMemo(() => {
    const maxH = stats.maxHourCount;
    return stats.hourCounts.map((v, i) => ({
      label: `${i}`,
      value: v,
      color: v === maxH && v > 0 ? "var(--accent)" : "var(--border)",
    }));
  }, [stats.hourCounts, stats.maxHourCount]);

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-display font-bold text-text-primary tracking-widest">年 度 报 告</h1>
        <p className="text-xs text-text-tertiary mt-1.5 font-display tracking-wider italic">
          回望一年笔墨，细数字里行间的温度
        </p>
      </motion.div>

      {/* Year selector */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-center gap-4 mb-8"
      >
        <button
          onClick={() => setYear((y) => y - 1)}
          className="rounded-full p-1.5 text-text-tertiary hover:text-text-primary hover:bg-bg-secondary transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-lg font-display font-bold text-text-primary tracking-widest tabular-nums">
          {year}
        </span>
        <button
          onClick={() => setYear((y) => Math.min(y + 1, currentYear))}
          disabled={year >= currentYear}
          className="rounded-full p-1.5 text-text-tertiary hover:text-text-primary hover:bg-bg-secondary transition-colors disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
      </motion.div>

      {/* Annual Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-8"
      >
        <AnnualStats
          stats={[
            { label: "总字数", value: stats.totalWords.toLocaleString(), emoji: "📝", color: "var(--vermillion)" },
            { label: "写作天数", value: stats.writingDays, subtitle: `${((stats.writingDays / (year % 4 === 0 ? 366 : 365)) * 100).toFixed(1)}%`, emoji: "📅", color: "var(--indigo-ink)" },
            { label: "文章数", value: stats.articleCount, emoji: "📄", color: "var(--jade)" },
            { label: "最长连续", value: `${stats.longestStreak} 天`, emoji: "🔥", color: "var(--gold)" },
          ]}
        />
      </motion.div>

      {/* Writing Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8 rounded-2xl border border-border bg-bg-elevated/80 p-5"
      >
        <h3 className="text-sm font-display font-semibold text-text-primary tracking-wider mb-4">
          📊 写作热力图
        </h3>
        <WritingHeatmap data={heatmapData} year={year} />
      </motion.div>

      {/* Monthly writing count */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-8 rounded-2xl border border-border bg-bg-elevated/80 p-5"
      >
        <h3 className="text-sm font-display font-semibold text-text-primary tracking-wider mb-4">
          📈 月度写作趋势
        </h3>
        <SimpleBarChart data={monthCountData} height={100} />
      </motion.div>

      {/* Emotion Trend */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8 rounded-2xl border border-border bg-bg-elevated/80 p-5"
      >
        <h3 className="text-sm font-display font-semibold text-text-primary tracking-wider mb-4">
          💗 月度情绪
        </h3>
        <div className="flex flex-wrap gap-2">
          {emotionMonthly.map((em, i) => (
            <div
              key={em.month}
              className="flex items-center gap-1.5 rounded-full border border-border bg-bg-secondary/50 px-3 py-1.5 text-xs"
            >
              <span className="text-text-tertiary tabular-nums">{em.month}</span>
              {em.mood ? (
                <span>{MOOD_EMOJI[em.mood] || "😐"}</span>
              ) : (
                <span className="text-text-tertiary/40">—</span>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Word Cloud */}
      {cloudWords.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-8 rounded-2xl border border-border bg-bg-elevated/80 p-5"
        >
          <h3 className="text-sm font-display font-semibold text-text-primary tracking-wider mb-4">
            ☁️ 关键词云
          </h3>
          <WordCloud words={cloudWords} />
        </motion.div>
      )}

      {/* Hour Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8 rounded-2xl border border-border bg-bg-elevated/80 p-5"
      >
        <h3 className="text-sm font-display font-semibold text-text-primary tracking-wider mb-4">
          🕐 写作时段
        </h3>
        <SimpleBarChart data={hourChartData} height={80} />
        {stats.maxHourCount > 0 && (
          <p className="text-[10px] text-text-tertiary text-center mt-2 font-display tracking-wider">
            最爱在{stats.peakLabel}写作
          </p>
        )}
      </motion.div>

      {/* Empty state fallback */}
      {stats.articleCount === 0 && (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-border text-center">
          <span className="text-5xl mb-4">📖</span>
          <p className="font-display text-xl text-text-tertiary/30 tracking-widest mb-3">
            {year} 年尚无记录
          </p>
          <p className="text-xs text-text-tertiary">
            开始写点什么吧，来年的报告一定精彩
          </p>
        </div>
      )}
    </div>
  );
}
