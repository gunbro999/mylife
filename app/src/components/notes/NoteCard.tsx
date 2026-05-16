"use client";

import { motion } from "framer-motion";
import { Trash2, ArrowUpRight } from "lucide-react";
import { formatDate, truncate } from "@/lib/utils";
import type { Writing } from "@/lib/types";

interface NoteCardProps {
  writing: Writing;
  onDelete: (id: string) => void;
  onConvert: (id: string, type: "diary" | "essay") => void;
}

export function NoteCard({ writing, onDelete, onConvert }: NoteCardProps) {
  const plainText = writing.content.replace(/<[^>]*>/g, "").trim();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="group rounded-2xl border border-border p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 break-inside-avoid mb-3"
      style={{ backgroundColor: writing.color || "var(--bg-elevated)" }}
    >
      {writing.title && (
        <h3 className="text-sm font-display font-medium text-text-primary mb-2 tracking-wide">
          {writing.title}
        </h3>
      )}

      <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">
        {truncate(plainText, 200) || "空白"}
      </p>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/40">
        <span className="text-[9px] text-text-tertiary font-display">
          {formatDate(writing.createdAt, "relative")}
        </span>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onConvert(writing.id, "diary"); }}
            className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] text-text-tertiary hover:bg-bg-secondary/80 hover:text-text-primary transition-colors"
          >
            <ArrowUpRight size={9} /> 记
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onConvert(writing.id, "essay"); }}
            className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] text-text-tertiary hover:bg-bg-secondary/80 hover:text-text-primary transition-colors"
          >
            <ArrowUpRight size={9} /> 文
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(writing.id); }}
            className="flex h-5 w-5 items-center justify-center rounded-full text-text-tertiary hover:bg-accent-soft hover:text-vermillion transition-colors"
          >
            <Trash2 size={9} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
