import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Mood } from "@/lib/types";
import { generateId } from "@/lib/utils";

export interface EmotionScore {
  mood: Mood;
  score: number;
  label: string;
}

export interface EmotionLog {
  id: string;
  writingId: string;
  date: string; // "2026-05-15"
  overallMood: Mood;
  scores: EmotionScore[];
  summary: string;
  createdAt: string; // ISO
}

interface EmotionState {
  logs: EmotionLog[];

  addLog: (log: Omit<EmotionLog, "id" | "createdAt">) => EmotionLog;
  deleteLog: (id: string) => void;
  getLogByWritingId: (writingId: string) => EmotionLog | undefined;
  getLogsByDate: (date: string) => EmotionLog[];
  getLogsByDateRange: (start: string, end: string) => EmotionLog[];
  getDailyMood: (date: string) => Mood | undefined;
  getWeeklyTrend: () => Array<{ date: string; label: string; mood: Mood | null; dominantScore: number }>;
  getMonthlyTrend: () => Array<{ week: string; label: string; mood: Mood | null; avgScore: number }>;
}

export const useEmotionStore = create<EmotionState>()(
  persist(
    (set, get) => ({
      logs: [],

      addLog: (log) => {
        const newLog: EmotionLog = {
          ...log,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          logs: [
            newLog,
            // Remove old log for same writing
            ...s.logs.filter((l) => l.writingId !== log.writingId),
          ],
        }));
        return newLog;
      },

      deleteLog: (id) =>
        set((s) => ({ logs: s.logs.filter((l) => l.id !== id) })),

      getLogByWritingId: (writingId) =>
        get().logs.find((l) => l.writingId === writingId),

      getLogsByDate: (date) =>
        get().logs.filter((l) => l.date === date),

      getLogsByDateRange: (start, end) =>
        get().logs.filter((l) => l.date >= start && l.date <= end),

      getDailyMood: (date) => {
        const logs = get().getLogsByDate(date);
        if (logs.length === 0) return undefined;
        // Return the mood with highest score from the most recent log
        return logs[logs.length - 1].overallMood;
      },

      getWeeklyTrend: () => {
        const today = new Date();
        const days: Array<{ date: string; label: string; mood: Mood | null; dominantScore: number }> = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().slice(0, 10);
          const label = `${d.getMonth() + 1}/${d.getDate()}`;
          const logs = get().getLogsByDate(dateStr);
          if (logs.length > 0) {
            const latest = logs[logs.length - 1];
            const topScore = latest.scores.reduce((max, s) => Math.max(max, s.score), 0);
            days.push({ date: dateStr, label, mood: latest.overallMood, dominantScore: topScore });
          } else {
            days.push({ date: dateStr, label, mood: null, dominantScore: 0 });
          }
        }
        return days;
      },

      getMonthlyTrend: () => {
        const today = new Date();
        const weeks: Array<{ week: string; label: string; mood: Mood | null; avgScore: number }> = [];
        for (let i = 3; i >= 0; i--) {
          const endDate = new Date(today);
          endDate.setDate(endDate.getDate() - i * 7);
          const startDate = new Date(endDate);
          startDate.setDate(startDate.getDate() - 6);
          const week = `${startDate.toISOString().slice(5, 10)}~${endDate.toISOString().slice(5, 10)}`;
          const logs = get().getLogsByDateRange(
            startDate.toISOString().slice(0, 10),
            endDate.toISOString().slice(0, 10)
          );
          if (logs.length > 0) {
            const avgScore = logs.reduce((sum, l) => {
              const top = l.scores.reduce((max, s) => Math.max(max, s.score), 0);
              return sum + top;
            }, 0) / logs.length;
            // Use most common mood
            const moodCounts = new Map<Mood, number>();
            logs.forEach((l) => {
              moodCounts.set(l.overallMood, (moodCounts.get(l.overallMood) || 0) + 1);
            });
            let topMood: Mood = logs[0].overallMood;
            let topCount = 0;
            moodCounts.forEach((count, mood) => {
              if (count > topCount) { topMood = mood; topCount = count; }
            });
            weeks.push({ week, label: week, mood: topMood, avgScore });
          } else {
            weeks.push({ week, label: week, mood: null, avgScore: 0 });
          }
        }
        return weeks;
      },
    }),
    { name: "mylife-emotions" }
  )
);
