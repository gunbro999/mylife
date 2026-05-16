"use client";

import { cn } from "@/lib/utils";
import { MOOD_CONFIG, type Mood } from "@/lib/types";

interface MoodPickerProps {
  value?: Mood;
  onChange: (mood: Mood) => void;
}

export function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.entries(MOOD_CONFIG) as [Mood, (typeof MOOD_CONFIG)[Mood]][]).map(
        ([key, config]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-all duration-200 border font-display",
              value === key
                ? "shadow-sm scale-105 bg-bg-elevated"
                : "border-border/60 text-text-secondary hover:border-accent/30 hover:bg-bg-secondary/50"
            )}
            style={
              value === key
                ? { borderColor: config.color, color: config.color }
                : undefined
            }
          >
            <span className="text-sm">{config.emoji}</span>
            <span className="tracking-wider">{config.label}</span>
          </button>
        )
      )}
    </div>
  );
}
