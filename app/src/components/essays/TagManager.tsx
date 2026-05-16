"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWritingStore } from "@/stores/writingStore";

const PRESET_COLORS = [
  "#B84C3D", "#C9943E", "#5C8A6E", "#3B4A6B",
  "#8B6E5A", "#D4956A", "#6B5E4F", "#9C8E7C",
];

interface TagManagerProps {
  selectedTags: string[];
  onToggleTag: (tagId: string) => void;
}

export function TagManager({ selectedTags, onToggleTag }: TagManagerProps) {
  const tags = useWritingStore((s) => s.tags);
  const addTag = useWritingStore((s) => s.addTag);
  const [showInput, setShowInput] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const handleAdd = () => {
    if (!newTagName.trim()) return;
    const tag = addTag(newTagName.trim(), selectedColor);
    onToggleTag(tag.id);
    setNewTagName("");
    setShowInput(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag.id);
          return (
            <button
              key={tag.id}
              onClick={() => onToggleTag(tag.id)}
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-200 border",
                isSelected
                  ? "border-transparent shadow-sm"
                  : "border-border/60 text-text-secondary hover:border-accent/30"
              )}
              style={
                isSelected
                  ? { backgroundColor: tag.color + "18", color: tag.color, borderColor: tag.color + "40" }
                  : undefined
              }
            >
              {tag.name}
              {isSelected && <X size={9} />}
            </button>
          );
        })}
        <button
          onClick={() => setShowInput(true)}
          className="flex items-center gap-1 rounded-full border border-dashed border-border/60 px-2.5 py-1 text-[11px] text-text-tertiary transition-all hover:border-accent/40 hover:text-accent"
        >
          <Plus size={11} />
          新标签
        </button>
      </div>

      {showInput && (
        <div className="flex items-center gap-2 p-3 rounded-xl border border-border bg-bg-secondary/50">
          <input
            autoFocus
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="标签名称"
            className="flex-1 text-xs bg-transparent outline-none text-text-primary placeholder:text-text-tertiary"
          />
          <div className="flex items-center gap-1">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={cn(
                  "h-3.5 w-3.5 rounded-full transition-transform",
                  selectedColor === color && "scale-125 ring-2 ring-offset-1"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <button
            onClick={handleAdd}
            disabled={!newTagName.trim()}
            className="rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-medium text-white disabled:opacity-30"
          >
            添加
          </button>
          <button
            onClick={() => setShowInput(false)}
            className="text-text-tertiary hover:text-text-primary"
          >
            <X size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
