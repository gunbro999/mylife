"use client";

import { motion } from "framer-motion";
import type { Excerpt } from "@/lib/types";
import { EXCERPT_TYPE_CONFIG } from "@/lib/types";

interface ExcerptCardProps {
  excerpt: Excerpt;
  onClick: () => void;
}

export function ExcerptCard({ excerpt, onClick }: ExcerptCardProps) {
  const typeConfig = EXCERPT_TYPE_CONFIG[excerpt.type];
  const preview = excerpt.content.slice(0, 120);

  return (
    <motion.button
      onClick={onClick}
      className="w-full text-left p-5 rounded-lg border border-border bg-bg-elevated
                 hover:border-vermillion/30 hover:shadow-md transition-all duration-200
                 group cursor-pointer"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[11px] px-2 py-0.5 rounded border border-vermillion/30
                       text-vermillion bg-vermillion/5 font-display">
          {typeConfig.emoji} {typeConfig.label}
        </span>
        {excerpt.dynasty && (
          <span className="text-[11px] px-2 py-0.5 rounded border border-border text-text-muted
                         font-display bg-bg-base">
            {excerpt.dynasty}
          </span>
        )}
        {excerpt.sourceTitle && (
          <span className="text-[11px] text-text-muted truncate max-w-[140px]">
            出自《{excerpt.sourceTitle}》
          </span>
        )}
      </div>

      <h3 className="text-[17px] font-bold font-display text-text mb-1 group-hover:text-vermillion
                     transition-colors">
        {excerpt.author || "佚名"}
      </h3>

      <div className="text-[15px] text-text leading-relaxed font-serif mb-2 whitespace-pre-line">
        {preview}{excerpt.content.length > 120 && "..."}
      </div>

      {excerpt.personalNote && (
        <p className="text-[13px] text-text-muted/70 italic border-t border-border pt-2 mt-2 line-clamp-2">
          {excerpt.personalNote}
        </p>
      )}
    </motion.button>
  );
}
