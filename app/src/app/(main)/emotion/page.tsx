"use client";

import { motion } from "framer-motion";
import { useEmotionStore } from "@/stores/emotionStore";
import { useWritingStore } from "@/stores/writingStore";
import { MoodTrendChart } from "@/components/emotion/MoodTrendChart";
import { MoodDailyReport } from "@/components/emotion/MoodDailyReport";
import { EmotionBadge } from "@/components/emotion/EmotionBadge";
import { MOOD_CONFIG } from "@/lib/types";
import { formatDate, stripHtml } from "@/lib/utils";
import type { Mood } from "@/lib/types";

export default function EmotionPage() {
  const logs = useEmotionStore((s) => s.logs);
  const getWritingById = useWritingStore((s) => s.getWritingById);

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-display font-bold text-text-primary tracking-widest">心 情</h1>
        <p className="text-xs text-text-tertiary mt-1.5 font-display tracking-wider italic">
          墨迹见心，情绪如诗
        </p>
      </motion.div>

      {/* Daily Report */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <MoodDailyReport />
      </motion.div>

      {/* Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-8"
      >
        <MoodTrendChart />
      </motion.div>

      {/* Emotion History */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-sm font-display font-semibold text-text-primary tracking-wider mb-4">
          情绪记录
        </h3>

        {sortedLogs.length > 0 ? (
          <div className="space-y-2">
            {sortedLogs.map((log) => {
              const writing = getWritingById(log.writingId);
              const snippet = writing ? stripHtml(writing.content).slice(0, 60) : "";
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-border bg-bg-elevated/50 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <EmotionBadge mood={log.overallMood} size="sm" />
                      <span className="text-[10px] text-text-tertiary">
                        {formatDate(log.createdAt, "short")}
                      </span>
                    </div>
                    {/* Score bars */}
                    <div className="flex items-center gap-1">
                      {log.scores.slice(0, 3).map((s) => (
                        <div
                          key={s.mood}
                          className="flex items-center gap-0.5 text-[9px]"
                          style={{ color: MOOD_CONFIG[s.mood]?.color }}
                        >
                          <span>{MOOD_CONFIG[s.mood]?.emoji}</span>
                          <span>{Math.round(s.score * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed font-serif">
                    {log.summary}
                  </p>
                  {snippet && (
                    <p className="text-[10px] text-text-tertiary/70 mt-2 truncate">
                      「{snippet}...」
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-border text-center">
            <span className="text-4xl mb-4">🌸</span>
            <p className="font-display text-xl text-text-tertiary/30 tracking-widest mb-3">
              墨迹未干，情绪待书
            </p>
            <p className="text-xs text-text-tertiary">
              写一篇日记或随笔，保存后即可看到情绪分析
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
