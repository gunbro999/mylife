"use client";

import { useState } from "react";
import { Plus, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { NOTE_COLORS } from "@/lib/types";

interface QuickNoteInputProps {
  onSubmit: (content: string, color?: string) => void;
}

export function QuickNoteInput({ onSubmit }: QuickNoteInputProps) {
  const [content, setContent] = useState("");
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [showColors, setShowColors] = useState(false);

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content.trim(), selectedColor);
    setContent("");
    setSelectedColor(undefined);
    setShowColors(false);
  };

  return (
    <div className="rounded-2xl border border-border bg-bg-elevated/80 p-4 transition-all duration-200 focus-within:border-accent/30 focus-within:shadow-sm">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
        }}
        placeholder="记下一个念头... (Ctrl+Enter 保存)"
        rows={3}
        className="w-full resize-none bg-transparent text-sm text-text-primary placeholder:text-text-tertiary/60 outline-none font-serif leading-relaxed"
      />

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowColors(!showColors)}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full transition-all",
              showColors
                ? "bg-accent-soft text-accent"
                : "text-text-tertiary hover:text-text-secondary hover:bg-bg-secondary"
            )}
          >
            <Palette size={12} />
          </button>

          {showColors && (
            <div className="flex items-center gap-1.5">
              {NOTE_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() =>
                    setSelectedColor(color.name === "default" ? undefined : color.value)
                  }
                  className={cn(
                    "h-4 w-4 rounded-full border-2 transition-all",
                    ((!selectedColor && color.name === "default") ||
                      selectedColor === color.value)
                      ? "scale-125 border-accent"
                      : "border-transparent hover:scale-110"
                  )}
                  style={{
                    backgroundColor:
                      color.name === "default" ? "var(--bg-secondary)" : color.value,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!content.trim()}
          className="flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-[11px] font-medium text-white transition-all hover:bg-accent/90 disabled:opacity-30"
        >
          <Plus size={12} />
          落笔
        </button>
      </div>
    </div>
  );
}
