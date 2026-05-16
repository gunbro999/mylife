"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatDate, truncate } from "@/lib/utils";
import { useWritingStore } from "@/stores/writingStore";
import type { Writing } from "@/lib/types";

export function EssayCard({ writing }: { writing: Writing }) {
  const tags = useWritingStore((s) => s.tags);
  const plainText = writing.content.replace(/<[^>]*>/g, "").trim();
  const essayTags = tags.filter((t) => writing.tags.includes(t.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        href={`/essays/${writing.id}`}
        className="group block rounded-2xl border border-border bg-bg-elevated/80 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-accent/15 hover:-translate-y-0.5"
      >
        {/* Cover */}
        <div className="h-28 bg-gradient-to-br from-bg-secondary to-border/30 flex items-center justify-center relative overflow-hidden">
          <span className="font-display text-4xl text-text-tertiary/10 tracking-widest">
            {writing.title?.[0] || "文"}
          </span>
          <div className="absolute inset-0 bg-gradient-to-t from-bg-elevated/60 to-transparent" />
        </div>

        <div className="p-4">
          <h3 className="text-sm font-display font-semibold text-text-primary mb-1.5 group-hover:text-accent transition-colors tracking-wide line-clamp-1">
            {writing.title || "无题"}
          </h3>

          <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 mb-3">
            {truncate(plainText, 80) || "空白..."}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 flex-wrap">
              {essayTags.slice(0, 2).map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full px-2 py-0.5 text-[9px] font-medium border"
                  style={{
                    borderColor: tag.color + "40",
                    color: tag.color,
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
            <span className="text-[10px] text-text-tertiary">
              {formatDate(writing.updatedAt, "relative")}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
