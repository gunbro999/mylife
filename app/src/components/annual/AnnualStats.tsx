"use client";

import { motion } from "framer-motion";

interface StatItem {
  label: string;
  value: string | number;
  subtitle?: string;
  emoji: string;
  color: string;
}

interface AnnualStatsProps {
  stats: StatItem[];
}

export function AnnualStats({ stats }: AnnualStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * i }}
          className="rounded-xl border border-border bg-bg-elevated/80 p-4 text-center"
        >
          <span className="text-xl mb-1 block">{stat.emoji}</span>
          <span
            className="text-2xl font-bold tabular-nums block"
            style={{ color: stat.color }}
          >
            {stat.value}
          </span>
          <span className="text-[10px] text-text-tertiary font-display tracking-wider">
            {stat.label}
          </span>
          {stat.subtitle && (
            <span className="text-[10px] text-text-tertiary block mt-0.5">
              {stat.subtitle}
            </span>
          )}
        </motion.div>
      ))}
    </div>
  );
}

export function computeAnnualStats(
  writings: Array<{ createdAt: string; wordCount: number; content: string }>,
  year: number
) {
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;

  const yearWritings = writings.filter(
    (w) => w.createdAt >= yearStart && w.createdAt <= yearEnd
  );

  const totalWords = yearWritings.reduce((s, w) => s + w.wordCount, 0);
  const articleCount = yearWritings.length;

  // Writing days (unique dates)
  const days = new Set(yearWritings.map((w) => w.createdAt.slice(0, 10)));
  const writingDays = days.size;

  // Longest streak
  let longestStreak = 0;
  let currentStreak = 0;
  const totalDays = year % 4 === 0 ? 366 : 365;
  const yearStartDate = new Date(year, 0, 1);
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(yearStartDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    if (days.has(dateStr)) {
      currentStreak++;
      if (currentStreak > longestStreak) longestStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
  }

  // Per-hour writing distribution
  const hourCounts = new Array(24).fill(0);
  yearWritings.forEach((w) => {
    const hour = new Date(w.createdAt).getHours();
    hourCounts[hour]++;
  });
  const maxHourCount = Math.max(...hourCounts);
  const peakHour = hourCounts.indexOf(maxHourCount);
  const peakLabel = `${peakHour}:00-${peakHour + 1}:00`;

  return {
    yearWritings,
    totalWords,
    articleCount,
    writingDays,
    longestStreak,
    peakLabel,
    maxHourCount,
    hourCounts,
    days,
  };
}
