"use client";

import { motion } from "framer-motion";
import type { Poem } from "@/lib/types";

interface PoetryCardProps {
  poem: Poem;
  beauty?: string;
  onClick: () => void;
}

export function PoetryCard({ poem, beauty, onClick }: PoetryCardProps) {
  const previewLines = poem.content.slice(0, 4);
  const hasMore = poem.content.length > 4;

  return (
    <motion.button
      onClick={onClick}
      className="w-full text-left p-5 rounded-lg border border-border bg-bg-elevated
                 hover:border-vermillion/30 hover:shadow-md transition-all duration-200
                 group cursor-pointer"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Top row: dynasty + type tags */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[11px] px-2 py-0.5 rounded border border-border text-text-muted
                       font-display bg-bg-base">
          {poem.dynasty}
        </span>
        <span className="text-[11px] px-2 py-0.5 rounded border border-vermillion/30
                       text-vermillion bg-vermillion/5 font-display">
          {poem.type}
        </span>
      </div>

      {/* Title & Author */}
      <h3 className="text-[17px] font-bold font-display text-text mb-1 group-hover:text-vermillion
                     transition-colors">
        《{poem.title}》
      </h3>
      <p className="text-[13px] text-text-muted mb-3">{poem.author}</p>

      {/* Content preview */}
      <div className="space-y-0.5 mb-3 text-[15px] text-text leading-relaxed font-serif">
        {previewLines.map((line, i) => (
          <p key={i}>{line}{i < previewLines.length - 1 && "，"}</p>
        ))}
        {hasMore && <p className="text-text-muted text-[13px]">...</p>}
      </div>

      {/* AI beauty line */}
      {beauty && (
        <p className="text-[13px] text-vermillion/80 italic border-t border-border pt-2 mt-2">
          {beauty}
        </p>
      )}

      {/* Hint */}
      <p className="text-[12px] text-text-muted/50 mt-2 group-hover:text-vermillion/60
                    transition-colors">
        点击展开赏析 →
      </p>
    </motion.button>
  );
}
