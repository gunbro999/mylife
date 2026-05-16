"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useWritingStore } from "@/stores/writingStore";
import { MOOD_CONFIG } from "@/lib/types";
import { formatDate, stripHtml, truncateText } from "@/lib/utils";
import type { WritingType, Writing } from "@/lib/types";

const TYPE_FILTERS: Array<{ key: WritingType | "all"; label: string; emoji: string }> = [
  { key: "all", label: "全部", emoji: "📜" },
  { key: "diary", label: "日记", emoji: "📖" },
  { key: "essay", label: "随笔", emoji: "✒️" },
  { key: "note", label: "小记", emoji: "💭" },
];

function groupByMonth(writings: Writing[]): Map<string, Writing[]> {
  const map = new Map<string, Writing[]>();
  writings.forEach((w) => {
    const key = w.createdAt.slice(0, 7); // "2026-05"
    const arr = map.get(key) || [];
    arr.push(w);
    map.set(key, arr);
  });
  return map;
}

function monthLabel(key: string): string {
  const [year, month] = key.split("-");
  return `${year}年 ${parseInt(month)}月`;
}

export default function TimelinePage() {
  const writings = useWritingStore((s) => s.writings);
  const [filter, setFilter] = useState<WritingType | "all">("all");

  const filtered = useMemo(() => {
    const items = filter === "all"
      ? writings
      : writings.filter((w) => w.type === filter);
    return [...items].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [writings, filter]);

  const grouped = useMemo(() => groupByMonth(filtered), [filtered]);
  const months = useMemo(() => [...grouped.entries()], [grouped]);

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-display font-bold text-text-primary tracking-widest">时 间 线</h1>
        <p className="text-xs text-text-tertiary mt-1.5 font-display tracking-wider italic">
          溯流而上，回顾笔尖流淌的时光
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 mb-8"
      >
        {TYPE_FILTERS.map((f) => {
          const count = f.key === "all"
            ? writings.length
            : writings.filter((w) => w.type === f.key).length;
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                active
                  ? "bg-accent text-white shadow-sm"
                  : "bg-bg-elevated text-text-secondary hover:text-text-primary border border-border hover:border-accent/20"
              }`}
            >
              <span className="text-[10px]">{f.emoji}</span>
              {f.label}
              <span className={`text-[10px] ml-0.5 ${active ? "text-white/70" : "text-text-tertiary"}`}>
                ({count})
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* Timeline */}
      {months.length > 0 ? (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />

          {months.map(([monthKey, items], mi) => (
            <div key={monthKey} className="mb-8">
              {/* Month divider */}
              <div className="flex items-center gap-3 mb-4 relative">
                <div className="relative z-10 w-[38px] h-[38px] rounded-full bg-accent-soft border-2 border-accent flex items-center justify-center text-[10px] font-display font-bold text-accent">
                  {monthKey.slice(5)}
                </div>
                <span className="text-xs font-display text-text-secondary tracking-wider font-semibold">
                  {monthLabel(monthKey)}
                </span>
                <span className="text-[10px] text-text-tertiary">
                  {grouped.get(monthKey)?.length} 篇
                </span>
              </div>

              {/* Items */}
              <div className="ml-[19px] pl-8 space-y-3">
                {items.map((w, i) => {
                  const typeInfo = {
                    diary: { label: "记", href: `/diary/${w.id}`, color: "var(--vermillion)" },
                    essay: { label: "文", href: `/essays/${w.id}`, color: "var(--indigo-ink)" },
                    note: { label: "念", href: "/notes", color: "var(--jade)" },
                  }[w.type];

                  const snippet = stripHtml(w.content);

                  return (
                    <motion.div
                      key={w.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: mi * 0.05 + i * 0.03 }}
                    >
                      <Link
                        href={typeInfo.href}
                        className="group relative block rounded-xl border border-border bg-bg-elevated/70 p-4 transition-all duration-200 hover:shadow-md hover:border-accent/20 hover:-translate-y-0.5"
                      >
                        {/* Date dot */}
                        <div
                          className="absolute left-[-27px] top-5 w-2 h-2 rounded-full border-2 border-border bg-bg-elevated transition-colors group-hover:border-accent group-hover:bg-accent-soft"
                        />

                        <div className="flex items-start gap-3">
                          {/* Type badge */}
                          <span
                            className="shrink-0 mt-0.5 text-[10px] font-display font-bold w-5 h-5 flex items-center justify-center rounded border"
                            style={{ borderColor: typeInfo.color, color: typeInfo.color }}
                          >
                            {typeInfo.label}
                          </span>

                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-text-primary group-hover:text-accent transition-colors line-clamp-1 font-medium">
                              {w.title || truncateText(snippet, 50) || "无题"}
                            </span>
                            {snippet && w.title && (
                              <p className="text-[11px] text-text-tertiary mt-1 line-clamp-1 font-serif">
                                {truncateText(snippet, 100)}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-[10px] text-text-tertiary">
                                {formatDate(w.createdAt, "short")}
                              </span>
                              <span className="text-[10px] text-text-tertiary">
                                {w.wordCount} 字
                              </span>
                              {w.mood && (
                                <span className="text-[10px]">
                                  {MOOD_CONFIG[w.mood]?.emoji}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-28 rounded-2xl border border-dashed border-border text-center">
          <span className="text-5xl mb-4">📜</span>
          <p className="font-display text-xl text-text-tertiary/30 tracking-widest mb-3">
            笔未落，时光未记
          </p>
          <p className="text-xs text-text-tertiary">
            开始写点什么吧，时间线会见证你的每一笔
          </p>
        </div>
      )}
    </div>
  );
}
