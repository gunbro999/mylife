"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatDate, truncate } from "@/lib/utils";
import { MOOD_CONFIG, WEATHER_CONFIG, type Writing } from "@/lib/types";

export function DiaryCard({ writing }: { writing: Writing }) {
  const plainText = writing.content.replace(/<[^>]*>/g, "").trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        href={`/diary/${writing.id}`}
        className="group block rounded-2xl border border-border bg-bg-elevated/80 p-5 transition-all duration-200 hover:shadow-md hover:border-accent/15 hover:-translate-y-0.5"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] text-text-tertiary font-display tracking-wider">
            {formatDate(writing.createdAt, "full")}
          </span>
          <div className="flex items-center gap-1.5">
            {writing.weather && (
              <span className="text-sm" title={WEATHER_CONFIG[writing.weather].label}>
                {WEATHER_CONFIG[writing.weather].emoji}
              </span>
            )}
            {writing.mood && (
              <span
                className="text-[10px] font-display font-bold px-1.5 py-0.5 rounded border"
                style={{
                  borderColor: MOOD_CONFIG[writing.mood].color,
                  color: MOOD_CONFIG[writing.mood].color,
                }}
              >
                {MOOD_CONFIG[writing.mood].label}
              </span>
            )}
          </div>
        </div>

        {writing.title && (
          <h3 className="text-base font-display font-semibold text-text-primary mb-2 group-hover:text-accent transition-colors tracking-wide">
            {writing.title}
          </h3>
        )}

        <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">
          {truncate(plainText, 120) || "空白..."}
        </p>

        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50">
          <span className="text-[10px] text-text-tertiary">{writing.wordCount} 字</span>
          {writing.isDraft && (
            <span className="seal-stamp text-[9px] py-0">草稿</span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
