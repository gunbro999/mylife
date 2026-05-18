"use client";

import { motion } from "framer-motion";
import type { CreatedPoem } from "@/lib/types";
import { POEM_GENRE_CONFIG } from "@/lib/types";

interface CreatedPoemCardProps {
  poem: CreatedPoem;
  onClick: () => void;
}

export function CreatedPoemCard({ poem, onClick }: CreatedPoemCardProps) {
  const genreConfig = POEM_GENRE_CONFIG[poem.genre];
  const preview = poem.editedContent
    ? poem.editedContent.slice(0, 120)
    : poem.content.slice(0, 120);
  const content = poem.editedContent || poem.content;
  const lines = content.split("\n").filter(Boolean);

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
          {genreConfig.emoji} {genreConfig.label}
        </span>
        {poem.isEdited && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-secondary text-text-muted">
            已编辑
          </span>
        )}
      </div>

      <h3 className="text-[17px] font-bold font-display text-text mb-1 group-hover:text-vermillion
                     transition-colors">
        {poem.title}
      </h3>

      <div className="text-[15px] text-text leading-relaxed font-serif mb-2">
        {lines.slice(0, 4).map((line, i) => (
          <p key={i}>{line}</p>
        ))}
        {lines.length > 4 && <p className="text-text-muted text-[13px]">...</p>}
      </div>

      {poem.explanation && (
        <p className="text-[12px] text-text-muted/70 italic border-t border-border pt-2 mt-2 line-clamp-2">
          {poem.explanation}
        </p>
      )}
    </motion.button>
  );
}
